import {Markdown} from "../../widgets/Markdown";
import mdFile from "./instructions.md?raw";

export const ConnectionInstructions = () => {
  return (
    <div className="card-white">
      <Markdown content={mdFile} />
    </div>
  );
};
