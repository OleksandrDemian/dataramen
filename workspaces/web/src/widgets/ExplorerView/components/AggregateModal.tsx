import {ChangeEventHandler, useContext, useState} from "react";
import {QueryResultContext, TableContext, TableOptionsContext} from "../context/TableContext.ts";
import {Modal, ModalClose} from "../../Modal";
import st from "./AggregateModal.module.css";
import {DataSourceColumnsAutocomplete} from "../../DataSourceColumnsAutocomplete";
import {TInputColumn} from "@dataramen/types";
import clsx from "clsx";

const COUNT_ALL = "COUNT all";

export type TSummarizeModalProps = {
  onClose: VoidFunction;
};
export const AggregateModal = ({
  onClose,
}: TSummarizeModalProps) => {
  const { dataSourceId } = useContext(TableContext);
  const { setState } = useContext(TableOptionsContext);
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
    onClose();
  };

  const isCountAll = options.fn === COUNT_ALL;
  const disabled = isCountAll ? false : !options.col || !options.fn;

  return (
    <Modal isVisible onClose={onClose} backdropClose portal>
      <ModalClose onClick={onClose} />
      <div>
        <h2 className="text-lg font-semibold">Aggregate</h2>

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
