import {useEffect, useRef} from "react";

type UseResizableProps = {
  resizeDirection?: "vertical-t" | "horizontal-r" | "vertical-b" | "horizontal-l";
  onSizeChange?: (ref: HTMLElement) => void;
}

export const useResizable = <TElement extends HTMLElement, THandler extends HTMLElement> ({ resizeDirection, onSizeChange }: UseResizableProps) => {
  const elementRef = useRef<TElement>(null);
  const handleRef = useRef<THandler>(null);

  useEffect(() => {
    function handleMouseDown(mouseDownEvent: MouseEvent) {
      const startDimensions = elementRef.current!.getBoundingClientRect();
      const startPosition = {
        x: mouseDownEvent.pageX,
        y: mouseDownEvent.pageY,
      };

      function onMouseMove(mouseMoveEvent: MouseEvent) {
        if (resizeDirection === "horizontal-r" || resizeDirection === "horizontal-l") {
          let deltaX: number;
          if (resizeDirection === "horizontal-l") {
            deltaX = startPosition.x - mouseMoveEvent.pageX;
          } else {
            deltaX = mouseMoveEvent.pageX - startPosition.x;
          }

          elementRef.current!.style.width = `${startDimensions.width + deltaX}px`;
        } else {
          let deltaY = mouseMoveEvent.pageY - startPosition.y;
          if (resizeDirection === "vertical-b") {
            deltaY = -deltaY;
          }
          elementRef.current!.style.height = `${startDimensions.height + deltaY}px`;
        }

        if (onSizeChange && elementRef.current) {
          onSizeChange(elementRef.current);
        }
      }

      function onMouseUp() {
        document.body.removeEventListener("mousemove", onMouseMove);
        document.body.removeEventListener("mouseleave", onMouseMove);
      }

      document.body.addEventListener("mousemove", onMouseMove);
      document.body.addEventListener("mouseup", onMouseUp);
      document.body.addEventListener("mouseleave", onMouseUp);
    }

    handleRef?.current?.addEventListener("mousedown", handleMouseDown);
    if (onSizeChange && elementRef.current) {
      onSizeChange(elementRef.current);
    }
  });

  return {
    elementRef,
    handleRef,
  };
}
