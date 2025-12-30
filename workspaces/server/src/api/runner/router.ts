import {createRouter} from "../../utils/createRouter";
import {getRequestParams, getRequestPayload, getRequestQuery} from "../../utils/request";
import {getEntity, runInsert, runSelect, runUpdate} from "../../services/sqlRunner";
import {TExecuteInsert, TExecuteQuery, TExecuteUpdate, EUserTeamRole} from "@dataramen/types";
import {validateExecuteQueryBody, validateInsertQueryBody, validateUpdateQueryBody} from "./validators";
import {atLeast} from "../../hooks/role";
import {WorkbenchTabsRepository} from "../../repository/db";
import {async} from "fast-glob";

export default createRouter((instance) => {
  instance.route({
    method: "post",
    url: "/:dsId/select",
    handler: async (request) => {
      const payload = getRequestPayload<TExecuteQuery>(request, validateExecuteQueryBody);
      const result = await runSelect(request, payload);

      return {
        data: result,
      };
    },
  });

  instance.route({
    method: "get",
    url: "/:dsId/entity/:table",
    handler: async (request) => {
      const { dsId, table } = getRequestParams<{ dsId: string; table: string; }>(request);
      const query = getRequestQuery<Record<string, string>>(request);
      const result = await getEntity(request, {
        table,
        dataSourceId: dsId,
        props: query,
      });

      return {
        data: result,
      };
    },
  })

  instance.route({
    method: "post",
    url: "/:dsId/insert",
    config: {
      requireRole: atLeast(EUserTeamRole.EDITOR),
    },
    handler: async (request) => {
      const payload = getRequestPayload<TExecuteInsert>(request, validateInsertQueryBody);
      const result = await runInsert(request, payload);

      return {
        data: result,
      };
    }
  });

  instance.route({
    method: "post",
    url: "/:dsId/update",
    config: {
      requireRole: atLeast(EUserTeamRole.EDITOR),
    },
    handler: async (request) => {
      const payload = getRequestPayload<TExecuteUpdate>(request, validateUpdateQueryBody);
      const result = await runUpdate(request, payload);

      return {
        data: result,
      };
    },
  });
});
