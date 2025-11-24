import {setDataSourceModal, useDataSourceModal} from "../../data/dataSourceModalStore.ts";
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
import {Analytics} from "../../utils/analytics.ts";
import {DataSourceIcon} from "../../widgets/Icons";
import {EUserTeamRole} from "@dataramen/types";
import {useRequireRole} from "../../hooks/useRequireRole.ts";
import {closeMenuSidebar} from "../../data/showSidebarMenuStore.ts";
import {Sidebar} from "../../widgets/Sidebar";
import {useCreateWorkbenchTab} from "../../data/queries/workbenchTabs.ts";
import {createTableOptions} from "../../widgets/ExplorerView/utils.ts";

const formatter = new Intl.DateTimeFormat("en", {
  dateStyle: "full",
  timeStyle: "long",
});

function getLabelClass (label: string, filter: string): string | undefined {
  if (!!filter && label.toLowerCase().includes(filter)) {
    return "bg-yellow-200";
  }

  return undefined;
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
            {col.isPrimary ? '🔐' : '🏷️'} <span className={getLabelClass(col.name, filter)}>{col.name}</span> <span className={st.columnType}>[{col.type}]</span>
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
      closeMenuSidebar();
      navigate(`${PAGES.workbench.path}/tab/${result.id}`);
    });

    Analytics.event("On open table [Datasource modal]");
  };

  const onInspect = () => {
    inspector.mutate(id);
    Analytics.event("On inspect [Datasource modal]");
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
      Analytics.event("On delete [Datasource modal]");
    }
  };

  const isColumn = searchType === "column";

  return (
    <div className={st.root}>
      <h3 className="page-head flex gap-2">
        {dataSource && <DataSourceIcon size={32} type={dataSource.dbType} />}
        <span className="truncate">{dataSource?.name}</span>
      </h3>

      <p className="mt-2 text-xs text-gray-800">Last DB inspection</p>
      <p className="text-sm font-semibold">{lastInspected}</p>

      {isEditor && (
        <div className="mt-2 flex gap-2">
          <button disabled={inspector.isPending} onClick={onInspect} className="button tertiary flex items-center gap-1">
            Refresh schema
          </button>

          <button disabled={inspector.isPending} onClick={onRename} className="button tertiary">
            Rename
          </button>

          <button disabled={inspector.isPending} onClick={onDelete} className="button tertiary">
            Delete
          </button>
        </div>
      )}

      <div className="flex gap-2 items-center mb-2 mt-4">
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

      <div className="overflow-y-auto">
        {filtered?.map((table) => (
          <div key={table.id}>
            <div className={st.tableNameContainer}>
              <button className={clsx(st.chevron, dropdownVisibility[table.id] && st.down)} onClick={() => toggleDropdown(table.id)}>
                <ChevronIcon width={16} height={16} />
              </button>

              <button className={clsx(st.tableName, "flex-1")} onClick={() => toggleDropdown(table.id)}>
                {table.tableName}
              </button>

              <button className={st.link} onClick={() => openTable(table.tableName)}>
                ↗️
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

export const DataSourceModal = () => {
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
