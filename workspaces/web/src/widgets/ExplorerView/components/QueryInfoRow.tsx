import {MouseEventHandler, useContext, useState} from "react";
import {TableOptionsContext} from "../context/TableContext";
import st from "./QueryInfoRow.module.css";
import {aggToString} from "../../../utils/sql";
import {showExplorerModal} from "../hooks/useExplorerModals";
import clsx from "clsx";
import CloseIcon from "../../../assets/close-outline.svg?react";
import {useJoinStatements} from "../hooks/useJoinStatements";
import {prompt} from "../../../data/promptModalStore";
import {useHotkeys} from "react-hotkeys-hook";
import {useDebouncedValue} from "../../../hooks/useDebouncedValue";
import {useWhereStatements} from "../hooks/useWhereStatements";

function calculateIsEnabled (current?: boolean) {
  return !(current === true || current === undefined);
}

export const QueryInfoRow = () => {
  const { state: { aggregations, columns, groupBy } } = useContext(TableOptionsContext);
  const { toggle, joins } = useJoinStatements();
  const { filters, setFilters, removeFilter } = useWhereStatements();

  const onJoinClick = () => showExplorerModal("joins");
  const onAggregateClick = () => showExplorerModal("aggregate");
  const onColumnsClick = () => showExplorerModal("columns");
  const onGroupByClick = () => showExplorerModal("groupBy");

  const onRemoveJoin: MouseEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();

    toggle(joins[joins.length - 1]);
  };

  const onTriggerFilterEnabled = (filterId: string) => {
    setFilters(filters.map((f) => ({
      ...f,
      isEnabled: filterId === f.id ? calculateIsEnabled(f.isEnabled) : f.isEnabled,
    })), true);
  };

  const removeFilterHandler = (filterId: string): MouseEventHandler => (e) => {
    e.preventDefault();
    e.stopPropagation();

    removeFilter(filterId);
  };

  if (filters.length > 0 || joins.length > 0 || groupBy.length > 0 || columns.length > 0 || aggregations.length > 0) {
    return (
      <div className={st.container}>
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

        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => onTriggerFilterEnabled(f.id)}
            onAuxClick={() => removeFilter(f.id)}
            /* explicitly check f.isEnabled === false, because undefined = TRUE */
            className={clsx(st.bluePill, f.isEnabled === false && st.disabledPill)}
            data-tooltip-id="default"
            data-tooltip-content={`${f.column} ${f.value}`}
          >
            <p className="text-sm">{f.column}</p>
            <p className="text-sm">{f.value}</p>
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

        {false && <SearchAll />}
      </div>
    );
  }

  return null;
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
