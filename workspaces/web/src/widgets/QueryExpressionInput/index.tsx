import st from "./styles.module.css";
import React, {ChangeEventHandler, KeyboardEventHandler} from "react";
import clsx from "clsx";
import FlashIcon from "../../assets/flash-outline.svg?react";
import CodeIcon from "../../assets/code-working-outline.svg?react";
import AutomaticIcon from "../../assets/cube-outline.svg?react";
import {TQueryExpressionMode} from "@dataramen/types";

const nextMode = (mode: TQueryExpressionMode): TQueryExpressionMode => {
  switch (mode) {
    case "default": return "raw";
    // case "advanced": return "raw";
    case "raw": return "default";
    default: return "default";
  }
};

const prevMode = (mode: TQueryExpressionMode): TQueryExpressionMode => {
  switch (mode) {
    case "default": return "raw";
    // case "advanced": return "raw";
    case "raw": return "default";
    default: return "default";
  }
};

export type TQueryExpressionInputProps = {
  inputClass?: string;
  mode?: TQueryExpressionMode;
  onChange?: never;
  onExpressionChange: (props: { mode: TQueryExpressionMode; value: string; }) => void;
} & React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

const Icon = ({ mode, onMode }: { mode: TQueryExpressionMode; onMode: (mode: TQueryExpressionMode) => void }) => {
  return (
    <button
      tabIndex={-1}
      className="pr-2 cursor-pointer text-(--text-color-primary)"
      onClick={() => onMode(nextMode(mode))}
      data-mode={mode}
      data-tooltip-id="default"
      data-tooltip-content={`Current mode: ${mode}. Use up/down arrows to change input mode.`}
    >
      {mode === "advanced" && (
        <FlashIcon className="pointer-events-none" width={20} height={20} />
      )}
      {mode === "raw" && (
        <CodeIcon className="pointer-events-none" width={20} height={20} />
      )}
      {mode === "default" && (
        <AutomaticIcon className="pointer-events-none" width={20} height={20} />
      )}
    </button>
  )
};

export const QueryExpressionInput = ({ mode = "default", className, inputClass, onExpressionChange, ...props }: TQueryExpressionInputProps) => {
  const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    onExpressionChange({
      mode,
      value: e.currentTarget.value,
    });
  };

  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      e.stopPropagation();
      onExpressionChange({
        mode: e.key === "ArrowUp" ? nextMode(mode) : prevMode(mode),
        value: props.value as string,
      });
    } else {
      props.onKeyDown?.(e);
    }
  };

  return (
    <div className={clsx(st.root, className)} data-input-mode={mode}>
      {mode === "raw" && <span className="inline-block pl-1">=</span>}
      <input
        {...props}
        onKeyDown={onKeyDown}
        onChange={onChange}
        className={clsx(st.input, inputClass)}
      />

      <Icon
        mode={mode}
        onMode={(newMode) => onExpressionChange({
          mode: newMode,
          value: props.value as string,
        })}
      />
    </div>
  );
};
