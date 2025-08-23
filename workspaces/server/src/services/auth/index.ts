import {SignJWT, jwtVerify} from "jose";
import {Env} from "../env";
import {HttpError} from "../../utils/httpError";

const encoder = new TextEncoder();
const secret = encoder.encode(Env.str("JWT_SECRET"));
const refreshSecret = encoder.encode(Env.str("JWT_REFRESH_SECRET"));

export const generateJwt = async ({ userId }: { userId: string; }): Promise<string> => {
  return new SignJWT({
    sub: userId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(secret);
};

export const generateJwtRefresh = async ({ userId }: { userId: string; }): Promise<string> => {
  return new SignJWT({
    sub: userId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('10d')
    .sign(refreshSecret);
};

const verify = async (token: string, sec: Uint8Array): Promise<{ userId: string }> => {
  try {
    const { payload } = await jwtVerify(token, sec);

    if (!payload.sub) {
      throw new HttpError(401, "Failed to verify access token");
    }

    return {
      userId: payload.sub,
    };
  } catch (error: unknown) {
    if (error instanceof HttpError) {
      throw error;
    } else if (error instanceof Error) {
      throw new HttpError(401, error.message);
    }

    throw new HttpError(401, "Failed to verify refresh token");
  }
}

export const verifyAccessToken = async (token: string) => verify(token, secret);
export const verifyRefreshToken = async (token: string) => verify(token, refreshSecret);
