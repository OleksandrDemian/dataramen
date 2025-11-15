import {QueryResultContext, TableContext, TableOptionsContext} from "../context/TableContext.ts";
import st from "./QueryBuilderSidebar.module.css";
import {useContext, useState} from "react";
import {useWhereStatements} from "../hooks/useWhereStatements.ts";
import {useJoinStatements} from "../hooks/useJoinStatements.ts";
import clsx from "clsx";
import CloseIcon from "../../../assets/close-outline.svg?react";
import {Alert} from "../../Alert";
import {inputColumnToAlias, OPERATOR_LABEL} from "@dataramen/common";
import {TInputColumn} from "@dataramen/types";
import {useDataSource} from "../../../data/queries/dataSources.ts";
import {OrderByClause, QueryFilter} from "@dataramen/sql-builder";
import Chevron from "../../../assets/chevron-forward-outline.svg?react";
import toast from "react-hot-toast";
import {toggleShowQuerySidebar, useShowQuerySidebar} from "../../../data/showQuerySidebarStore.ts";
import {Sidebar} from "../../Sidebar";
import {useMediaQuery} from "../../../hooks/useMediaQuery.ts";
import {ScreenQuery} from "../../../utils/screen.ts";
import {showExplorerModal} from "../hooks/useExplorerModals.ts";
import {useRenameTab} from "../../../hooks/useRenameTab.ts";

export const QueryBuilderSidebar = () => {
  const show = useShowQuerySidebar();
  const laptop = useMediaQuery(ScreenQuery.laptop);

  if (laptop) {
    return (
      <div className={clsx(st.root, show && st.rootShow)}>
        <div className={clsx(st.contentDesktop, "no-scrollbar")}>
          <Information />
          <Actions />
          <OrderBy />
          <Joins />
          <Filters />
          <Columns />
          <Aggregate />
          <GroupBy />
        </div>
      </div>
    );
  }

  return (
    <Sidebar isVisible={show} onClose={toggleShowQuerySidebar} backdropClose>
      <div className={st.contentMobile}>
        <Information />
        <Actions />
        <OrderBy />
        <Joins />
        <Filters />
        <Columns />
        <Aggregate />
        <GroupBy />
      </div>
    </Sidebar>
  );
};

export type TSectionHeadProps = {
  title: string;
  show: boolean;
  onShow: () => void;
  items: number;
};
function SectionHead ({ onShow, show, title, items }: TSectionHeadProps) {
  return (
    <div className="flex justify-between items-center">
      <p className={st.sectionTitle}>{title}</p>
      {items > 0 && (
        <button
          className={clsx(st.sectionOpenBtn, show && st.show)}
          onClick={onShow}
        >
          <span>{items}</span>
          <Chevron width={16} height={16} />
        </button>
      )}
    </div>
  );
}

function Actions () {
  const { name } = useContext(TableContext);
  const { data } = useContext(QueryResultContext);
  const { rename } = useRenameTab();

  const onCopyRawQuery = () => {
    if (data?.result.query) {
      navigator.clipboard.writeText(data.result.query);
      toast.success("Query copied to clipboard");
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-1 px-2 mb-4">
      <button className={st.sidebarAction} onClick={() => rename(name)}>
        <span>✏️ Rename tab</span>
      </button>

      <button className={st.sidebarAction} onClick={onCopyRawQuery}>
        <span>🖋️ Copy SQL</span>
      </button>
    </div>
  )
}

function Information () {
  const { state } = useContext(TableOptionsContext);
  const { data: dataSource } = useDataSource(state.dataSourceId);

  return (
    <div className={st.sectionContainer}>
      <div className={st.card}>
        <div>
          <p className={st.subText}>📄 Table</p>
          <p className={clsx(st.text, "text-blue-600")}>{state.table}</p>
        </div>
      </div>

      <div className={clsx(st.card, "mt-2")}>
        <div>
          <p className={st.subText}>📦 Data source</p>
          <p className={clsx(st.text, "text-blue-600")}>{dataSource?.name}</p>
        </div>
      </div>
    </div>
  );
}

function GroupBy () {
  const { state, setState } = useContext(TableOptionsContext);
  const [showCurrent, setShowCurrent] = useState(true);

  const onRemoveColumn = (col: string) => {
    setState((prev) => ({
      ...prev,
      groupBy: prev.groupBy.filter((column) => inputColumnToAlias(column) !== col)
    }));
  };

  return (
    <div className={st.sectionContainer}>
      <SectionHead
        title="📚 Group by"
        show={showCurrent}
        onShow={() => setShowCurrent(!showCurrent)}
        items={state.groupBy.length}
      />

      {showCurrent && state.groupBy.length > 0 && (
        <div className={st.cardsList}>
          {state.groupBy.map((group) => (
            <div className={st.card} key={inputColumnToAlias(group)}>
              <span className={st.text}>{inputColumnToAlias(group)}</span>
              <button className={st.closeButton} onClick={() => onRemoveColumn(inputColumnToAlias(group))}>
                <CloseIcon width={20} height={20} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button className={st.sidebarAddAction} onClick={() => showExplorerModal("groupBy")}>
        <span className="hotkey">G</span>
        <span>Add group by</span>
      </button>
    </div>
  );
}

function Columns () {
  const { state, setState } = useContext(TableOptionsContext);
  const [showCurrent, setShowCurrent] = useState(false);

  const onRemoveColumn = (col: string) => {
    setState((prev) => ({
      ...prev,
      columns: prev.columns.filter((column) => inputColumnToAlias(column) !== col)
    }));
  };

  const ignoreColumns = state.aggregations.length > 0 || state.groupBy.length > 0;

  return (
    <div className={st.sectionContainer}>
      <SectionHead
        title="👀 Columns"
        show={showCurrent}
        onShow={() => setShowCurrent(!showCurrent)}
        items={ignoreColumns ? 0 : state.columns.length}
      />
      {ignoreColumns && (
        <Alert variant="warning" className="border border-yellow-800 my-2">
          <span className={st.text}>Columns are ignored when there is at least one aggregation or group by</span>
        </Alert>
      )}

      {!ignoreColumns && showCurrent && state.columns.length > 0 && (
        <div className={st.cardsList}>
          {state.columns.map((column) => (
            <div className={st.card}>
              <span className={st.text}>{inputColumnToAlias(column)}</span>
              <button className={st.closeButton} onClick={() => onRemoveColumn(inputColumnToAlias(column))}>
                <CloseIcon width={20} height={20} />
              </button>
            </div>
          ))}
        </div>
      )}

      {!ignoreColumns && (
        <button className={st.sidebarAddAction} onClick={() => showExplorerModal("columns")}>
          <span className="hotkey">C</span>
          <span>Show/Hide columns</span>
        </button>
      )}
    </div>
  );
}

function Aggregate () {
  const { state, setState } = useContext(TableOptionsContext);
  const [showCurrent, setShowCurrent] = useState(true);

  const onRemoveAggregation = (agg: TInputColumn) => {
    const orderLabel = inputColumnToAlias(agg);

    setState((prevState) => ({
      ...prevState,
      aggregations: prevState.aggregations.filter((s) => s.fn !== agg.fn || s.value !== agg.value),
      orderBy: prevState.orderBy.filter((o) => o.column !== orderLabel), // remove order by when removing aggregation
    }));
  };

  return (
    <div className={st.sectionContainer}>
      <SectionHead
        title="🔢 Aggregations"
        show={showCurrent}
        onShow={() => setShowCurrent(!showCurrent)}
        items={state.aggregations.length}
      />
      {showCurrent && state.aggregations.length > 0 && (
        <div className={st.cardsList}>
          {state.aggregations.map((agg) => (
            <div className={st.card}>
              <span className={st.text}>{agg.fn} {agg.value}</span>
              <button className={st.closeButton} onClick={() => onRemoveAggregation(agg)}>
                <CloseIcon width={20} height={20} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button className={st.sidebarAddAction} onClick={() => showExplorerModal("aggregate")}>
        <span className="hotkey">A</span>
        <span>Aggregate data</span>
      </button>
    </div>
  );
}

const stringifyValues = (val: QueryFilter["value"]): string => {
  return val?.map((v) => v.value).join(", ") || '';
};
function Filters () {
  const { state } = useContext(TableOptionsContext);
  const { removeFilter } = useWhereStatements();
  const [showCurrent, setShowCurrent] = useState(true);

  const setShowFiltersModal = () => {
    showExplorerModal("filters");
  };

  return (
    <div className={st.sectionContainer}>
      <SectionHead
        title="🎚️ Filters"
        show={showCurrent}
        onShow={() => setShowCurrent(!showCurrent)}
        items={state.filters.length}
      />
      {showCurrent && state.filters.length > 0 && (
        <div className={st.cardsList}>
          {state.filters.map((f, i) => (
            <div className={st.card} key={i}>
              <div className="overflow-hidden">
                <p className={clsx(st.subText, "truncate")}>{f.column}</p>
                <p className={clsx(st.text, "truncate")}>{OPERATOR_LABEL[f.operator]} {stringifyValues(f.value)}</p>
              </div>
              <button className={st.closeButton} onClick={() => removeFilter(f.id)}>
                <CloseIcon width={20} height={20} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button className={st.sidebarAddAction} onClick={setShowFiltersModal}>
        <span className="hotkey">F</span>
        <span>Filter data</span>
      </button>
    </div>
  );
}

function Joins () {
  const { toggle } = useJoinStatements();
  const { availableJoins } = useContext(TableContext);
  const { state: options } = useContext(TableOptionsContext);
  const [showCurrent, setShowCurrent] = useState(true);

  return (
    <div className={st.sectionContainer}>
      <SectionHead
        title="📄 Joins"
        show={showCurrent}
        onShow={() => setShowCurrent(!showCurrent)}
        items={options.joins.length}
      />
      {showCurrent && options.joins.length > 0 && (
        <div className={st.cardsList}>
          {options.joins.map((j, i) => (
            <div className={st.card} key={j.table + j.on}>
              <div className="overflow-hidden">
                <p className={clsx(st.subText, "truncate")}>on {j.on}</p>
                <p className={st.text}>{j.table}</p>
              </div>
              {i === options.joins.length - 1 && (
                <button className={st.closeButton} onClick={() => toggle(j)}>
                  <CloseIcon width={20} height={20} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {availableJoins.length > 0 && (
        <button onClick={() => showExplorerModal("joins")} className={st.sidebarAddAction}>
          <span className="hotkey">J</span>
          <span>Join table</span>
        </button>
      )}
    </div>
  );
}

function OrderBy () {
  const { state, setState } = useContext(TableOptionsContext);

  if (!state.orderBy.length) {
    return null;
  }

  const onRemove = (o: OrderByClause) => {
    setState((cur) => ({
      ...cur,
      orderBy: cur.orderBy.filter(
        (old) => old.column !== o.column && old.direction !== o.direction
      ),
    }));
  };

  return (
    <div className={st.sectionContainer}>
      <p className={st.sectionTitle}>Order by</p>

      <div className={st.cardsList}>
        {state.orderBy.map((o, i) => (
          <div className={st.card} key={i}>
            <div className="overflow-hidden">
              <p className={clsx(st.subText, "truncate")}>{o.direction}</p>
              <p className={st.text}>{o.column}</p>
            </div>

            <button className={st.closeButton} onClick={() => onRemove(o)}>
              <CloseIcon width={20} height={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
