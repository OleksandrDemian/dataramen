import st from "./index.module.css";
import {TCreateDataSource} from "../../../../data/types/dataSources.ts";
import {ChangeFn} from "../../../../hooks/form/useForm.ts";

export type TFormShape <T> = {
  fields: {
    label: string;
    name: keyof T;
    type: string;
  }[];
};

export const DatasourceForm = ({ form, change, shape }: { form: TCreateDataSource; change: ChangeFn<TCreateDataSource>; shape: TFormShape<TCreateDataSource>; }) => {
  return (
    <div className={st.form}>
      {shape.fields.map((field) => (
        <label className={st.input} key={field.name}>
          <p className={st.label}>{field.label}</p>
          <input value={form[field.name] as string} onChange={change(field.name)} type={field.type} />
        </label>
      ))}
    </div>
  );
};
