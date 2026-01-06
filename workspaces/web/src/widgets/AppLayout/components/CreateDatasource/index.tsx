import {
  useCreateDataSource,
  useManualInspectDataSource
} from "../../../../data/queries/dataSources.ts";
import st from "./index.module.css";
import {Modal} from "../../../Modal";
import {useForm} from "../../../../hooks/form/useForm.ts";
import {TCreateDataSource} from "../../../../data/types/dataSources.ts";
import {Alert} from "../../../Alert";
import {useCurrentUser} from "../../../../data/queries/users.ts";
import clsx from "clsx";
import {MySqlForm} from "./MySqlForm.tsx";
import {PostgreForm} from "./PostgreForm.tsx";
import {Analytics} from "../../../../utils/analytics.ts";

const DataSources = [
  {
    label: "PostgreSQL",
    tag: "postgres",
  },
  {
    label: "MySQL",
    tag: "mysql",
  },
];

export const CreateDatasourceModal = ({ show, onClose, dbType = "postgres" }: { show: boolean; onClose: VoidFunction; dbType: string; }) => {
  const createDataSource = useCreateDataSource();
  const manualInspector = useManualInspectDataSource();

  const { data: user } = useCurrentUser();
  const [form, { change, set }] = useForm<TCreateDataSource>({
    name: "",
    dbType,
    dbUrl: "",
    dbUser: "",
    dbPassword: "",
    dbDatabase: "",
    dbSchema: "",
    dbPort: 5432,
    teamId: "",
    ownerId: "",
    description: "",
    allowInsert: false,
    allowUpdate: false,
  });

  const onSubmit = async () => {
    const result = await createDataSource.mutateAsync({
      ...form,
      dbPort: Number(form.dbPort),
      teamId: user!.teamId,
      ownerId: user!.id,
    });

    await manualInspector.mutateAsync(result.id);
    onClose();

    Analytics.event("Create Datasource", {
      dbType: form.dbType,
    });
  };

  const onProductionMode = (value: boolean) => {
    set("allowInsert", !value);
    set("allowUpdate", !value);
  };

  const close = () => {
    onClose();
    Analytics.event("Cancel Datasource");
  };

  const disableUi = createDataSource.isPending || manualInspector.isPending;
  const isProdMode = !form.allowInsert && !form.allowUpdate;

  return (
    <Modal isVisible={show} onClose={close}>
      <div className="max-w-xl mx-auto overflow-y-auto">
        <Alert variant="warning" className="text-sm mb-2 max-w-xl">DataRamen is currently under active development. In production-like environments, <span className="font-semibold underline">it’s recommended to use read-only database credentials</span>.</Alert>

        {createDataSource.isError && (
          <Alert variant="danger" className="mb-2">
            <span>Failed to connect to the database. Please check if the data are correct and retry.</span>
          </Alert>
        )}

        {createDataSource.isPending && (
          <Alert className="mb-2" variant="info">Creating connection</Alert>
        )}

        {manualInspector.isPending && (
          <Alert className="mb-2" variant="info">Inspecting connection</Alert>
        )}

        <div className={st.switch}>
          <label className="button tertiary">
            <input type="radio" name="bdType" className="mr-2" checked={form.dbType === DataSources[0].tag} onChange={() => set("dbType", DataSources[0].tag)} />
            <span>{DataSources[0].label}</span>
          </label>
          <label className="button tertiary">
            <input type="radio" name="bdType" className="mr-2" checked={form.dbType === DataSources[1].tag} onChange={() => set("dbType", DataSources[1].tag)} />
            <span>{DataSources[1].label}</span>
          </label>
        </div>

        <div className="overflow-y-auto mt-2">
          <div className={st.content}>
            <div className={st.form}>
              <div className={clsx(st.input, "col-span-2")}>
                <label>
                  Name
                </label>
                <input value={form.name} onChange={change("name")} className="input"/>
              </div>

              <div className={clsx(st.input, "col-span-2")}>
                <label>
                  Description
                </label>
                <textarea value={form.description} onChange={change("description")} className="input"/>
              </div>

              {form.dbType === 'mysql' && (
                <MySqlForm form={form} change={change} />
              )}
              {form.dbType === 'postgres' && (
                <PostgreForm form={form} change={change} />
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className={st.modeSelect}>
              <div>
                <input type="radio" name="production-mode" className="mr-2" checked={isProdMode} onChange={() => onProductionMode(true)} />
                <span className="text-sm font-semibold">Production mode</span>
              </div>
              <p className="text-xs mt-1 text-gray-600">Mutation operations (such as INSERT or UPDATE) are <strong>forbidden</strong>. You won't be able to insert new rows or edit existing data. Tables in this data source are read-only.</p>
            </label>

            <label className={st.modeSelect}>
              <div>
                <input type="radio" name="production-mode" className="mr-2" checked={!isProdMode} onChange={() => onProductionMode(false)} />
                <span className="text-sm font-semibold">Dev mode</span>
              </div>
              <p className="text-xs mt-1 text-gray-600">Mutation operations (such as INSERT or UPDATE) are <strong>allowed</strong>. You will be able to insert new rows and edit existing data.</p>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-1 mt-2">
        <button onClick={close} className="button tertiary" disabled={disableUi}>
          Cancel
        </button>
        <button onClick={onSubmit} className="button primary" disabled={disableUi}>
          Create
        </button>
      </div>
    </Modal>
  );
};
