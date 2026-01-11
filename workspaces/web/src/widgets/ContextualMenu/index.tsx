import {PropsWithChildren, Ref, useImperativeHandle, useState, MouseEvent, useRef} from "react";
import st from "./index.module.css";
import {isLaptop} from "../../utils/screen.ts";
import clsx from "clsx";
import {createPortal} from "react-dom";

export type TContextMenuRef = {
  open: (e: MouseEvent, propagate?: boolean) => void;
  close: () => void;
};

export type TContextualMenuProps = PropsWithChildren<{
  ref?: Ref<TContextMenuRef>;
  onClosed?: VoidFunction;
}>;

type TPos = {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
};

export const ContextualMenu = ({ children, ref, onClosed }: TContextualMenuProps) => {
  const [position, setPosition] = useState<TPos | undefined>(undefined);
  const [state, setState] = useState<"hidden" | "visible" | "in" | "out">("hidden");
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    open: (e, propagate: boolean = true) => {
      if (!propagate) {
        e.preventDefault();
        e.stopPropagation();
      }

      const tempPos: TPos = {};
      const isLowerHalf = e.clientY > window.innerHeight / 2;
      const isRightSide = e.clientX > window.innerWidth / 2;

      if (isLowerHalf) {
        tempPos.bottom = window.innerHeight - e.clientY;
      } else {
        tempPos.top = e.clientY;
      }

      if (isLaptop()) {
        if (isRightSide) {
          tempPos.right = window.innerWidth - e.clientX;
        } else {
          tempPos.left = e.clientX;
        }
      } else {
        tempPos.right = 36;
        tempPos.left = 36;
      }

      setPosition(tempPos);
      setState("in");
    },
    close: () => {
      setState("out");
    },
  }), []);

  if (!position) {
    return null;
  }

  const onAnimationEnd = () => {
    if (state === "in") {
      setState("visible");
    } else if (state === "out") {
      setPosition(undefined);
      setState("hidden");
      onClosed?.();
    }
  };

  const render = (
    <div
      className={clsx(st.container, state === "out" && st.animateHide, state === "in" && st.animateShow)}
      onAnimationEnd={onAnimationEnd}
    >
      <div
        className={st.backdrop}
        onClick={() => setState("out")}
      />

      <div
        ref={containerRef}
        style={position}
        className={clsx(st.content, state === "out" && st.animateHide, state === "in" && st.animateShow)}
      >
        {children}
      </div>
    </div>
  );
  return createPortal(render, document.body);
};
