import st from "./index.module.css";
import {TCreateDataSource} from "../../../../data/types/dataSources.ts";
import {ChangeFn} from "../../../../hooks/form/useForm.ts";
import clsx from "clsx";

export const PostgreForm = ({ form, change }: { form: TCreateDataSource; change: ChangeFn<TCreateDataSource> }) => {
  return (
    <>
      <div className={clsx(st.input, st.small)}>
        <label>
          Database URL
        </label>
        <input value={form.dbUrl} onChange={change("dbUrl")} className="input"/>
      </div>

      <div className={clsx(st.input, st.small)}>
        <label>
          Database port
        </label>
        <input value={form.dbPort} onChange={change("dbPort")} type="number" className="input"/>
      </div>

      <div className={clsx(st.input, st.small)}>
        <label>
          User
        </label>
        <input value={form.dbUser} onChange={change("dbUser")} className="input"/>
      </div>

      <div className={clsx(st.input, st.small)}>
        <label>
          Password
        </label>
        <input type="password" value={form.dbPassword} onChange={change("dbPassword")} className="input"/>
      </div>

      <div className={clsx(st.input, st.small)}>
        <label>
          Database
        </label>
        <input value={form.dbDatabase} onChange={change("dbDatabase")} className="input"/>
      </div>

      <div className={clsx(st.input, st.small)}>
        <label>
          Schema
        </label>
        <input value={form.dbSchema} onChange={change("dbSchema")} className="input"/>
      </div>
    </>
  );
};
