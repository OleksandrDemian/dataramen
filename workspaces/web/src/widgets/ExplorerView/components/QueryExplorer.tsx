import {memo, MouseEventHandler, useContext, useMemo, useRef, useState} from "react";
import clsx from "clsx";
import {useParseError} from "../../../hooks/useParseError.ts";
import {Alert} from "../../Alert";
import {sanitizeCellValue} from "../../../utils/sql.ts";
import st from "./QueryExplorer.module.css";
import {
  QueryResultContext, TableContext,
  TableOptionsContext,
} from "../context/TableContext.ts";
import {IInspectionColumnRef, TDbValue, TQueryFilter} from "@dataramen/types";
import {useContextMenuHandler} from "./ContextualMenu.handler.ts";
import {useOrderByStatements} from "../hooks/useOrderByStatements.ts";
import {RowOptions} from "./RowOptions";
import {gt} from "../../../utils/numbers.ts";
import {prompt} from "../../../data/promptModalStore.ts";
import {useWhereStatements} from "../hooks/useWhereStatements.ts";
import {genSimpleId} from "../../../utils/id.ts";
import ArrowUpIcon from "../../../assets/arrow-up-outline.svg?react";
import SwapIcon from "../../../assets/swap-vertical-outline.svg?react";
import SearchIcon from "../../../assets/search-outline.svg?react";
import {TContextMenuRef} from "../../ContextualMenu";
import {CellActions} from "./CellActions";
import CaretUpIcon from "../../../assets/caret-up-outline.svg?react";
import {updateEntityEditor} from "../../../data/entityEditorStore.ts";

type TNewFilter = {
  value: string;
  column: string;
  fn?: string;
};

const orderIconClass = {
  DESC: "",
  ASC: "rotate-180",
};

const updateFilters = (filters: TQueryFilter[], { column, value, fn }: TNewFilter): TQueryFilter[] => {
  const newFilters: TQueryFilter[] = filters.map((f) => ({
    ...f,
    // disable other filters for the same column
    isEnabled: f.column === column ? false : f.isEnabled,
  }));

  newFilters.push({
    id: genSimpleId(),
    column,
    isEnabled: true,
    value,
    fn,
    isAdvanced: false,
  });

  return newFilters;
};

const TableHeaders = () => {
  const { data } = useContext(QueryResultContext);
  const { orderBy: orderByList, updateOrderBy } = useOrderByStatements();
  const { setFilters, filters } = useWhereStatements();

  const columns = data?.result.columns || [];
  const orderBy = orderByList[0];
  const showTableName = gt(data?.result.tables.length, 1);

  const onFilter = (column: string, fn?: string) => {
    prompt("Filter value", "").then((value) => {
      if (!value) {
        return;
      }

      setFilters(updateFilters(filters, { column, value, fn }));
    });
  };

  return (
    <thead>
      <tr>
        <td>🥢</td>
        {columns.map(column => (
          <td className={st.headerCell} key={column.full}>
            <div className="overflow-hidden">
              {showTableName && <p className="text-xs truncate italic text-(--text-color-primary)">{column.table || '-'}</p>}
              <p className="text-sm font-semibold truncate text-(--text-color-primary)">{column.column}</p>
            </div>

            <div className={st.headerActions}>
              {/* order by on alias, because group by runs after select */}
              <button onClick={() => updateOrderBy(column.alias)}>
                {orderBy?.column === column.alias ?
                  <ArrowUpIcon className={orderIconClass[orderBy.direction]} width={16} height={16} /> :
                  <SwapIcon width={16} height={16} />
                }
              </button>
              {/* filter on full column + fn to generate proper filter string */}
              <button onClick={() => onFilter(column.full, column.fn)}>
                <SearchIcon width={16} height={16} />
              </button>
            </div>
          </td>
        ))}
      </tr>
    </thead>
  );
};

function CellValue ({ value, refTable, refCol }: { value: TDbValue; refCol?: string; refTable?: string; }) {
  if (value === "") {
    return <span className="pointer-events-none text-black/30 truncate">{`<EMPTY STRING>`}</span>;
  }

  if (value === undefined || value === null) {
    return <span className="pointer-events-none text-black/30">{`<NULL>`}</span>;
  }

  const sanitized = sanitizeCellValue(value);

  if (refTable && refCol) {
    return (
      <div className="flex gap-1 items-center justify-between">
        <span className={st.value}>{sanitized}</span>
        <span className="hover:bg-gray-100 rounded p-0.5 cursor-pointer" data-cell-action="ref">
          <CaretUpIcon className="text-blue-600 pointer-events-none" width={16} height={16} />
        </span>
      </div>
    );
  }

  return (
    <span className={st.value}>{sanitized}</span>
  );
}

const TableRow = memo(({
  row,
  isLastRow,
  index,
  offset,
  indexedRefs,
}: {
  row: TDbValue[];
  isLastRow: boolean;
  index: number;
  offset: number;
  indexedRefs: Map<number, IInspectionColumnRef>;
}) => {
  return (
    <tr className={clsx(st.tableRowCells, isLastRow && "rounded-b-lg")}>
      <td>
        <button data-row-action={index} className={st.rowIndexBtn}>
          <CaretUpIcon className="rotate-180 pointer-events-none" width={16} height={16} />
          {index + 1 + offset}
        </button>
      </td>

      {row.map((value, i) => (
        <td className={st.cell} key={i} data-row={index} data-col={i}>
          <CellValue value={value} refCol={indexedRefs.get(i)?.field} refTable={indexedRefs.get(i)?.table} />
        </td>
      ))}
    </tr>
  );
});

const getCellParent = (e: HTMLElement): HTMLElement | undefined => {
  let parent = e.parentElement;
  let maxAttempts = 5;

  while (parent && maxAttempts >= 0) {
    if (parent.tagName === "TD") {
      return parent;
    }

    parent = parent.parentElement;
    maxAttempts --;
  }

  return undefined;
};

export const QueryExplorer = () => {
  const { data: result, error: queryError, isLoading, isFetching } = useContext(QueryResultContext);
  const { dataSourceId } = useContext(TableContext);
  const { state: { page, size } } = useContext(TableOptionsContext);
  const cellActionsRef = useRef<TContextMenuRef>(null);

  const parsedError = useParseError(queryError);

  const contextMenuHandler = useContextMenuHandler();
  const [row, setRow] = useState<number | undefined>(undefined);
  const [col, setCol] = useState<number | undefined>(undefined);

  const onRowActionClick: MouseEventHandler<HTMLTableElement> = (e) => {
    const dataset = (e.target as HTMLElement)?.dataset;
    const row = dataset?.rowAction;

    if (row != undefined) {
      setRow(parseInt(row));
      contextMenuHandler.open(e);
    }

    const cellAction = dataset?.cellAction;
    if (cellAction === "ref") {
      const parentCell = getCellParent(e.target as HTMLElement);
      if (parentCell) {
        const row = parentCell.dataset.row!;
        const col = parentCell.dataset.col!;
        const value = result?.result.rows[parseInt(row, 10)]?.[parseInt(col, 10)];
        const colInfo = result?.result.columns[parseInt(col, 10)];

        if (row && col) {
          updateEntityEditor({
            tableName: colInfo!.ref!.table,
            dataSourceId,
            entityId: [[colInfo!.ref!.field, value as unknown as any]],
          });
        }
      }
    }
  };

  const onCellContext: MouseEventHandler<HTMLElement> = (e) => {
    const dataset = (e.target as HTMLElement)?.dataset;
    const row = dataset?.row;
    const col = dataset?.col;

    if (row != undefined && col != undefined) {
      setRow(parseInt(row));
      setCol(parseInt(col));

      cellActionsRef.current?.open(e);
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const offset = page * size;
  const indexedRefs = useMemo(() => {
    const temp = new Map<number, IInspectionColumnRef>();
    if (result) {
      result.result.columns.forEach((col, index) => {
        if (col.ref) {
          temp.set(index, col.ref);
        }
      });
    }
    return temp;
  }, [result]);

  return (
    <>
      {row != undefined && contextMenuHandler.show && (
        <RowOptions
          handler={contextMenuHandler}
          rowIndex={row}
        />
      )}

      <CellActions
        ref={cellActionsRef}
        col={col}
        row={row}
        onClosed={() => {
          setRow(undefined);
          setCol(undefined);
        }}
      />

      {parsedError && (
        <Alert variant="danger">{parsedError}</Alert>
      )}

      {isLoading && (
        <div className={st.tableLoading}>Loading data</div>
      )}

      {result && (
        <table
          className={clsx(st.table, isFetching && st.semiTransparent)}
          onClick={onRowActionClick}
          onContextMenu={onCellContext}
        >
          <TableHeaders />

          <tbody>
            {result.result.rows?.length < 1 && (
              <tr className={st.tableEmpty}>
                <td colSpan={result.result.columns.length + 1}>No data</td>
              </tr>
            )}

            {/* Table Rows */}
            {result.result.rows?.map((row, i) => (
              <TableRow
                key={i}
                index={i}
                offset={offset}
                row={row}
                indexedRefs={indexedRefs}
                isLastRow={i === result.result.rows.length - 1}
              />
            ))}
          </tbody>
        </table>
      )}
    </>
  );
};
