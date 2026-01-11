// todo: better name

export interface IValuesHandler <TKeys extends string>{
  str(name: TKeys, fallback: string): string;
  str(name: TKeys): string | undefined;

  num(name: TKeys, fallback: number): number;
  num(name: TKeys): number | undefined;

  bool(name: TKeys): boolean;
}

export const createValuesHandler = <TKeys extends string>(data: Record<TKeys, string | undefined>): IValuesHandler<TKeys> => {
  function getString(name: TKeys, fallback: string | undefined = undefined): string | undefined {
    return data[name] || fallback;
  }

  function getNumber (name: TKeys, fallback: number | undefined = undefined): number | undefined {
    const value = data[name];
    if (!value) {
      return fallback;
    }

    const num = Number(value);
    if (!isNaN(num) && value.trim() !== '') {
      return num;
    }

    return fallback;
  }

  function getBoolean(name: TKeys): boolean {
    return data[name] === "true" || data[name] === "TRUE" || data[name] === "1";
  }

  return {
    str: getString,
    num: getNumber,
    bool: getBoolean,
  } as IValuesHandler<TKeys>;
};
