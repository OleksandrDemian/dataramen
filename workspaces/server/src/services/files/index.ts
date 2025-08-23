import fs from "node:fs/promises";
import { join } from "node:path";
import os from 'node:os';

const homeDir = os.homedir();
const filesPath = join(homeDir, ".dataramen", ".runtime", "files");

export const setupProjectFolders = async () => {
  const hasFilesFolder = await filesFolderExists();
  if (!hasFilesFolder) {
    await fs.mkdir(filesPath, {
      recursive: true
    });
  }
};

async function filesFolderExists (): Promise<boolean> {
  try {
    const result = await fs.lstat(filesPath);
    return result.isDirectory();
  } catch (e) {
    return false;
  }
}
