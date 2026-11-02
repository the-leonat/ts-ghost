import type { z, ZodRawShape } from "zod";

import { sanitizeFormatMask, sanitizeMask } from "../helpers/masks";
import type { StrictOption } from "../helpers/response-schema";
import type { Exactly, Mask, NoUnrecognizedKeys } from "../utils";
import { contentFormats, type ContentFormats } from "./formats";

/** What browse and read fetchers parse with: the full schema, the selected output, includes and strictness. */
export type OutputConfig<
  BaseShape extends ZodRawShape,
  OutputShape extends ZodRawShape,
  IncludeShape extends ZodRawShape,
> = {
  schema: z.ZodObject<BaseShape>;
  output: z.ZodObject<OutputShape>;
  include: z.ZodObject<IncludeShape>;
  /** Fail results carrying keys the schema doesn't declare; by default they pass through. */
  strict?: StrictOption;
};

/** The requested formats, and the config with them required in the output. */
export function withFormats<
  BaseShape extends ZodRawShape,
  OutputShape extends ZodRawShape,
  IncludeShape extends ZodRawShape,
  Formats extends Mask<Pick<OutputShape, ContentFormats>>,
>(
  config: OutputConfig<BaseShape, OutputShape, IncludeShape>,
  formats: NoUnrecognizedKeys<Formats, OutputShape>,
) {
  const requiredFormats = sanitizeFormatMask(config.output, formats);
  return {
    formats: Object.keys(requiredFormats).filter((key) => contentFormats.includes(key)),
    config: { ...config, output: config.output.required(requiredFormats as Exactly<Formats, Formats>) },
  };
}

/** The include keys to send, and the config with the included output keys required. */
export function withInclude<
  BaseShape extends ZodRawShape,
  OutputShape extends ZodRawShape,
  IncludeShape extends ZodRawShape,
  Includes extends Mask<IncludeShape>,
>(
  config: OutputConfig<BaseShape, OutputShape, IncludeShape>,
  include: NoUnrecognizedKeys<Includes, IncludeShape>,
) {
  const parsedInclude = config.include.parse(include);
  const requiredIncludeKeys = sanitizeMask(config.output, parsedInclude, { excludeDotNotation: true });
  return {
    include: Object.keys(parsedInclude),
    config: {
      ...config,
      output: config.output.required(requiredIncludeKeys as Exactly<Includes, Includes>),
    },
  };
}

/** The config with its output narrowed to the selected fields. */
export function withFields<
  BaseShape extends ZodRawShape,
  OutputShape extends ZodRawShape,
  IncludeShape extends ZodRawShape,
  Fields extends Mask<OutputShape>,
>(
  config: OutputConfig<BaseShape, OutputShape, IncludeShape>,
  fields: NoUnrecognizedKeys<Fields, OutputShape>,
) {
  const pickedFields = sanitizeMask(config.output, fields);
  return { ...config, output: config.output.pick(pickedFields as Exactly<Fields, Fields>) };
}

/** The `fields`, `include` and `formats` URL params; `fields` only when the output is narrowed. */
export function outputURLParams(
  config: OutputConfig<any, any, any>,
  params: { include?: PropertyKey[]; formats?: string[] },
  options: { omitFields?: string[] } = {},
) {
  const urlParams: Record<string, string> = {};
  const inputKeys = config.schema.keyof().options as string[];
  const outputKeys = config.output.keyof().options as string[];
  if (inputKeys.length !== outputKeys.length && outputKeys.length > 0) {
    urlParams.fields = outputKeys.filter((key) => !options.omitFields?.includes(key)).join(",");
  }
  if (params.include && params.include.length > 0) urlParams.include = params.include.join(",");
  if (params.formats && params.formats.length > 0) urlParams.formats = params.formats.join(",");
  return urlParams;
}
