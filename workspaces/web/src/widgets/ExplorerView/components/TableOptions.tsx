import {useContext} from "react";
import {QueryResultContext, TableContext, TableOptionsContext} from "../context/TableContext.ts";
import {usePagination} from "../hooks/usePagination.ts";
import {updateCreateEntity} from "../../../data/entityCreatorStore.ts";
import st from "./QueryExplorer.module.css";
import clsx from "clsx";
import {pushNewExplorerTab} from "../../../data/openTabsStore.ts";
import {useCreateQuery} from "../../../data/queries/queries.ts";
import {EUserTeamRole, TQueryOptions} from "@dataramen/types";
import {omit} from "../../../utils/omit.ts";
import {prompt} from "../../../data/promptModalStore.ts";
import {closeQueryModal} from "../../../data/queryModalStore.ts";
import {useDataSource} from "../../../data/queries/dataSources.ts";
import {useRequireRole} from "../../../hooks/useRequireRole.ts";
import {toggleShowQuerySidebar} from "../../../data/showQuerySidebarStore.ts";

export function TableOptions () {
  return (
    <div className="flex items-center bg-white border-b border-gray-200 overflow-auto no-scrollbar">
      <Main />
      <Pagination />
      <PageSize/>
      <SearchAll />
    </div>
  );
}

function Main () {
  const { dataSourceId, name } = useContext(TableContext);
  const { data: dataSource } = useDataSource(dataSourceId);
  const { state } = useContext(TableOptionsContext);
  const { refetch, data } = useContext(QueryResultContext);
  const isEditor = useRequireRole(EUserTeamRole.EDITOR);

  const createQuery = useCreateQuery();

  const onInsert = () => {
    if (data?.columns?.[0].table) {
      updateCreateEntity({
        table: data?.columns?.[0].table,
        dataSourceId,
      });
    }
  };

  const onOpen = () => {
    pushNewExplorerTab(name, state, true);
    closeQueryModal(); // in case a query is opened, close it
  };

  const onSaveQuery = async () => {
    const opts: TQueryOptions = omit(state, ["size", "page"])
    const newName = await prompt("Query name", name);

    if (!newName) {
      return;
    }

    createQuery.mutate({
      name: newName,
      dataSourceId,
      opts: opts,
    });
  };

  return (
    <div className={st.tableConfig}>
      <button data-tooltip-id="default" data-tooltip-content="Edit query parameters (joins, filters, etc...)" onClick={toggleShowQuerySidebar} className={clsx(st.tableAction, st.blue)}>
        ✏️ Query editor
      </button>

      <button data-tooltip-id="default" data-tooltip-content="Refresh data" onClick={() => refetch()} className={clsx(st.tableAction, st.blue)}>
        🔄 Refresh
      </button>

      {isEditor && (
        <button data-tooltip-id="default" data-tooltip-content="Save query" onClick={onSaveQuery} className={clsx(st.tableAction, st.blue)}>
          💾 Save
        </button>
      )}

      {isEditor && dataSource?.allowInsert === true && (
        <button data-tooltip-id="default" data-tooltip-content="Insert new row" onClick={onInsert} className={clsx(st.tableAction, st.blue)}>
          📝 New row
        </button>
      )}

      <button data-tooltip-id="default" data-tooltip-content="Clone in a new tab" onClick={onOpen} className={clsx(st.tableAction, st.blue)}>
        ↗️ Clone
      </button>
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
        ⬅️ Prev
      </button>
      <span className="lg:text-xs text-sm bg-gray-50 rounded-md px-2 border border-gray-200">{page+1}</span>
      <button
        data-tooltip-content="Next page"
        data-tooltip-id="default"
        disabled={!hasMore}
        className={clsx(st.tableAction, st.blue)}
        onClick={() => setPage(page + 1)}
      >
        Next ➡️
      </button>
    </div>
  );
}

function PageSize () {
  const { size, setSize } = usePagination();

  return (
    <div className={st.tableConfig}>
      <label className={st.tableAction} data-tooltip-content="Size" data-tooltip-id="default">
        📏
        <select
          style={{ height: "20px" }}
          value={size}
          onChange={(e) => setSize(parseInt(e.target.value, 10))}
        >
          <option value={5}>5 rows</option>
          <option value={10}>10 rows</option>
          <option value={20}>20 rows</option>
          <option value={50}>50 rows</option>
          <option value={100}>100 rows</option>
          <option value={200}>200 rows</option>
        </select>
      </label>
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
    prompt("Search all text values for", "", {
      type: "info",
      message: "This will search all text values using LIKE operator (numbers, dates and other non string values are not searched)."
    }).then((result) => {
      if (result) {
        setState((s) => ({
          ...s,
          searchAll: result,
        }));
      }
    });
  };

  return (
    <div className={st.tableConfig}>
      {state.searchAll ? (
        <button data-tooltip-id="default" data-tooltip-content="Remove search all filter" onClick={onRemoveSearchAll} className={clsx(st.tableAction, st.red)}>
          <span className="truncate px-1">❌ {state.searchAll}</span>
        </button>
      ) : (
        <button data-tooltip-id="default" data-tooltip-content="Search text in all columns" onClick={onSearchAll} className={clsx(st.tableAction, st.blue)}>
          🔎 Search text
        </button>
      )}
    </div>
  );
}
