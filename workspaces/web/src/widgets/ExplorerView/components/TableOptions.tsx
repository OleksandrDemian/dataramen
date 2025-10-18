import {useContext} from "react";
import {QueryResultContext, TableContext, TableOptionsContext} from "../context/TableContext.ts";
import {usePagination} from "../hooks/usePagination.ts";
import {updateCreateEntity} from "../../../data/entityCreatorStore.ts";
import st from "./QueryExplorer.module.css";
import clsx from "clsx";
import {pushNewExplorerTab, renameTab} from "../../../data/openTabsStore.ts";
import {useSaveQuery} from "../../../data/queries/queries.ts";
import {EUserTeamRole} from "@dataramen/types";
import {prompt} from "../../../data/promptModalStore.ts";
import {closeQueryModal} from "../../../data/queryModalStore.ts";
import {useDataSource} from "../../../data/queries/dataSources.ts";
import {useRequireRole} from "../../../hooks/useRequireRole.ts";
import {toggleShowQuerySidebar} from "../../../data/showQuerySidebarStore.ts";
import {useGlobalHotkey} from "../../../hooks/useGlobalHotkey.ts";
import {showExplorerModal} from "../hooks/useExplorerModals.ts";
import {Tooltip} from "react-tooltip";
import Chevron from "../../../assets/chevron-forward-outline.svg?react";
import toast from "react-hot-toast";
import {PAGES} from "../../../const/pages.ts";

export function TableOptions () {
  return (
    <div className="flex items-center bg-white border-b border-gray-200 overflow-auto no-scrollbar">
      <QueryManipulation />
      <TabOptions />
      <Pagination />
    </div>
  );
}

function QueryManipulation() {
  const { dataSourceId, name, tabId } = useContext(TableContext);
  const { data: dataSource } = useDataSource(dataSourceId);
  const { data } = useContext(QueryResultContext);
  const isEditor = useRequireRole(EUserTeamRole.EDITOR);
  const saveQuery = useSaveQuery();

  const onInsert = () => {
    if (data?.columns?.[0].table) {
      updateCreateEntity({
        table: data?.columns?.[0].table,
        dataSourceId,
      });
    }
  };

  const onSaveQuery = async () => {
    const newName = await prompt("Query name", name);

    if (!newName || !data?.queryHistoryId) {
      return;
    }

    saveQuery.mutate({
      name: newName,
      queryId: data.queryHistoryId,
    });

    if (tabId) {
      renameTab(tabId, newName);
    }
  };

  useGlobalHotkey("s", onSaveQuery, "Save query");

  return (
    <div className={st.tableConfig}>
      <button data-tooltip-id="default" data-tooltip-content="Manage filters" onClick={() => showExplorerModal("filters")} className={clsx(st.tableAction, st.blue)}>
        <span>Filter</span>
        <span className="hotkey">F</span>
      </button>

      <button data-tooltip-id="default" data-tooltip-content="Join tables" onClick={() => showExplorerModal("joins")} className={clsx(st.tableAction, st.blue)}>
        <span>Join</span>
        <span className="hotkey">J</span>
      </button>

      <SearchAll />

      <button data-tooltip-id="explorer-more-actions" className={clsx(st.tableAction, st.blue)}>
        <span className="whitespace-nowrap">More actions</span>
        <Chevron width={16} height={16} className="rotate-90" />
      </button>

      <Tooltip id="explorer-more-actions" className="z-10 shadow-md flex flex-col" clickable variant="light" opacity={1}>
        <button onClick={() => showExplorerModal("columns")} className={clsx(st.tableAction, st.modal, st.blue, "justify-between")}>
          <span>Columns</span>
          <span className="hotkey">C</span>
        </button>

        <button onClick={() => showExplorerModal("groupBy")} className={clsx(st.tableAction, st.modal, st.blue, "justify-between")}>
          <span>Group by</span>
          <span className="hotkey">G</span>
        </button>

        <button onClick={() => showExplorerModal("aggregate")} className={clsx(st.tableAction, st.modal, st.blue, "justify-between")}>
          <span>Aggregate</span>
          <span className="hotkey">A</span>
        </button>

        <button onClick={toggleShowQuerySidebar} className={clsx(st.tableAction, st.modal, st.blue, "justify-between")}>
          <span>Query editor</span>
          <span className="hotkey">E</span>
        </button>

        {isEditor && (
          <>
            <div className="h-0.5 my-2 bg-gray-100" />

            <button onClick={onSaveQuery} className={clsx(st.tableAction, st.modal, st.blue)}>
              <span>Save query</span>
              <span className="hotkey">S</span>
            </button>

            {dataSource?.allowInsert === true && (
              <button onClick={onInsert} className={clsx(st.tableAction, st.modal, st.blue)}>
                Insert new row
              </button>
            )}
          </>
        )}
      </Tooltip>
    </div>
  );
}

const rows = [5, 10, 20, 50, 100, 200];

function TabOptions () {
  const { name } = useContext(TableContext);
  const { state } = useContext(TableOptionsContext);
  const { refetch, data: queryResult } = useContext(QueryResultContext);
  const { size, setSize } = usePagination();

  const canShare = window?.location.hostname !== 'localhost';

  const onOpen = () => {
    pushNewExplorerTab(name, state, true);
    closeQueryModal(); // in case a query is opened, close it
  };

  const onShare = () => {
    if (queryResult?.queryHistoryId) {
      const url = new URL(window.location.href);
      url.pathname = PAGES.share.path;
      url.searchParams.set("shareId", queryResult.queryHistoryId);
      navigator.clipboard.writeText(url.toString());
      toast.success("Share link copied to clipboard");
    }
  };

  useGlobalHotkey("e", toggleShowQuerySidebar, "Show editor sidebar");

  return (
    <div className={st.tableConfig}>
      {/* @ts-ignore onClick refetch*/}
      <button data-tooltip-id="default" data-tooltip-content="Refresh data" onClick={refetch} className={clsx(st.tableAction, st.blue)}>
        Refresh
      </button>

      {canShare && (
        <button data-tooltip-id="default" data-tooltip-content="Share query" onClick={onShare} className={clsx(st.tableAction, st.blue)}>
          Share
        </button>
      )}

      <button data-tooltip-id="default" data-tooltip-content="Clone in a new tab" onClick={onOpen} className={clsx(st.tableAction, st.blue)}>
        Clone
      </button>

      <button data-tooltip-id="rows-num" className={clsx(st.tableAction, st.size, st.blue)}>
        <span className="whitespace-nowrap">{size} rows</span>
        <Chevron width={16} height={16} className="rotate-90" />
      </button>

      <Tooltip id="rows-num" className="z-10 shadow-md flex" clickable variant="light" opacity={1}>
        {rows.map((num) => (
          <button onClick={() => setSize(num)} className={clsx(st.tableAction, st.blue)}>
            <span>{num}</span>
          </button>
        ))}
      </Tooltip>
    </div>
  );
}

function Pagination () {
  const { page, size, setPage } = usePagination();
  const { data } = useContext(QueryResultContext);

  const hasMore = data?.rows.length === size;

  return (
    <div className={st.tableConfig}>
      <button
        data-tooltip-content="Previous page"
        data-tooltip-id="default"
        disabled={page <= 0}
        className={clsx(st.tableAction, st.blue)}
        onClick={() => setPage(page - 1)}
      >
        Prev
      </button>
      <span className="text-sm bg-gray-50 rounded-md px-2 border border-gray-200">{page+1}</span>
      <button
        data-tooltip-content="Next page"
        data-tooltip-id="default"
        disabled={!hasMore}
        className={clsx(st.tableAction, st.blue)}
        onClick={() => setPage(page + 1)}
      >
        Next
      </button>
    </div>
  );
}

function SearchAll () {
  const { state, setState } = useContext(TableOptionsContext);

  const onRemoveSearchAll = () => {
    setState((s) => ({
      ...s,
      searchAll: undefined,
    }));
  };

  const onSearchAll = () => {
    prompt("Search all text values for", state.searchAll || "", {
      type: "info",
      message: "This will search all text values using LIKE operator (numbers, dates and other non string values are not searched)."
    }).then((result) => {
      if (result !== undefined) {
        setState((s) => ({
          ...s,
          searchAll: result.length > 0 ? result : undefined,
        }));
      }
    });
  };

  useGlobalHotkey("k", onSearchAll, "Search text");

  if (state.searchAll) {
    return (
      <button data-tooltip-id="default" data-tooltip-content="Remove search all filter" onClick={onRemoveSearchAll} className={clsx(st.tableAction, st.red)}>
        <span className="truncate px-1">❌ {state.searchAll}</span>
      </button>
    );
  }

  return (
    <button data-tooltip-id="default" data-tooltip-content="Search text in all columns" onClick={onSearchAll} className={clsx(st.tableAction, st.blue)}>
      <span className="whitespace-nowrap">Search text</span>
      <span className="hotkey">K</span>
    </button>
  );
}
