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

const orderEmojis = {
  ASC: "⬆️",
  DESC: "⬇️",
};

const TableHeaders = () => {
  const { data } = useContext(QueryResultContext);
  const { orderBy: orderByList, updateOrderBy } = useOrderByStatements();

  const columns = data?.result.columns || [];
  const orderBy = orderByList[0];

  return (
    <thead>
      <tr>
        <td className="p-1 text-center w-8 text-sm text-gray-600">#</td>
        {columns.map(column => (
          <td className={st.headerCell} key={column.full}>
            <div className="overflow-hidden">
              <p className="text-xs truncate">{column.table || '-'}</p>
              <p className="text-sm font-bold truncate">{column.column}</p>
            </div>

            <div className={st.headerActions}>
              <button onClick={() => updateOrderBy(column.full)}>
                {orderBy?.column === column.full ? orderEmojis[orderBy.direction] : '↕️'}
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
  offset,
}: {
  row: TDbValue[];
  isLastRow: boolean;
  index: number;
  offset: number;
}) => {
  return (
    <tr className={clsx(st.tableRowCells, isLastRow && "rounded-b-lg")}>
      <td className="p-1 text-center align-middle text-xs w-8 text-blue-500">{index + 1 + offset}</td>
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
