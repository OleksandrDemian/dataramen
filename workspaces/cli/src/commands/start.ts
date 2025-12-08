import {TCommand} from "../types/commands";
import {asyncExec, checkPm2, installPm2, installServer, shouldInstall, stopExisting} from "../utils/cliUtils";
import {generateDefaultEnvValues} from "../utils/envUtils";
import {env} from "../utils/envHandler";
import {isPortFree} from "../utils/netUtils";
import yoctoSpinner from "yocto-spinner";
import {PROCESS_NAME, SERVER_PATH} from "../const";
import * as fs from "fs-extra";
import {join} from "node:path";
import {SERVER_CHECK_INTERVAL, SERVER_CHECK_TIMEOUT, waitServerAvailability} from "../utils/waitServerAvailability";
import open from "open";

const start: TCommand = {
  command: "start",
  description: "Start local server, restarts if already running",
  handler: async () => {
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
  },
};

export default start;
