import {RefObject, useContext} from "react";
import {QueryResultContext, TableContext, TableOptionsContext} from "../../context/TableContext.ts";
import {sanitizeCellValue} from "../../../../utils/sql.ts";
import {displayValue} from "../../../../data/valueDisplayStore.ts";
import {QueryFilter} from "@dataramen/sql-builder";
import toast from "react-hot-toast";
import {TRunQueryResult} from "../../../../data/types/queryRunner.ts";
import {genSimpleId} from "../../../../utils/id.ts";
import {TContextMenuRef} from "../../../ContextualMenu";

function getValueAndColumn (result: TRunQueryResult | undefined, row: number, col: number) {
  const value = result?.rows?.[row]?.[col];
  const column = result?.columns?.[col];

  return {
    value,
    column,
  };
}

export type TUseCellActionsProps = {
  ref: RefObject<TContextMenuRef | null>;
};
export const useCellActions = ({ ref }: TUseCellActionsProps) => {
  const { data: result } = useContext(QueryResultContext);
  const { getColumnType } = useContext(TableContext);
  const { setState } = useContext(TableOptionsContext);

  const copyValue = (row: number, col: number) => {
    const { value, column } = getValueAndColumn(result?.result, row, col);

    if (column) {
      const sanitized = sanitizeCellValue(
        value,
        getColumnType(column.full),
      );
      navigator.clipboard.writeText(sanitized);
      toast.success("Copied!");
      ref.current?.close();
    }
  };

  const showValue = (row: number, col: number) => {
    const { value, column } = getValueAndColumn(result?.result, row, col);

    if (column) {
      const sanitized = sanitizeCellValue(
        value,
        getColumnType(column.full),
      );
      displayValue(sanitized);
      ref.current?.close();
    }
  };

  const filterValue = (row: number, col: number) => {
    const { value, column } = getValueAndColumn(result?.result, row, col);
    const actualValue = column?.full || "";
    const fn: string | undefined = undefined;

    if (column?.table === "") {
      toast.error("Filtering on aggregated column is not supported yet");
      return;
    }

    if (actualValue) {
      let filter: QueryFilter;
      if (value === undefined || value === null) {
        filter = {
          id: genSimpleId(),
          isEnabled: true,
          column: actualValue,
          connector: 'AND',
          operator: "IS NULL"
        };
      } else {
        const sanitized = sanitizeCellValue(
          value,
          getColumnType(actualValue),
        );
        filter = {
          id: genSimpleId(),
          isEnabled: true,
          column: actualValue,
          connector: 'AND',
          operator: "=",
          fn,
          value: [{ value: sanitized }],
        };
      }

      setState((cur) => ({
        ...cur,
        filters: [...cur.filters, filter],
      }));

      toast.success(`Added new filter on column ${column?.alias}`);
      ref.current?.close();
    }
  };

  return {
    copyValue,
    showValue,
    filterValue,
  };
};
