// Vitest global setup of the manifest test: the Ghosts it starts are removed afterwards, also on interrupt.

import { claimRunGhosts } from "../ghost/docker-compose.ts";

export default claimRunGhosts;
