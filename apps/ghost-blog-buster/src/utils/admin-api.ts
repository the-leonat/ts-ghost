import { TSGhostAdminAPI, type Member } from "@ts-ghost/admin-api";

import { fetchAllPages } from "./fetch-all-pages";

export const fetchAllMembers = (ghost: TSGhostAdminAPI): Promise<Member[]> =>
  fetchAllPages(ghost.members.browse().paginate());
