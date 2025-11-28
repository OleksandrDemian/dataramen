import {MouseEventHandler, useContext, useState} from "react";
import {TableOptionsContext} from "../context/TableContext.ts";
import st from "./QueryInfoRow.module.css";
import {aggToString, filterToString, filterValueToString} from "../../../utils/sql.ts";
import {showExplorerModal} from "../hooks/useExplorerModals.ts";
import {useWhereStatements} from "../hooks/useWhereStatements.ts";
import clsx from "clsx";
import CloseIcon from "../../../assets/close-outline.svg?react";
import AddIcon from "../../../assets/add-outline.svg?react";
import ChevronIcon from "../../../assets/chevron-forward-outline.svg?react";
import {useJoinStatements} from "../hooks/useJoinStatements.ts";
import {useDataSource} from "../../../data/queries/dataSources.ts";
import {DataSourceIcon} from "../../Icons";
import {prompt} from "../../../data/promptModalStore.ts";
import {useHotkeys} from "react-hotkeys-hook";
import {useDebouncedValue} from "../../../hooks/useDebouncedValue.ts";

function calculateIsEnabled (current?: boolean) {
  return !(current === true || current === undefined);
}

export const QueryInfoRow = () => {
  const { state: { table, dataSourceId, aggregations, columns, groupBy } } = useContext(TableOptionsContext);
  const { filters, setFilters, removeFilter } = useWhereStatements();
  const { toggle, joins } = useJoinStatements();
  const { data: dataSource } = useDataSource(dataSourceId);

  const onJoinClick = () => showExplorerModal("joins");
  const onAddFilterClick = () => showExplorerModal("filters");
  const onAggregateClick = () => showExplorerModal("aggregate");
  const onColumnsClick = () => showExplorerModal("columns");
  const onGroupByClick = () => showExplorerModal("groupBy");
  const onTriggerFilterEnabled = (filterId: string) => {
    setFilters(filters.map((f) => ({
      ...f,
      isEnabled: filterId === f.id ? calculateIsEnabled(f.isEnabled) : f.isEnabled,
    })), true);
  };

  const onRemoveJoin: MouseEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();

    toggle(joins[joins.length - 1]);
  };

  const removeFilterHandler = (filterId: string): MouseEventHandler => (e) => {
    e.preventDefault();
    e.stopPropagation();

    removeFilter(filterId);
  };

  return (
    <div className={st.container}>
      {dataSource && (
        <button onClick={onJoinClick} className={st.greenPill} data-tooltip-id="default" data-tooltip-content={table}>
          <DataSourceIcon size={18} type={dataSource.dbType} />
          <p className="text-sm">{dataSource.name}</p>
          <ChevronIcon width={12} height={12} />
          <p className="text-sm">{table}</p>
        </button>
      )}

      <button
        onClick={onJoinClick}
        className={st.yellowOutlinePill}
        data-tooltip-id="default"
        data-tooltip-content="Join table, hotkey J"
      >
        <AddIcon width={18} height={18} />
        <p className="text-sm">Table</p>
      </button>

      {joins.map((j, i) => (
        <button
          key={j.table}
          onClick={onJoinClick}
          className={st.yellowPill}
          data-tooltip-id="default"
          data-tooltip-content={`Joins ${j.table} on ${j.on}`}
        >
          <p className="text-sm">{j.table}</p>
          {i === joins.length - 1 && (
            <CloseIcon onClick={onRemoveJoin} width={18} height={18} />
          )}
        </button>
      ))}

      <button
        onClick={onAddFilterClick}
        className={st.blueOutlinePill}
        data-tooltip-id="default"
        data-tooltip-content="Add filters, hotkey F"
      >
        <AddIcon width={18} height={18} />
        <p className="text-sm">Filter</p>
      </button>

      {filters.map((f) => (
        <button
          key={f.id}
          onClick={() => onTriggerFilterEnabled(f.id)}
          onAuxClick={() => removeFilter(f.id)}
          /* explicitly check f.isEnabled === false, because undefined = TRUE */
          className={clsx(st.bluePill, f.isEnabled === false && st.disabledPill)}
          data-tooltip-id="default"
          data-tooltip-content={filterToString(f)}
        >
          <p className="text-sm">{f.column}</p>
          <p className="text-sm">{f.operator}</p>
          <p className="text-sm">{filterValueToString(f)}</p>
          <CloseIcon onClick={removeFilterHandler(f.id)} width={18} height={18} />
        </button>
      ))}

      {aggregations.map((a) => (
        <button
          key={aggToString(a)}
          onClick={onAggregateClick}
          className={clsx(st.purplePill)}
          data-tooltip-id="default"
          data-tooltip-content={aggToString(a)}
        >
          <p className="text-sm">{aggToString(a)}</p>
        </button>
      ))}

      {columns.length > 0 && (
        <button
          onClick={onColumnsClick}
          className={clsx(st.redPill)}
          data-tooltip-id="default"
          data-tooltip-content="Has hidden columns"
        >
          <p className="text-sm">Hidden columns</p>
        </button>
      )}

      {groupBy.length > 0 && (
        <button
          onClick={onGroupByClick}
          className={clsx(st.blackPill)}
          data-tooltip-id="default"
          data-tooltip-content="Has GROUP BY"
        >
          <p className="text-sm">GROUP BY</p>
        </button>
      )}

      <SearchAll />
    </div>
  );
};

function SearchAll () {
  const { state, setState } = useContext(TableOptionsContext);
  const [inp, setInp] = useState(() => state.searchAll);

  const onSearchAll = () => {
    prompt("Search all text values for", state.searchAll || "", {
      type: "info",
      message: "This will search all text values using LIKE operator (numbers, dates and other non string values are not searched)."
    }).then((result) => {
      if (result !== undefined) {
        setState((s) => ({
          ...s,
          searchAll: result.length > 0 ? result : undefined,
        }));
        setInp(result.length > 0 ? result : undefined);
      }
    });
  };

  useHotkeys("k", onSearchAll);

  useDebouncedValue(inp, 500, (value) => {
    setState((s) => ({
      ...s,
      searchAll: value && value.length > 0 ? value : undefined,
    }));
  });

  return (
    <input
      className="input text-sm"
      data-tooltip-id="default"
      data-tooltip-content="Search text in all columns. Can be slow when using a lot of columns."
      placeholder="Search text in all columns"
      value={inp || ''}
      onChange={(e) => setInp(e.currentTarget.value)}
    />
  );
}
