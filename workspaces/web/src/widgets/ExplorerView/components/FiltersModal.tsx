import {Modal, ModalClose} from "../../Modal";
import {ChangeEventHandler, KeyboardEventHandler, useContext, useEffect, useMemo, useState} from "react";
import {useWhereStatements} from "../hooks/useWhereStatements.ts";
import {TableOptionsContext} from "../context/TableContext.ts";
import {DataSourceColumnsAutocomplete} from "../../DataSourceColumnsAutocomplete";
import {OperatorAutocomplete} from "../../OperatorAutocomplete";
import toast from "react-hot-toast";
import st from "./FiltersModal.module.css";
import {useFocus} from "../hooks/useFocus.ts";
import {useDatabaseInspections} from "../../../data/queries/dataSources.ts";
import {TDatabaseInspectionColumn} from "../../../data/types/dataSources.ts";
import {allowsInput, OPERATOR_VALUE, processInputVale} from "@dataramen/common";
import {genSimpleId} from "../../../utils/id.ts";

type TTForm = {
  column: string;
  operator: string;
  value: string;
  isMatched: boolean;
};

export type TFiltersModalProps = {
  onClose: VoidFunction;
  selectColumn?: string;
  selectedOperation?: string;
  focusOn?: 'column' | 'operator' | 'value';
};
export const FiltersModal = ({ onClose, selectColumn = '', selectedOperation = '', focusOn }: TFiltersModalProps) => {
  const { addFilter } = useWhereStatements();
  const { state } = useContext(TableOptionsContext);
  const { data: inspections } = useDatabaseInspections(state.dataSourceId);

  const allowedTables = useMemo(() => {
    return [state.table, ...state.joins.map((j) => j.table)];
  }, [state.table, state.joins]);

  const [filter, setFilter] = useState<TTForm>({
    column: selectColumn,
    operator: selectedOperation,
    value: '',
    isMatched: false,
  });
  const [searchColumn, setSearchColumn] = useState(false);
  const { containerRef, focus } = useFocus();
  const columnType = useMemo<string>(() => {
    if (!inspections) {
      return "";
    }

    let colInfo: TDatabaseInspectionColumn | null = null;
    for (const insp of inspections) {
      for (const col of insp.columns) {
        const full = insp.tableName + "." + col.name;
        if (full === filter.column) {
          colInfo = col;
        }
      }
    }

    if (!colInfo?.type) {
      return "";
    }

    return colInfo.type;
  }, [filter.column, inspections]);

  useEffect(() => {
    if (focusOn) {
      focus(focusOn);
    }
  }, [focus, focusOn]);

  const onAddFilter = (submitFilter?: TTForm) => {
    const f = submitFilter || filter;
    const [table] = f.column.split(".");
    const operator = OPERATOR_VALUE[f.operator];

    if (!f.column.includes(".") || !table) {
      toast.error("Invalid column value: " + f.column);
      return;
    }

    if (!operator) {
      toast.error("Invalid operator: " + f.operator);
      return;
    }

    addFilter({
      isEnabled: true,
      id: genSimpleId(),
      connector: "AND",
      operator: operator,
      column: f.column,
      value: f.isMatched ? [{ value: f.value, isColumn: f.isMatched }] : processInputVale(operator, f.value),
    });
    onClose();
  };

  const listenKeyPress: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      onAddFilter();
    }
  };

  const handleColumnChange = (column: string, _: boolean, submit: boolean) => {
    setFilter((f) => ({
      ...f,
      column,
      operator: "",
    }));

    if (submit) {
      focus("operator");
    }
  };

  const handleOperatorChange = (value: string, isSubmit: boolean) => {
    setFilter((f) => ({
      ...f,
      operator: value,
    }));
    setSearchColumn(false);

    if (isSubmit) {
      focus("value");
    }
  };

  const handleValueChange = (value: string, isMatched: boolean, submit: boolean) => {
    if (submit) {
      onAddFilter({
        ...filter,
        value,
        isMatched,
      });
    } else {
      setFilter((f) => ({
        ...f,
        value,
        isMatched,
      }));
    }
  };

  const handleValueTypeChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setSearchColumn(e.target.checked);
    if (!e.target.checked) {
      setFilter((f) => ({
        ...f,
        isMatched: false,
      }));
    }
    focus("value");
  };

  const arrayValue = filter.operator.includes("list");
  const allowColumnMatch = filter.operator.includes("equal");

  return (
    <Modal isVisible onClose={onClose} backdropClose portal>
      <ModalClose onClick={onClose} />
      <h2 className="text-lg font-semibold">Filter</h2>

      <div className={st.formContainer} ref={containerRef}>
        <label className="z-3 w-full">
          <p className="font-semibold text-xs">Column</p>
          <DataSourceColumnsAutocomplete
            dataSourceId={state.dataSourceId}
            onChange={handleColumnChange}
            value={filter.column}
            allowTables={allowedTables}
            focusId="column"
          />
        </label>

        <label className="z-2 w-full">
          <p className="font-semibold text-xs">Operator <span className="text-sm text-blue-800">[for {columnType}]</span></p>
          <OperatorAutocomplete
            onChange={handleOperatorChange}
            focusId="operator"
            colType={columnType}
            value={filter.operator}
          />
        </label>

        {allowsInput(OPERATOR_VALUE[filter.operator]) && (
          <label className="z-1 w-full">
            <p className="font-semibold text-xs">Value</p>
            {(arrayValue || !searchColumn || !allowColumnMatch) ? (
              <input
                className="input w-full"
                placeholder="Filter value"
                value={filter.value}
                onKeyPress={listenKeyPress}
                onChange={(e) => handleValueChange(e.currentTarget.value, false, false)}
                data-focus="value"
              />
            ) : (
              <DataSourceColumnsAutocomplete
                dataSourceId={state.dataSourceId}
                onChange={handleValueChange}
                value={filter.value}
                allowTables={allowedTables}
                focusId="value"
                placeholder="Insert value or column"
              />
            )}
          </label>
        )}

        {allowColumnMatch && (
          <label className="w-full flex items-center gap-2">
            <input
              type="checkbox"
              checked={searchColumn}
              onChange={handleValueTypeChange}
            />
            <span>Value is another column</span>
          </label>
        )}
      </div>

      <div className="flex justify-end gap-2 items-center mt-2">
        <button
          className="button primary"
          onClick={() => onAddFilter()}
        >
          Apply filter
        </button>
      </div>
    </Modal>
  )
};
