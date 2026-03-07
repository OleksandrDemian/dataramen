import {TExecuteInsert, TExecuteQuery, TExecuteUpdate, TQueryExpressionInput} from "@dataramen/types";
import {HttpError} from "../../utils/httpError";

export const validateExecuteQueryBody = (body: TExecuteQuery) => {
  // todo validate payload
};

const FORBIDDEN_STRINGS: string[] = ["--", ";", "DROP", "drop"];
const checkInputValue = ([column, input]: [string, TQueryExpressionInput]) => {
  if(input.mode !== "default") {
    // raw value, check for weirdness
    FORBIDDEN_STRINGS.forEach(str => {
      if (input.value.includes(str)) {
        throw new HttpError(400, "Invalid input value for " + column);
      }
    });
  }
};

export const validateInsertQueryBody = (body: TExecuteInsert) => {
  if (!body.table) {
    throw new HttpError(400, "Table is required");
  }

  Object.entries(body.values).forEach(checkInputValue);
};

export const validateUpdateQueryBody = (body: TExecuteUpdate) => {
  if (!body.table) {
    throw new HttpError(400, "Table is required");
  }

  Object.entries(body.values).forEach(checkInputValue);
};
