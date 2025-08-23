import { TAuthUserParams } from "@dataramen/types";
import {HttpError} from "../../utils/httpError";

export const validateAuthBody = (body?: TAuthUserParams) => {
  if (!body?.username) throw new HttpError(400, "Username is required");
  if (!body?.password) throw new HttpError(400, "Password is required");
};
