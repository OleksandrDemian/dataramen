import {createRouter} from "../../utils/createRouter";
import {WorkbenchTabsRepository} from "../../repository/db";
import {getRequestParams, getRequestPayload} from "../../utils/request";
import {HttpError} from "../../utils/httpError";
import {runSelect} from "../../services/sqlRunner";
import { TExecuteQuery } from "@dataramen/types";

export default createRouter((instance) => {
  instance.route({
    method: "get",
    url: "/",
    handler: async (request) => {
      const { currentTeamId, id: currentUserId } = request.user;
      const workbenchTabs = await WorkbenchTabsRepository.find({
        where: {
          team: {
            id: currentTeamId,
          },
          user: {
            id: currentUserId,
          },
        },
      });

      return {
        data: workbenchTabs.map((tab) => ({
          name: tab.name,
          id: tab.id,
        })),
      };
    },
  });

  instance.route({
    method: "post",
    url: "/",
    handler: async (request) => {
      const { opts, name } = getRequestPayload<{ opts: TExecuteQuery; name: string; }>(request);
      const newWorkbenchTab = await WorkbenchTabsRepository.save(
        WorkbenchTabsRepository.create({
          name,
          opts,
          user: {
            id: request.user.id,
          },
          team: {
            id: request.user.currentTeamId,
          },
        }),
      );

      return {
        data: newWorkbenchTab,
      };
    },
  });

  instance.route({
    method: "post",
    url: "/:id/run",
    handler: async (request) => {
      const { id } = getRequestParams<{ id: string }>(request);
      const { newOptions } = getRequestPayload<{ newOptions?: TExecuteQuery }>(request);
      const workbenchTab = await WorkbenchTabsRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!workbenchTab) {
        throw new HttpError(404, 'Not found');
      }

      if (workbenchTab.user?.id !== request.user.id) {
        // todo: copy tab if same team
        throw new HttpError(404, 'Not found');
      }

      if (newOptions) {
        // do not await
        WorkbenchTabsRepository.update(id, {
          opts: newOptions,
        });
      }

      const queryResult = await runSelect(request, newOptions || workbenchTab.opts);

      return {
        data: {
          result: queryResult,
        }
      };
    },
  });
});
