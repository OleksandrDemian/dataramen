import { homedir } from "node:os";
import { join } from "node:path";

const homeDir = homedir();

export const PROCESS_NAME = '@dataramen/server';
export const SERVER_PATH = join(homeDir, ".dataramen", ".runtime", "server");
