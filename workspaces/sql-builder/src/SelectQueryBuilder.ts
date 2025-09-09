import {
  DatabaseDialect,
  JoinClause,
  OrderByClause,
  SelectQuerySkeleton,
  QueryFilter,
} from "./types";
import {buildSelect, buildQueryFilterCondition} from "./utils";

export class SelectQueryBuilder {
  private skeleton: SelectQuerySkeleton;
  private dialect: DatabaseDialect;

  constructor(dialect: DatabaseDialect = 'mysql') {
    this.dialect = dialect;
    this.skeleton = {
      type: "SELECT",
    };
  }

  addWhere(condition: QueryFilter): SelectQueryBuilder {
    const conditionStr = buildQueryFilterCondition(condition, this.dialect);

    if (condition.isEnabled !== false) { // consider undefined as true
      if (this.skeleton.where) {
        const connector = condition.connector || 'AND';
        this.skeleton.where += ` ${connector} ${conditionStr}`;
      } else {
        this.skeleton.where = conditionStr;
      }
    }

    return this;
  }

  addWhereRaw(condition: string, connector: 'AND' | 'OR' = 'AND'): SelectQueryBuilder {
    if (this.skeleton.where) {
      this.skeleton.where += ` ${connector} ${condition}`;
    } else {
      this.skeleton.where = condition;
    }

    return this;
  }

  clearWhere(): SelectQueryBuilder {
    this.skeleton.where = undefined;
    return this;
  }

  addHaving(condition: QueryFilter): SelectQueryBuilder {
    const conditionStr = buildQueryFilterCondition(condition, this.dialect);

    if (condition.isEnabled !== false) { // consider undefined as true
      if (this.skeleton.having) {
        const connector = condition.connector || 'AND';
        this.skeleton.having += ` ${connector} ${conditionStr}`;
      } else {
        this.skeleton.having = conditionStr;
      }
    }

    return this;
  }

  clearHaving(): SelectQueryBuilder {
    this.skeleton.having = undefined;
    return this;
  }

  addOrderBy(...orderBy: OrderByClause[]): SelectQueryBuilder {
    if (!this.skeleton.orderBy) {
      this.skeleton.orderBy = [];
    }

    this.skeleton.orderBy.push(...orderBy);
    return this;
  }

  clearOrderBy(): SelectQueryBuilder {
    this.skeleton.orderBy = undefined;
    return this;
  }

  setLimit(limit: number): SelectQueryBuilder {
    this.skeleton.limit = limit;
    return this;
  }

  setOffset(offset: number): SelectQueryBuilder {
    this.skeleton.offset = offset;
    return this;
  }

  addGroupBy(column: string): SelectQueryBuilder {
    if (!this.skeleton.groupBy) {
      this.skeleton.groupBy = [];
    }

    const existing = this.skeleton.groupBy.findIndex(groupBy => groupBy === column);
    if (existing > -1) {
      this.skeleton.groupBy[existing] = column;
    } else {
      this.skeleton.groupBy.push(column);
    }

    return this;
  }

  setTable(table: string): SelectQueryBuilder {
    this.skeleton.table = table;
    return this;
  }

  addJoin(...joins: JoinClause[]): SelectQueryBuilder {
    if (!this.skeleton.joins) {
      this.skeleton.joins = [];
    }

    this.skeleton.joins.push(...joins);
    return this;
  }

  selectColumns(columns: string[]): SelectQueryBuilder {
    if (this.skeleton.type !== 'SELECT') {
      throw new Error('Column selection is only supported for SELECT queries');
    }

    this.skeleton.columns = columns;
    return this;
  }

  // Build final SQL with parameter substitution
  toSQL(): string {
    return buildSelect(this.skeleton);
  }
}
