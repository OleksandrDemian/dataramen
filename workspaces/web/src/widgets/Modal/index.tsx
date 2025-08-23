import {ReactNode, TransitionEventHandler, useEffect, useRef, useState} from "react";
import st from "./styles.module.css";
import clsx from "clsx";
import CloseIcon from "../../assets/close-outline.svg?react";
import {createPortal} from "react-dom";

export type TModalProps = {
  children: ReactNode;
  backdropClose?: boolean;
  isVisible: boolean;
  onClose: () => void;
  onClosed?: () => void;
  noPadding?: boolean;
  portal?: boolean;
};
export const Modal = ({children, backdropClose, isVisible, onClose, onClosed, noPadding = false, portal = false}: TModalProps) => {
  const [renderComponent, setRenderComponent] = useState(false);

  const _onClose = () => {
    if (backdropClose) {
      onClose();
    }
  }
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

  const r = (
    <div onTransitionEnd={onTransitionEnd} className={clsx(st.modal, isVisible ? st.modalVisible : st.modalInvisible)}>
      <div onClick={_onClose} className={st.backdrop}></div>
      <div className={clsx(st.modalContainer, noPadding !== true && 'p-4')}>
        {renderComponent && children}
      </div>
    </div>
  );

  return portal ? createPortal(r, document.body) : r;
};

export const ModalClose = ({ onClick }: { onClick: VoidFunction }) => {
  const closeRef = useRef(onClick);
  closeRef.current = onClick;

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeRef.current?.();
      }
    };

    window.addEventListener("keyup", listener);
    return () => {
      window.removeEventListener("keyup", listener);
    }
  }, []);

  return (
    <button className={st.closeButton} onClick={onClick}>
      <CloseIcon width={20} height={20} />
    </button>
  );
};

export const ModalTitle = ({ children }: { children: ReactNode }) => {
  return <h2 className="text-xl font-semibold">{children}</h2>;
};
