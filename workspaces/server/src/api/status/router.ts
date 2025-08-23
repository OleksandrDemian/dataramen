import {createRouter} from "../../utils/createRouter";
import {Env} from "../../services/env";

export default createRouter((instance) => {
  instance.get("/", { config: { isPublic: true } }, async () => {
    return {
      data: {
        active: true,
        version: Env.str("SERVER_VERSION"),
      },
    };
  });
});
