import {TExecuteInsert, TExecuteQuery, TExecuteUpdate, TQueryMutationValue} from "@dataramen/types";
import {HttpError} from "../../utils/httpError";

export const validateExecuteQueryBody = (body: TExecuteQuery) => {
  // todo validate payload
};

const FORBIDDEN_STRINGS: string[] = ["--", ";", "DROP", "drop"];
const checkInputValue = (value: TQueryMutationValue) => {
  if(typeof value.value === 'string' && value.value.startsWith("=")) {
    let strValue: string = value.value;
    // raw value, check for weirdness
    FORBIDDEN_STRINGS.forEach(str => {
      if (strValue.includes(str)) {
        throw new HttpError(400, "Invalid input value for " + value.column);
      }
    });
  }
};

export const validateInsertQueryBody = (body: TExecuteInsert) => {
  if (!body.table) {
    throw new HttpError(400, "Table is required");
  }

  body.values.forEach(checkInputValue);
};

export const validateUpdateQueryBody = (body: TExecuteUpdate) => {
  if (!body.table) {
    throw new HttpError(400, "Table is required");
  }

  body.values.forEach(checkInputValue);
};
