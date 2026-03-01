import {
  closeEntityCreatorModal,
  TEntityCreatorStore,
  useCreateEntity
} from "../../data/entityCreatorStore.ts";
import {useDatabaseInspections} from "../../data/queries/dataSources.ts";
import {useMemo, useState} from "react";
import {sanitizeCellValue} from "../../utils/sql.ts";
import {useForm} from "../../hooks/form/useForm.ts";
import st from "./index.module.css";
import {useInsert} from "../../data/queries/queryRunner.ts";
import {Alert} from "../../widgets/Alert";
import {useParseError} from "../../hooks/useParseError.ts";
import {TDatabaseInspectionColumn} from "../../data/types/dataSources.ts";
import {invalidateTabData} from "../../data/queries/workbenchTabs.ts";
import {useWorkbenchTabId} from "../../hooks/useWorkbenchTabId.ts";
import InfoIcon from "../../assets/information-circle-outline.svg?react";
import CloseIcon from "../../assets/close-outline.svg?react";
import {SearchInput} from "../../widgets/SearchInput";
import toast from "react-hot-toast";

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

  const fields = useMemo<TDatabaseInspectionColumn[]>(() => {
    if (!inspection) {
      return [];
    }

    if (!filter) {
      return inspection.columns;
    }

    const lowerFilter = filter.toLowerCase();
    return inspection.columns
      .filter((c) => c.name.toLowerCase().includes(lowerFilter));
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
      toast.success("Record successfully created.");

      if (workbenchTabId) {
        invalidateTabData(workbenchTabId);
      }
    });
  };

  return (
    <div className={st.root}>
      <div className={st.header}>
        <div className="flex justify-between items-center">
          <p className="text-lg font-semibold underline">New {data.table}</p>
          <button className="cursor-pointer" onClick={closeEntityCreatorModal}>
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
                className="input w-full"
                value={sanitizeCellValue(form[col.name])}
                onChange={change(col.name)}
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
          Insert
        </button>
      </div>
    </div>
  );
};

export const EntityCreator = () => {
  const data = useCreateEntity();

  if (!data) {
    return null;
  }

  return (
    <Component data={data} />
  );
};
