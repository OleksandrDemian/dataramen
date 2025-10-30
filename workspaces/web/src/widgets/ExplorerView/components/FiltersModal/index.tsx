import {Modal, ModalClose} from "../../../Modal";
import {useContext, useEffect, useMemo, useState} from "react";
import {TableOptionsContext} from "../../context/TableContext.ts";
import {DataSourceColumnsAutocomplete} from "../../../DataSourceColumnsAutocomplete";
import {OperatorAutocomplete} from "../../../OperatorAutocomplete";
import {allowsInput, OPERATOR_LABEL, OPERATOR_VALUE} from "@dataramen/common";
import {genSimpleId} from "../../../../utils/id.ts";
import {useWhereStatements} from "../../hooks/useWhereStatements.ts";
import clsx from "clsx";
import {useDatabaseInspections} from "../../../../data/queries/dataSources.ts";
import {TDatabaseInspection, TDatabaseInspectionColumn} from "../../../../data/types/dataSources.ts";
import st from "./index.module.css";
import {TFilterForm} from "./types.ts";
import {filterValueToString, mapFiltersToWhere, validateFilters} from "./utils.ts";
import {hideExplorerModal, toggleExplorerModal, useExplorerModals} from "../../hooks/useExplorerModals.ts";
import CloseButton from "./../../../../assets/close-outline.svg?react";
import {useHotkeys} from "react-hotkeys-hook";

const FilterEntry = ({
  filter,
  dataSourceId,
  allowedTables,
  inspections,
  autoFocus,
  onChangeColumn,
  onChangeOperator,
  onChangeValue,
  onRemoveFilter,
  triggerIsEnabled,
  onIsColumnChange,
}: {
  filter: TFilterForm;
  dataSourceId: string;
  allowedTables: string[];
  inspections: TDatabaseInspection[];
  autoFocus?: boolean;
  onChangeColumn: (id: string, column: string) => void;
  onChangeOperator: (id: string, operator: string) => void;
  onChangeValue: (id: string, value: string) => void;
  onRemoveFilter: (id: string) => void;
  triggerIsEnabled: (id: string) => void;
  onIsColumnChange: (id: string, isColumn: boolean) => void;
}) => {
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

  return (
    <div className="flex gap-2 items-center">
      <label>
        <input type="checkbox" checked={filter.isEnabled !== false} onClick={() => triggerIsEnabled(filter.id)} />
      </label>

      <label className="w-full">
        <DataSourceColumnsAutocomplete
          dataSourceId={dataSourceId}
          onChange={(value) => onChangeColumn(filter.id, value)}
          value={filter.column}
          allowTables={allowedTables}
          focusId="column"
          autoFocus={autoFocus}
        />
      </label>

      <label>
        <OperatorAutocomplete
          onChange={(value) => onChangeOperator(filter.id, value)}
          focusId="operator"
          colType={columnType}
          value={filter.operator}
        />
      </label>

      {allowsInput(OPERATOR_VALUE[filter.operator]) && (
        <label className="w-full">
          {filter.isColumnRef ? (
            <DataSourceColumnsAutocomplete
              dataSourceId={dataSourceId}
              onChange={(val) => onChangeValue(filter.id, val)}
              value={filter.value}
              allowTables={allowedTables}
              focusId="value"
              placeholder="Search column"
            />
          ) : (
            <input
              className="input w-full"
              placeholder="Filter value"
              value={filter.value}
              onChange={(e) => onChangeValue(filter.id, e.currentTarget.value)}
              data-focus="value"
            />
          )}
        </label>
      )}

      <div className={st.filterActions}>
        <button
          tabIndex={-1}
          data-tooltip-id="default"
          data-tooltip-content="If enabled, the value will reference another column instead of being raw string"
          className={clsx("p-0.5 cursor-pointer rounded-lg border", filter.isColumnRef ? "bg-blue-50 border-blue-200" : "bg-white border-white")}
          onClick={() => onIsColumnChange(filter.id, !filter.isColumnRef)}
        >
          🏷️
        </button>
        <button
          tabIndex={-1}
          data-tooltip-id="default"
          data-tooltip-content="Remove filter"
          className="p-0.5 text-sm cursor-pointer" onClick={() => onRemoveFilter(filter.id)}
        >
          <CloseButton width={20} height={20} className="text-red-600" />
        </button>
      </div>
    </div>
  );
};

export const FiltersModal = () => {
  const { state } = useContext(TableOptionsContext);
  const { setFilters: updateFilters } = useWhereStatements();
  const showModal = useExplorerModals((s) => s.filters);
  const { data: inspections } = useDatabaseInspections(state.dataSourceId);

  const allowedTables = useMemo(() => {
    return [state.table, ...state.joins.map((j) => j.table)];
  }, [state.table, state.joins]);

  const [filters, setFilters] = useState<TFilterForm[]>([]);

  const handleColumnChange = (id: string, column: string) => {
    setFilters((f) => [
      ...f.map((currentFilter) => {
        if (currentFilter.id === id) {
          return {
            ...currentFilter,
            column,
          }
        }

        return currentFilter;
      })
    ]);
  };

  const handleOperatorChange = (id: string, operator: string) => {
    setFilters((f) => [
      ...f.map((currentFilter) => {
        if (currentFilter.id === id) {
          return {
            ...currentFilter,
            operator,
          }
        }

        return currentFilter;
      })
    ]);
  };

  const handleValueChange = (id: string, value: string) => {
    setFilters((f) => [
      ...f.map((currentFilter) => {
        if (currentFilter.id === id) {
          return {
            ...currentFilter,
            value,
          }
        }

        return currentFilter;
      })
    ]);
  };

  const handleAddFilter = () => {
    setFilters((f) => [
      ...f,
      {
        id: genSimpleId(),
        value: "",
        column: "",
        operator: "",
        isColumnRef: false,
        isEnabled: true,
      },
    ]);
  };

  const handleChangeIsColumn = (id: string, isColumn: boolean) => {
    setFilters((f) => [
      ...f.map((currentFilter) => {
        if (currentFilter.id === id) {
          return {
            ...currentFilter,
            isColumnRef: isColumn,
          }
        }

        return currentFilter;
      })
    ]);
  };

  const handleRemoveFilter = (id: string) => {
    setFilters((store) => store.filter((f) => f.id !== id));
  };

  const handleOnClose = () => hideExplorerModal("filters");

  const handleApplyFilters = () => {
    if (validateFilters(filters)) {
      updateFilters(mapFiltersToWhere(filters));
      handleOnClose();
    }
  };

  const triggerIsEnabled = (id: string) => {
    setFilters((store) => store.map((f) => {
      if (f.id === id) {
        return {
          ...f,
          isEnabled: !f.isEnabled,
        };
      }

      return f;
    }));
  };

  useEffect(() => {
    if (!showModal) {
      return;
    }

    setFilters(
      () => {
        const filters: TFilterForm[] = state.filters.map((f) => ({
          id: f.id,
          value: filterValueToString(f),
          column: f.column,
          operator: OPERATOR_LABEL[f.operator],
          isColumnRef: !!f.value?.[0]?.isColumn,
          isEnabled: f.isEnabled,
        }));

        // push empty element to create new filter
        filters.push({
          id: genSimpleId(),
          value: "",
          column: "",
          operator: "",
          isColumnRef: false,
          isEnabled: true,
        });

        return filters;
      },
    );
    // do not use state as dependency, we only need to update filters when showModal becomes true
  }, [showModal]);

  useHotkeys("f", () => {
    toggleExplorerModal("filters");
  });

  useHotkeys("ctrl+f", () => {
    alert("Save filters");
  });

  return (
    <Modal isVisible={showModal} onClose={handleOnClose} portal onClosed={() => setFilters([])}>
      <ModalClose onClick={handleOnClose} />
      <h2 className="text-lg font-semibold">Filters</h2>

      <div className="flex gap-4 flex-col w-full lg:w-lg my-4">
        {filters.length < 1 && (
          <p className="p-1 text-center rounded-lg bg-gray-50 border border-gray-200">No filters</p>
        )}

        {filters.map((f, i) => (
          <FilterEntry
            key={f.id}
            filter={f}
            dataSourceId={state.dataSourceId}
            allowedTables={allowedTables}
            inspections={inspections || []}
            onChangeColumn={handleColumnChange}
            onChangeOperator={handleOperatorChange}
            onChangeValue={handleValueChange}
            onRemoveFilter={handleRemoveFilter}
            onIsColumnChange={handleChangeIsColumn}
            triggerIsEnabled={triggerIsEnabled}
            autoFocus={i === filters.length - 1}
          />
        ))}
      </div>

      <div className={st.actions}>
        <button
          className="button tertiary"
          onClick={handleAddFilter}
        >
          Add filter
        </button>

        <button
          className="button primary"
          onClick={handleApplyFilters}
        >
          Apply filters
        </button>
      </div>
    </Modal>
  )
};
