import {TCreateWorkbenchTab} from "@dataramen/types";
import {HttpError} from "../../utils/httpError";

export const validateCreateWorkbenchTab = (body: TCreateWorkbenchTab) => {
  if (body.queryId) {
    return;
  }

  if (body.opts && body.name) {
    return;
  }

  throw new HttpError(400, "Either queryId or name and opts are required");
};
