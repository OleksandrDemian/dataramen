import {QueryExplorer} from "./components/QueryExplorer.tsx";
import {
  QueryResultContext,
  TableContext,
  TableOptionsContext,
  TTableOptionsUpdater
} from "./context/TableContext.ts";
import {QueryBuilderSidebar} from "./components/QueryBuilderSidebar.tsx";
import {useCreateTableContext, useCreateTableOptionsContext} from "./utils.ts";
import {TableOptions} from "./components/TableOptions.tsx";
import {FiltersModal} from "./components/FiltersModal";
import {JoinsModal} from "./components/JoinsModal";
import {ColumnsPicker} from "./components/ColumnsPicker";
import {AggregateModal} from "./components/AggregateModal";
import { TExecuteQuery } from "@dataramen/types";
import {useRunWorkbenchTab} from "../../data/queries/workbenchTabs.ts";

export type TDataSourceExplorerTabProps = {
  options: TExecuteQuery;
  updater: TTableOptionsUpdater;
  name: string;
  tabId: string;
};
export const ExplorerView = ({ options, updater, name, tabId }: TDataSourceExplorerTabProps) => {
  const tableOptionsContext = useCreateTableOptionsContext(options, updater);
  const query = useRunWorkbenchTab(tabId, options);

  const context = useCreateTableContext(query.data, options.datasourceId, name, tabId);

  return (
    <TableContext value={context}>
      <TableOptionsContext value={tableOptionsContext}>
        <QueryResultContext value={query}>
          <TableOptions />

          <div className="flex-1 flex overflow-hidden">
            <div className="m-2 flex-1 overflow-auto pb-24 lg:pb-12 no-scrollbar">
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
