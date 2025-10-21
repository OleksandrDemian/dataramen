import {TExecuteQuery, TRunSqlResult} from "./queryRunner";
import {IWorkbenchTab} from "./schemas";

export type TGetWorkbenchTabsEntry = {
  id: string;
  name: string;
};

export type TCreateWorkbenchTab = {
  name: string;
  opts?: TExecuteQuery;
  queryId?: string;
};

export type TRunWorkbenchQuery = {
  newWorkbenchId?: string;
  result: TRunSqlResult;
};

export type TUpdateWorkbenchTab = Partial<Pick<IWorkbenchTab, "name" | "archived">>;
