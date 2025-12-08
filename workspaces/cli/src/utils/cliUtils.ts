import {PROCESS_NAME, SERVER_PATH} from "../const";
import {serverPkg} from "./pkgUtils";
import * as fs from "fs-extra";
import {join} from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import yoctoSpinner from "yocto-spinner";

export const asyncExec = promisify(exec);

export function shouldInstall () {
  try {
    const installedProxyPkjJson = serverPkg();

    if (!installedProxyPkjJson) {
      return true;
    }

    const thisProxyPkgJson = fs.readJsonSync(join(__dirname, '..', 'dist', "package.json"));
    return installedProxyPkjJson.version !== thisProxyPkgJson.version; // version are different, install new code
  } catch (e) {
    return true;
  }
}

export async function checkPm2 () {
  const spinner = yoctoSpinner({ text: "Checking if PM2 is installed" }).start();
  try {
    await asyncExec(`pm2 -v`);

    spinner.success("PM2 already installed");
    return true;
  } catch (e) {
    spinner.warning("PM2 not installed");
    return false;
  }
}

export async function installPm2 () {
  const spinner = yoctoSpinner({ text: "Installing PM2" }).start();
  try {
    await asyncExec(`npm i -g pm2`);
    spinner.success("Installed PM2");
  } catch (error) {
    spinner.error("Failed to install PM2");
    process.exit(1);
  }
}

export async function stopExisting () {
  const spinner = yoctoSpinner({ text: "Stop running instances of " + PROCESS_NAME }).start();
  try {
    await asyncExec(`pm2 stop "${PROCESS_NAME}"`);
    spinner.warning("Stopped " + PROCESS_NAME);
  } catch (e) {
    spinner.success("No running instances of " + PROCESS_NAME + " found");
  }
}

export async function installServer () {
  const spinner = yoctoSpinner({ text: "Create local server" }).start();

  // remove current code
  fs.removeSync(join(SERVER_PATH, 'code'));

  // copy code
  fs.copySync(join(__dirname, '..', 'dist', "code"), join(SERVER_PATH, "code"));
  // copy package.json
  fs.copySync(join(__dirname, '..', 'dist', "package.json"), join(SERVER_PATH, "package.json"));

  spinner.text = 'Install local server dependencies';
  await asyncExec(`npm i`, {
    cwd: SERVER_PATH,
  });
  spinner.success("Local server installed");

  // registerServer();
}
