import {
  closeEntityEditorModal,
  TEntityEditorStore,
  updateEntityEditor,
  useEntityEditor
} from "../../data/entityEditorStore.ts";
import {useDatabaseInspections, useDataSource} from "../../data/queries/dataSources.ts";
import {useEffect, useMemo, useState} from "react";
import {useForm} from "../../hooks/form/useForm.ts";
import {useEntity, useUpdate} from "../../data/queries/queryRunner.ts";
import {generateColumnLabel, sanitizeCellValue} from "../../utils/sql.ts";
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
import {Modal, ModalClose} from "../../widgets/Modal";
import OpenIcon from "../../assets/open-outline.svg?react";
import {createTableOptions} from "../../widgets/ExplorerView/utils.ts";
import {useNavigate} from "react-router-dom";
import {PAGES} from "../../const/pages.ts";

const getPlaceholder = (value: unknown): string | undefined => {
  if (value === null || value === undefined) return "<NULL>";

  if (value === "") {
    return "<EMPTY STRING>";
  }

  return undefined;
};

const Component = ({ data }: { data: TEntityEditorStore }) => {
  const [form, { change, set, reset, touched }] = useForm<{ [key: string]: string }>({});
  const workbenchTabId = useWorkbenchTabId();
  const navigate = useNavigate();

  const [filter, setFilter] = useState<string>("");
  const { data: queryResult, isLoading: isLoadingResult } = useEntity(data.dataSourceId, data.tableName, data.entityId);
  const { mutateAsync: execute, error } = useUpdate();
  const { mutateAsync: createTab } = useCreateWorkbenchTab();
  const errorMessage = useParseError(error);
  const isEditor = useRequireRole(EUserTeamRole.EDITOR);

  const { data: inspection } = useDatabaseInspections(data.dataSourceId);
  const { data: dataSource } = useDataSource(data.dataSourceId);
  const currentTable = useMemo(() => {
    return inspection?.find(i => i.tableName === data.tableName);
  }, [data.tableName, inspection]);

  const fields = useMemo<(TDatabaseInspectionColumn & { label: string })[]>(() => {
    if (!currentTable) {
      return [];
    }

    if (!filter) {
      return currentTable.columns.map(c => ({
        ...c,
        label: generateColumnLabel(c.name),
      }));
    }

    const lowerFilter = filter.toLowerCase();
    return currentTable.columns
      .filter((c) => c.name.toLowerCase().includes(lowerFilter))
      .map(c => ({
        ...c,
        label: generateColumnLabel(c.name),
      }));
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
      closeEntityEditorModal();
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
      updateEntityEditor(undefined);
    });
  }

  const disableEdit = !dataSource?.allowUpdate || !isEditor;

  return (
    <>
      <div className={st.header}>
        <p className="text-lg font-semibold">{disableEdit ? 'View' : 'Edit'} row in <span className="underline">{data?.tableName}</span></p>

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
                <p>{col.isPrimary ? '🔐' : '🏷️'} {col.label}</p>
                <p className="text-blue-800 text-sm">[{col.name}: {col.type}]</p>
              </div>
              <input
                disabled={col.isPrimary || isLoadingResult || disableEdit}
                className="input w-full secondary"
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

        <button className="button tertiary flex gap-2 items-center" onClick={onOpen}>
          <OpenIcon width={16} height={16} />
          <span>Open in new tab</span>
        </button>

        {!disableEdit && (
          <button
            disabled={!touched.length}
            className="button primary"
            onClick={onRun}
          >
            Update
          </button>
        )}
      </div>
    </>
  );
};

export const EntityEditor = () => {
  const data = useEntityEditor();
  const [temp, setTemp] = useState<TEntityEditorStore | undefined>(undefined);

  useEffect(() => {
    if (data) {
      setTemp(data);
    }
  }, [data]);

  const onClose = () => updateEntityEditor(undefined);

  return (
    <Modal
      isVisible={data != undefined}
      onClose={onClose}
      onClosed={() => setTemp(undefined)}
      noPadding
    >
      <ModalClose onClick={onClose} />
      {temp && (
        <Component data={temp} />
      )}
    </Modal>
  );
};
