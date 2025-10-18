import {useSearchQueries} from "../../data/queries/project.ts";
import {useCurrentUser} from "../../data/queries/users.ts";
import React, {MouseEventHandler, useMemo, useState} from "react";
import {useDebouncedValue} from "../../hooks/useDebouncedValue.ts";
import st from "./index.module.css";
import {gte} from "../../utils/numbers.ts";
import {TFindQuery} from "@dataramen/types";
import {useDataSources} from "../../data/queries/dataSources.ts";
import {toggleSelectedDataSource, useSelectedDataSources} from "../../data/selectedDataSourcesStore.ts";
import {reduceArrayToMap} from "../../utils/reducers.ts";

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
  const debouncedSearch = useDebouncedValue(searchTerm, 200);
  const selectedDataSources = useSelectedDataSources();

  const { data: user } = useCurrentUser();
  const { data: dataSources } = useDataSources({
    teamId: user?.teamId,
  });

  const availableSelectedDataSources = useMemo(() => {
    const temp: string[] = [];
    const selected = reduceArrayToMap(selectedDataSources);
    if (!dataSources || dataSources.length === 0) {
      return [];
    }

    for (const ds of dataSources) {
      if (selected[ds.id]) {
        temp.push(ds.id);
      }
    }

    return temp;
  }, [selectedDataSources, dataSources]);

  const { data: tables } = useSearchQueries(debouncedSearch, {
    teamId: user?.teamId,
    selectedDataSources: availableSelectedDataSources,
  });

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

  const enabled = useMemo(
    () => reduceArrayToMap(selectedDataSources),
    [selectedDataSources]
  );

  return (
    <div className="overflow-hidden flex flex-col w-full lg:w-lg">
      {gte(dataSources?.length, 0) && (
        <div className="flex overflow-x-auto mb-2 gap-2 no-scrollbar">
          {dataSources.map(ds => (
            <label key={ds.id} className={st.dsEntry}>
              <input
                type="checkbox"
                checked={enabled[ds.id] === true}
                onChange={() => toggleSelectedDataSource(ds.id)}
              />
              <span>{ds.name}</span>
            </label>
          ))}
        </div>
      )}

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
              <p className={st.ds}>📦 {table.dataSourceName}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
