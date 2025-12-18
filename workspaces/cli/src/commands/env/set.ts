import {TCommand} from "../../types/commands";
import {env} from "../../utils/envHandler";

const set: TCommand = {
  command: "set <prop> <value>",
  description: "Set env value",
  module: "env",
  handler: async (prop: string, value: string) => {
    env.set(prop, value);
    env.flush();
    console.log(`Environment property set: ${prop}`);
  },
};

export default set;
