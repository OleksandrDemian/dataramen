import {createRouter} from "../../utils/createRouter";
import {completeSetup, requireSetup} from "../../services/setup";
import {HttpError} from "../../utils/httpError";
import {getRequestPayload} from "../../utils/request";
import { TCompleteSetupRequest } from "@dataramen/types";
import {validateCompleteSetupRequest} from "./validators";

export default createRouter((instance) => {
  // inject dynamic config into index.html
  instance.route({
    method: "post",
    url: "/",
    config: { isPublic: true },
    handler: async (req) => {
      const isAvailable = await requireSetup();
      if (!isAvailable) {
        throw new HttpError(400, `Setup has already been completed`);
      }

      const body = getRequestPayload<TCompleteSetupRequest>(req, validateCompleteSetupRequest);
      await completeSetup(body);
      return {
        data: true,
      };
    },
  });
});
