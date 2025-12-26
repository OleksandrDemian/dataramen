import {Modal, ModalClose} from "../../../Modal";
import {ChangeEventHandler, KeyboardEventHandler, useContext, useEffect, useMemo, useState} from "react";
import {TableOptionsContext} from "../../context/TableContext.ts";
import {DataSourceColumnsAutocomplete} from "../../../DataSourceColumnsAutocomplete";
import {TQueryFilter} from "@dataramen/types";
import {genSimpleId} from "../../../../utils/id.ts";
import {useWhereStatements} from "../../hooks/useWhereStatements.ts";
import st from "./index.module.css";
import {hideExplorerModal, toggleExplorerModal, useExplorerModals} from "../../hooks/useExplorerModals.ts";
import CloseIcon from "./../../../../assets/close-outline.svg?react";
import AddIcon from "./../../../../assets/add-outline.svg?react";
import FilterIcon from "./../../../../assets/filter-outline.svg?react";
import {useHotkeys} from "react-hotkeys-hook";
import toast from "react-hot-toast";

const FilterEntry = ({
  filter,
  dataSourceId,
  allowedTables,
  autoFocus,
  onChangeColumn,
  onChangeValue,
  onRemoveFilter,
  onChangeAdvancedFilter,
  triggerIsEnabled,
  onSubmit,
}: {
  filter: TQueryFilter;
  dataSourceId: string;
  allowedTables: string[];
  autoFocus?: boolean;
  onChangeColumn: (id: string, column: string) => void;
  onChangeValue: (id: string, value: string) => void;
  onRemoveFilter: (id: string) => void;
  onChangeAdvancedFilter: (id: string, value: boolean) => void;
  triggerIsEnabled: (id: string) => void;
  onSubmit: () => void;
}) => {
  const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const value = e.target.value;
    if (value.charAt(0) === ":") {
      onChangeAdvancedFilter(filter.id, true);
    } else {
      if (!filter.isAdvanced && ["=", "<", ">"].includes(value.charAt(0))) {
        onChangeAdvancedFilter(filter.id, true);
      }
      onChangeValue(filter.id, e.currentTarget.value);
    }
  };

  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Backspace") {
      if (filter.value.length === 0 || e.currentTarget.selectionEnd === 0) {
        onChangeAdvancedFilter(filter.id, false);
      }
    } else if (e.key === "Enter") {
      onSubmit();
    }
  };

  return (
    <tr>
      <td className="p-1">
        <input type="checkbox" checked={filter.isEnabled !== false} onClick={() => triggerIsEnabled(filter.id)} />
      </td>
      <td>
        <DataSourceColumnsAutocomplete
          dataSourceId={dataSourceId}
          onChange={(value) => onChangeColumn(filter.id, value)}
          value={filter.column}
          allowTables={allowedTables}
          focusId="column"
          autoFocus={autoFocus}
        />
      </td>
      <td>
        <span className="flex items-center">
          {filter.isAdvanced && (
            <span className="m-1 p-1 text-xs rounded-md bg-gray-200 w-5 h-5">
              <FilterIcon width={12} height={12} />
            </span>
          )}

          <input
            key={filter.id}
            placeholder="Filter value"
            value={filter.value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            data-focus="value"
          />
        </span>
      </td>

      <td className={st.filterActions}>
        <button
          tabIndex={-1}
          data-tooltip-id="default"
          data-tooltip-content="Remove filter"
          className="p-0.5 text-sm cursor-pointer" onClick={() => onRemoveFilter(filter.id)}
        >
          <CloseIcon width={20} height={20} className="text-red-600" />
        </button>
      </td>
    </tr>
  );
};

export const FiltersModal = () => {
  const { state } = useContext(TableOptionsContext);
  const { setFilters: updateFilters } = useWhereStatements();
  const showModal = useExplorerModals((s) => s.filters);

  const allowedTables = useMemo(() => {
    return [state.table, ...state.joins.map((j) => j.table)];
  }, [state.table, state.joins]);

  const [filters, setFilters] = useState<TQueryFilter[]>([]);

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
        isEnabled: true,
      },
    ]);
  };

  const handleRemoveFilter = (id: string) => {
    setFilters((store) => store.filter((f) => f.id !== id));
  };

  const handleChangeAdvancedFilter = (id: string, isAdvanced: boolean) => {
    setFilters((store) => store.map((f) => {
      if (f.id === id) {
        return {
          ...f,
          isAdvanced,
        };
      }

      return f;
    }));
  };

  const handleOnClose = () => hideExplorerModal("filters");

  const handleApplyFilters = () => {
    try {
      updateFilters(filters.filter(f => {
        return f.value.length > 0 && f.column.length > 0;
      }));
      handleOnClose();
    } catch (e: any) {
      if (e instanceof Error) {
        toast.error(e.message);
      } else {
        toast.error(`Error during parsing, check you filters`);
      }
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
        const filters: TQueryFilter[] = [...state.filters, {
          id: genSimpleId(),
          value: "",
          column: "",
          isEnabled: true,
        }];
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
    <Modal isVisible={showModal} onClose={handleOnClose} portal onClosed={() => setFilters([])} noPadding>
      <ModalClose onClick={handleOnClose} />
      <h2 className="text-lg font-semibold m-2">Filters</h2>

      <div className="w-full lg:w-lg">
        {filters.length < 1 && (
          <p className="p-1 text-center rounded-lg bg-gray-50 border border-gray-200">No filters</p>
        )}

        <table className={st.table}>
          <tbody>
          {filters.map((f, i) => (
            <FilterEntry
              key={f.id}
              filter={f}
              dataSourceId={state.dataSourceId}
              allowedTables={allowedTables}
              onChangeColumn={handleColumnChange}
              onChangeValue={handleValueChange}
              onRemoveFilter={handleRemoveFilter}
              onChangeAdvancedFilter={handleChangeAdvancedFilter}
              triggerIsEnabled={triggerIsEnabled}
              onSubmit={handleApplyFilters}
              autoFocus={i === filters.length - 1}
            />
          ))}
          </tbody>
        </table>
      </div>

      <div className={st.actions}>
        <button
          className="button tertiary flex items-center gap-1 text-sm"
          onClick={handleAddFilter}
        >
          <AddIcon width={20} height={20} />
          <span>Add filter</span>
        </button>

        <button
          className="button primary text-sm"
          onClick={handleApplyFilters}
        >
          Apply filters
        </button>
      </div>
    </Modal>
  )
};
