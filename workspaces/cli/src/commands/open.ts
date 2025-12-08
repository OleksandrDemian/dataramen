import {TCommand} from "../types/commands";
import {env} from "../utils/envHandler";
import { default as openUrl } from "open";

const open: TCommand = {
  command: "open",
  description: "Open webapp",
  handler: async () => {
    const port = env.getNumber("PORT");
    await openUrl(`http://localhost:${port}`);
  }
};

export default open;
