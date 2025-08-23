import * as fs from "fs-extra";
import {join} from "node:path";
import {SERVER_PATH} from "./const";

function useJson (path: string) {
  let file = undefined;

  function get () {
    try {
      if (!file) {
        file = fs.readJsonSync(path);
      }

      return file;
    } catch (e) {
      return undefined;
    }
  }

  return get;
}

export const cliPkg = useJson(join(__dirname, "..", "package.json"));
export const serverPkg = useJson(join(SERVER_PATH, "package.json"));
