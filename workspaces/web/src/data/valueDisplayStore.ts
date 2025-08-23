import {createStore} from "@odemian/react-store";
import {TDbValue} from "@dataramen/types";

export const [useValueDisplay, updateValueDisplay] = createStore<TDbValue>(undefined);

export const displayValue = (value: TDbValue) => {
  updateValueDisplay(value);
};
