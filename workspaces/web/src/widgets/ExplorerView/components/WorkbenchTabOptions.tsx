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
import OptionsIcon from "../../../assets/ellipsis-vertical-outline.svg?react";
import Refresh from "../../../assets/refresh-outline.svg?react";
import Duplicate from "../../../assets/duplicate-outline.svg?react";
import Share from "../../../assets/share-social-outline.svg?react";
import FilterIcon from "../../../assets/filter-outline.svg?react";
import AddIcon from "../../../assets/add-outline.svg?react";
import toast from "react-hot-toast";
import {PAGES} from "../../../const/pages.ts";
import {useCreateWorkbenchTab} from "../../../data/queries/workbenchTabs.ts";
import {useNavigate} from "react-router-dom";
import {useRenameTab} from "../../../hooks/useRenameTab.ts";
import {useHotkeys} from "react-hotkeys-hook";
import {DataSourceIcon} from "../../Icons";

export function WorkbenchTabOptions () {
  return (
    <div className="flex md:grid md:grid-cols-3 items-center bg-white overflow-auto no-scrollbar">
      <RootInfo />
      <Pagination />
      <MoreOptions />
    </div>
  );
}

function RootInfo() {
  const { dataSourceId } = useContext(TableContext);
  const { data: dataSource } = useDataSource(dataSourceId);
  const { state: { table } } = useContext(TableOptionsContext);

  return (
    <div className={st.tableConfig}>
      {dataSource && (
        <div className={clsx(st.tableAction, st.greenFixed)} data-tooltip-id="default" data-tooltip-content={table}>
          <DataSourceIcon size={18} type={dataSource.dbType} />
          <p className="text-sm">{dataSource.name}</p>
          <Chevron width={12} height={12} />
          <p className="text-sm">{table}</p>
        </div>
      )}
    </div>
  );
}

function Pagination () {
  const { page, size, setPage } = usePagination();
  const { data, isFetching } = useContext(QueryResultContext);

  const currentStartIndex = page * size;
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
    <div className={clsx(st.tableConfig, "justify-self-center")}>
      <span
        data-tooltip-content="Previous page"
        data-tooltip-id="default"
        className={clsx(st.tableAction, st.gray, page < 1 && "opacity-30")}
        onClick={onPrevPage}
        role="button"
      >
        <Chevron width={16} height={16} className="rotate-180" />
      </span>

      <span
        data-tooltip-id="rows-num"
        className={st.paginationIndicator}
      >
        {currentStartIndex + 1} - {currentStartIndex + currentBatchRows}{hasMoreData && "+"}
      </span>

      <span
        data-tooltip-content="Next page"
        data-tooltip-id="default"
        className={clsx(st.tableAction, hasMoreData ? st.gray : "opacity-30")}
        onClick={onNextPage}
        role="button"
      >
        <Chevron width={16} height={16} />
      </span>
    </div>
  );
}

const rows = [5, 10, 20, 50, 100, 200];
const canShare = !__CLIENT_CONFIG__.skipAuth;
function MoreOptions () {
  const { dataSourceId, name } = useContext(TableContext);
  const { data: dataSource } = useDataSource(dataSourceId);
  const { data, refetch } = useContext(QueryResultContext);
  const isEditor = useRequireRole(EUserTeamRole.EDITOR);
  const saveQuery = useSaveQuery();
  const { rename } = useRenameTab();
  const { size, setSize } = usePagination();
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
  useHotkeys("d", onCloneTab);

  return (
    <div className="flex justify-self-end">
      <span
        data-tooltip-content="Show filters"
        data-tooltip-id="default"
        className={clsx(st.tableAction, st.gray)}
        onClick={() => showExplorerModal("filters")}
        role="button"
      >
        <FilterIcon width={16} height={16} />
      </span>

      <span
        data-tooltip-content="Join table"
        data-tooltip-id="default"
        className={clsx(st.tableAction, st.gray)}
        onClick={() => showExplorerModal("joins")}
        role="button"
      >
        <AddIcon width={16} height={16} />
      </span>

      <span
        data-tooltip-content="Refresh data"
        data-tooltip-id="default"
        className={clsx(st.tableAction, st.gray)}
        onClick={() => refetch()}
        role="button"
      >
        <Refresh width={16} height={16} />
      </span>

      {canShare && (
        <span
          data-tooltip-content="Share query"
          data-tooltip-id="default"
          className={clsx(st.tableAction, st.gray)}
          onClick={onShare}
          role="button"
        >
          <Share width={16} height={16} />
        </span>
      )}

      <span
        data-tooltip-content="Duplicate tab"
        data-tooltip-id="default"
        className={clsx(st.tableAction, st.gray)}
        onClick={onCloneTab}
        role="button"
      >
        <Duplicate width={16} height={16} />
      </span>

      <Tooltip id="rows-num" className="z-10 shadow-md flex gap-1" clickable variant="light" opacity={1}>
        {rows.map((num) => (
          <button key={num} onClick={() => setSize(num, true)} className={clsx(st.tableAction, st.gray, num === size && st.selectedSize)}>
            <span>{num}</span>
          </button>
        ))}
      </Tooltip>

      <button data-tooltip-id="explorer-more-actions" className={clsx(st.tableAction, st.gray)}>
        <OptionsIcon width={16} height={16} />
      </button>

      <Tooltip id="explorer-more-actions" className="z-10 shadow-md flex flex-col" clickable variant="light" opacity={1}>
        <button onClick={() => showExplorerModal("columns")} className={clsx(st.tableAction, st.modal, st.gray, "justify-between")}>
          <span>Columns</span>
          <span className="hotkey">C</span>
        </button>

        <button onClick={() => showExplorerModal("groupBy")} className={clsx(st.tableAction, st.modal, st.gray, "justify-between")}>
          <span>Group by</span>
          <span className="hotkey">G</span>
        </button>

        <button onClick={() => showExplorerModal("aggregate")} className={clsx(st.tableAction, st.modal, st.gray, "justify-between")}>
          <span>Aggregate</span>
          <span className="hotkey">A</span>
        </button>

        <div className="h-0.5 my-2 bg-gray-100" />

        <button onClick={onRename} className={clsx(st.tableAction, st.modal, st.gray, "justify-between")}>
          <span>Rename tab</span>
          <span className="hotkey">R</span>
        </button>

        {isEditor && (
          <>
            <button onClick={onSaveQuery} className={clsx(st.tableAction, st.modal, st.gray)}>
              <span>Save query</span>
              <span className="hotkey">S</span>
            </button>

            {dataSource?.allowInsert === true && (
              <button onClick={onInsert} className={clsx(st.tableAction, st.modal, st.gray)}>
                Insert new row
              </button>
            )}
          </>
        )}
      </Tooltip>
    </div>
  )
}
