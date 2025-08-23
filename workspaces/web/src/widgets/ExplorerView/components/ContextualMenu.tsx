import {ReactNode, useEffect, useMemo, useRef} from "react";
import st from "./ContextualMenu.module.css";
import {TContextMenuHandler} from "./ContextualMenu.handler.ts";

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

      if (isRightSide) {
        position.right = window.innerWidth - handler.position.x;
      } else {
        position.left = handler.position.x;
      }
    }

    return position;
  }, [handler]);

  useEffect(() => {
    const onClose = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        closeRef.current();
      }
    }

    window.addEventListener("keyup", onClose);
    return () => {
      window.removeEventListener("keyup", onClose);
    };
  }, []);

  if (!posStyle) {
    return null;
  }

  return (
    <div className={st.container}>
      <div
        className={st.backdrop}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          handler.close();
        }}
      />

      <div
        className={st.content}
        style={posStyle}
      >
        {children}
      </div>
    </div>
  );
};