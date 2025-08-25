import {MouseEvent, MouseEventHandler, useContext} from "react";
import {QueryResultContext, TableContext, TableOptionsContext} from "../context/TableContext.ts";
import {sanitizeCellValue} from "../../../utils/sql.ts";
import {displayValue} from "../../../data/valueDisplayStore.ts";
import {QueryFilter} from "@dataramen/sql-builder";
import toast from "react-hot-toast";
import {TRunQueryResult} from "../../../data/types/queryRunner.ts";

type TCellEvent = {
  col: number;
  row: number;
  action: 'copy' | 'show' | 'filter';
};
function getEventData(e: MouseEvent<HTMLTableElement>): TCellEvent | undefined {
  const dataset = (e.target as HTMLElement)?.dataset;
  if (dataset) {
    if (dataset.copyCol && dataset.copyRow) {
      return {
        col: parseInt(dataset.copyCol),
        row: parseInt(dataset.copyRow),
        action: 'copy'
      };
    }

    if (dataset.showCol && dataset.showRow) {
      return {
        col: parseInt(dataset.showCol),
        row: parseInt(dataset.showRow),
        action: 'show'
      };
    }

    if (dataset.filterCol && dataset.filterRow) {
      return {
        col: parseInt(dataset.filterCol),
        row: parseInt(dataset.filterRow),
        action: 'filter'
      }
    }
  }

  return undefined;
}

function getValueAndColumn (result: TRunQueryResult | undefined, row: number, col: number) {
  const value = result?.rows?.[row]?.[col];
  const column = result?.columns?.[col];

  return {
    value,
    column,
  };
}

export const useCellActions = () => {
  const { data: result } = useContext(QueryResultContext);
  const { getColumnType } = useContext(TableContext);
  const { setState } = useContext(TableOptionsContext);

  const copyValue = (event: TCellEvent) => {
    const { value, column } = getValueAndColumn(result, event.row, event.col);

    if (column) {
      const sanitized = sanitizeCellValue(
        value,
        getColumnType(column.full),
      );
      navigator.clipboard.writeText(sanitized);
      toast.success("Copied!");
    }
  };

  const showValue = (event: TCellEvent) => {
    const { value, column } = getValueAndColumn(result, event.row, event.col);

    if (column) {
      const sanitized = sanitizeCellValue(
        value,
        getColumnType(column.full),
      );
      displayValue(sanitized);
    }
  };

  const filterValue = (event: TCellEvent) => {
    const { value, column } = getValueAndColumn(result, event.row, event.col);
    let actualValue = column?.full || "";
    let fn: string | undefined = undefined;

    if (column?.table === "") {
      toast.error("Filtering on aggregated column is not supported yet");
      return;
    }

    if (actualValue) {
      let filter: QueryFilter;
      if (value === undefined || value === null) {
        filter = {
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
    }
  };

  const clickHandler: MouseEventHandler<HTMLTableElement> = (e) => {
    const eventData = getEventData(e);
    if (eventData) {
      if (eventData.action === 'copy') {
        copyValue(eventData);
      } else if (eventData.action === 'show') {
        showValue(eventData);
      } else if (eventData.action === 'filter') {
        filterValue(eventData);
      }
    }
  };

  return clickHandler;
};
