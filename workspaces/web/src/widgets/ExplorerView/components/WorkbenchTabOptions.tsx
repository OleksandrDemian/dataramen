import {useContext} from "react";
import {QueryResultContext, TableContext, TableOptionsContext} from "../context/TableContext.ts";
import {usePagination} from "../hooks/usePagination.ts";
import {updateCreateEntity} from "../../../data/entityCreatorStore.ts";
import st from "./QueryExplorer.module.css";
import clsx from "clsx";
import {useSaveQuery} from "../../../data/queries/queries.ts";
import {EUserTeamRole} from "@dataramen/types";
import {prompt} from "../../../data/promptModalStore.ts";
import {useDataSource} from "../../../data/queries/dataSources.ts";
import {useRequireRole} from "../../../hooks/useRequireRole.ts";
import {showExplorerModal} from "../hooks/useExplorerModals.ts";
import {Tooltip} from "react-tooltip";
import Chevron from "../../../assets/chevron-forward-outline.svg?react";
import Refresh from "../../../assets/refresh-outline.svg?react";
import Duplicate from "../../../assets/duplicate-outline.svg?react";
import Share from "../../../assets/share-social-outline.svg?react";
import toast from "react-hot-toast";
import {PAGES} from "../../../const/pages.ts";
import {useCreateWorkbenchTab} from "../../../data/queries/workbenchTabs.ts";
import {useNavigate} from "react-router-dom";
import {useRenameTab} from "../../../hooks/useRenameTab.ts";
import {useHotkeys} from "react-hotkeys-hook";

export function WorkbenchTabOptions () {
  return (
    <div className="flex items-center bg-white border-b border-gray-200 overflow-auto no-scrollbar">
      <QueryManipulation />
      <Pagination />
    </div>
  );
}

function QueryManipulation() {
  const { dataSourceId, name } = useContext(TableContext);
  const { data: dataSource } = useDataSource(dataSourceId);
  const { data } = useContext(QueryResultContext);
  const isEditor = useRequireRole(EUserTeamRole.EDITOR);
  const saveQuery = useSaveQuery();
  const { rename } = useRenameTab();

  const onInsert = () => {
    if (data?.result.columns?.[0].table) {
      updateCreateEntity({
        table: data?.result.columns?.[0].table,
        dataSourceId,
      });
    }
  };

  const onSaveQuery = async () => {
    const newName = await prompt("Query name", name);

    if (!newName || !data?.result.queryHistoryId) {
      return;
    }

    saveQuery.mutate({
      name: newName,
      queryId: data.result.queryHistoryId,
    });
  };

  const onRename = () => rename(name);

  useHotkeys("s", onSaveQuery);
  useHotkeys("r", onRename);

  return (
    <div className={st.tableConfig}>
      <button data-tooltip-id="default" data-tooltip-content="Rename tab" onClick={onRename} className={clsx(st.tableAction, st.blue, "block")}>
        <span className={st.tabName}>🛠️ {name}</span>
      </button>

      <button data-tooltip-id="explorer-more-actions" className={clsx(st.tableAction, st.blue)}>
        <span className="whitespace-nowrap">Options</span>
        <Chevron width={16} height={16} className="rotate-90" />
      </button>

      <Tooltip id="explorer-more-actions" className="z-10 shadow-md flex flex-col" clickable variant="light" opacity={1}>
        <button data-tooltip-id="default" data-tooltip-content="Manage filters" onClick={() => showExplorerModal("filters")} className={clsx(st.tableAction, st.modal, st.blue)}>
          <span>Filters</span>
          <span className="hotkey">F</span>
        </button>

        <button data-tooltip-id="default" data-tooltip-content="Join tables" onClick={() => showExplorerModal("joins")} className={clsx(st.tableAction, st.modal, st.blue)}>
          <span>Joins</span>
          <span className="hotkey">J</span>
        </button>

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
function Pagination () {
  const { page, size, setPage, setSize } = usePagination();
  const { data, refetch, isFetching } = useContext(QueryResultContext);
  const { name } = useContext(TableContext);
  const { state } = useContext(TableOptionsContext);

  const createWorkbenchTab = useCreateWorkbenchTab();
  const navigate = useNavigate();

  const onCloneTab = () => {
    createWorkbenchTab.mutateAsync({
      name,
      opts: state,
    }).then((result) => {
      navigate(`${PAGES.workbench.path}/tab/${result.id}`)
    })
  };

  const onShare = () => {
    if (data?.result.queryHistoryId) {
      const url = new URL(window.location.href);
      url.pathname = PAGES.share.path;
      url.searchParams.set("shareId", data.result.queryHistoryId);
      navigator.clipboard.writeText(url.toString());
      toast.success("Share link copied to clipboard");
    }
  };

  useHotkeys("d", onCloneTab);

  const currentStartIndex = page * size;
  const canShare = true;// window?.location.hostname !== 'localhost';
  const hasMoreData = !isFetching && !!data?.result.hasMore;
  const currentBatchRows = data?.result.rows.length || 0;

  const onPrevPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const onNextPage = () => {
    if (hasMoreData) {
      setPage(page + 1);
    }
  };

  return (
    <div className={st.tableConfig}>
      <span
        className={st.paginationIndicator}
        data-tooltip-id="rows-num"
      >
        {size} rows
      </span>

      <span
        data-tooltip-content="Previous page"
        data-tooltip-id="default"
        className={clsx(st.tableAction, st.blue)}
        onClick={onPrevPage}
        role="button"
      >
        <Chevron width={16} height={16} className="rotate-180" />
      </span>

      <span
        className={st.paginationIndicator}
      >
        {currentStartIndex + 1} - {currentStartIndex + currentBatchRows}{hasMoreData && "+"}
      </span>

      <span
        data-tooltip-content="Next page"
        data-tooltip-id="default"
        className={clsx(st.tableAction, hasMoreData ? st.blue : "opacity-30")}
        onClick={onNextPage}
        role="button"
      >
        <Chevron width={16} height={16} />
      </span>
      <span
        data-tooltip-content="Refresh data"
        data-tooltip-id="default"
        className={clsx(st.tableAction, st.blue)}
        onClick={() => refetch()}
        role="button"
      >
        <Refresh width={16} height={16} />
      </span>

      {canShare && (
        <span
          data-tooltip-content="Share query"
          data-tooltip-id="default"
          className={clsx(st.tableAction, st.blue)}
          onClick={onShare}
          role="button"
        >
          <Share width={16} height={16} />
        </span>
      )}

      <span
        data-tooltip-content="Duplicate tab"
        data-tooltip-id="default"
        className={clsx(st.tableAction, st.blue)}
        onClick={onCloneTab}
        role="button"
      >
        <Duplicate width={16} height={16} />
      </span>

      <Tooltip id="rows-num" className="z-10 shadow-md flex" clickable variant="light" opacity={1}>
        {rows.map((num) => (
          <button key={num} onClick={() => setSize(num, true)} className={clsx(st.tableAction, st.blue)}>
            <span>{num}</span>
          </button>
        ))}
      </Tooltip>
    </div>
  );
}
