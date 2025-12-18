import {TCommand} from "../../types/commands";
import {execSync} from "node:child_process";
import {PROCESS_NAME} from "../../const";

const logs: TCommand = {
  command: "logs",
  description: "Listen for logs",
  handler: async () => {
    execSync(`pm2 logs ${PROCESS_NAME}`, {
      stdio: "inherit",
    });
  },
};

export default logs;
