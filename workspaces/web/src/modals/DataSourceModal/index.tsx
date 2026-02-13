import {setDataSourceModal, useDataSourceModal} from "../../data/sidebarDispatchersStore.ts";
import {
  useDatabaseInspections,
  useDataSource,
  useDeleteDataSource,
  useManualInspectDataSource,
  useUpdateDataSource
} from "../../data/queries/dataSources.ts";
import {useEffect, useMemo, useState} from "react";
import {prompt} from "../../data/promptModalStore.ts";
import {confirm} from "../../data/confirmModalStore.ts";
import st from "./index.module.css";
import {TDatabaseInspection} from "../../data/types/dataSources.ts";
import clsx from "clsx";
import ChevronIcon from "../../assets/chevron-forward-outline.svg?react";
import {PAGES} from "../../const/pages.ts";
import {useNavigate} from "react-router-dom";
import {DataSourceIcon} from "../../widgets/Icons";
import {EUserTeamRole} from "@dataramen/types";
import {useRequireRole} from "../../hooks/useRequireRole.ts";
import {Sidebar} from "../../widgets/Sidebar";
import {useCreateWorkbenchTab} from "../../data/queries/workbenchTabs.ts";
import {createTableOptions} from "../../widgets/ExplorerView/utils.ts";
import CopyIcon from "../../assets/copy-outline.svg?react";
import OpenIcon from "../../assets/open-outline.svg?react"
import EditIcon from "../../assets/pencil-outline.svg?react"
import RefreshIcon from "../../assets/refresh-outline.svg?react"
import TrashIcon from "../../assets/trash-bin-outline.svg?react"
import {copyText} from "../../utils/copyText.ts";
import {Spinner} from "../../widgets/Spinner";
import {useRefetchInspectionGuard} from "./useRefetchInspectionGuard.ts";

const formatter = new Intl.DateTimeFormat("en", {
  dateStyle: "full",
  timeStyle: "long",
});

const tableActionSize = 18;

function getLabelClass (label: string, filter: string): string | undefined {
  if (!!filter && label.toLowerCase().includes(filter)) {
    return "bg-yellow-200 cursor-pointer";
  }

  return "cursor-pointer";
}

const InspectionList = ({ insp, filter, expanded }: { insp: TDatabaseInspection; filter: string; expanded: boolean }) => {
  const columns = useMemo(() => {
    if (expanded) {
      return insp.columns;
    }

    if (filter.length < 1) {
      return [];
    }

    return insp.columns.filter((column) => column.name.toLowerCase().includes(filter));
  }, [insp, filter, expanded]);

  return (
    <ul className={st.ul} key={insp.id}>
      {columns.map((col) => (
        <>
          <li key={col.name + col.type}>
            {col.isPrimary ? '🔐' : '🏷️'} <span onClick={() => copyText(col.name)} className={getLabelClass(col.name, filter)}>{col.name}</span> <span className={st.columnType}>[{col.type}]</span>
            {col.ref && (
              <span> ➡️ <span className={st.columnType}>{col.ref.table}</span>.{col.ref.field}</span>
            )}
          </li>
        </>
      ))}
    </ul>
  );
};

function Component ({ id }: { id: string }) {
  const { data: dataSource } = useDataSource(id);
  const { data: tables } = useDatabaseInspections(id);

  const navigate = useNavigate();
  const update = useUpdateDataSource();
  const inspector = useManualInspectDataSource();
  const deleter = useDeleteDataSource();

  const createWorkbenchTab = useCreateWorkbenchTab();

  const lastInspected = useMemo(() => {
    if (dataSource?.lastInspected) {
      return formatter.format(new Date(dataSource.lastInspected));
    }
    return "--";
  }, [dataSource]);

  // Create a state variable for each table's dropdown visibility
  const [dropdownVisibility, setDropdownVisibility] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<string>("");
  const [searchType, setSearchType] = useState<"column" | "table">("table");
  const isEditor = useRequireRole(EUserTeamRole.EDITOR);

  const lowerFilter = filter.toLowerCase();
  const filtered = useMemo<TDatabaseInspection[]>(() => {
    if (!lowerFilter || !tables) {
      return tables || [];
    }

    const show: TDatabaseInspection[] = [];

    for (const insp of tables) {
      if (insp.tableName.toLowerCase().includes(lowerFilter)) {
        show.push(insp);
        continue;
      }

      if (searchType === "table") {
        continue;
      }

      if (insp.columns.findIndex((col) => col.name.toLowerCase().includes(lowerFilter)) >= 0) {
        show.push(insp);
      }
    }

    return show;
  }, [lowerFilter, tables, searchType]);

  const toggleDropdown = (id: string) => {
    setDropdownVisibility(prevState => ({
      ...prevState,
      [id]: !prevState[id]
    }));
  };

  const openTable = (table: string) => {
    createWorkbenchTab.mutateAsync({
      name: table,
      opts: createTableOptions({
        table,
        dataSourceId: id,
      })
    }).then((result) => {
      setDataSourceModal(undefined);
      navigate(PAGES.workbenchTab.build({ id: result.id }));
    });
  };

  const onInspect = () => {
    inspector.mutate(id);
  };

  const onRename = async () => {
    const name = await prompt("Enter name", dataSource?.name);
    if (name) {
      update.mutate({
        id,
        dataSource: {
          name
        },
      });
    }
  };

  const onDelete = async () => {
    const result = await confirm("Are you sure you want to delete this data source?");
    if (result) {
      deleter.mutate(id);
      setDataSourceModal(undefined);
    }
  };

  useRefetchInspectionGuard(dataSource);
  const isColumn = searchType === "column";
  const isInspecting = dataSource?.status === "INSPECTING";

  return (
    <div className={st.root}>
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-2 z-1">
        <div className={st.dbHeaderContainer}>
          <div className={st.dbHeader}>
            {dataSource && (
              <DataSourceIcon size={24} type={dataSource.dbType} />
            )}
            <p className="truncate text-(--text-color-primary) text-lg">{dataSource?.name}</p>
          </div>

          <div className={st.dbSubheader}>
            <p className="text-xs text-(--text-color-secondary) truncate">{lastInspected}</p>
            {isEditor && (
              <div className="flex justify-end">
                <button disabled={inspector.isPending || isInspecting} onClick={onInspect} className={st.actionBlue} data-tooltip-id="default-xs" data-tooltip-content="Refresh schema">
                  <RefreshIcon width={16} height={16} />
                </button>

                <button disabled={inspector.isPending} onClick={onRename} className={st.actionBlue} data-tooltip-id="default-xs" data-tooltip-content="Update name">
                  <EditIcon width={16} height={16} />
                </button>

                <button disabled={inspector.isPending} onClick={onDelete} className={st.actionRed} data-tooltip-id="default-xs" data-tooltip-content="Delete data source">
                  <TrashIcon width={16} height={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 items-center mt-2">
          <select
            className="input"
            value={searchType}
            onChange={(e) => setSearchType(e.currentTarget.value as any)}
          >
            <option value="table">Table</option>
            <option value="column">Column</option>
          </select>
          <input
            className="input flex-1 bg-gray-50"
            placeholder={isColumn ? "Search column" : "Search table"}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      {isInspecting && (
        <div className="flex justify-center gap-2 items-center bg-blue-50 p-4 rounded">
          <Spinner size={16} />
          <p className="text-xs text-blue-800">Inspecting schema</p>
        </div>
      )}

      <div className={clsx("overflow-y-auto p-4", isInspecting && "opacity-30")}>
        {filtered?.map((table) => (
          <div key={table.id}>
            <div className={st.tableNameContainer}>
              <button className={clsx(st.chevron, dropdownVisibility[table.id] ? st.down : st.up)} onClick={() => toggleDropdown(table.id)}>
                <ChevronIcon width={16} height={16} />
              </button>

              <button className={clsx(st.tableName, "flex-1")} onClick={() => toggleDropdown(table.id)}>
                {table.tableName}
              </button>

              <button className={st.link} onClick={() => openTable(table.tableName)} data-tooltip-id="default-xs" data-tooltip-content="Explore table data">
                <OpenIcon width={tableActionSize} height={tableActionSize} />
              </button>

              <button className={st.link} onClick={() => copyText(table.tableName)} data-tooltip-id="default-xs" data-tooltip-content="Copy table name">
                <CopyIcon width={tableActionSize} height={tableActionSize} />
              </button>
            </div>

            {(dropdownVisibility[table.id] || filter.length > 0) && (
              <InspectionList insp={table} filter={isColumn ? lowerFilter : ""} expanded={dropdownVisibility[table.id]} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export const DataSourceSidebar = () => {
  const shownDataSource = useDataSourceModal();
  const [dataSourceId, setDataSourceId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (shownDataSource) {
      setDataSourceId(shownDataSource);
    }
  }, [shownDataSource]);

  const onClose = () => setDataSourceModal(undefined);

  return (
    <Sidebar isVisible={shownDataSource != null} onClose={onClose} onClosed={() => setDataSourceId(undefined)} backdropClose>
      {dataSourceId && (
        <Component id={dataSourceId} />
      )}
    </Sidebar>
  );
};
