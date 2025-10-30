import {MouseEventHandler, useMemo, useState} from "react";

export const ContextualMenuInternals = {
  ON_ANIMATION_END: Symbol("ON_TRANSITION_END"),
};

export const useContextMenuHandler = () => {
  const [position, setPosition] = useState<{ x: number; y: number; } | undefined>();
  const [state, setState] = useState<"hidden" | "visible" | "in" | "out">("hidden");

  return useMemo(() => {
    const open: MouseEventHandler<unknown> = (e) => {
      e.preventDefault();
      setState("in");
      setPosition({
        x: e.clientX - 1,
        y: e.clientY - 1,
      });
    };

    const close = () => {
      setState("out");
    };

    const onAnimationEnd = (e: any) => {
      console.log("onAnimationEnd", e);
      if (state === "in") {
        setState("visible");
      } else if (state === "out") {
        setPosition(undefined);
        setState("hidden");
      }
    };

    return {
      show: !!position,
      position,
      state,
      open,
      close,
      [ContextualMenuInternals.ON_ANIMATION_END]: onAnimationEnd,
    }
  }, [position, state]);
};

export type TContextMenuHandler = ReturnType<typeof useContextMenuHandler>;
