import {TRunSqlResult} from "./queryRunner";
import {IWorkbenchTab} from "./schemas";
import {TQueryOptions} from "./queries";

export type TWorkbenchOptions = TQueryOptions & {
  dataSourceId: string;
  page: number;
  size: number;
};

export type TGetWorkbenchTabsEntry = {
  id: string;
  name: string;
};

export type TCreateWorkbenchTab = {
  name?: string;
  opts?: TWorkbenchOptions;
  queryId?: string;
};

export type TRunWorkbenchQuery = {
  newWorkbenchId?: string;
  result: TRunSqlResult;
};

export type TUpdateWorkbenchTab = Partial<Pick<IWorkbenchTab, "name" | "archived">>;
