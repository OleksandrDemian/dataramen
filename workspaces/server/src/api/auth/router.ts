import {createRouter} from "../../utils/createRouter";
import {TAuthUser, TAuthUserParams} from "@dataramen/types";
import {generateJwt, generateJwtRefresh, verifyRefreshToken} from "../../services/auth";
import {CookieSerializeOptions} from "@fastify/cookie";
import {Env} from "../../services/env";
import {getRequestPayload} from "../../utils/request";
import bcrypt from 'bcryptjs';
import {HttpError} from "../../utils/httpError";
import {UserRepository} from "../../repository/db";
import {validateAuthBody} from "./validators";

const COOKIE_NAME = "DATARAMEN_refresh_token";

const refreshTokenCookiesOption: CookieSerializeOptions = {
  httpOnly: true,
  secure: Env.bool("PROD"),
  sameSite: Env.bool("PROD"),
  path: "/",
  maxAge: 10 * 24 * 60 * 60, //10d
};

export default createRouter((instance) => {
  instance.route({
    method: "post",
    url: "/login",
    config: { isPublic: true },
    handler: async (req, res): Promise<{ data: TAuthUser }> => {
      const { username, password } = getRequestPayload<TAuthUserParams>(req, validateAuthBody);

      const user = await UserRepository.findOne({
        where: {
          username,
        }
      });

      if (!user || !bcrypt.compareSync(password, user.password)) {
        throw new HttpError(401, "Invalid credentials");
      }

      const [accessToken, refreshToken] = await Promise.all([
        generateJwt({
          userId: user?.id!,
        }),
        generateJwtRefresh({
          userId: user?.id!,
        })
      ]);

      res.setCookie(COOKIE_NAME, refreshToken, refreshTokenCookiesOption);

      return {
        data: {
          accessToken,
        },
      };
    },
  });

  instance.route({
    method: "post",
    url: "/refresh",
    config: { isPublic: true },
    handler: async (req, res): Promise<{ data: TAuthUser }> => {
      const refreshToken = req.cookies[COOKIE_NAME];
      if (!refreshToken) return res.code(401).send({ message: 'Missing refresh token' });

      const { userId } = await verifyRefreshToken(refreshToken);

      const [accessToken, newRefreshToken] = await Promise.all([
        generateJwt({
          userId: userId,
        }),
        generateJwtRefresh({
          userId: userId,
        })
      ]);

      res.setCookie(COOKIE_NAME, newRefreshToken, refreshTokenCookiesOption);

      return {
        data: {
          accessToken,
        },
      };
    },
  });

  instance.route({
    method: "post",
    url: "/logout",
    config: { isPublic: true },
    handler: async (_, res): Promise<{ data: boolean }> => {
      res.clearCookie(COOKIE_NAME, refreshTokenCookiesOption);

      return {
        data: true
      }
    },
  });
});
