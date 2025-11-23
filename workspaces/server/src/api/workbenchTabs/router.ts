import {createRouter} from "../../utils/createRouter";
import {QueriesRepository, WorkbenchTabsRepository} from "../../repository/db";
import {getRequestParams, getRequestPayload} from "../../utils/request";
import {HttpError} from "../../utils/httpError";
import {runSelect} from "../../services/sqlRunner";
import {
  IWorkbenchTab,
  TCreateWorkbenchTab,
  TGetWorkbenchTabsEntry,
  TUpdateWorkbenchTab,
  TWorkbenchOptions
} from "@dataramen/types";
import {validateCreateWorkbenchTab} from "./validators";
import {generateSearchString} from "../../utils/generateSearchString";
import * as worker_threads from "node:worker_threads";

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
      const { opts, name, queryId } = getRequestPayload<TCreateWorkbenchTab>(request, validateCreateWorkbenchTab);
      let baseOptions: Partial<TWorkbenchOptions>;
      let dataSourceId: string;
      let finalName = name;

      if (opts) {
        dataSourceId = opts.dataSourceId;
        baseOptions = opts;
      } else {
        const query = await QueriesRepository.findOne({
          where: {
            id: queryId,
          },
          relations: {
            dataSource: true,
          },
        });

        if (!query) {
          throw new HttpError(404, "Query not Found");
        }

        dataSourceId = query.dataSource.id;
        baseOptions = {
          table: query.opts.table!,
          filters: query.opts.filters,
          joins: query.opts.joins,
          orderBy: query.opts.orderBy,
          columns: query.opts.columns,
          groupBy: query.opts.groupBy,
          searchAll: query.opts.searchAll,
          aggregations: query.opts.aggregations,
          dataSourceId: query.dataSource.id,
          page: 0,
          size: 50,
        };

        if (!name) {
          // only use query name if no name passed
          finalName = query.name;
        }
      }

      const newWorkbenchTab = await WorkbenchTabsRepository.save(
        WorkbenchTabsRepository.create({
          name: finalName || new Date().toISOString(), // fallback to date
          opts: baseOptions,
          dataSource: {
            id: dataSourceId,
          },
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
      const newOptions = getRequestPayload<TWorkbenchOptions>(request);
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
          searchString: generateSearchString(newOptions, workbenchTab.name),
        });
      }

      const queryResult = await runSelect(request, {
        datasourceId: newOptions.dataSourceId,
        size: newOptions.size,
        name: workbenchTab.name,
        page: newOptions.page,
        opts: {
          table: newOptions.table,
          filters: newOptions.filters,
          joins: newOptions.joins,
          orderBy: newOptions.orderBy,
          columns: newOptions.columns,
          groupBy: newOptions.groupBy,
          searchAll: newOptions.searchAll,
          aggregations : newOptions.aggregations,
        }
      });

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

      let searchString: string | null = workbenchTab.searchString;
      if (body.name) {
        searchString = generateSearchString(workbenchTab.opts, body.name);
      }

      await WorkbenchTabsRepository.update(id, {
        ...body,
        searchString,
      });

      return {
        data: {
          id,
        },
      };
    }
  })
});
