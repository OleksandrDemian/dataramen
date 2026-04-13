import {RefObject, useContext} from "react";
import {QueryResultContext, TableContext, TableOptionsContext} from "../../context/TableContext.ts";
import {sanitizeCellValue} from "../../../../utils/sql.ts";
import {displayValue} from "../../../../data/valueDisplayStore.ts";
import {TQueryFilter} from "@dataramen/types";
import toast from "react-hot-toast";
import {TRunQueryResult} from "../../../../data/types/queryRunner.ts";
import {genSimpleId} from "../../../../utils/id.ts";
import {TContextMenuRef} from "../../../ContextualMenu";
import {showEditValueModal} from "../../../../data/editValueStore.ts";

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
  const { getColumnType, getEntityKey, dataSourceId } = useContext(TableContext);
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

  const editValue = (row: number, col: number) => {
    const { value, column } = getValueAndColumn(result?.result, row, col);

    if (column && column.table) {
      const entityKey = getEntityKey(column.table, row);
      const sanitized = sanitizeCellValue(
        value,
        getColumnType(column.full),
      );
      showEditValueModal({
        entity: column.table,
        current: sanitized,
        entityId: entityKey,
        prop: column.column,
        dataSourceId,
      });
      ref.current?.close();
    } else {
      toast.error("Unable to edit cell");
    }
  };

  const filterValue = (row: number, col: number) => {
    const { value, column } = getValueAndColumn(result?.result, row, col);
    const actualValue = column?.full || "";

    if (actualValue) {
      let filter: TQueryFilter;
      if (value === undefined || value === null) {
        filter = {
          id: genSimpleId(),
          isEnabled: true,
          mode: "raw",
          column: actualValue,
          value: "IS NULL"
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
          value: sanitized,
          fn: column?.fn,
          mode: "default"
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
    editValue,
  };
};
