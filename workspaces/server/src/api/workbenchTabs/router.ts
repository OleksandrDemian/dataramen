import {createRouter} from "../../utils/createRouter";
import {QueriesRepository, WorkbenchTabsRepository} from "../../repository/db";
import {getRequestParams, getRequestPayload} from "../../utils/request";
import {HttpError} from "../../utils/httpError";
import {runSelect} from "../../services/sqlRunner";
import {
  IWorkbenchTab,
  TCreateWorkbenchTab,
  TExecuteQuery,
  TGetWorkbenchTabsEntry,
  TQueryOptions, TUpdateWorkbenchTab
} from "@dataramen/types";

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
          archived: false,
        },
        select: ["id", "name"],
      });

      return {
        data: workbenchTabs.map((tab) => ({
          name: tab.name,
          id: tab.id,
        })),
      } satisfies { data: TGetWorkbenchTabsEntry[] };
    },
  });

  instance.route({
    method: "get",
    url: "/:id",
    handler: async (request) => {
      const { id } = getRequestParams<{ id: string }>(request);
      const { currentTeamId, id: currentUserId } = request.user;
      const workbenchTab = await WorkbenchTabsRepository.findOne({
        where: {
          id,
          team: {
            id: currentTeamId,
          },
          user: {
            id: currentUserId,
          },
        },
      });

      if (!workbenchTab) {
        throw new HttpError(404, "Not Found");
      }

      return {
        data: workbenchTab,
      } satisfies { data: IWorkbenchTab };
    },
  });

  instance.route({
    method: "post",
    url: "/",
    handler: async (request) => {
      let { opts, name, queryId } = getRequestPayload<TCreateWorkbenchTab>(request); // todo: make const
      let baseOptions: TExecuteQuery;
      if (opts) {
        baseOptions = opts;
      } else {
        const query = await QueriesRepository.findOne({
          where: {
            id: queryId,
          },
        });

        if (!query) {
          throw new HttpError(404, "Query not Found");
        }

        baseOptions = {
          opts: query.opts as TQueryOptions, // todo: forced type casting
          name: query.name,
          datasourceId: query.dataSource.id,
          page: 0,
          size: 50,
        };
        name = query.name; // todo: variable reasigning
      }


      const newWorkbenchTab = await WorkbenchTabsRepository.save(
        WorkbenchTabsRepository.create({
          name,
          opts: baseOptions,
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
      } satisfies { data: TGetWorkbenchTabsEntry };
    },
  });

  instance.route({
    method: "post",
    url: "/:id/run",
    handler: async (request) => {
      const { id } = getRequestParams<{ id: string }>(request);
      const newOptions = getRequestPayload<TExecuteQuery>(request);
      const workbenchTab = await WorkbenchTabsRepository.findOne({
        where: {
          id: id,
        },
        relations: {
          user: true,
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

  instance.route({
    method: "patch",
    url: "/:id",
    handler: async (request) => {
      const { id } = getRequestParams<{ id: string }>(request);
      const body = getRequestPayload<TUpdateWorkbenchTab>(request);

      const workbenchTab = await WorkbenchTabsRepository.findOne({
        where: {
          id,
          user: {
            id: request.user.id,
          },
        },
      });

      if (!workbenchTab) {
        throw new HttpError(404, "Not Found");
      }

      return WorkbenchTabsRepository.update(id, body);
    }
  })
});
