import {FilterParser, isStringType} from "@dataramen/common";
import {
  IDatabaseColumnSchema,
  IInspectionColumnRef,
  TInputColumn,
  TQueryFilter,
  TQueryOperator,
  TQueryOptions,
  TResultColumn
} from "@dataramen/types";
import {HttpError} from "../../../utils/httpError";
import {ISelectColumn, IWhere} from "../builders/types";
import {TGetColumnByName} from "./schemaInfoHandler";

export const getDefaultOperator = (type?: string): TQueryOperator => {
  return (type && isStringType(type)) ? 'CONTAINS' : '=';
}

export const transformClientFilters = (filters: TQueryFilter[], getColumnByName: TGetColumnByName): IWhere[] => {
  const parsedFilters: IWhere[] = [];
  for (const f of filters) {
    if (!f.column?.length || !f.value?.length || f.isEnabled === false) continue;

    const [table, column] = f.column.split('.');
    const schema = getColumnByName(table, column);

    if (f.isAdvanced) {
      const parsed = FilterParser.parse(f.value);
      if (!parsed) {
        throw new HttpError(400, `Invalid value for '${f.column}': ${f.value}`);
      }

      parsedFilters.push({
        value: parsed.value,
        column: f.column,
        operator: parsed.operator || getDefaultOperator(schema?.type),
        fn: f.fn,
      });
    } else {
      parsedFilters.push({
        value: f.value ? [{ value: f.value }] : [],
        column: f.column,
        operator: getDefaultOperator(schema?.type),
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

const getRef = (col: IDatabaseColumnSchema): IInspectionColumnRef | undefined => {
  if (col.isPrimary && col.table?.name) {
    return {
      table: col.table.name,
      field: col.name,
    };
  }

  return col?.meta?.refs;
};

const getReferencedBy = (col: IDatabaseColumnSchema): IInspectionColumnRef[] | undefined => {
  return col?.meta?.referencedBy;
};

export const computeResultColumns = (
  selectedColumns: ISelectColumn[],
  resultColumns: TResultColumn[],
  getColumnSchema: (table: string, column: string) => IDatabaseColumnSchema | undefined,
): TResultColumn[] => {
  return resultColumns.map((c, i) => {
    const columnSchema = c.table ? getColumnSchema(c.table, c.column) : undefined;
    const ref = columnSchema ? getRef(columnSchema) : undefined;
    const referencedBy = columnSchema ? getReferencedBy(columnSchema) : undefined;

    return {
      ...c,
      full: selectedColumns[i].fn ? selectedColumns[i].column : c.full,
      type: columnSchema?.type,
      fn: selectedColumns[i].fn,
      ref,
      referencedBy,
    };
  });
};
