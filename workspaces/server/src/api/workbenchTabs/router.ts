import {createRouter} from "../../utils/createRouter";
import {QueriesRepository, WorkbenchTabsRepository} from "../../repository/db";
import {getRequestParams, getRequestPayload, getRequestQuery} from "../../utils/request";
import {HttpError} from "../../utils/httpError";
import {runSelect} from "../../services/sqlRunner";
import {
  IWorkbenchTab, IWorkbenchTabSchema, TArchiveTabsParams,
  TCreateWorkbenchTab,
  TGetWorkbenchTabsEntry,
  TUpdateWorkbenchTab,
  TWorkbenchOptions
} from "@dataramen/types";
import {validateCreateWorkbenchTab} from "./validators";
import {generateSearchString} from "../../utils/generateSearchString";
import {FindOptionsWhere, LessThan, MoreThan, Not} from "typeorm";
import {Dirent} from "node:fs";
import {getNextOrderIndex} from "./utils";

function getActiveWorkbenchTabs (teamId: string, userId: string) {
  return WorkbenchTabsRepository.find({
    where: {
      team: {
        id: teamId,
      },
      user: {
        id: userId,
      },
      archived: false,
    },
    select: ["id", "name", "orderIndex"],
    order: {
      orderIndex: "ASC",
    },
  });
}

export default createRouter((instance) => {
  instance.route({
    method: "get",
    url: "/",
    handler: async (request) => {
      const { currentTeamId, id: currentUserId } = request.user;
      const workbenchTabs = await getActiveWorkbenchTabs(currentTeamId, currentUserId);

      return {
        data: workbenchTabs,
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
          hiddenColumns: query.opts.hiddenColumns,
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

      const nextOrderIndex = await getNextOrderIndex();
      const newWorkbenchTab = await WorkbenchTabsRepository.save(
        WorkbenchTabsRepository.create({
          name: finalName || new Date().toISOString(), // fallback to date
          opts: baseOptions || {},
          orderIndex: nextOrderIndex,
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
          opts: newOptions || {},
          searchString: generateSearchString(newOptions, workbenchTab.name),
          updatedAt: new Date(),
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
          hiddenColumns: newOptions.hiddenColumns,
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
  });

  instance.route({
    method: "patch",
    url: "/:id/archive",
    handler: async (request) => {
      const { id } = getRequestParams<{ id: string }>(request);
      const archiveParams = getRequestPayload<TArchiveTabsParams>(request);
      const { currentTeamId, id: currentUserId } = request.user;

      const workbenchTab = await WorkbenchTabsRepository.findOne({
        where: {
          id,
          user: {
            id: request.user.id,
          },
        },
        select: ["id", "orderIndex"],
      });

      if (!workbenchTab) {
        throw new HttpError(404, "Not Found");
      }

      if (archiveParams.others || archiveParams.all) {
        const where = getArchiveQuery(currentTeamId, currentUserId, workbenchTab.id, archiveParams);
        await WorkbenchTabsRepository.update(where, { archived: true });
      } else {
        await WorkbenchTabsRepository.update(id, { archived: true });
      }

      const workbenchTabs = await getActiveWorkbenchTabs(currentTeamId, currentUserId);
      return {
        data: workbenchTabs,
      } satisfies { data: TGetWorkbenchTabsEntry[] };
    }
  });

  instance.route({
    method: "patch",
    url: "/:id/restore",
    handler: async (request) => {
      const { id } = getRequestParams<{ id: string }>(request);

      const workbenchTab = await WorkbenchTabsRepository.findOne({
        where: {
          id,
          user: {
            id: request.user.id,
          },
        },
        select: ["id", "archived"],
      });

      if (!workbenchTab) {
        throw new HttpError(404, "Not Found");
      }

      if (!workbenchTab.archived) {
        throw new HttpError(400, "This tab is not archived");
      }

      const nextIndex = await getNextOrderIndex();
      await WorkbenchTabsRepository.update(id, {
        archived: false,
        orderIndex: nextIndex, // move to end of list
      });

      return {
        data: {
          id,
        },
      };
    }
  });

  instance.route({
    method: "delete",
    url: "/:id",
    handler: async (request) => {
      const { id } = getRequestParams<{ id: string }>(request);
      const userId = request.user.id;

      await WorkbenchTabsRepository.delete({
        id,
        user: {
          id: userId,
        }
      });

      return {
        data: true,
      };
    },
  });
});

function getArchiveQuery (teamId: string, userId: string, tabId: string, params: TArchiveTabsParams): FindOptionsWhere<IWorkbenchTabSchema> {
  const baseParams: FindOptionsWhere<IWorkbenchTabSchema> = {
    archived: false,
    team: { id: teamId },
    user: { id: userId },
  };

  if (params.others) {
    baseParams.id = Not(tabId);
  }
  // if all do nothing

  return baseParams;
}