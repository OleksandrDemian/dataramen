import {memo, MouseEventHandler, useContext, useState} from "react";
import clsx from "clsx";
import {useParseError} from "../../../hooks/useParseError.ts";
import {Alert} from "../../Alert";
import {sanitizeCellValue} from "../../../utils/sql.ts";
import st from "./QueryExplorer.module.css";
import {
  QueryResultContext, TableContext, TTableContext,
} from "../context/TableContext.ts";
import {TDbValue, TResultColumn} from "@dataramen/types";
import { OPERATOR_LABEL, STRING_TYPES } from "@dataramen/common";
import {useContextMenuHandler} from "./ContextualMenu.handler.ts";
import {useOrderByStatements} from "../hooks/useOrderByStatements.ts";
import {FiltersModal} from "./FiltersModal.tsx";
import {useCellActions} from "../hooks/useCellActions.ts";
import {RowOptions, TRowOptionsProps} from "./RowOptions.tsx";

const orderEmojis = {
  ASC: "⬆️",
  DESC: "⬇️",
};

function getDefaultOperator (filterColumn: TResultColumn, getColumnType: TTableContext["getColumnType"]) {
  const colType = getColumnType(filterColumn.full);
  if (!colType) {
    return OPERATOR_LABEL["="];
  }

  return STRING_TYPES.includes(colType) ? OPERATOR_LABEL["LIKE"] : OPERATOR_LABEL["="];
}

const TableHeaders = () => {
  const { data } = useContext(QueryResultContext);
  const { getColumnType } = useContext(TableContext);
  const { orderBy: orderByList, updateOrderBy } = useOrderByStatements();

  const columns = data?.columns || [];
  const orderBy = orderByList[0];
  const [filterColumn, setFilterColumn] = useState<TResultColumn | undefined>();

  return (
    <thead>
      <tr>
        {columns.map(column => (
          <td className={st.headerCell} key={column.full}>
            <div className="overflow-hidden">
              <p className="text-xs truncate">{column.table || '-'}</p>
              <p className="text-sm font-bold truncate">{column.alias}</p>
            </div>

            <div className={st.headerActions}>
              {/* if no table than it might be aggregated. Cannot use aggregated values in WHERE */}
              {column.table && (
                <button
                  onClick={() => {
                    setFilterColumn(column);
                  }}
                >
                  🔎
                </button>
              )}
              <button
                onClick={() => updateOrderBy(column.full)}
              >
                {orderBy?.column === column.full ? orderEmojis[orderBy.direction] : '↕️'}
              </button>
            </div>
          </td>
        ))}
      </tr>

      {filterColumn && (
        <FiltersModal
          selectColumn={filterColumn.full}
          selectedOperation={getDefaultOperator(filterColumn, getColumnType)}
          focusOn="value"
          onClose={() => setFilterColumn(undefined)}
        />
      )}
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
      <span data-row={row} className="truncate block pointer-events-none">{sanitized}</span>
      <div className={st.cellActions}>
        <button data-copy-col={col} data-copy-row={row}>📋</button>
        <button data-show-col={col} data-show-row={row}>👀</button>
        <button data-filter-col={col} data-filter-row={row}>🔎</button>
      </div>
    </>
  );
}

const TableRow = memo(({
  row,
  isLastRow,
  index,
}: {
  row: TDbValue[];
  isLastRow: boolean;
  index: number;
}) => {
  return (
    <tr className={clsx(st.tableRowCells, isLastRow && "rounded-b-lg")}>
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
            {result.rows?.length < 1 && (
              <tr className={st.tableEmpty}>
                <td colSpan={result.columns.length}>No data</td>
              </tr>
            )}

            {/* Table Rows */}
            {result.rows?.map((row, i) => (
              <TableRow
                key={i}
                index={i}
                row={row}
                isLastRow={i === result.rows.length - 1}
              />
            ))}
          </tbody>
        </table>
      )}
    </>
  );
};
