import {Modal} from "../../widgets/Modal";
import {closeEditValueModal, EditValueStore, useEditValueStore} from "../../data/editValueStore.ts";
import {QueryExpressionInput} from "../../widgets/QueryExpressionInput";
import {KeyboardEventHandler, useEffect, useState} from "react";
import {TQueryExpressionInput, TQueryFilter} from "@dataramen/types/src/queries.ts";
import {RawMode} from "../../widgets/QueryExpressionInput/const.ts";
import {closeEntityEditorModal} from "../../data/entityEditorStore.ts";
import {useUpdate} from "../../data/queries/queryRunner.ts";
import {genSimpleId} from "../../utils/id.ts";
import {useWorkbenchTabId} from "../../hooks/useWorkbenchTabId.ts";
import {invalidateTabData} from "../../data/queries/workbenchTabs.ts";

const Component = ({ prop, entity, entityId, current, dataSourceId }: EditValueStore) => {
  const [value, setValue] = useState<TQueryExpressionInput>({
    mode: "default",
    value: current?.toString() || "",
  });

  const updateEntity = useUpdate();
  const workbenchTabId = useWorkbenchTabId();

  const onCommit = () => {
    const filters: TQueryFilter[] = Object.entries(entityId).map(([k, v]) => ({
      value: (v as any).toString(),
      column: k,
      id: genSimpleId(),
      isEnabled: true,
    }));

    updateEntity.mutateAsync({
      datasourceId: dataSourceId,
      table: entity,
      values: {
        [prop]: value,
      },
      filters
    }).then(() => {
      closeEditValueModal();
      if (workbenchTabId) {
        invalidateTabData(workbenchTabId);
      }
    });
  };

  const commitOnEnter: KeyboardEventHandler = (e) => {
    if (e.key === "Enter") {
      onCommit();
    }
  };

  return (
    <div className="w-full lg:w-lg">
      <div className="rounded-t-md bg-gray-50 border-b border-gray-100 px-4 py-2">
        <p className="font-semibold text-sm">{entity}</p>
        <p className="text-xs">{Object.entries(entityId).map(([k, v]) => `${k} = "${v}"`).join()}</p>
      </div>

      <div className="px-4 py-2">
        <p className="font-semibold text-sm">{prop}</p>
        <QueryExpressionInput
          prefix="="
          onExpressionChange={setValue}
          allowedModes={RawMode}
          value={value.value}
          mode={value.mode}
          className="h-8"
          autoFocus
          onKeyUp={commitOnEnter}
          disabled={updateEntity.isPending}
        />

        <div className="mt-2 flex gap-1 justify-end">
          <button disabled={updateEntity.isPending} className="button primary" onClick={onCommit}>Commit</button>
          <button disabled={updateEntity.isPending} className="button tertiary" onClick={closeEditValueModal}>Close</button>
        </div>
      </div>
    </div>
  );
};

export const EditValueModal = () => {
  const data = useEditValueStore();
  const [temp, setTemp] = useState<EditValueStore | undefined>(undefined);

  useEffect(() => {
    if (data) {
      setTemp(data);
    }
  }, [data]);

  return (
    <Modal
      backdropClose
      isVisible={!!data}
      onClose={closeEntityEditorModal}
      onClosed={() => setTemp(undefined)}
      noPadding
    >
      {temp && (
        <Component
          prop={temp.prop}
          entityId={temp.entityId}
          current={temp.current}
          entity={temp.entity}
          dataSourceId={temp.dataSourceId}
        />
      )}
    </Modal>
  )
};
