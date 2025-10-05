import {ReactNode, TransitionEventHandler, useEffect, useRef, useState} from "react";
import st from "./styles.module.css";
import clsx from "clsx";

export type TSidebarProps = {
  children: ReactNode;
  backdropClose?: boolean;
  isVisible: boolean;
  onClose: () => void;
  onClosed?: () => void;
  contentClassName?: string;
};
export const Sidebar = ({children, backdropClose, isVisible, onClose, onClosed, contentClassName}: TSidebarProps) => {
  const [renderComponent, setRenderComponent] = useState(false);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  const _onClose = () => {
    if (backdropClose) {
      onClose();
    }
  };

  const onTransitionEnd: TransitionEventHandler<HTMLDivElement> = (e) => {
    if (!isVisible) {
      const style = getComputedStyle(e.currentTarget);
      if (style.opacity === "0") {
        setRenderComponent(false);
        if (onClosed) {
          onClosed();
        }
      }
    }
  };

  useEffect(() => {
    if (isVisible) {
      setRenderComponent(true);
    }
  }, [isVisible]);

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (isVisible && e.key === "Escape") {
        closeRef.current();
      }
    }

    window.addEventListener("keydown", listener);
    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, [isVisible]);

  return (
    <div onTransitionEnd={onTransitionEnd} className={clsx(st.sidebar, isVisible ? st.sidebarVisible : st.sidebarInvisible)}>
      <div onClick={_onClose} className={st.backdrop}></div>
      <div className={clsx(st.sidebarContainer, contentClassName)}>
        {renderComponent && children}
      </div>
    </div>
  );
};