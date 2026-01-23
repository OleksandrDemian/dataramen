import {Modal, ModalClose} from "../../widgets/Modal";
import {
  closeEntityCreatorModal,
  TEntityCreatorStore,
  updateCreateEntity,
  useCreateEntity
} from "../../data/entityCreatorStore.ts";
import {useDatabaseInspections} from "../../data/queries/dataSources.ts";
import {useEffect, useMemo, useState} from "react";
import {generateColumnLabel, sanitizeCellValue} from "../../utils/sql.ts";
import {useForm} from "../../hooks/form/useForm.ts";
import st from "./index.module.css";
import {useInsert} from "../../data/queries/queryRunner.ts";
import {Alert} from "../../widgets/Alert";
import {useParseError} from "../../hooks/useParseError.ts";
import {TDatabaseInspectionColumn} from "../../data/types/dataSources.ts";
import {invalidateTabData} from "../../data/queries/workbenchTabs.ts";
import {useWorkbenchTabId} from "../../hooks/useWorkbenchTabId.ts";
import InfoIcon from "../../assets/information-circle-outline.svg?react";
import {SearchInput} from "../../widgets/SearchInput";

export const Component = ({ data }: { data: TEntityCreatorStore }) => {
  const [form, { change, touched }] = useForm<Record<string, string>>({});
  const workbenchTabId = useWorkbenchTabId();

  const { mutateAsync: execute, error } = useInsert();
  const errorMessage = useParseError(error);

  const { data: inspections } = useDatabaseInspections(data.dataSourceId);

  const [filter, setFilter] = useState<string>("");
  const inspection = useMemo(() => {
    return inspections
      ?.find((ins) => ins.tableName === data.table);
  }, [inspections, data.table]);

  const fields = useMemo<(TDatabaseInspectionColumn & { label: string })[]>(() => {
    if (!inspection) {
      return [];
    }

    if (!filter) {
      return inspection.columns.map(c => ({
        ...c,
        label: generateColumnLabel(c.name),
      }));
    }

    const lowerFilter = filter.toLowerCase();
    return inspection.columns
      .filter((c) => c.name.toLowerCase().includes(lowerFilter))
      .map(c => ({
        ...c,
        label: generateColumnLabel(c.name),
      }));
  }, [filter, inspection]);

  const onRun = () => {
    const values: Record<string, unknown> = {};
    for (const column of touched) {
      values[column] = form[column];
    }

    execute({
      datasourceId: data.dataSourceId,
      table: data.table,
      values,
    }).then(() => {
      closeEntityCreatorModal();
      if (workbenchTabId) {
        invalidateTabData(workbenchTabId);
      }
    });
  };

  return (
    <>
      <div className={st.header}>
        <p className="text-lg font-semibold">Insert new row in <span className="underline">{data.table}</span></p>

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
              <div className="flex justify-between">
                <p>{col.isPrimary ? '🔐' : '🏷️'} {col.label}</p>
                <p className="text-blue-800 text-sm">[{col.name}: {col.type}]</p>
              </div>
              <input
                className="input w-full"
                value={sanitizeCellValue(form[col.name])}
                onChange={change(col.name)}
                placeholder={col.name}
              />
            </label>
          ))}
        </div>
      </div>

      <div className={st.actions}>
        <span data-tooltip-id="default" data-tooltip-content="Tip: use = to write raw SQL. Ex: =NULL or =NOW()">
          <InfoIcon className="text-(--text-color-secondary)" width={22} height={22} />
        </span>

        <span className="flex-1" />

        <button
          disabled={!touched.length}
          className="button primary"
          onClick={onRun}
        >
          Run insert
        </button>
      </div>
    </>
  );
};

export const EntityCreator = () => {
  const data = useCreateEntity();
  const [temp, setTemp] = useState<TEntityCreatorStore | undefined>(undefined);

  useEffect(() => {
    if (data) {
      setTemp(data);
    }
  }, [data]);

  const onClose = () => updateCreateEntity(undefined);

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
