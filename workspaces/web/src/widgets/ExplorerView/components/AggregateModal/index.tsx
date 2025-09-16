import {ChangeEventHandler, useContext, useState} from "react";
import {QueryResultContext, TableContext, TableOptionsContext} from "../../context/TableContext.ts";
import {Modal, ModalClose} from "../../../Modal";
import st from "./index.module.css";
import {DataSourceColumnsAutocomplete} from "../../../DataSourceColumnsAutocomplete";
import {TInputColumn} from "@dataramen/types";
import clsx from "clsx";
import {hideExplorerModal, toggleExplorerModal, useExplorerModals} from "../../hooks/useExplorerModals.ts";
import {useGlobalHotkey} from "../../../../hooks/useGlobalHotkey.ts";
import {gte} from "../../../../utils/numbers.ts";
import { inputColumnToAlias } from "@dataramen/common";
import CloseButton from "./../../../../assets/close-outline.svg?react";

const COUNT_ALL = "COUNT all";

const aggToString = (agg: TInputColumn): string => {
  if (agg.distinct) {
    return [agg.fn, "DISTINCT", agg.value].join(" ");
  }

  return [agg.fn, agg.value].join(" ");
};

export const AggregateModal = () => {
  const show = useExplorerModals((s) => s.aggregate);
  const { dataSourceId } = useContext(TableContext);
  const { setState, state } = useContext(TableOptionsContext);
  const { data: result } = useContext(QueryResultContext);

  const [options, setOptions] = useState({
    fn: '',
    col: '',
  });

  const onFunction: ChangeEventHandler<HTMLSelectElement> = (e) => setOptions({
    ...options,
    fn: e.currentTarget.value,
  });

  const onColumn = (col: string) => setOptions({
    ...options,
    col,
  });

  const onClose = () => hideExplorerModal("aggregate");

  const onAddAggregation = () => {
    const aggregation: TInputColumn = options.fn === COUNT_ALL ? {
      value: "*",
      fn: "COUNT"
    } : {
      fn: options.fn,
      value: options.col,
      distinct: options.fn === "COUNT"
    };

    setState((prevState) => ({
      ...prevState,
      aggregations: [...prevState.aggregations, aggregation],
    }));
  };

  const isCountAll = options.fn === COUNT_ALL;
  const disabled = isCountAll ? false : !options.col || !options.fn;

  const onRemoveAggregation = (agg: TInputColumn) => {
    const orderLabel = inputColumnToAlias(agg);

    setState((prevState) => ({
      ...prevState,
      aggregations: prevState.aggregations.filter((s) => s.fn !== agg.fn || s.value !== agg.value),
      orderBy: prevState.orderBy.filter((o) => o.column !== orderLabel), // remove order by when removing aggregation
    }));
  };

  useGlobalHotkey("a", () => {
    toggleExplorerModal("aggregate");
  }, "Aggregate data");

  return (
    <Modal isVisible={show} onClose={onClose} backdropClose portal>
      <ModalClose onClick={onClose} />
      <div>
        <h2 className="text-lg font-semibold">Aggregate</h2>

        {gte(state.aggregations.length, 0) && (
          <div className="flex flex-col gap-1 mt-4">
            {state.aggregations.map((agg, i) => (
              <p className="p-2 rounded-md bg-gray-50 flex items-center justify-between" key={i}>
                <span>{aggToString(agg)}</span>
                <button
                  tabIndex={-1}
                  data-tooltip-id="default"
                  data-tooltip-content="Remove aggregation"
                  className="p-0.5 text-sm cursor-pointer" onClick={() => onRemoveAggregation(agg)}
                >
                  <CloseButton width={20} height={20} className="text-red-600" />
                </button>
              </p>
            ))}
          </div>
        )}

        <div className={st.optionsContainer}>
          <label className={clsx(isCountAll && "col-span-2")}>
            <p className="font-semibold text-xs">Function</p>
            <select className="input w-full" value={options.fn} onChange={onFunction} autoFocus>
              <option value="" disabled>Select function</option>
              <option value={COUNT_ALL}>Count all rows</option>
              <option value="COUNT">Count</option>
              <option value="SUM">Sum</option>
              <option value="MAX">Max</option>
              <option value="MIN">Min</option>
              <option value="AVG">Avg</option>
            </select>
          </label>

          {!isCountAll && (
            <label>
              <p className="font-semibold text-xs">Column</p>
              <DataSourceColumnsAutocomplete
                dataSourceId={dataSourceId}
                allowTables={result?.tables || []}
                onChange={onColumn}
                value={options.col}
              />
            </label>
          )}

          <button
            className="button primary"
            disabled={disabled}
            onClick={onAddAggregation}
          >
            Add
          </button>
        </div>
      </div>
    </Modal>
  );
};
