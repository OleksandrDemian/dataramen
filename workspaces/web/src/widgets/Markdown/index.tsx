import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import {components} from "./components.tsx";

export const Markdown = ({ content }: { content: string; }) => (
  <div className="prose max-w-none">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  </div>
);
