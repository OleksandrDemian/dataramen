import {QueryExplorer} from "./components/QueryExplorer.tsx";
import {
  QueryResultContext,
  TableContext,
  TableOptionsContext,
  TTableOptions, TTableOptionsUpdater
} from "./context/TableContext.ts";
import {QueryBuilderSidebar} from "./components/QueryBuilderSidebar.tsx";
import {useCreateTableContext, useCreateTableOptionsContext} from "./utils.ts";
import {useTableExplorer} from "../../data/queries/queryRunner.ts";
import {TableOptions} from "./components/TableOptions.tsx";
import {TInputColumn} from "@dataramen/types";

function computeColumns(cols: TInputColumn[], groupBy: TInputColumn[], agg: TInputColumn[]): TInputColumn[] {
  const result: TInputColumn[] = [];
  if (groupBy.length > 0 || agg.length > 0) {
    result.push(...groupBy, ...agg);
  } else if (cols.length > 0) {
    result.push(...cols);
  }

  return result;
}

export type TDataSourceExplorerTabProps = {
  options: TTableOptions;
  updater: TTableOptionsUpdater;
  name: string;
  tabId?: string;
};
export const ExplorerView = ({ options, updater, name, tabId }: TDataSourceExplorerTabProps) => {
  const tableOptionsContext = useCreateTableOptionsContext(options, updater);
  const { state: tableOptions } = tableOptionsContext;

  const query = useTableExplorer({
    datasourceId: options.dataSourceId,
    table: options.table,
    filters: tableOptions.filters,
    joins: tableOptions.joins,
    page: tableOptions.page,
    size: tableOptions.size,
    orderBy: tableOptions.orderBy,
    columns: computeColumns(tableOptions.columns, tableOptions.groupBy, tableOptions.aggregations),
    groupBy: tableOptions.groupBy,
    searchAll: tableOptions.searchAll,
  });

  const context = useCreateTableContext(query.data, options.dataSourceId, name, tabId);

  return (
    <TableContext value={context}>
      <TableOptionsContext value={tableOptionsContext}>
        <QueryResultContext value={query}>
          <TableOptions />

          <div className="flex-1 flex overflow-hidden">
            <div className="m-1 flex-1 overflow-auto pb-6 no-scrollbar">
              {/* workaround, somehow this fixes table head disalignment glitch */}
              <div className="pb-0.5 sticky bottom-0" />
              <QueryExplorer />
            </div>

            <QueryBuilderSidebar />
          </div>
        </QueryResultContext>
      </TableOptionsContext>
    </TableContext>
  );
};
