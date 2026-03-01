import {
  closeEntityEditorModal,
  TEntityEditorStore,
  useEntityEditor
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
import {EUserTeamRole, TQueryFilter} from "@dataramen/types";
import {useRequireRole} from "../../hooks/useRequireRole.ts";
import {genSimpleId} from "../../utils/id.ts";
import {useWorkbenchTabId} from "../../hooks/useWorkbenchTabId.ts";
import {invalidateTabData, useCreateWorkbenchTab} from "../../data/queries/workbenchTabs.ts";
import InfoIcon from "../../assets/information-circle-outline.svg?react";
import {SearchInput} from "../../widgets/SearchInput";
import CloseIcon from "../../assets/close-outline.svg?react";
import RefreshIcon from "../../assets/refresh-outline.svg?react";
import OpenIcon from "../../assets/open-outline.svg?react";
import {createTableOptions} from "../../widgets/ExplorerView/utils.ts";
import {useNavigate} from "react-router-dom";
import {PAGES} from "../../const/pages.ts";
import toast from "react-hot-toast";
import clsx from "clsx";

const getPlaceholder = (value: unknown): string | undefined => {
  if (value === null || value === undefined) return "<NULL>";

  if (value === "") {
    return "<EMPTY STRING>";
  }

  return undefined;
};

const Component = ({ data }: { data: TEntityEditorStore }) => {
  const [form, { change, set, reset, touched, untouch }] = useForm<{ [key: string]: string }>({});
  const workbenchTabId = useWorkbenchTabId();
  const navigate = useNavigate();

  const [filter, setFilter] = useState<string>("");
  const { data: queryResult, isLoading: isLoadingResult, refetch } = useEntity(data.dataSourceId, data.tableName, data.entityId);
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
        set(col.column, sanitizeCellValue(entity[i]));
      }
    }
  }, [queryResult, set, reset]);

  const onRun = () => {
    const values: Record<string, unknown> = {};
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
      if (workbenchTabId) {
        invalidateTabData(workbenchTabId);
      }
    });
  };

  const onOpen = () => {
    createTab({
      name: data.tableName,
      opts: createTableOptions({
        dataSourceId: data.dataSourceId,
        table: data.tableName,
        filters: data.entityId.map(([key, value]) => ({
          value: `${value}`,
          column: `${data.tableName}.${key}`,
          id: genSimpleId(),
          isEnabled: true,
        })),
      }),
    }).then(({ id }) => {
      navigate(PAGES.workbenchTab.build({ id }));
    });
  }

  const disableEdit = !dataSource?.allowUpdate || !isEditor;

  return (
    <div className={st.root}>
      <div className={st.header}>
        <div className="flex items-center">
          <p className="text-lg font-semibold underline">{data?.tableName}</p>

          <span className="flex-1" />
          <button className="cursor-pointer mr-2" onClick={onOpen}>
            <OpenIcon width={16} height={16} />
          </button>
          <button className="cursor-pointer mr-1" onClick={() => refetch()}>
            <RefreshIcon width={16} height={16} />
          </button>
          <button className="cursor-pointer" onClick={closeEntityEditorModal}>
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
          autoFocus
        />
      </div>

      <div className={st.container}>
        <div className={st.fieldsContainer}>
          {fields.map((col) => (
            <label key={col.name} className={st.fieldLabel}>
              <div className="flex justify-between mb-0.5">
                <p>{col.isPrimary ? '🔐 ' : ''}{col.name}</p>
                <p className="text-blue-800 text-xs">{col.type}</p>
              </div>
              <input
                disabled={col.isPrimary || isLoadingResult || disableEdit}
                className={clsx("input w-full secondary", touched.includes(col.name) && "bg-green-100!")}
                value={sanitizeCellValue(form[col.name])}
                onChange={change(col.name)}
                placeholder={placeholders[col.name]}
              />
            </label>
          ))}
        </div>
      </div>

      <div className={st.actions}>
        {!disableEdit && (
          <span data-tooltip-id="default" data-tooltip-content="Tip: use = to write raw SQL. Ex: =NULL or =NOW()">
            <InfoIcon className="text-(--text-color-secondary)" width={22} height={22} />
          </span>
        )}

        <span className="flex-1" />

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
