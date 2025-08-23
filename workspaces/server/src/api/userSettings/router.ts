import {createRouter} from "../../utils/createRouter";
import {getRequestPayload} from "../../utils/request";
import {HttpError} from "../../utils/httpError";
import { UserSettingsRepository } from "../../repository/db";
import { IUserSettingsSchema } from "@dataramen/types";

// TODO: currently unused
export default createRouter((instance) => {
  // get user settings by user id
  instance.route({
    method: "get",
    url: "/",
    handler: async (req) => {
      const userId = req.user.id;
      let settings = await UserSettingsRepository.findOneBy({
        user: {
          id: userId,
        }
      });

      if (!settings) {
        // create default settings if not found
        settings = await UserSettingsRepository.save(
          UserSettingsRepository.create({
            user: {
              id: userId,
            },
          })
        );
      }

      return {
        data: settings,
      };
    },
  });

  // update user settings
  instance.route({
    method: "patch",
    url: "/",
    handler: async (req) => {
      const { settings } = getRequestPayload<{ settings: Partial<IUserSettingsSchema> }>(req);
      if (!settings.id) {
        throw new HttpError(400, "Settings id is required!");
      }

      const result = await UserSettingsRepository.update(settings.id, settings);

      if (!result.affected) {
        throw new HttpError(404, "You do not own these settings!");
      }

      const updatedSettings = await UserSettingsRepository.findOneBy({
        id: settings.id,
      });
      return {
        data: updatedSettings,
      };
    },
  });
});
