import {ChangeEvent, useCallback, useRef, useState} from "react";

export type SetArgFn<ArgsT> = <K extends keyof ArgsT>(key: K, value: ArgsT[K], touch?: boolean) => void;
export type ChangeFn<ArgsT> = (prop: keyof ArgsT) => (e: ChangeEvent<any>) => void;

export const useForm = <ArgsT extends NonNullable<unknown>>(defaultArgs: ArgsT): [ArgsT, { touched: string[]; change: ChangeFn<ArgsT>; set: SetArgFn<ArgsT>; reset: VoidFunction; untouch: VoidFunction; }] => {
  const [args, setArgs] = useState<ArgsT>(defaultArgs);
  const [touched, setTouched] = useState<string[]>([]);

  const resetArgs = useRef(defaultArgs);

  const set: SetArgFn<ArgsT> = useCallback((key, value, touch: boolean = false) => {
    setArgs((args) => ({
      ...args,
      [key]: value,
    }));

    if (touch) {
      setTouched((touched) => {
        if (!touched.includes(key as string)) {
          return [...touched, key as string];
        }
        return touched;
      });
    }
  }, []);

  const change = useCallback(
    (prop: keyof ArgsT) => (e: ChangeEvent<any>) => {
      // check if checkbox
      if (e.target.type === "checkbox") {
        set(prop, e.target.checked, true);
      } else {
        set(prop, e.target.value, true);
      }
    },
    [set]
  );

  const reset = useCallback(() => {
    setArgs(resetArgs.current);
    setTouched([]);
  }, []);

  const untouch = useCallback(() => {
    setTouched([]);
  }, []);

  return [args, {
    set,
    change,
    reset,
    touched,
    untouch,
  }];
};
