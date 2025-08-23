import {useCallback, useRef} from "react";
import {isHtmlElement} from "../../../utils/htmlElements.ts";

export const useFocus = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const focus = useCallback((target: string, delay: number = 30) => {
    setTimeout(() => {
      const el = containerRef.current?.querySelector(`[data-focus="${target}"]`);
      if (isHtmlElement(el)) {
        el.focus();
      }
    }, delay);
  }, []);

  return {
    containerRef,
    focus,
  };
};
