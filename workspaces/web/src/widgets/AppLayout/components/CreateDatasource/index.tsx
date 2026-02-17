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
import {DatasourceForm, TFormShape} from "./DatasourceForm.tsx";
import { TDatabaseDialect } from "@dataramen/types";
import {DataSourceIcon} from "../../../Icons";
import clsx from "clsx";

const DB_LABELS: Record<TDatabaseDialect, string> = {
  mysql: 'MySQL',
  postgres: 'PostgreSQL',
};

const MySQLShape: TFormShape<TCreateDataSource> = {
  fields: [
    { label: "Database URL", name: "dbUrl", type: "text" },
    { label: "Database port", name: "dbPort", type: "number" },
    { label: "Username", name: "dbUser", type: "text" },
    { label: "Password", name: "dbPassword", type: "password" },
    { label: "Database", name: "dbDatabase", type: "text" },
  ],
};

const PostgresSQLShape: TFormShape<TCreateDataSource> = {
  fields: [
    { label: "Database URL", name: "dbUrl", type: "text" },
    { label: "Database port", name: "dbPort", type: "number" },
    { label: "Username", name: "dbUser", type: "text" },
    { label: "Password", name: "dbPassword", type: "password" },
    { label: "Database", name: "dbDatabase", type: "text" },
    { label: "Schema", name: "dbSchema", type: "text" },
  ],
};

export const CreateDatasourceModal = ({ show, onClose, dbType = "postgres" }: { show: boolean; onClose: VoidFunction; dbType: TDatabaseDialect; }) => {
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
    dbPort: dbType === "mysql" ? 3306 : 5432,
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
  };

  const onProductionMode = (value: boolean) => {
    set("allowInsert", !value);
    set("allowUpdate", !value);
  };

  const disableUi = createDataSource.isPending || manualInspector.isPending;
  const isProdMode = !form.allowInsert && !form.allowUpdate;

  return (
    <Modal isVisible={show} onClose={onClose} portal>
      <div className="max-w-xl mx-auto overflow-y-auto">
        <div className={st.header}>
          <DataSourceIcon size={24} type={dbType} />
          <p className="text-(--text-color-primary) font-semibold">{DB_LABELS[dbType]}</p>
        </div>

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

        <div className="mt-2">
          <div className={st.content}>
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2" htmlFor="datasource-name">
                Name
              </label>
              <input
                value={form.name}
                onChange={change("name")}
                id="datasource-name"
                className="input"
                placeholder="Data source name"
                disabled={disableUi}
              />
            </div>

            <p className="text-sm font-semibold mt-2">
              Configuration
            </p>

            <DatasourceForm
              form={form}
              change={change}
              shape={form.dbType === 'mysql' ? MySQLShape : PostgresSQLShape}
            />
          </div>

          <p className="text-sm font-semibold mt-4">
            Connection mode
          </p>

          <div className={st.modeContainer}>
            <label onClick={() => onProductionMode(true)} className={clsx(st.modeSelect, isProdMode && st.selected)}>
              <span className="text-sm font-semibold text-(--text-color-primary)">
                <input type="radio" disabled={disableUi} checked={isProdMode} className="mr-2" />
                Read-only mode
              </span>
              <p className="text-sm mt-1 text-(--text-color-primary)">Mutation operations (such as INSERT or UPDATE) are <strong>forbidden</strong>. You won't be able to insert new rows or edit existing data. Tables in this data source are read-only.</p>
            </label>

            <label onClick={() => onProductionMode(false)} className={clsx(st.modeSelect, !isProdMode && st.selected)}>
              <span className="text-sm font-semibold text-(--text-color-primary)">
                <input type="radio" disabled={disableUi} checked={!isProdMode} className="mr-2" />
                Read/Write mode
              </span>
              <p className="text-sm mt-1 text-(--text-color-primary)">Mutation operations (such as INSERT or UPDATE) are <strong>allowed</strong>. You will be able to insert new rows and edit existing data.</p>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-1 mt-2">
        <button onClick={onClose} className="button tertiary" disabled={disableUi}>
          Cancel
        </button>
        <button onClick={onSubmit} className="button primary" disabled={disableUi}>
          Create
        </button>
      </div>
    </Modal>
  );
};
