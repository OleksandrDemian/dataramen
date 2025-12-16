import {TCommand} from "../../types/commands";
import {env} from "../../utils/envHandler";

const unset: TCommand = {
  command: "unset <prop>",
  description: "Remove env value",
  module: "env",
  handler: async (prop: string) => {
    env.unset(prop);
    env.flush();
    console.log(`Environment property unset: ${prop}`);
  },
};

export default unset;
