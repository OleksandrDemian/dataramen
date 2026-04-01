import {
  closeEntityCreatorModal,
  TEntityCreatorStore,
  useCreateEntity
} from "../../data/entityCreatorStore.ts";
import {useDatabaseInspections} from "../../data/queries/dataSources.ts";
import {useEffect, useMemo, useState} from "react";
import {sanitizeCellValue} from "../../utils/sql.ts";
import {useForm} from "../../hooks/form/useForm.ts";
import st from "./index.module.css";
import {useInsert} from "../../data/queries/queryRunner.ts";
import {Alert} from "../../widgets/Alert";
import {useParseError} from "../../hooks/useParseError.ts";
import {TDatabaseInspectionColumn} from "../../data/types/dataSources.ts";
import {invalidateTabData} from "../../data/queries/workbenchTabs.ts";
import {useWorkbenchTabId} from "../../hooks/useWorkbenchTabId.ts";
import CloseIcon from "../../assets/close-outline.svg?react";
import SaveIcon from "../../assets/save-outline.svg?react";
import {SearchInput} from "../../widgets/SearchInput";
import toast from "react-hot-toast";
import { TQueryExpressionInput } from "@dataramen/types";
import {QueryExpressionInput} from "../../widgets/QueryExpressionInput";
import {RawMode} from "../../widgets/QueryExpressionInput/const.ts";
import {Sidebar} from "../../widgets/Sidebar";

const getLabel = (col: TDatabaseInspectionColumn) => {
  if (col.isPrimary) {
    return "🔐 " + col.name;
  }

  if (col.ref) {
    return "🔑 " + col.name;
  }

  return col.name;
};

export const Component = ({ data }: { data: TEntityCreatorStore }) => {
  const [form, { set, touched, reset }] = useForm<Record<string, TQueryExpressionInput>>({});
  const workbenchTabId = useWorkbenchTabId();

  const { mutateAsync: execute, error, isPending: isInserting } = useInsert();
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
    const values: Record<string, TQueryExpressionInput> = {};
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

  useEffect(() => {
    reset();
  }, [data]);

  return (
    <div className={st.root}>
      <div className={st.header}>
        <div className="flex items-center gap-1">
          <p className="text-lg flex-1 font-semibold underline">New {data.table}</p>
          <button
            data-tooltip-id="default"
            data-tooltip-content="Commit changes"
            disabled={!touched.length || isInserting}
            className={st.iconAction}
            onClick={onRun}
          >
            <SaveIcon width={16} height={16} />
          </button>
          <button className={st.iconAction} onClick={closeEntityCreatorModal}>
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
                <p>{getLabel(col)}</p>
                <p className="text-blue-800 text-xs">{col.type}</p>
              </div>
              <QueryExpressionInput
                disabled={isInserting}
                prefix="="
                allowedModes={RawMode}
                mode={form[col.name]?.mode}
                value={sanitizeCellValue(form[col.name]?.value)}
                onExpressionChange={(props) => set(col.name, props, true)}
              />
            </label>
          ))}
        </div>
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

export const MobileEntityCreator = () => {
  const data = useCreateEntity();
  const [temp, setTemp] = useState<TEntityCreatorStore | undefined>(undefined);

  useEffect(() => {
    if (data) {
      setTemp(data);
    }
  }, [data]);

  return (
    <Sidebar
      backdropClose
      isVisible={!!data}
      onClose={closeEntityCreatorModal}
      onClosed={() => setTemp(undefined)}
    >
      {temp && (
        <Component data={temp} />
      )}
    </Sidebar>
  );
};
