import {memo, MouseEventHandler, useContext, useMemo, useRef, useState} from "react";
import clsx from "clsx";
import {useParseError} from "../../../hooks/useParseError.ts";
import {Alert} from "../../Alert";
import {sanitizeCellValue} from "../../../utils/sql.ts";
import st from "./QueryExplorer.module.css";
import {
  QueryResultContext,
  TableContext,
  TableOptionsContext,
} from "../context/TableContext.ts";
import {TDbValue, TQueryFilter} from "@dataramen/types";
import {useContextMenuHandler} from "./ContextualMenu.handler.ts";
import {useOrderByStatements} from "../hooks/useOrderByStatements.ts";
import {CellDrillDown} from "./RowOptions";
import {gt} from "../../../utils/numbers.ts";
import {queryExpressionPrompt} from "../../../data/promptModalStore.ts";
import {genSimpleId} from "../../../utils/id.ts";
import ArrowUpIcon from "../../../assets/arrow-up-outline.svg?react";
import SwapIcon from "../../../assets/swap-vertical-outline.svg?react";
import SearchIcon from "../../../assets/search-outline.svg?react";
import EyeOffIcon from "../../../assets/eye-off-outline.svg?react";
import {TContextMenuRef} from "../../ContextualMenu";
import {CellActions} from "./CellActions";
import CaretUpIcon from "../../../assets/caret-up-outline.svg?react";
import {openEntityEditor} from "../../../data/entityEditorStore.ts";

type TNewFilter = Pick<TQueryFilter, 'column' | 'value' | 'mode' | 'fn'>

type TCellActions = {
  hasDrill?: boolean;
  hasRecord?: boolean;
};

const orderIconClass = {
  DESC: "",
  ASC: "rotate-180",
};

const updateFilters = (filters: TQueryFilter[], { column, value, fn, mode }: TNewFilter): TQueryFilter[] => {
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
    mode,
  });

  return newFilters;
};

const TableHeaders = ({ visibleCols }: { visibleCols: number[] }) => {
  const { data } = useContext(QueryResultContext);
  const { setState } = useContext(TableOptionsContext);
  const { orderBy: orderByList, updateOrderBy } = useOrderByStatements();

  const columns = data?.result.columns || [];
  const orderBy = orderByList[0];
  const showTableName = gt(data?.result.tables.length, 1);

  const onFilter = (column: string, fn?: string) => {
    queryExpressionPrompt("Filter value", "").then((exp) => {
      if (!exp) {
        return;
      }

      setState((state) => ({
        ...state,
        page: 0,
        filters: updateFilters(state.filters, { column, value: exp.value, fn, mode: exp.mode }),
      }));
    });
  };

  const onHide = (column: string) => {
    setState((state) => ({
      ...state,
      hiddenColumns: [...state.hiddenColumns, { value: column }]
    }));
  };

  const cols = visibleCols.map((col) => columns[col]);

  return (
    <thead>
      <tr>
        <td>🥢</td>
        {cols.map(column => (
          <td className={st.headerCell} key={column.full} data-column-name={column.full}>
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
              {column.table && (
                <button onClick={() => onHide(column.full)}>
                  <EyeOffIcon width={16} height={16} />
                </button>
              )}
            </div>
          </td>
        ))}
      </tr>
    </thead>
  );
};

function CellValue ({ value, actions }: { value: TDbValue; actions?: TCellActions; }) {
  if (value === "") {
    return <span className="pointer-events-none text-black/30 truncate">{`<EMPTY STRING>`}</span>;
  }

  if (value === undefined || value === null) {
    return <span className="pointer-events-none text-black/30">{`<NULL>`}</span>;
  }

  const sanitized = sanitizeCellValue(value);

  if (actions?.hasRecord || actions?.hasDrill) {
    return (
      <div className="flex gap-1 items-center justify-between pointer-events-none">
        <span className={st.value}>{sanitized}</span>

        <div className="flex">
          {actions.hasRecord && (
            <span className="text-gray-300 hover:text-green-600 hover:bg-gray-100 rounded p-0.5 cursor-pointer pointer-events-auto" data-cell-action="ref" data-tooltip-id="default-xs" data-tooltip-content="Show record">
              <CaretUpIcon className="pointer-events-none" width={16} height={16} />
            </span>
          )}

          {actions.hasDrill && (
            <span className="text-gray-300 hover:text-blue-600 hover:bg-gray-100 rounded p-0.5 cursor-pointer pointer-events-auto" data-cell-action="drill" data-tooltip-id="default-xs" data-tooltip-content="Show related rows">
              <CaretUpIcon className="pointer-events-none rotate-180" width={16} height={16} />
            </span>
          )}
        </div>
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
  colMeta,
  visibleCols,
}: {
  row: TDbValue[];
  isLastRow: boolean;
  index: number;
  offset: number;
  colMeta: Map<number, TCellActions>;
  visibleCols: number[];
}) => {
  const cells: Array<[TDbValue, number]> = visibleCols.map((col) => [row[col], col]);

  return (
    <tr className={clsx(st.tableRowCells, isLastRow && "rounded-b-lg")}>
      <td data-row={index}>
        <button data-cell-action="drill-all" className={st.rowIndexBtn}>
          <CaretUpIcon className="rotate-180 pointer-events-none" width={16} height={16} />
          <span>{index + 1 + offset}</span>
        </button>
      </td>

      {cells.map(([value, i]) => (
        <td className={st.cell} key={i} data-row={index} data-col={i}>
          <CellValue value={value} actions={colMeta.get(i)} />
        </td>
      ))}
    </tr>
  );
});

const getCellParent = (e: HTMLElement): HTMLElement | undefined => {
  if (e.tagName === "TD") {
    return e;
  }

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

type TCellCoordinates = {
  row: number;
  col?: number;
}

const getCellCoordinates = (el: HTMLElement): TCellCoordinates | undefined => {
  const parentCell = getCellParent(el);
  if (!parentCell) {
    return undefined;
  }

  const row = parseInt(parentCell.dataset.row!, 10);
  const col = parseInt(parentCell.dataset.col!, 10);

  return {
    row,
    col: Number.isNaN(col) ? undefined : col,
  }
};

export const QueryExplorer = () => {
  const { data: result, error: queryError, isLoading, isFetching } = useContext(QueryResultContext);
  const { dataSourceId, getColumnByIndex, getValueByIndex } = useContext(TableContext);
  const { state: { page, size } } = useContext(TableOptionsContext);
  const cellActionsRef = useRef<TContextMenuRef>(null);

  const parsedError = useParseError(queryError);

  const cellDrillDownHandler = useContextMenuHandler();
  const [coordinates, setCoordinates] = useState<TCellCoordinates | undefined>();

  const onRowActionClick: MouseEventHandler<HTMLTableElement> = (e) => {
    const el = e.target as HTMLElement;
    const cellAction = el.dataset?.cellAction;
    const coordinates = getCellCoordinates(el);

    if (cellAction === "ref" && gt(coordinates?.col, -1)) {
      const value = getValueByIndex(coordinates.row, coordinates.col);
      const colInfo = getColumnByIndex(coordinates.col);

      if (colInfo) {
        openEntityEditor({
          tableName: colInfo!.ref!.table,
          dataSourceId,
          entityId: [[colInfo!.ref!.field, value as unknown as any]],
        });
      }
    } else if (cellAction === "drill") {
      setCoordinates(coordinates);
      cellDrillDownHandler.open(e);
    } else if (cellAction === "drill-all") {
      setCoordinates(coordinates);
      cellDrillDownHandler.open(e);
    }
  };

  const onCellContext: MouseEventHandler<HTMLElement> = (e) => {
    const coordinates = getCellCoordinates(e.target as HTMLElement);

    if (coordinates) {
      setCoordinates(coordinates);

      cellActionsRef.current?.open(e);
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const offset = page * size;
  const colMeta = useMemo(() => {
    const temp = new Map<number, TCellActions>();
    if (result) {
      result.result.columns.forEach((col, index) => {
        temp.set(index, {
          hasRecord: !!col.ref,
          hasDrill: !!col.referencedBy,
        });
      });
    }
    return temp;
  }, [result]);

  const cols = useMemo(() => {
    const columns: number[] = [];
    const headers = result?.result.columns;

    if (headers) {
      for (let i = 0; i < headers.length; i++) {
        if (headers[i].hidden !== true) {
          columns.push(i);
        }
      }
    }

    return columns;
  }, [result]);

  return (
    <>
      {coordinates && cellDrillDownHandler.show && (
        <CellDrillDown
          handler={cellDrillDownHandler}
          rowIndex={coordinates.row}
          colIndex={coordinates.col}
        />
      )}

      <CellActions
        ref={cellActionsRef}
        col={coordinates?.col}
        row={coordinates?.row}
        onClosed={() => {
          setCoordinates(undefined);
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
          <TableHeaders visibleCols={cols} />

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
                colMeta={colMeta}
                visibleCols={cols}
                isLastRow={i === result.result.rows.length - 1}
              />
            ))}
          </tbody>
        </table>
      )}
    </>
  );
};
