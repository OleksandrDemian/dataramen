import {useSearchQueries} from "../../data/queries/project.ts";
import {useCurrentUser} from "../../data/queries/users.ts";
import React, {MouseEventHandler, useState} from "react";
import {useDebouncedValue} from "../../hooks/useDebouncedValue.ts";
import st from "./index.module.css";
import {gte} from "../../utils/numbers.ts";
import {TFindQuery} from "@dataramen/types";

const EMOJI: Record<TFindQuery["type"], string> = {
  table: "📄",
  query: "📖",
};

export type TSearchTableProps = {
  onTable: (table: string, dsId: string) => void;
  onQuery: (queryId: string, dsId: string) => void;
  autoFocus?: boolean;
};
export const SearchQuery = ({ onTable, onQuery, autoFocus }: TSearchTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const debouncedSearch = useDebouncedValue(searchTerm);

  const { data: user } = useCurrentUser();
  const { data: tables } = useSearchQueries(debouncedSearch, user?.teamId);

  const onSelect = (query: TFindQuery) => {
    if (query.type === "table") {
      onTable(query.name, query.dataSourceId);
    } else if (query.type === "query") {
      onQuery(query.id, query.dataSourceId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!tables) {
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => (i + 1) % tables.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => (i - 1 + tables.length) % tables.length);
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && tables[activeIndex]?.name) {
        e.preventDefault();
        onSelect(tables[activeIndex]);
      }
    }
  };

  const onClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    const tableId = e.currentTarget.dataset.tableId;
    const table = tables?.find((table) => table.id === tableId);
    if (table) {
      onSelect(table);
    }
  };

  return (
    <>
      <input
        className={st.search}
        placeholder="Search table or saved query to start from"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus={autoFocus}
      />

      {gte(tables?.length, 0) && (
        <div className="overflow-y-auto max-h-full mt-2">
          {tables.map((table, i) => (
            <button key={table.id} className={st.entry} data-is-active={activeIndex === i} data-table-id={table.id} onClick={onClick}>
              <p className="font-semibold">{EMOJI[table.type]} {table.name}</p>
              <p className="text-xs text-blue-600">📦 {table.dataSourceName}</p>
            </button>
          ))}
        </div>
      )}
    </>
  );
};
