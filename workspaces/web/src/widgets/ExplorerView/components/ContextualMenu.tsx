import {ReactNode, useMemo, useRef} from "react";
import st from "./ContextualMenu.module.css";
import {ContextualMenuInternals, TContextMenuHandler} from "./ContextualMenu.handler.ts";
import {isLaptop} from "../../../utils/screen.ts";
import clsx from "clsx";
import {useModalStack} from "../../../hooks/useModalStack.ts";
import {createPortal} from "react-dom";

type TPos = {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

export const ContextualMenu = ({ children, handler }: { children: ReactNode, handler: TContextMenuHandler }) => {
  const closeRef = useRef(handler.close);
  closeRef.current = handler.close;

  const posStyle = useMemo<TPos | undefined>(() => {
    if (!handler.position) {
      return undefined;
    }

    const position: TPos = {};

    if (typeof window !== 'undefined') {
      const isLowerHalf = handler.position.y > window.innerHeight / 2;
      const isRightSide = handler.position.x > window.innerWidth / 2;

      if (isLowerHalf) {
        position.bottom = window.innerHeight - handler.position.y;
      } else {
        position.top = handler.position.y;
      }

      if (isLaptop()) {
        if (isRightSide) {
          position.right = window.innerWidth - handler.position.x;
        } else {
          position.left = handler.position.x;
        }
      } else {
        position.right = 36;
        position.left = 36;
      }
    }

    return position;
  }, [handler.position]);

  useModalStack({
    enabled: !!posStyle,
    onClose: handler.close,
  });

  if (!posStyle) {
    return null;
  }

  const render = (
    <div className={clsx(st.container, handler.state === "out" && st.animateHide, handler.state === "in" && st.animateShow)} onAnimationEnd={handler[ContextualMenuInternals.ON_ANIMATION_END]}>
      <div
        className={st.backdrop}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          handler.close();
        }}
      />

      <div
        className={clsx(st.content, handler.state === "out" && st.animateHide, handler.state === "in" && st.animateShow)}
        style={posStyle}
      >
        {children}
      </div>
    </div>
  );

  return createPortal(render, document.body);
};