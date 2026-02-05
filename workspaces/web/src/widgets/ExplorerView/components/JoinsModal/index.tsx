import {Modal, ModalClose} from "../../../Modal";
import st from "./index.module.css";
import {HookButton} from "../../../HookButton";
import {
  hideExplorerModal,
  showExplorerModal,
  useExplorerModals,
} from "../../hooks/useExplorerModals.ts";
import {useContext, useMemo, useState} from "react";
import {QueryResultContext, TableContext} from "../../context/TableContext.ts";
import {useJoinStatements} from "../../hooks/useJoinStatements.ts";
import toast from "react-hot-toast";
import {Alert} from "../../../Alert";
import {useHotkeys} from "react-hotkeys-hook";
import { IHook } from "@dataramen/types";
import { createOnStatement } from "@dataramen/common";

export const JoinsModal = () => {
  const { isFetching } = useContext(QueryResultContext);
  const showModal = useExplorerModals((s) => s.joins);
  const { toggle } = useJoinStatements();
  const { availableJoins } = useContext(TableContext);

  const [filter, setFilter] = useState("");

  const filteredHooks = useMemo<IHook[]>(() => {
    const lower = filter.toLowerCase();
    return availableJoins.filter((h) => h.toTable.toLowerCase().includes(lower));
  }, [availableJoins, filter]);

  const onClose = () => hideExplorerModal("joins");

  useHotkeys("j", () => {
    if (availableJoins.length > 0) {
      showExplorerModal("joins");
    } else {
      toast.error("No available tables to join");
    }
  });

  return (
    <Modal isVisible={showModal} onClose={onClose} portal backdropClose>
      <ModalClose onClick={onClose} />
      <div className={st.joinModal}>
        <h2 className="text-lg font-semibold mb-4">Join table</h2>

        {availableJoins.length > 0 ? (
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
            <p className="text-sm truncate">There is nothing else to join</p>
          </Alert>
        )}

        <div className={`flex flex-col mt-2 overflow-y-auto ${isFetching ? "opacity-40" : ""}`}>
          {filteredHooks.map((hook) => (
            <HookButton
              key={hook.id}
              hook={hook}
              onClick={() => {
                if (isFetching) {
                  return;
                }

                toggle({
                  table: hook.direction === 'in' ? hook.fromTable : hook.toTable,
                  type: 'LEFT',
                  on: createOnStatement(hook),
                });
                setFilter("");
                onClose();
              }}
            />
          ))}
        </div>
      </div>
    </Modal>
  );
};
