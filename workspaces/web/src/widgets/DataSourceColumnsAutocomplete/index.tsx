import React, {ChangeEventHandler, useEffect, useMemo, useRef, useState} from "react";
import clsx from "clsx";
import {useDatabaseInspections} from "../../data/queries/dataSources.ts";
import st from "./index.module.css";

type TSearchColumn = {
  label: string;
  table: string;
  searchValue: string;
  value: string;
};

export type TDataSourceColumnsAutocompleteProps = {
  dataSourceId: string;
  onChange: (value: string, matched: boolean, submit: boolean) => void;
  value: string;
  autoFocus?: boolean;
  allowTables?: string[];
  placeholder?: string;
  focusId?: string;
};
export const DataSourceColumnsAutocomplete = ({ dataSourceId, focusId, placeholder = "Column", onChange, value, autoFocus, allowTables }: TDataSourceColumnsAutocompleteProps) => {
  const { data: inspections } = useDatabaseInspections(dataSourceId);
  const containerRef = useRef<HTMLDivElement>(null);
  const allColumns = useMemo<TSearchColumn[]>(() => {
    if (!inspections) {
      return [];
    }

    let t = inspections;
    if (allowTables) {
      t = inspections.filter(i => allowTables.includes(i.tableName));
    }

    return t.flatMap(inspection => {
      return inspection.columns.map(column => {
        return {
          value,
          label: column.name,
          table: inspection.tableName,
          searchValue: column.name.toLowerCase(),
        };
      });
    });
  }, [inspections, allowTables]);

  const availableColumns = useMemo(() => {
    const src = value.toLowerCase() || "";
    const columns: TSearchColumn[] = [];

    for (let i = 0; i < allColumns.length && columns.length < 10; i++) {
      if (allColumns[i].searchValue.includes(src)) {
        columns.push(allColumns[i]);
      }
    }

    return columns;
  }, [allColumns, value]);

  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => (i + 1) % availableColumns.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => (i - 1 + availableColumns.length) % availableColumns.length);
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < availableColumns.length) {
        e.preventDefault();
        const value = availableColumns[activeIndex].value;
        setShowAutocomplete(false);
        const isMatched = allColumns.findIndex((c) => c.value === value) > -1;
        onChange(availableColumns[activeIndex]?.value || value, isMatched, true);
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

  const changeHandler: ChangeEventHandler<HTMLInputElement> = (e) => {
    const value = e.currentTarget.value;
    const isMatched = allColumns.findIndex((c) => c.value === value) > -1;
    onChange(value, isMatched, false);
  };

  return (
    <div
      className="relative"
      onFocus={() => setShowAutocomplete(true)}
      onBlur={() => setShowAutocomplete(false)}
    >
      <input
        autoFocus={autoFocus}
        onKeyDown={handleKeyDown}
        value={value}
        onChange={changeHandler}
        className={clsx("input w-full")}
        placeholder={placeholder}
        data-focus={focusId}
      />

      {showAutocomplete && availableColumns.length > 0 && (
        <div className={st.dropContainer} ref={containerRef} tabIndex={-1}>
          {availableColumns.map((table, i) => (
            <div
              className={st.item}
              data-is-active={activeIndex === i}
              key={i}
              onMouseDownCapture={(e) => {
                e.preventDefault(); // Prevent blur
                setShowAutocomplete(false);
                onChange(table.value, true, true);
              }}
            >
              <span className="text-xs font-semibold truncate">{table.table}</span>
              <p className="truncate text-sm">{table.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
