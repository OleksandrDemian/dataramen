import {Modal, ModalClose} from "../../../Modal";
import st from "./index.module.css";
import {HookButton} from "../../../HookButton";
import {
  hideExplorerModal,
  showExplorerModal,
  useExplorerModals,
} from "../../hooks/useExplorerModals.ts";
import {useContext, useMemo, useState} from "react";
import {THook} from "../../../../data/types/hooks.ts";
import {QueryResultContext, TableContext} from "../../context/TableContext.ts";
import {useJoinStatements} from "../../hooks/useJoinStatements.ts";
import {useGlobalHotkey} from "../../../../hooks/useGlobalHotkey.ts";
import toast from "react-hot-toast";
import CloseIcon from "../../../../assets/close-outline.svg?react";
import {Alert} from "../../../Alert";

export const JoinsModal = () => {
  const { isFetching } = useContext(QueryResultContext);
  const showModal = useExplorerModals((s) => s.joins);
  const { toggle, joins } = useJoinStatements();
  const { availableJoins } = useContext(TableContext);

  const [filter, setFilter] = useState("");

  const filteredHooks = useMemo<THook[]>(() => {
    const lower = filter.toLowerCase();
    return availableJoins.filter((h) => h.on.toTable.toLowerCase().includes(lower));
  }, [availableJoins, filter]);

  const onClose = () => hideExplorerModal("joins");

  useGlobalHotkey("j", () => {
    if (availableJoins.length > 0) {
      showExplorerModal("joins");
    } else {
      toast.error("No available tables to join");
    }
  }, "Add new join");

  return (
    <Modal isVisible={showModal} onClose={onClose} portal>
      <ModalClose onClick={onClose} />
      <div className={st.joinModal}>
        <h2 className="text-lg font-semibold mb-4">Join table</h2>

        {joins.length > 0 && (
          <div className={st.cardsList}>
            {joins.map((j, i) => (
              <div className={st.card} key={j.table + j.on}>
                <p className="text-sm truncate">{j.table} on {j.on}</p>

                {i === joins.length - 1 && (
                  <button className={st.closeButton} onClick={() => toggle(j)} disabled={isFetching}>
                    <CloseIcon width={20} height={20} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {filteredHooks.length > 0 ? (
          <input
            className="input w-full"
            placeholder="Filter"
            autoFocus
            onChange={e => setFilter(e.target.value)}
            value={filter}
            disabled={isFetching}
          />
        ) : (
          <Alert variant="warning">
            <p className="text-sm truncate">No more tables to join</p>
          </Alert>
        )}

        <div className={`flex flex-col mt-2 overflow-y-auto ${isFetching ? "opacity-40" : ""}`}>
          {filteredHooks.map((hook) => (
            <HookButton
              key={hook.where}
              hook={hook}
              onClick={() => {
                if (isFetching) {
                  return;
                }

                toggle({
                  table: hook.on.toTable,
                  type: 'LEFT',
                  on: hook.where
                });
                setFilter("");
              }}
            />
          ))}
        </div>
      </div>
    </Modal>
  );
};
