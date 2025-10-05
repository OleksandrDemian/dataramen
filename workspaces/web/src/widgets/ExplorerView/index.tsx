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
import {FiltersModal} from "./components/FiltersModal";
import {JoinsModal} from "./components/JoinsModal";
import {ColumnsPicker} from "./components/ColumnsPicker";
import {AggregateModal} from "./components/AggregateModal";

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
    name,
    opts: {
      table: options.table,
      filters: tableOptions.filters,
      joins: tableOptions.joins,
      orderBy: tableOptions.orderBy,
      columns: tableOptions.columns,
      aggregations: tableOptions.aggregations,
      groupBy: tableOptions.groupBy,
      searchAll: tableOptions.searchAll,
    },
    page: tableOptions.page,
    size: tableOptions.size,
  });

  const context = useCreateTableContext(query.data, options.dataSourceId, name, tabId);

  return (
    <TableContext value={context}>
      <TableOptionsContext value={tableOptionsContext}>
        <QueryResultContext value={query}>
          <TableOptions />

          <div className="flex-1 flex overflow-hidden">
            <div className="m-1 flex-1 overflow-auto pb-24 lg:pb-12 no-scrollbar">
              {/* workaround, somehow this fixes table head disalignment glitch */}
              <div className="pb-0.5 sticky bottom-0" />
              <QueryExplorer />
            </div>

            <FiltersModal />
            <JoinsModal />
            <ColumnsPicker mode="columns" />
            <ColumnsPicker mode="groupBy" />
            <AggregateModal />
            <QueryBuilderSidebar />
          </div>
        </QueryResultContext>
      </TableOptionsContext>
    </TableContext>
  );
};
