import {Modal, ModalClose} from "../../../Modal";
import {KeyboardEventHandler, useContext, useEffect, useMemo, useState} from "react";
import {QueryResultContext, TableOptionsContext} from "../../context/TableContext.ts";
import {DataSourceColumnsAutocomplete} from "../../../DataSourceColumnsAutocomplete";
import {TQueryFilter} from "@dataramen/types";
import {genSimpleId} from "../../../../utils/id.ts";
import {useWhereStatements} from "../../hooks/useWhereStatements.ts";
import st from "./index.module.css";
import {hideExplorerModal, toggleExplorerModal, useExplorerModals} from "../../hooks/useExplorerModals.ts";
import CloseIcon from "./../../../../assets/close-outline.svg?react";
import AddIcon from "./../../../../assets/add-outline.svg?react";
import {useHotkeys} from "react-hotkeys-hook";
import toast from "react-hot-toast";
import {QueryExpressionInput, TQueryExpressionValue} from "../../../QueryExpressionInput";
import {RawMode} from "../../../QueryExpressionInput/const.ts";

const FilterEntry = ({
  filter,
  dataSourceId,
  allowedTables,
  autoFocus,
  onChangeColumn,
  onChangeValue,
  onRemoveFilter,
  triggerIsEnabled,
  onSubmit,
}: {
  filter: TQueryFilter;
  dataSourceId: string;
  allowedTables: string[];
  autoFocus?: boolean;
  onChangeColumn: (id: string, column: string) => void;
  onChangeValue: (id: string, value: TQueryExpressionValue) => void;
  onRemoveFilter: (id: string) => void;
  triggerIsEnabled: (id: string) => void;
  onSubmit: () => void;
}) => {
  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      onSubmit();
    }
  };

  return (
    <div className={st.filterContainer}>
      <input className="mr-1" type="checkbox" checked={filter.isEnabled !== false} onClick={() => triggerIsEnabled(filter.id)} />
      <DataSourceColumnsAutocomplete
        dataSourceId={dataSourceId}
        onChange={(value) => onChangeColumn(filter.id, value)}
        value={filter.column}
        allowTables={allowedTables}
        focusId="column"
        inputClassName="input w-full"
        autoFocus={autoFocus}
      />

      <QueryExpressionInput
        prefix="_"
        allowedModes={RawMode}
        onExpressionChange={(props) => onChangeValue(filter.id, props)}
        onKeyDown={onKeyDown}
        placeholder="Filter value"
        value={filter.value}
        mode={filter.mode}
        className="h-8"
      />

      <div className={st.filterActions}>
        <button
          tabIndex={-1}
          data-tooltip-id="default"
          data-tooltip-content="Remove filter"
          className="p-0.5 text-sm cursor-pointer rounded-md ml-1"
          onClick={() => onRemoveFilter(filter.id)}
        >
          <CloseIcon width={20} height={20} className="text-red-600" />
        </button>
      </div>
    </div>
  );
};

export const FiltersModal = () => {
  const { state } = useContext(TableOptionsContext);
  const { refetch } = useContext(QueryResultContext);
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

  const handleValueChange = (id: string, value: TQueryExpressionValue) => {
    setFilters((f) => [
      ...f.map((currentFilter) => {
        if (currentFilter.id === id) {
          return {
            ...currentFilter,
            value: value.value,
            mode: value.mode,
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
        mode: "default",
      },
    ]);
  };

  const handleRemoveFilter = (id: string) => {
    setFilters((store) => store.filter((f) => f.id !== id));
  };

  const handleOnClose = () => hideExplorerModal("filters");

  const handleApplyFilters = () => {
    try {
      updateFilters(filters.filter(f => f.value.length > 0 && f.column.length > 0));
      setTimeout(refetch, 1);
      handleOnClose();
    } catch (e: unknown) {
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
          mode: "default",
        }];
        return filters;
      },
    );
    // do not use state as dependency, we only need to update filters when showModal becomes true
  }, [showModal]);

  useHotkeys("f", () => {
    toggleExplorerModal("filters");
  });

  return (
    <Modal isVisible={showModal} onClose={handleOnClose} portal onClosed={() => setFilters([])} noPadding backdropClose>
      <ModalClose onClick={handleOnClose} />
      <h2 className="text-lg font-semibold m-2">Filters</h2>

      <div className={st.filtersContainer}>
        {filters.length < 1 && (
          <p className="p-1 text-center rounded-lg bg-gray-50 border border-gray-200">No filters</p>
        )}

        {filters.map((f, i) => (
          <FilterEntry
            key={f.id}
            filter={f}
            dataSourceId={state.dataSourceId}
            allowedTables={allowedTables}
            onChangeColumn={handleColumnChange}
            onChangeValue={handleValueChange}
            onRemoveFilter={handleRemoveFilter}
            triggerIsEnabled={triggerIsEnabled}
            onSubmit={handleApplyFilters}
            autoFocus={i === filters.length - 1}
          />
        ))}
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
