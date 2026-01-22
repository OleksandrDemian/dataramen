import {useEffect, useRef} from "react";

type TStackEntry = { listener: VoidFunction; id: symbol };

let modals: TStackEntry[] = [];

const addToStack = (listener: VoidFunction) => {
  const id = Symbol();
  modals.push({ id, listener });
  return () => {
    modals = modals.filter((m) => m.id !== id);
  };
};

window.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;

  const last = modals.pop();
  if (!last) return;

  // Prevent downstream handlers from also acting on Escape
  e.preventDefault();
  e.stopPropagation();

  last.listener();
});

export type TUseModalStackProps = {
  onClose: VoidFunction;
  enabled: boolean;
};
export const useModalStack = (props: TUseModalStackProps) => {
  const closeRef = useRef(props.onClose);
  closeRef.current = props.onClose;

  useEffect(() => {
    if (!props.enabled) return;

    return addToStack(() => {
      closeRef.current();
    });
  }, [props.enabled]);
};
