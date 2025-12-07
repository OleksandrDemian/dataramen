import {PROCESS_NAME, SERVER_PATH} from "./const";
import {join} from "node:path";
import * as fs from "fs-extra";
import {execSync} from "node:child_process";
import {asyncExec, checkPm2, installPm2, installServer, shouldInstall, stopExisting} from "./cliUtils";
import {cliPkg, serverPkg} from "./pkgUtils";
import yoctoSpinner from 'yocto-spinner';
import open from "open";
import {isPortFree} from "./netUtils";
import {generateDefaultEnvValues} from "./envUtils";
import {SERVER_CHECK_INTERVAL, SERVER_CHECK_TIMEOUT, waitServerAvailability} from "./waitServerAvailability";
import {env} from "./envHandler";

async function start () {
  const hasPm2 = await checkPm2();
  if (!hasPm2) {
    await installPm2();
  }

  await stopExisting();

  try {
    if (shouldInstall()) {
      await installServer();
    }

    generateDefaultEnvValues();

    const port = env.getNumber("PORT") || 4466; // TODO: move into common package
    if (!port) {
      throw new Error(`PORT env variable not found`);
    }

    const isFree = await isPortFree(port);
    if (!isFree) {
      throw new Error(`Port ${port} is occupied by another process`);
    }

    const spinner = yoctoSpinner({ text: "Starting new instance of " + PROCESS_NAME }).start();
    const appPkg = fs.readJsonSync(join(SERVER_PATH, "package.json"));
    await asyncExec(`pm2 start "${appPkg.main}" --name "${PROCESS_NAME}" --no-autorestart -- "${SERVER_PATH}/.env"`, {
      cwd: SERVER_PATH,
    });

    spinner.success("Local server will be available in a couple of seconds");

    const waitServerSpinner = yoctoSpinner({
      text: "Waiting for the server to become available",
    }).start();
    const isAvailable = await waitServerAvailability(`http://localhost:${port}/api/status`, SERVER_CHECK_TIMEOUT, SERVER_CHECK_INTERVAL);

    if (isAvailable) {
      await open(`http://localhost:${port}`);
      waitServerSpinner.success(`App is running at http://localhost:${port}`);
    } else {
      waitServerSpinner.error("Server failed to become available in time");
    }
  } catch (e) {
    console.error(`Failed to start local server`, e);
  }
}

async function logs () {
  execSync(`pm2 logs ${PROCESS_NAME}`, {
    stdio: "inherit",
  });
}

async function stop () {
  await stopExisting();
}

function version () {
  console.log(`DataRamen CLI version:          ${cliPkg().version}`);
  console.log(`DataRamen local server version: ${serverPkg().version}`);
}

async function openApp () {
  const port = env.getNumber("PORT");
  await open(`http://localhost:${port}`);
}

function setEnvVariable (prop: string, value: string) {
  env.set(prop, value);
  env.flush();
  console.log(`Environment property set: ${prop}`);
}

function unsetEnvVariable (prop: string) {
  env.unset(prop);
  env.flush();
  console.log(`Environment property unset: ${prop}`);
}

export const Commands = {
  start: start,
  logs: logs,
  stop: stop,
  version: version,
  open: openApp,
  setEnvVariable: setEnvVariable,
  unsetEnvVariable: unsetEnvVariable,
};
