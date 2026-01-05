import {createRouter} from "../../utils/createRouter";
import {modeConfig} from "../../config/modeConfig";
import { TClientConfig } from "@dataramen/types";
import {requireSetup} from "../../services/setup";

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

      return res
        .type('application/javascript')
        .send(`window.__CLIENT_CONFIG__ = ${JSON.stringify(clientConfig)};`);
    },
  });

  instance.route({
    method: "get",
    url: "/",
    handler: async (_, rep) => {
      const redirectToSetup = await requireSetup();
      if (redirectToSetup) {
        return rep.redirect("/setup");
      } else {
        return rep.sendFile("index.html");
      }
    },
  });

  instance.route({
    method: "get",
    url: "/setup",
    handler: async (_, rep) => {
      const renderSetup = await requireSetup();
      if (renderSetup) {
        return rep.sendFile("setup.html");
      } else {
        return rep.redirect("/");
      }
    },
  });
});
