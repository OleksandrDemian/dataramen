import {memo, MouseEventHandler, useContext, useRef, useState} from "react";
import clsx from "clsx";
import {useParseError} from "../../../hooks/useParseError.ts";
import {Alert} from "../../Alert";
import {sanitizeCellValue} from "../../../utils/sql.ts";
import st from "./QueryExplorer.module.css";
import {
  QueryResultContext,
  TableOptionsContext,
} from "../context/TableContext.ts";
import {TDbValue, TQueryFilter} from "@dataramen/types";
import {useContextMenuHandler} from "./ContextualMenu.handler.ts";
import {useOrderByStatements} from "../hooks/useOrderByStatements.ts";
import {RowOptions} from "./RowOptions";
import {gte} from "../../../utils/numbers.ts";
import {prompt} from "../../../data/promptModalStore.ts";
import {useWhereStatements} from "../hooks/useWhereStatements.ts";
import {genSimpleId} from "../../../utils/id.ts";
import ArrowUpIcon from "../../../assets/arrow-up-outline.svg?react";
import ChevronIcon from "../../../assets/chevron-forward-outline.svg?react";
import SwapIcon from "../../../assets/swap-vertical-outline.svg?react";
import SearchIcon from "../../../assets/search-outline.svg?react";
import {TContextMenuRef} from "../../ContextualMenu";
import {CellActions} from "./CellActions";

type TNewFilter = {
  value: string;
  column: string;
};

const orderIconClass = {
  DESC: "",
  ASC: "rotate-180",
};

const updateFilters = (filters: TQueryFilter[], { column, value }: TNewFilter): TQueryFilter[] => {
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
  const showTableName = gte(data?.result.tables.length, 1);

  const onFilter = (column: string) => {
    prompt("Filter value", "").then((value) => {
      if (!value) {
        return;
      }

      setFilters(updateFilters(filters, { column, value }));
    });
  };

  return (
    <thead>
      <tr>
        <td>🥢</td>
        {columns.map(column => (
          <td className={st.headerCell} key={column.full}>
            <div className="overflow-hidden">
              {showTableName && <p className="text-xs truncate italic">{column.table || '-'}</p>}
              <p className="text-sm font-semibold truncate">{column.column}</p>
            </div>

            <div className={st.headerActions}>
              <button onClick={() => updateOrderBy(column.full)}>
                {orderBy?.column === column.full ?
                  <ArrowUpIcon className={orderIconClass[orderBy.direction]} width={16} height={16} /> :
                  <SwapIcon width={16} height={16} />
                }
              </button>
              {/* check if it has table, otherwise it is aggregated or smth, not supported for now */}
              {column.table && (
                <button onClick={() => onFilter(column.full)}>
                  <SearchIcon width={16} height={16} />
                </button>
              )}
            </div>
          </td>
        ))}
      </tr>
    </thead>
  );
};

function CellValue ({ value }: { value: TDbValue; }) {
  if (value === "") {
    return <span className="pointer-events-none text-black/30 truncate">{`<EMPTY STRING>`}</span>;
  }

  if (value === undefined || value === null) {
    return <span className="pointer-events-none text-black/30">{`<NULL>`}</span>;
  }

  const sanitized = sanitizeCellValue(value);

  return (
    <span className={st.value}>{sanitized}</span>
  );
}

const TableRow = memo(({
  row,
  isLastRow,
  index,
  offset,
}: {
  row: TDbValue[];
  isLastRow: boolean;
  index: number;
  offset: number;
}) => {
  return (
    <tr className={clsx(st.tableRowCells, isLastRow && "rounded-b-lg")}>
      <td>
        <button data-row-action={index} className={st.rowIndexBtn}>
          <ChevronIcon className="pointer-events-none" width={16} height={16} />
          {index + 1 + offset}
        </button>
      </td>

      {row.map((value, i) => (
        <td className={st.cell} key={i} data-row={index} data-col={i}>
          <CellValue value={value} />
        </td>
      ))}
    </tr>
  );
});

export const QueryExplorer = () => {
  const { data: result, error: queryError, isLoading, isFetching } = useContext(QueryResultContext);
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
                isLastRow={i === result.result.rows.length - 1}
              />
            ))}
          </tbody>
        </table>
      )}
    </>
  );
};
