import {
  closeEntityEditorModal,
  openEntityEditor,
  TEntityEditorStore,
  useEntityEditor, useEntityEditorHistory
} from "../../data/entityEditorStore.ts";
import {useDatabaseInspections, useDataSource} from "../../data/queries/dataSources.ts";
import {useEffect, useMemo, useState} from "react";
import {useForm} from "../../hooks/form/useForm.ts";
import {useEntity, useUpdate} from "../../data/queries/queryRunner.ts";
import {sanitizeCellValue} from "../../utils/sql.ts";
import st from "./index.module.css";
import {Alert} from "../../widgets/Alert";
import {useParseError} from "../../hooks/useParseError.ts";
import {TDatabaseInspectionColumn} from "../../data/types/dataSources.ts";
import {EUserTeamRole, TQueryExpressionInput, TQueryFilter} from "@dataramen/types";
import {useRequireRole} from "../../hooks/useRequireRole.ts";
import {genSimpleId} from "../../utils/id.ts";
import {useWorkbenchTabId} from "../../hooks/useWorkbenchTabId.ts";
import {invalidateTabData, useCreateWorkbenchTab} from "../../data/queries/workbenchTabs.ts";
import {SearchInput} from "../../widgets/SearchInput";
import CloseIcon from "../../assets/close-outline.svg?react";
import OpenIcon from "../../assets/open-outline.svg?react";
import {createTableOptions} from "../../widgets/ExplorerView/utils.ts";
import {useNavigate} from "react-router-dom";
import {PAGES} from "../../const/pages.ts";
import toast from "react-hot-toast";
import {QueryExpressionInput} from "../../widgets/QueryExpressionInput";

const getPlaceholder = (value: unknown): string | undefined => {
  if (value === null || value === undefined) return "<NULL>";

  if (value === "") {
    return "<EMPTY STRING>";
  }

  return undefined;
};

const getLabel = (col: TDatabaseInspectionColumn) => {
  if (col.isPrimary) {
    return "🔐 " + col.name;
  }

  if (col.ref) {
    return "🔑 " + col.name;
  }

  return col.name;
};

const Component = ({ data }: { data: TEntityEditorStore }) => {
  const history = useEntityEditorHistory((s) => s.history);
  const [form, { set, reset, touched, untouch }] = useForm<{ [key: string]: TQueryExpressionInput }>({});
  const workbenchTabId = useWorkbenchTabId();
  const navigate = useNavigate();
  const [resetCounter, setResetCounter] = useState(0);

  const [filter, setFilter] = useState<string>("");
  const { data: queryResult, isLoading: isLoadingResult, refetch: refetchData } = useEntity(data.dataSourceId, data.tableName, data.entityId);
  const { mutateAsync: execute, error } = useUpdate();
  const { mutateAsync: createTab } = useCreateWorkbenchTab();
  const errorMessage = useParseError(error);
  const isEditor = useRequireRole(EUserTeamRole.EDITOR);

  const { data: inspection } = useDatabaseInspections(data.dataSourceId);
  const { data: dataSource } = useDataSource(data.dataSourceId);
  const currentTable = useMemo(() => {
    return inspection?.find(i => i.tableName === data.tableName);
  }, [data.tableName, inspection]);

  const fields = useMemo<TDatabaseInspectionColumn[]>(() => {
    if (!currentTable) {
      return [];
    }

    if (!filter) {
      return currentTable.columns;
    }

    const lowerFilter = filter.toLowerCase();
    return currentTable.columns
      .filter((c) => c.name.toLowerCase().includes(lowerFilter));
  }, [filter, currentTable]);

  const placeholders = useMemo(() => {
    const placeholders: Record<string, string | undefined> = {};
    if (!queryResult?.entity) return placeholders;

    for (let i = 0; i < queryResult.columns.length; i++) {
      placeholders[queryResult.columns[i]?.column] = getPlaceholder(queryResult.entity[i]);
    }

    return placeholders;
  }, [queryResult])

  useEffect(() => {
    const entity = queryResult?.entity;
    reset();

    if (entity && queryResult?.columns) {
      for (let i = 0; i < queryResult.columns.length; i++) {
        const col = queryResult.columns[i];
        set(col.column, {
          value: sanitizeCellValue(entity[i]),
          mode: "default",
        });
      }
    }
  }, [queryResult, set, reset, resetCounter]);

  const onRun = () => {
    const values: Record<string, TQueryExpressionInput> = {};
    for (const column of touched) {
      values[column] = form[column];
    }

    execute({
      datasourceId: data.dataSourceId,
      table: data.tableName,
      filters: data.entityId.map((key) => ({
        id: genSimpleId(),
        value: "" + key[1],
        column: key[0],
        isEnabled: true,
      } satisfies TQueryFilter)),
      values,
    }).then(() => {
      untouch();
      toast.success("Record successfully updated.");
      refetchData();

      if (workbenchTabId) {
        invalidateTabData(workbenchTabId);
      }
    });
  };

  const onOpenRef = (table: string, column: string, value: any) => {
    createTab({
      name: `${table} ${column} = ${value}`,
      opts: createTableOptions({
        dataSourceId: data.dataSourceId,
        table,
        filters: [{
          value: `${value}`,
          column: `${table}.${column}`,
          id: genSimpleId(),
          isEnabled: true,
        }],
      }),
    }).then(({ id }) => {
      navigate(PAGES.workbenchTab.build({ id }));
    });
  };

  const onUpdateHistory = (key: string) => {
    const entry = history.find((entry) => entry.key === key);
    if (entry) {
      openEntityEditor(entry, false);
    }
  };

  const disableEdit = !dataSource?.allowUpdate || !isEditor;

  return (
    <div className={st.root}>
      <div className={st.header}>
        <div className="flex items-center gap-2">
          <select
            className="input rounded-md! w-full"
            value={data?.key}
            onChange={(e) => onUpdateHistory(e.currentTarget.value)}
          >
            {history.map((entry) => (
              <option key={entry.key} value={entry.key}>{entry.tableName} - {entry.entityId.map((v) => `${v[0]} = ${v[1]}`)}</option>
            ))}
          </select>
          {/*<p className="text-lg font-semibold underline">{data?.tableName}</p>*/}

          <button className={st.close} onClick={closeEntityEditorModal}>
            <CloseIcon width={20} height={20} />
          </button>
        </div>

        {errorMessage && (
          <Alert variant="danger">
            <p>{errorMessage}</p>
          </Alert>
        )}

        <SearchInput
          containerClassName="mt-2"
          className="text-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter columns"
        />
      </div>

      <div className={st.container}>
        <div className={st.fieldsContainer}>
          {fields.map((col) => (
            <label key={col.name} className={st.fieldLabel}>
              <div className="flex justify-between mb-0.5">
                <p>{touched.includes(col.name) && <span className={st.changedMarker} />}{getLabel(col)}</p>
                <p className="text-blue-800 text-xs">{col.type}</p>
              </div>
              <div className="flex items-center">
                <QueryExpressionInput
                  disabled={col.isPrimary || isLoadingResult || disableEdit}
                  value={sanitizeCellValue(form[col.name]?.value)}
                  mode={form[col.name]?.mode}
                  onExpressionChange={(props) => set(col.name, props, true)}
                  placeholder={placeholders[col.name]}
                />
                {col.ref && (
                  <button className="cursor-pointer pl-2" onClick={() => onOpenRef(col.ref!.table, col.ref!.field, form[col.name]?.value)}>
                    <OpenIcon width={16} height={16} />
                  </button>
                )}

                {col.isPrimary && (
                  <button className="cursor-pointer pl-2" onClick={() => onOpenRef(data.tableName, col.name, form[col.name]?.value)}>
                    <OpenIcon width={16} height={16} />
                  </button>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className={st.actions}>
        <span className="flex-1" />

        {touched.length > 0 && (
          <button
            className="button tertiary"
            onClick={() => setResetCounter((r) => ++r)}
          >
            Reset
          </button>
        )}

        {!disableEdit && (
          <button
            disabled={!touched.length}
            className="button primary"
            onClick={onRun}
          >
            Commit
          </button>
        )}
      </div>
    </div>
  );
};

export const EntityEditor = () => {
  const data = useEntityEditor();

  if (!data) {
    return null;
  }

  return (
    <Component data={data} />
  );
};
