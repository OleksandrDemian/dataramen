import st from "./styles.module.css";
import React, {ChangeEventHandler, KeyboardEventHandler} from "react";
import clsx from "clsx";
import FlashIcon from "../../assets/flash-outline.svg?react";
import CodeIcon from "../../assets/code-working-outline.svg?react";
import AutomaticIcon from "../../assets/cube-outline.svg?react";
import {TQueryExpressionMode} from "@dataramen/types";

const nextMode = (mode: TQueryExpressionMode, modes: TQueryExpressionMode[]): TQueryExpressionMode => {
  const currentModeIndex = modes.indexOf(mode);
  if (currentModeIndex >= modes.length) {
    return modes[0];
  }

  return modes[currentModeIndex + 1];
};

const prevMode = (mode: TQueryExpressionMode, modes: TQueryExpressionMode[]): TQueryExpressionMode => {
  const currentModeIndex = modes.indexOf(mode);
  if (currentModeIndex <= 0) {
    return modes[modes.length - 1];
  }

  return modes[currentModeIndex -1];
};

export type TQueryExpressionValue = {
  mode: TQueryExpressionMode;
  value: string;
};

export type TQueryExpressionInputProps = {
  inputClass?: string;
  mode?: TQueryExpressionMode;
  onChange?: never;
  onExpressionChange: (props: TQueryExpressionValue) => void;
  allowedModes: TQueryExpressionMode[];
  prefix?: string;
} & React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

const Icon = ({ mode, onNextMode }: { mode: TQueryExpressionMode; onNextMode: VoidFunction }) => {
  return (
    <span
      tabIndex={-1}
      className="pr-2 cursor-pointer text-(--text-color-primary)"
      onClick={onNextMode}
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
    </span>
  )
};

export const QueryExpressionInput = ({ prefix, mode = "default", allowedModes, className, inputClass, onExpressionChange, ...props }: TQueryExpressionInputProps) => {
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
        mode: e.key === "ArrowUp" ? nextMode(mode, allowedModes) : prevMode(mode, allowedModes),
        value: props.value as string,
      });
    } else {
      props.onKeyDown?.(e);
    }
  };

  return (
    <label className={clsx(st.root, className)} data-input-mode={mode}>
      {mode === "raw" && !!prefix && <span className="inline-block pl-1">{prefix}</span>}
      <input
        {...props}
        onKeyDown={onKeyDown}
        onChange={onChange}
        className={clsx(st.input, inputClass)}
      />

      <Icon
        mode={mode}
        onNextMode={() => onExpressionChange({
          mode: nextMode(mode, allowedModes),
          value: props.value as string,
        })}
      />
    </label>
  );
};
