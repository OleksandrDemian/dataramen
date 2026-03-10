import {useSearchQueries} from "../../data/queries/project.ts";
import {useCurrentUser} from "../../data/queries/users.ts";
import React, {MouseEventHandler, useMemo, useState} from "react";
import {useDebouncedValue} from "../../hooks/useDebouncedValue.ts";
import st from "./index.module.css";
import {gt, lt} from "../../utils/numbers.ts";
import {TFindQuery} from "@dataramen/types";
import {useDataSources} from "../../data/queries/dataSources.ts";
import {toggleSelectedDataSource, useSelectedDataSources} from "../../data/selectedDataSourcesStore.ts";
import {reduceArrayToMap} from "../../utils/reducers.ts";
import {DataSourceIcon} from "../Icons";
import MenuIcon from "../../assets/ellipsis-vertical-outline.svg?react";
import clsx from "clsx";
import {Alert} from "../Alert";
import {SearchInput} from "../SearchInput";
import {Tooltip} from "react-tooltip";

const EMOJI: Record<TFindQuery["type"], string> = {
  table: "📄",
  query: "📖",
  tab: '🛠️',
};

export type TSearchTableProps = {
  onTable: (table: string, dsId: string) => void;
  onQuery: (queryId: string, dsId: string) => void;
  onWorkbenchTab: (tabId: string, dsId: string) => void;
  autoFocus?: boolean;
};
export const SearchQuery = ({ onTable, onQuery, onWorkbenchTab, autoFocus }: TSearchTableProps) => {
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
    } else if (query.type === "tab") {
      onWorkbenchTab(query.id, query.dataSourceId);
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
      <Tooltip id="datasources" clickable className={st.dsTooltip} variant="light" place="left-start" positionStrategy="fixed" noArrow opacity={1}>
        {dataSources?.map(ds => (
          <button key={ds.id} className={clsx(st.dsEntry, enabled[ds.id] && st.enabled)} onClick={() => toggleSelectedDataSource(ds.id)}>
            <input type="checkbox" checked={!!enabled[ds.id]} readOnly />
            <p className={st.dsName}>{ds.name}</p>
            <div>
              <DataSourceIcon size={16} type={ds.dbType} />
            </div>
          </button>
        ))}
      </Tooltip>

      {lt(dataSources?.length, 1) && (
        <Alert variant="warning" className="mb-4">Connect at least one data source to start using DataRamen</Alert>
      )}

      <div className={st.searchContainer}>
        <SearchInput
          containerClassName={st.search}
          placeholder="Search table or saved query to start from"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
        />

        {gt(dataSources?.length, 0) && (
          <span data-tooltip-id="datasources">
            <MenuIcon width={16} height={16} />
          </span>
        )}
      </div>

      <div className="overflow-y-auto max-h-full mt-2">
        {tables?.map((table, i) => (
          <button key={table.id} className={st.entry} data-is-active={activeIndex === i} data-table-id={table.id} onClick={onClick}>
            <p className="truncate">{EMOJI[table.type]} {table.name}</p>
            <p className={st.ds}>📦 {table.dataSourceName}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
