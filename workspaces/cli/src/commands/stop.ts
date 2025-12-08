import {TCommand} from "../types/commands";
import {stopExisting} from "../utils/cliUtils";

const stop: TCommand = {
  command: "stop",
  description: "Stop the server",
  handler: stopExisting,
};

export default stop;
