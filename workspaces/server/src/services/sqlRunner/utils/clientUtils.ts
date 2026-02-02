import {FilterParser, isStringType} from "@dataramen/common";
import {
  IInspectionColumnRef,
  TInputColumn,
  TQueryFilter,
  TQueryOperator,
  TQueryOptions,
  TResultColumn
} from "@dataramen/types";
import {HttpError} from "../../../utils/httpError";
import {ISelectColumn, IWhere} from "../builders/types";
import {TGetColumnType} from "./schemaInfoHandler";

export const getDefaultOperator = (type: string): TQueryOperator => {
  return isStringType(type) ? 'CONTAINS' : '=';
}

export const transformClientFilters = (filters: TQueryFilter[], getColumnType: TGetColumnType): IWhere[] => {
  const parsedFilters: IWhere[] = [];
  for (const f of filters) {
    if (!f.column?.length || !f.value?.length || f.isEnabled === false) continue;

    if (f.isAdvanced) {
      const parsed = FilterParser.parse(f.value);
      if (!parsed) {
        throw new HttpError(400, `Invalid value for '${f.column}': ${f.value}`);
      }

      parsedFilters.push({
        value: parsed.value,
        column: f.column,
        operator: parsed.operator || getDefaultOperator(getColumnType(f.column)),
        fn: f.fn,
      });
    } else {
      parsedFilters.push({
        value: f.value ? [{ value: f.value }] : [],
        column: f.column,
        operator: getDefaultOperator(getColumnType(f.column)),
        fn: f.fn,
      });
    }
  }

  return parsedFilters;
};

export const extractTables = (props: TQueryOptions): string[] => {
  const tables: string[] = [props.table];
  if (props.joins) {
    props.joins.forEach(({ table }) => tables.push(table));
  }

  return tables;
};

const convertInputColumnToColumn = (column: TInputColumn): ISelectColumn => {
  return {
    column: column.value,
    fn: column.fn,
    distinct: column.distinct,
  };
};

export const computeColumns = (cols: TInputColumn[], groupBy: TInputColumn[], agg: TInputColumn[]): ISelectColumn[] => {
  const result: ISelectColumn[] = [];
  if (groupBy.length > 0 || agg.length > 0) {
    result.push(
      ...groupBy.map(convertInputColumnToColumn),
      ...agg.map(convertInputColumnToColumn),
    );
  } else if (cols.length > 0) {
    result.push(...cols.map(convertInputColumnToColumn));
  }

  return result;
};

export const computeResultColumns = (
  selectedColumns: ISelectColumn[],
  resultColumns: TResultColumn[],
  getType: (column: string) => string,
  getColRef: (table: string, column: string) => IInspectionColumnRef | undefined,
  getColumnReferencedBy: (table: string, column: string) => IInspectionColumnRef[] | undefined,
): TResultColumn[] => {
  return resultColumns.map((c, i) => ({
    ...c,
    full: selectedColumns[i].fn ? selectedColumns[i].column : c.full,
    type: getType(c.full),
    fn: selectedColumns[i].fn,
    ref: c.table ? getColRef(c.table, c.column) : undefined,
    referencedBy: c.table ? getColumnReferencedBy(c.table, c.column) : undefined,
  }));
};
