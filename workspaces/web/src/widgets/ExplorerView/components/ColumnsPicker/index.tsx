import {TInputColumn, TRunSqlResult} from "@dataramen/types";
import {useContext, useEffect, useMemo, useRef, useState} from "react";
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
import OpenIcon from "../../../../assets/open-outline.svg?react";
import {reduceStringArrayToBooleanObject} from "../../../../utils/reducers.ts";
import { DEFAULT_AUTOFOCUS } from "../../../../utils/autofocus.ts";
import { tryScrollIntoColumn } from "../../../../utils/scrollIntoElement.ts";

type TColumn = {
  columnName: string;
  value: string;
  type: string;
  nested?: boolean;
  colIndex?: number;
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
  let colIndex = 0;

  return tables
    .map(table => {
      const filteredColumns = table.columns.filter(
        col => col.columnName.toLowerCase().includes(lowerFilter)
      );

      return {
        ...table,
        columns: filteredColumns.map(col => ({...col, colIndex: colIndex++})),
      };
    })
    .filter(table => table.columns.length > 0); // Remove tables with no matching columns
}

function scrollToHighlighted(id: number) {
  const el = document.querySelector(`[data-col-idx="${id}"]`);
  el?.scrollIntoView({ block: "nearest" });
}

function findFilteredColumnIndex(tables: TTables, index: number): TColumn | undefined {
  for (const table of tables) {
    for (const column of table.columns) {
      if (column.colIndex === index) {
        return column;
      }
    }
  }

  return undefined;
}

const HiddenColumnEntry = ({column, hidden, highlighted, onToggle, onScrollIntoColumn}: {
  column: TColumn;
  hidden: boolean;
  highlighted?: boolean;
  onToggle: (name: string, value: boolean) => void;
  onScrollIntoColumn: (columnName: string) => void;
}) => {
  return (
    <div
      key={column.value}
      data-col-idx={column.colIndex}
      className={clsx(st.columnLabel, hidden === true && st.hidden, highlighted && st.highlighted)}
    >
      {hidden ? <EyeOffIcon width={16} height={16}/> : <EyeIcon width={16} height={16}/>}

      <p className="flex justify-between w-full" onClick={() => onToggle(column.value, !hidden)}>
        <span data-tooltip-content={column.value} data-tooltip-id="default">{column.columnName}</span>
        <span className="text-blue-600">{column.type}</span>
      </p>

      <button onClick={() => onScrollIntoColumn(column.value)}>
        <OpenIcon width={16} height={16}/>
      </button>
    </div>
  );
};

const GroupByEntry = ({column, selected, highlighted, onToggle}: {
  column: TColumn;
  selected: boolean;
  highlighted?: boolean;
  onToggle: (name: string, value: boolean) => void;
}) => {
  return (
    <div
      key={column.value}
      data-col-idx={column.colIndex}
      className={clsx(st.groupByLabel, selected === false && st.notSelected, highlighted && st.highlighted)}
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
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const parsedColumns = useMemo<TTables>(() => parseColumns(allColumns), [allColumns]);
  const ignoreColumns = state.aggregations.length > 0 || state.groupBy.length > 0;

  const { filtered, size } = useMemo(() => {
    const res = filterColumns(parsedColumns, filter);
    return {
      filtered: res,
      size: res.reduce((acc, table) => acc + table.columns.length, 0),
    };
  }, [filter, parsedColumns]);

  const onToggle = (name: string, value: boolean) => {
    setSelectedColumns((col) => ({
      ...col,
      [name]: value,
    }));
    inputRef.current?.focus();
  };

  const onRemoveSelection = () => {
    setSelectedColumns({});
  };

  const onSelectAll = () => {
    setSelectedColumns(allColumns.reduce((acc, col) => {
      acc[col.full] = true;
      return acc;
    }, {} as Record<string, boolean>));
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

  const hasSelectedSomething = Object.values(selectedColumns).some(v => v);

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

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      const index = Math.min(highlightIndex + 1, size - 1);
      e.preventDefault();
      setHighlightIndex(index);
      scrollToHighlighted(index);
    } else if (e.key === "ArrowUp") {
      const index = Math.max(highlightIndex - 1, -1);
      e.preventDefault();
      setHighlightIndex(index);
      scrollToHighlighted(index);
    } else if (e.key === " ") {
      if (highlightIndex >= 0 && highlightIndex < size) {
        e.preventDefault();
        const col = findFilteredColumnIndex(filtered, highlightIndex);
        if (col) {
          onToggle(col.value, !selectedColumns[col.value]);
        }
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      apply();
    }
  };

  // init hidden columns after each open
  useEffect(() => {
    if (showModal) {
      setSelectedColumns(
        () => reduceStringArrayToBooleanObject(
          state[mode]?.map((c) => {
            if (c.fn) {
              return c.fn + " " + c.value;
            }

            return c.value;
          }) || [],
        ),
      );
    }
  }, [showModal, setSelectedColumns /* don't include state in dependencies */]);

  const onClosed = () => {
    setFilter("");
    setSelectedColumns({});
    setHighlightIndex(-1);
  };

  return (
    <Modal isVisible={showModal} onClose={onCancel} portal onClosed={onClosed} backdropClose>
      <ModalClose onClick={onCancel}/>
      <div className={st.container}>
        <h2 className="text-lg font-semibold">
          {mode === 'groupBy' ? 'Group by' : 'Show columns'}
        </h2>

        <input
          ref={inputRef}
          autoFocus={DEFAULT_AUTOFOCUS}
          className="input my-2"
          placeholder="Filter"
          value={filter}
          onChange={(e) => {
            setHighlightIndex(-1);
            setFilter(e.target.value);
          }}
          onKeyDown={onKeyDown}
        />

        <div className="overflow-y-auto">
          {filtered.map((table) => (
            <div key={table.name} className="my-2">
              <p className="font-semibold sticky top-0 bg-white p-1 z-1">📄 {table.name}</p>

              {mode === "hiddenColumns" && table.columns.map((column) => (
                <HiddenColumnEntry
                  key={column.value}
                  column={column}
                  hidden={selectedColumns[column.value] === true}
                  highlighted={highlightIndex === column.colIndex}
                  onToggle={onToggle}
                  onScrollIntoColumn={() => {
                    tryScrollIntoColumn(column.value);
                    onCancel();
                  }}
                />
              ))}

              {mode === "groupBy" && table.columns.map((column) => (
                <GroupByEntry
                  key={column.value}
                  column={column}
                  selected={selectedColumns[column.value] === true}
                  highlighted={highlightIndex === column.colIndex}
                  onToggle={onToggle}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-2">
          {mode === "hiddenColumns" && (
            <button className="button text-sm tertiary flex gap-2 items-center" onClick={onSelectAll}>
              <span>Hide all</span>
            </button>
          )}

          {hasSelectedSomething && (
            <button className="button text-sm tertiary flex gap-2 items-center" onClick={onRemoveSelection}>
              <span>{mode === "hiddenColumns" ? "Show all" : "Remove all"}</span>
            </button>
          )}

          <span className="flex-1"/>
          <button className="button text-sm tertiary" onClick={onCancel}>Cancel</button>
          <button className="button text-sm primary" onClick={apply}>Apply</button>
        </div>
      </div>
    </Modal>
  );
};
