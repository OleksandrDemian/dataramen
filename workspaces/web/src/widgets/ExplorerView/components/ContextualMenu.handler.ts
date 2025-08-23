import {MouseEventHandler, useMemo, useState} from "react";

export const useContextMenuHandler = () => {
  const [position, setPosition] = useState<{ x: number; y: number; } | undefined>();

  return useMemo(() => {
    const open: MouseEventHandler<unknown> = (e) => {
      e.preventDefault();
      setPosition({
        x: e.clientX - 1,
        y: e.clientY - 1,
      });
    };

    return {
      show: !!position,
      position,
      open,
      close: () => {
        setPosition(undefined)
      },
    }
  }, [position]);
};

export type TContextMenuHandler = ReturnType<typeof useContextMenuHandler>;
