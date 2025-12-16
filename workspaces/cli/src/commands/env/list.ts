import {TCommand} from "../../types/commands";
import {env} from "../../utils/envHandler";

const list: TCommand = {
  command: "list",
  description: "List env values",
  module: "env",
  handler: async () => {
    console.table(env.values())
  },
};

export default list;
