import {createRouter} from "../../utils/createRouter";
import {modeConfig} from "../../config/modeConfig";
import { TClientConfig } from "@dataramen/types";

export default createRouter((instance) => {
  // inject dynamic config into index.html
  instance.route({
    method: "get",
    url: "/client.config.js",
    handler: (_, res) => {
      const clientConfig: TClientConfig = {
        skipAuth: modeConfig.skipAuth,
        modeName: modeConfig.name,
      };

      res
        .type('application/javascript')
        .send(`window.__CLIENT_CONFIG__ = ${JSON.stringify(clientConfig)};`);
    },
  });

  instance.route({
    method: "get",
    url: "/",
    handler: (_, rep) => {
      rep.sendFile("index.html");
    },
  });
});
