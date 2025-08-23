import {ChangeEvent, useCallback, useRef, useState} from "react";

export type SetArgFn<ArgsT> = <K extends keyof ArgsT>(key: K, value: ArgsT[K]) => void;
export type ChangeFn<ArgsT> = (prop: keyof ArgsT) => (e: ChangeEvent<any>) => void;

export const useForm = <ArgsT extends NonNullable<unknown>>(defaultArgs: ArgsT): [ArgsT, { touched: string[]; change: ChangeFn<ArgsT>; set: SetArgFn<ArgsT>; reset: VoidFunction }] => {
  const [args, setArgs] = useState<ArgsT>(defaultArgs);
  const [touched, setTouched] = useState<string[]>([]);

  const resetArgs = useRef(defaultArgs);

  const set: SetArgFn<ArgsT> = useCallback((key, value) => {
    setArgs((args) => ({
      ...args,
      [key]: value,
    }));
  }, []);

  const change = useCallback(
    (prop: keyof ArgsT) => (e: ChangeEvent<any>) => {
      // check if checkbox
      if (e.target.type === "checkbox") {
        set(prop, e.target.checked);
      } else {
        set(prop, e.target.value);
      }

      setTouched((touched) => {
        if (!touched.includes(prop as string)) {
          return [...touched, prop as string];
        }
        return touched;
      });
    },
    [set]
  );

  const reset = useCallback(() => {
    setArgs(resetArgs.current);
    setTouched([]);
  }, []);

  return [args, {
    set,
    change,
    reset,
    touched,
  }];
};
