import React, {useEffect, useMemo, useRef, useState} from "react";
import st from "./index.module.css";
import {
  STRING_TYPES,
  STRING_OPERATORS,
  NUMERIC_TYPES,
  NUMBER_OPERATORS,
  DATE_TYPES,
  DATE_OPERATORS,
  OPERATORS
} from "@dataramen/common";

function getOperators (col: string) {
  if (STRING_TYPES.includes(col)) {
    return STRING_OPERATORS;
  }
  if (NUMERIC_TYPES.includes(col)) {
    return NUMBER_OPERATORS;
  }
  if (DATE_TYPES.includes(col)) {
    return DATE_OPERATORS;
  }
  return OPERATORS;
}

export type TOperatorAutocompleteProps = {
  onChange: (value: string, submit: boolean) => void;
  value: string;
  colType?: string;
  autoFocus?: boolean;
  focusId?: string;
}
export const OperatorAutocomplete = ({ value, onChange, autoFocus, focusId, colType }: TOperatorAutocompleteProps) => {
  const availableOperators = useMemo(() => {
    const src = value.toLowerCase() || "";
    return getOperators(colType || '').filter((op) => op.label.includes(src));
  }, [value, colType]);

  const containerRef = useRef<HTMLUListElement>(null);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => (i + 1) % availableOperators.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => (i - 1 + availableOperators.length) % availableOperators.length);
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < availableOperators.length) {
        e.preventDefault();
        setShowAutocomplete(false);
        onChange(availableOperators[activeIndex]?.label || "", true);
      } else {
        onChange(value, true);
      }
    }
  };

  useEffect(() => {
    const activeChild = containerRef.current?.querySelector(`[data-is-active="true"]`);
    if (activeChild) {
      activeChild.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [activeIndex]);

  return (
    <div className="relative">
      <input
        onKeyDown={handleKeyDown}
        value={value}
        onChange={(e) => onChange(e.target.value, false)}
        className="input w-full"
        placeholder="Operator"
        autoFocus={autoFocus}
        onFocus={() => setShowAutocomplete(true)}
        onBlur={() => setShowAutocomplete(false)}
        data-focus={focusId}
      />

      {showAutocomplete && availableOperators.length > 0 && (
        <ul className={st.dropContainer} ref={containerRef} tabIndex={-1}>
          {availableOperators.map((op, i) => (
            <li
              className={st.item}
              data-is-active={activeIndex === i}
              key={i}
              onMouseDownCapture={(e) => {
                e.preventDefault(); // Prevent blur
                setShowAutocomplete(false);
                onChange(op.label, true);
              }}
            >
              {op.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
