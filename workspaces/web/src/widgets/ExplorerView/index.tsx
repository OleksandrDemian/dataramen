import {QueryExplorer} from "./components/QueryExplorer.tsx";
import {
  QueryResultContext,
  TableContext,
  TableOptionsContext,
  TTableOptionsUpdater
} from "./context/TableContext.ts";
import {useCreateTableContext, useCreateTableOptionsContext} from "./utils.ts";
import {WorkbenchTabOptions} from "./components/WorkbenchTabOptions.tsx";
import {FiltersModal} from "./components/FiltersModal";
import {JoinsModal} from "./components/JoinsModal";
import {ColumnsPicker} from "./components/ColumnsPicker";
import {AggregateModal} from "./components/AggregateModal";
import {TWorkbenchOptions} from "@dataramen/types";
import {useRunWorkbenchTab} from "../../data/queries/workbenchTabs.ts";
import {QueryInfoRow} from "./components/QueryInfoRow.tsx";
import {Alert} from "../Alert";

export type TDataSourceExplorerTabProps = {
  options: TWorkbenchOptions;
  updater: TTableOptionsUpdater;
  name: string;
  tabId: string;
};
export const ExplorerView = ({ options, updater, name, tabId }: TDataSourceExplorerTabProps) => {
  const tableOptionsContext = useCreateTableOptionsContext(options, updater);
  const query = useRunWorkbenchTab(tabId, tableOptionsContext.state);

  const context = useCreateTableContext(query.data, tableOptionsContext.state.dataSourceId, name, tabId);

  if (query.isError) {
    return (
      <div className="flex-1">
        <Alert variant="danger">Failed to load query</Alert>
      </div>
    );
  }

  return (
    <TableContext value={context}>
      <TableOptionsContext value={tableOptionsContext}>
        <QueryResultContext value={query}>
          <WorkbenchTabOptions />
          <QueryInfoRow />

          <div className="flex-1 flex overflow-hidden border-t border-gray-200">
            <div className="flex-1 overflow-auto pb-24 lg:pb-12 no-scrollbar">
              {/* workaround, somehow this fixes table head disalignment glitch */}
              <QueryExplorer />
            </div>

            <FiltersModal />
            <JoinsModal />
            <ColumnsPicker mode="columns" />
            <ColumnsPicker mode="groupBy" />
            <AggregateModal />
            {/*<QueryBuilderSidebar />*/}
          </div>
        </QueryResultContext>
      </TableOptionsContext>
    </TableContext>
  );
};
