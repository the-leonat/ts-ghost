// ts-ghost route spec extraction.
//
// Describes Ghost's admin surface by introspecting live objects inside the
// booted Ghost the recorder runs in, never by parsing source: the admin router
// exposes its own stack, the endpoint index is lazy getters over plain
// controller modules readable as values, and the permission matrix and input
// schemas are plain data. Copied next to the recorder into Ghost's
// test/e2e-api/admin/ (see recorder/Dockerfile); it is never run on the host.
//
// The result is written by the recorder as route-spec.json beside the
// fixtures, and is what @ts-ghost/admin-api's offline cross-check reads.
const path = require("node:path");

const CORE = path.join(__dirname, "../../../core");

// A diffable rendering of a controller config value: functions become their
// names, nested objects are kept to a fixed depth, keys are sorted.
function describeValue(value, depth = 0) {
  if (typeof value === "function") {
    return `[Function ${value.name || "anonymous"}]`;
  }
  if (Array.isArray(value)) {
    return value.map((item) => describeValue(item, depth + 1));
  }
  if (value && typeof value === "object") {
    if (depth > 4) {
      return "[Object]";
    }
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, key === "cache" ? "[cache]" : describeValue(value[key], depth + 1)]),
    );
  }
  return value;
}

function sortKeys(object) {
  return Object.fromEntries(
    Object.keys(object)
      .sort()
      .map((key) => [key, object[key]]),
  );
}

// Express gives a mounted sub-router only as a regexp, e.g.
// /^\/members\/metafields\/?(?=\/|$)/i. Turn the plain-prefix form back into a path.
function mountPrefix(regexp) {
  const match = /^\^((?:\\\/[\w-]+)+)\\\/\?\(\?=\\\/\|\$\)$/.exec(regexp.source);
  return match ? match[1].replace(/\\\//g, "/") : `{mounted:${String(regexp)}}`;
}

/**
 * @param {{ matchers: Record<string, unknown> }} ghost Ghost's e2e matchers, whose patterns are recorded too
 */
function extractRouteSpec({ matchers }) {
  const endpointsIndex = require(path.join(CORE, "server/api")).endpoints;
  const endpointsDir = path.join(CORE, "server/api/endpoints");
  const mw = require(path.join(CORE, "server/web/api/endpoints/admin/middleware"));
  const labs = require(path.join(CORE, "shared/labs"));
  const permissionsData = require(path.join(CORE, "server/services/permissions/permissions-data"));
  const adminApiSchema = require("@tryghost/admin-api-schema");

  // 1. Route -> controller. Wrap every lazy getter on the endpoint index so
  //    that, while `probing` is set, calling a controller method records which
  //    one it is and throws instead of running. Ghost's Http handler calls the
  //    controller synchronously before its first await, so invoking a route's
  //    terminal handler with a fake request names its controller method without
  //    touching the database.
  let probing = false;
  let captured = null;
  const originals = {};
  const controllers = {};
  for (const [key, desc] of Object.entries(Object.getOwnPropertyDescriptors(endpointsIndex))) {
    if (!desc.get) {
      continue;
    }
    originals[key] = desc;
    // docName lives only on the raw module; the getter names the module it requires.
    const required = desc.get.toString().match(/require\('\.\/([^']+)'\)(\.controller)?/);
    let docName = null;
    if (required) {
      const mod = require(path.join(endpointsDir, required[1]));
      docName = (required[2] ? mod.controller : mod.default || mod)?.docName ?? null;
    }
    Object.defineProperty(endpointsIndex, key, {
      configurable: true,
      enumerable: desc.enumerable,
      get() {
        const controller = desc.get.call(endpointsIndex);
        const methods = {};
        const tagged = {};
        for (const method of Object.keys(controller)) {
          const impl = controller[method];
          if (typeof impl !== "function") {
            tagged[method] = impl;
            continue;
          }
          methods[method] = {
            options: describeValue(impl.options ?? null),
            data: describeValue(impl.data ?? null),
            validation: describeValue(impl.validation ?? null),
            permissions: describeValue(impl.permissions ?? null),
            statusCode: describeValue(impl.statusCode ?? null),
            headers: describeValue(impl.headers ?? null),
            allowedIncludes: impl.validation?.options?.include?.values ?? null,
          };
          const wrapper = function (...args) {
            if (probing) {
              captured = { endpoint: key, docName, method };
              throw new Error("__ts_ghost_route_spec_probe__");
            }
            return impl.apply(this, args);
          };
          Object.assign(wrapper, impl);
          tagged[method] = wrapper;
        }
        controllers[key] = { docName, methods: sortKeys(methods) };
        return tagged;
      },
    });
  }

  // routes.js reads api.* when called, so a fresh router captures the wrappers.
  const router = require(path.join(CORE, "server/web/api/endpoints/admin/routes"))();
  for (const [key, desc] of Object.entries(originals)) {
    Object.defineProperty(endpointsIndex, key, desc);
  }

  // 2. Authentication tiers, by identity of the middleware in each route's stack.
  //    mw.authAdminApi[0] is itself [apiKeyAuth.admin.authenticate, session.authenticate].
  const [apiKeyAdminAuth, sessionAuth] = [].concat(mw.authAdminApi[0]);
  const [authenticateAdminApiWithUrl] = [].concat(mw.authAdminApiWithUrl[0]);
  const tokenPermissionCheck = mw.authAdminApi[mw.authAdminApi.length - 1];

  function authTier(handles, mounted) {
    if (handles.includes(apiKeyAdminAuth) && handles.includes(sessionAuth)) {
      return "adminApi";
    }
    if (handles.includes(authenticateAdminApiWithUrl)) {
      return "adminApiWithUrl";
    }
    if (handles.includes(tokenPermissionCheck)) {
      return "public";
    }
    return mounted ? "inheritsMount" : "other";
  }

  // 3. Feature flags: stub labs.isSet to see which flag a labs middleware asks for.
  function labsFlag(handle) {
    const isSet = labs.isSet;
    let flag = null;
    labs.isSet = (name) => {
      flag = name;
      return true;
    };
    try {
      handle({}, {}, () => {});
    } finally {
      labs.isSet = isSet;
    }
    return flag;
  }

  function controllerOf(handle, method, samplePath) {
    captured = null;
    probing = true;
    const req = {
      method,
      url: samplePath,
      originalUrl: samplePath,
      body: {},
      query: {},
      params: {},
      get: () => "127.0.0.1",
    };
    try {
      const pending = handle(req, { status() {}, set() {}, json() {}, send() {} }, () => {});
      if (pending && typeof pending.catch === "function") {
        pending.catch(() => {});
      }
    } catch {
      // the probe sentinel, or a handler that is not Ghost's Http
    } finally {
      probing = false;
    }
    return captured;
  }

  // 4. The integration-token allowlist is a closure-local constant inside
  //    tokenPermissionCheck, so it is probed: call it as an integration token
  //    (no user_id) or a staff token (user_id set) and see whether it refuses.
  function tokenAccess(method, samplePath, staff) {
    let result = "allowed";
    tokenPermissionCheck(
      {
        api_key: { get: (field) => (field === "user_id" ? (staff ? "u1" : null) : "x") },
        method,
        url: samplePath,
        path: samplePath,
        query: {},
      },
      {},
      (err) => {
        if (err) {
          result = `refused:${err.statusCode}`;
        }
      },
    );
    return result;
  }

  const routes = [];
  const mounts = [];
  function walk(stack, prefix) {
    for (const layer of stack) {
      if (layer.route) {
        const paths = [].concat(layer.route.path);
        const handles = layer.route.stack.map((l) => l.handle);
        const auth = authTier(handles, prefix !== "");
        const labsFlags = handles.filter((h) => h.name === "labsEnabledMw").map(labsFlag);
        for (const verb of Object.keys(layer.route.methods)) {
          const method = verb.toUpperCase();
          for (const routePath of paths) {
            const full = prefix + routePath;
            const samplePath = full.replace(/:[a-z_]+/g, "abc123").replace(/\*/g, "x");
            const tokenChecked = auth === "public" || auth.startsWith("adminApi");
            routes.push({
              method,
              path: full,
              auth,
              labsFlags,
              middleware: handles.map((h) => h.name || "anonymous"),
              controller:
                verb === "_all" ? null : controllerOf(handles[handles.length - 1], method, samplePath),
              integrationToken: tokenChecked ? tokenAccess(method, samplePath, false) : null,
              staffToken: auth.startsWith("adminApi") ? tokenAccess(method, samplePath, true) : null,
            });
          }
        }
      } else if (layer.handle && Array.isArray(layer.handle.stack)) {
        const mountPath = prefix + mountPrefix(layer.regexp);
        mounts.push({ path: mountPath, layers: layer.handle.stack.length });
        walk(layer.handle.stack, mountPath);
      }
    }
  }
  walk(router.stack, "");

  return {
    ghostVersion: require(path.join(CORE, "../package.json")).version,
    routes,
    mounts,
    controllers: sortKeys(controllers),
    rolePermissions: describeValue(permissionsData.rolePermissions),
    permissionActions: describeValue(permissionsData.permissions),
    adminApiSchemas: Object.fromEntries(
      adminApiSchema
        .list()
        .sort()
        .map((name) => [name, adminApiSchema.get(name)]),
    ),
    // The definition documents the input schemas reference (`posts#/definitions/post`),
    // by name: Ghost validates each action against the definition named by its
    // prefix (`posts-add` -> `posts`).
    adminApiSchemaDefinitions: Object.fromEntries(
      [...new Set(adminApiSchema.list().map((name) => name.split("-")[0]))]
        .sort()
        .map((name) => [name, adminApiSchema.get(name)]),
    ),
    matcherPatterns: Object.fromEntries(
      Object.entries(matchers)
        .filter(([, value]) => value && typeof value === "object" && value.sample instanceof RegExp)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, value]) => [name, String(value.sample)]),
    ),
  };
}

module.exports = { extractRouteSpec };
