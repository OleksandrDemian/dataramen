import {memo, MouseEventHandler, useContext, useState} from "react";
import clsx from "clsx";
import {useParseError} from "../../../hooks/useParseError.ts";
import {Alert} from "../../Alert";
import {sanitizeCellValue} from "../../../utils/sql.ts";
import st from "./QueryExplorer.module.css";
import {
  QueryResultContext,
  TableOptionsContext,
} from "../context/TableContext.ts";
import {TDbValue} from "@dataramen/types";
import {useContextMenuHandler} from "./ContextualMenu.handler.ts";
import {useOrderByStatements} from "../hooks/useOrderByStatements.ts";
import {useCellActions} from "../hooks/useCellActions.ts";
import {RowOptions, TRowOptionsProps} from "./RowOptions.tsx";
import {gte} from "../../../utils/numbers.ts";
import {prompt} from "../../../data/promptModalStore.ts";
import {isStringType} from "@dataramen/common";
import {useWhereStatements} from "../hooks/useWhereStatements.ts";
import {genSimpleId} from "../../../utils/id.ts";
import {QueryFilter} from "@dataramen/sql-builder";
import ArrowUpIcon from "../../../assets/arrow-up-outline.svg?react";
import SwapIcon from "../../../assets/swap-vertical-outline.svg?react";
import SearchIcon from "../../../assets/search-outline.svg?react";
import CopyIcon from "../../../assets/copy-outline.svg?react";
import EyeIcon from "../../../assets/eye-outline.svg?react";

type TNewFilter = {
  value: string;
  column: string;
  type: string;
};

const orderIconClass = {
  ASC: "",
  DESC: "rotate-180",
};

const updateFilters = (filters: QueryFilter[], { type, column, value }: TNewFilter): QueryFilter[] => {
  const newFilters: QueryFilter[] = filters.map((f) => ({
    ...f,
    // disable other filters for the same column
    isEnabled: f.column === column ? false : f.isEnabled,
  }));

  newFilters.push({
    id: genSimpleId(),
    column,
    isEnabled: true,
    connector: "AND",
    value: [{
      value,
      isColumn: false,
    }],
    operator: isStringType(type) ? "LIKE" : "=",
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

  const onFilter = (column: string, type?: string) => {
    prompt("Filter value", "").then((value) => {
      if (!type || !value) {
        return;
      }

      setFilters(updateFilters(filters, { column, type, value }));
    });
  };

  return (
    <thead>
      <tr>
        <td className="py-1 px-4 text-center text-sm text-gray-600 border-r">#</td>
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
              <button onClick={() => onFilter(column.full, column.type)}>
                <SearchIcon width={16} height={16} />
              </button>
            </div>
          </td>
        ))}
      </tr>
    </thead>
  );
};

function CellValue ({ value, row, col }: { value: TDbValue; col: number; row: number; }) {
  if (value === "") {
    return <span className="pointer-events-none text-black/30 truncate">{`<EMPTY STRING>`}</span>;
  }

  if (value === undefined || value === null) {
    return <span className="pointer-events-none text-black/30">{`<NULL>`}</span>;
  }

  const sanitized = sanitizeCellValue(value);

  return (
    <>
      <span data-row={row} className={st.value}>{sanitized}</span>
      <div className={st.cellActions}>
        <button data-copy-col={col} data-copy-row={row}>
          <CopyIcon width={16} height={16} />
        </button>
        <button data-show-col={col} data-show-row={row}>
          <EyeIcon width={16} height={16} />
        </button>
        <button data-filter-col={col} data-filter-row={row}>
          <SearchIcon width={16} height={16} />
        </button>
      </div>
    </>
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
      <td className="py-1 px-4 text-center align-middle text-xs w-8 text-blue-500 border-r">{index + 1 + offset}</td>
      {row.map((value, i) => (
        <td className={st.cell} key={i} data-row={index}>
          <CellValue value={value} col={i} row={index} />
        </td>
      ))}
    </tr>
  );
});

export const QueryExplorer = () => {
  const { data: result, error: queryError, isLoading, isFetching } = useContext(QueryResultContext);
  const { state: { page, size } } = useContext(TableOptionsContext);

  const parsedError = useParseError(queryError);
  const clickHandler = useCellActions();

  const contextMenuHandler = useContextMenuHandler();
  const [row, setRow] = useState<TRowOptionsProps["rowIndex"] | undefined>(undefined);

  const onContextMenu: MouseEventHandler<HTMLTableElement> = (e) => {
    const dataset = (e.target as HTMLElement)?.dataset;
    const row = dataset?.row;

    if (row != undefined) {
      setRow(parseInt(row));
      contextMenuHandler.open(e);
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

      {parsedError && (
        <Alert className="my-4" variant="danger">{parsedError}</Alert>
      )}

      {isLoading && (
        <div className={st.tableLoading}>Loading data</div>
      )}

      {result && (
        <table
          className={clsx(st.table, isFetching && st.semiTransparent)}
          onContextMenu={onContextMenu}
          onClick={clickHandler}
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
