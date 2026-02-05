import {IHook} from "@dataramen/types";

export const createOnStatement = (hook: IHook) => {
  return `${hook.fromTable}.${hook.fromColumn} = ${hook.toTable}.${hook.toColumn}`;
};
