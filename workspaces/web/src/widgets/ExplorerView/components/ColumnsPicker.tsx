import {Modal, ModalClose} from "../../Modal";
import {ChangeEventHandler, useContext, useMemo, useState} from "react";
import {TableContext, TableOptionsContext} from "../context/TableContext.ts";
import st from "./ColumnsPicker.module.css";
import {reduceStringArrayToBooleanObject} from "../../../utils/reducers.ts";
import {generateColumnLabel} from "../../../utils/sql.ts";
import clsx from "clsx";
import {TInputColumn, TRunSqlResult} from "@dataramen/types";
import {ALLOW_DATE_FUNCTIONS} from "@dataramen/common";

type TColumn = {
  label: string;
  value: string;
  type: string;
  nested?: boolean;
};
type TTables = {
  name: string;
  columns: TColumn[];
}[];

function parseColumns (availableColumns: TRunSqlResult["allColumns"]) {
  if (!availableColumns) {
    return [];
  }

  const groups: Record<string, TColumn[]> = {};
  availableColumns.forEach((col) => {
    if (groups[col.table]) {
      groups[col.table].push({
        value: col.full,
        label: generateColumnLabel(col.column),
        type: col.type,
      });
    } else {
      groups[col.table] = [{
        value: col.full,
        label: generateColumnLabel(col.column),
        type: col.type,
      }];
    }

    if (ALLOW_DATE_FUNCTIONS[col.type]) {
      ["YEAR", "MONTH", "DAY"].forEach((fn) => {
        groups[col.table].push({
          value: fn + " " + col.full,
          label: fn + " " + generateColumnLabel(col.column),
          type: "number",
          nested: true,
        });
      })
    }
  });

  return Object.entries(groups).reduce((acc, [table, columns]) => {
    acc.push({
      name: generateColumnLabel(table),
      columns,
    });
    return acc;
  }, [] as TTables);
}

function filterColumns (tables: TTables, filter: string): TTables {
  const lowerFilter = filter.toLowerCase();

  return tables
    .map(table => {
      const filteredColumns = table.columns.filter(
        col =>
          col.label.toLowerCase().includes(lowerFilter) ||
          col.value.toLowerCase().includes(lowerFilter)
      );
      return { ...table, columns: filteredColumns };
    })
    .filter(table => table.columns.length > 0); // Remove tables with no matching columns
}

const ColumnEntry = ({ column, selected, onCheck }: { column: TColumn; selected: Record<string, boolean>; onCheck: ChangeEventHandler<HTMLInputElement> }) => {
  return (
    <label key={column.value} className={clsx(st.columnLabel, selected ? st.active : st.notActive, column.nested && "pl-5!")}>
      <input type="checkbox" checked={selected[column.value]} name={column.value} onChange={onCheck} />
      <p className="flex justify-between w-full">
        <span data-tooltip-content={column.value} data-tooltip-id="default">{column.label}</span>
        <span className="text-blue-600">{column.type}</span>
      </p>
    </label>
  );
};

export type TQueryColumnsProps = {
  onCancel: () => void;
  mode: "columns" | "groupBy";
};
export const ColumnsPicker = ({ onCancel, mode }: TQueryColumnsProps) => {
  const { allColumns } = useContext(TableContext);
  const { state, setState } = useContext(TableOptionsContext);
  const [newColumns, setNewColumns] = useState<Record<string, boolean>>(
    () => reduceStringArrayToBooleanObject(
      state[mode].map((c) => {
        if (c.fn) {
          return c.fn + " " + c.value;
        }

        return c.value;
      }),
    ),
  );
  const [filter, setFilter] = useState<string>("");
  const parsedColumns = useMemo<TTables>(() => parseColumns(allColumns), [allColumns])

  const filtered = useMemo(() => {
    if (!filter) {
      return parsedColumns;
    }

    return filterColumns(parsedColumns, filter);
  }, [filter, parsedColumns]);

  const onCheck: ChangeEventHandler<HTMLInputElement> = (e) => {
    setNewColumns((col) => ({
      ...col,
      [e.target.name]: e.target.checked,
    }))
  };

  const onAllCheck: ChangeEventHandler<HTMLInputElement> = (e) => {
    const value = e.target.checked;
    setNewColumns((columns) => {
      for (const col of allColumns) {
        columns[col.full] = value;
      }

      return {...columns};
    });
  };

  const apply = () => {
    const cols: TInputColumn[] = [];
    for (const [column, selected] of Object.entries(newColumns)) {
      if (selected) {
        const [a, b] = column.split(" ");
        cols.push({
          value: b ? b : a,
          fn: b ? a : undefined,
        });
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
      if (!newColumns[column.full]) {
        return false;
      }
    }

    return true;
  }, [newColumns, allColumns])

  return (
    <Modal isVisible onClose={onCancel} portal>
      <ModalClose onClick={onCancel} />
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
            <div key={table.name} className="mt-2">
              <p className="font-semibold sticky top-0 bg-white p-1 z-1">📄 {table.name}</p>
              {table.columns.map((column) => (
                <ColumnEntry
                  key={column.value}
                  column={column}
                  selected={newColumns}
                  onCheck={onCheck}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <label className="button tertiary flex gap-2 items-center">
            <input type="checkbox" checked={allSelected} onChange={onAllCheck} />
            <span>Select all</span>
          </label>
          <span className="flex-1" />
          <button className="button tertiary" onClick={onCancel}>Cancel</button>
          <button className="button primary" onClick={apply}>Apply</button>
        </div>
      </div>
    </Modal>
  );
};
