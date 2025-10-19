import {createRouter} from "../../utils/createRouter";
import {getRequestPayload} from "../../utils/request";
import {runInsert, runSelect, runUpdate} from "../../services/sqlRunner";
import {TExecuteInsert, TExecuteQuery, TExecuteUpdate, EUserTeamRole} from "@dataramen/types";
import {validateExecuteQueryBody, validateInsertQueryBody, validateUpdateQueryBody} from "./validators";
import {atLeast} from "../../hooks/role";
import {WorkbenchTabsRepository} from "../../repository/db";

export default createRouter((instance) => {
  instance.route({
    method: "post",
    url: "/select",
    handler: async (request) => {
      const payload = getRequestPayload<TExecuteQuery>(request, validateExecuteQueryBody);
      const result = await runSelect(request, payload);

      if (payload.workbenchTabId) {
        WorkbenchTabsRepository.update(payload.workbenchTabId, {
          query: {
            id: result.queryHistoryId,
          },
        });
      }

      return {
        data: result,
      };
    },
  });

  instance.route({
    method: "post",
    url: "/insert",
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
    url: "/update",
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
