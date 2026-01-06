import {UserRepository} from "../../repository/db";
import {modeConfig} from "../../config/modeConfig";
import {randomBytes} from "node:crypto";
import {HttpError} from "../../utils/httpError";
import { TCompleteSetupRequest } from "@dataramen/types";
import {initDefaultOwnerUser} from "../users";

type TValues = {
  setupAccessToken?: string;
};

const values: TValues = {
  setupAccessToken: undefined,
};

export const generateSetupAccessToken = (): string => {
  values.setupAccessToken = randomBytes(32).toString("hex");
  return values.setupAccessToken;
};

export const validateSetupAccessToken = (token: string) => {
  if (!values.setupAccessToken) {
    throw new HttpError(400, `Setup already performed`);
  }

  if (!token || token !== values.setupAccessToken) {
    throw new HttpError(400, `Invalid setup access token`);
  }
};

export const requireSetup = async (): Promise<boolean> => {
  if (modeConfig.skipAuth) {
    // no need to setup when no auth
    return false;
  }

  const users = await UserRepository.count();

  // if no users, require setup
  return users < 1;
};

export const completeSetup = async (props: TCompleteSetupRequest) => {
  validateSetupAccessToken(props.setupAccessToken);

  await initDefaultOwnerUser({
    name: props.userName,
    password: props.userPassword,
  });
};
