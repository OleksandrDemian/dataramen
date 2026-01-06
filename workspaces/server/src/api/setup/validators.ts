import { TCompleteSetupRequest } from "@dataramen/types";
import {HttpError} from "../../utils/httpError";

export const validateCompleteSetupRequest = (body: TCompleteSetupRequest) => {
  if (!body.setupAccessToken) {
    throw new HttpError(400, `Invalid setup access token`);
  }

  if (!body.userPassword || body.userPassword.length < 8) {
    throw new HttpError(400, `Password should be at least 8 chars long`);
  }

  if (!body.userName) {
    throw new HttpError(400, `User name is required`);
  }
};
