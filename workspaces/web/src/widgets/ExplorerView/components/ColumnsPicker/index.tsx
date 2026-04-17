import {TInputColumn, TRunSqlResult} from "@dataramen/types";
import {ALLOW_DATE_FUNCTIONS} from "@dataramen/common";
import {useContext, useEffect, useMemo, useState} from "react";
import clsx from "clsx";
import {TableContext, TableOptionsContext} from "../../context/TableContext.ts";
import {Modal, ModalClose} from "../../../Modal";
import st from "./index.module.css";
import {
  hideExplorerModal,
  toggleExplorerModal,
  useExplorerModals
} from "../../hooks/useExplorerModals.ts";
import toast from "react-hot-toast";
import {useHotkeys} from "react-hotkeys-hook";
import EyeIcon from "../../../../assets/eye-outline.svg?react";
import EyeOffIcon from "../../../../assets/eye-off-outline.svg?react";
import { reduceStringArrayToBooleanObject } from "../../../../utils/reducers.ts";

type TColumn = {
  columnName: string;
  value: string;
  type: string;
  nested?: boolean;
};
type TTables = {
  name: string;
  columns: TColumn[];
}[];

function parseColumns(availableColumns: TRunSqlResult["allColumns"]) {
  if (!availableColumns) {
    return [];
  }

  const groups: Record<string, TColumn[]> = {};
  availableColumns.forEach((col) => {
    if (groups[col.table]) {
      groups[col.table].push({
        value: col.full,
        columnName: col.column,
        type: col.type,
      });
    } else {
      groups[col.table] = [{
        value: col.full,
        columnName: col.column,
        type: col.type,
      }];
    }

    if (ALLOW_DATE_FUNCTIONS[col.type]) {
      ["YEAR", "MONTH", "DAY"].forEach((fn) => {
        groups[col.table].push({
          value: fn + " " + col.full,
          columnName: fn + " " +  col.column,
          type: "number",
          nested: true,
        });
      })
    }
  });

  return Object.entries(groups).reduce((acc, [table, columns]) => {
    acc.push({
      name: table,
      columns,
    });
    return acc;
  }, [] as TTables);
}

function filterColumns(tables: TTables, filter: string): TTables {
  const lowerFilter = filter.toLowerCase();

  return tables
    .map(table => {
      const filteredColumns = table.columns.filter(
        col => col.columnName.toLowerCase().includes(lowerFilter)
      );

      return {...table, columns: filteredColumns};
    })
    .filter(table => table.columns.length > 0); // Remove tables with no matching columns
}

const HiddenColumnEntry = ({column, selected, onToggle}: {
  column: TColumn;
  selected: boolean;
  onToggle: (name: string, value: boolean) => void;
}) => {
  return (
    <div
      key={column.value}
      className={clsx(st.columnLabel, selected ? st.notActive : st.active, column.nested && "pl-5!")}
      onClick={() => onToggle(column.value, !selected)}
    >
      {selected ? <EyeOffIcon width={16} height={16}/> : <EyeIcon width={16} height={16}/>}

      <p className="flex justify-between w-full">
        <span data-tooltip-content={column.value} data-tooltip-id="default">{column.columnName}</span>
        <span className="text-blue-600">{column.type}</span>
      </p>
    </div>
  );
};

const GroupByEntry = ({column, selected, onToggle}: {
  column: TColumn;
  selected: boolean;
  onToggle: (name: string, value: boolean) => void;
}) => {
  return (
    <div
      key={column.value}
      className={clsx(st.groupByLabel, selected ? st.notActive : st.active, column.nested && "pl-5!")}
      onClick={() => onToggle(column.value, !selected)}
    >
      {selected ? <EyeIcon width={16} height={16}/> : <EyeOffIcon width={16} height={16}/>}

      <p className="flex justify-between w-full">
        <span data-tooltip-content={column.value} data-tooltip-id="default">{column.columnName}</span>
        <span className="text-blue-600">{column.type}</span>
      </p>
    </div>
  );
};

const HotKey = {
  "hiddenColumns": "c",
  "groupBy": "g",
} as const;

export type TColumnPickerProps = {
  mode: "hiddenColumns" | "groupBy";
};
export const ColumnsPicker = ({mode}: TColumnPickerProps) => {
  const showModal = useExplorerModals((s) => s[mode]);
  const {allColumns} = useContext(TableContext);
  const {state, setState} = useContext(TableOptionsContext);
  const [selectedColumns, setSelectedColumns] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<string>("");
  const parsedColumns = useMemo<TTables>(() => parseColumns(allColumns), [allColumns]);
  const ignoreColumns = state.aggregations.length > 0 || state.groupBy.length > 0;

  const filtered = useMemo(() => {
    if (!filter) {
      return parsedColumns;
    }

    return filterColumns(parsedColumns, filter);
  }, [filter, parsedColumns]);

  const onToggle = (name: string, value: boolean) => {
    setSelectedColumns((col) => ({
      ...col,
      [name]: value,
    }))
  };

  const onAllToggle = () => {
    const value = !allSelected;
    setSelectedColumns((columns) => {
      for (const col of allColumns) {
        columns[col.full] = value;
      }

      return {...columns};
    });
  };

  const onCancel = () => {
    hideExplorerModal(mode);
  };

  const apply = () => {
    const cols: TInputColumn[] = [];
    for (const table of parsedColumns) {
      for (const column of table.columns) {
        if (selectedColumns[column.value] === true) {
          const [a, b] = column.value.split(" ");
          cols.push({
            value: b ? b : a,
            fn: b ? a : undefined,
          });
        }
      }
    }

    setState((state) => ({
      ...state,
      [mode]: cols,
    }));
    onCancel();
  };

  const allSelected = useMemo(() => {
    for (const column of allColumns) {
      if (selectedColumns[column.full] === true) {
        return false;
      }
    }

    return true;
  }, [selectedColumns, allColumns])

  useHotkeys(HotKey[mode], () => {
    if (mode === "hiddenColumns") {
      if (ignoreColumns) {
        toast.error("Columns are ignored when there is at least one aggregation or group by");
      } else {
        toggleExplorerModal("hiddenColumns");
      }
    } else {
      toggleExplorerModal("groupBy");
    }
  });

  // init hidden columns after each open
  useEffect(() => {
    if (showModal) {
      setSelectedColumns(
        () => reduceStringArrayToBooleanObject(
          state[mode].map((c) => {
            if (c.fn) {
              return c.fn + " " + c.value;
            }

            return c.value;
          }),
        ),
      );
    }
  }, [showModal, setSelectedColumns /* don't include state in dependencies */]);

  const onClosed = () => {
    setFilter("");
    setSelectedColumns({});
  };

  return (
    <Modal isVisible={showModal} onClose={onCancel} portal onClosed={onClosed} backdropClose>
      <ModalClose onClick={onCancel}/>
      <div className={st.container}>
        <h2 className="text-lg font-semibold">
          {mode === 'groupBy' ? 'Group by' : 'Show columns'}
        </h2>

        <input
          autoFocus
          className="input my-2"
          placeholder="Filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />

        <div className="overflow-y-auto">
          {filtered.map((table) => (
            <div key={table.name} className="my-2">
              <p className="font-semibold sticky top-0 bg-white p-1 z-1">📄 {table.name}</p>

              {mode === "hiddenColumns" && table.columns.map((column) => (
                <HiddenColumnEntry
                  key={column.value}
                  column={column}
                  selected={selectedColumns[column.value] === true}
                  onToggle={onToggle}
                />
              ))}

              {mode === "groupBy" && table.columns.map((column) => (
                <GroupByEntry
                  key={column.value}
                  column={column}
                  selected={selectedColumns[column.value] === true}
                  onToggle={onToggle}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <button className="button tertiary flex gap-2 items-center" onClick={onAllToggle}>
            {allSelected ? <EyeIcon width={16} height={16}/> : <EyeOffIcon width={16} height={16}/>}
            <span>{allSelected ? 'Hide all' : 'Show all'}</span>
          </button>
          <span className="flex-1"/>
          <button className="button tertiary" onClick={onCancel}>Cancel</button>
          <button className="button primary" onClick={apply}>Apply</button>
        </div>
      </div>
    </Modal>
  );
};
