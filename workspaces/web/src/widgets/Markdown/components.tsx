// MarkdownComponents.tsx
import React, {ReactNode} from 'react';
import { Components } from 'react-markdown';
import toast from "react-hot-toast";

interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// Inline code
export const InlineCode: React.FC<React.HTMLAttributes<HTMLElement>> = ({ children, ...props }) => (
  <code
    className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-sm font-mono"
    {...props}
  >
    {children}
  </code>
);

// // Extract raw string from code block children
const getCodeString = (children: ReactNode): string => {
  if (Array.isArray(children) && typeof children[0] === "string") return children[0];
  if (typeof children === "string") return children;
  return "";
};

const CopyButton = ({ getText }: { getText: () => string }) => {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(getText());
    toast.success("Copied!");
  };

  return (
    <button
      onClick={handleCopy}
      className="text-xs text-white px-2 py-1 rounded hover:bg-gray-600 cursor-pointer"
    >
      📋
    </button>
  );
};

// Code blocks
export const CodeBlock: React.FC<CodeProps> = ({ children, className, ...props }) => {
  const language = className?.replace('language-', '') || '';

  return (
    <div className="mb-4 not-prose">
      {language && (
        <div className="bg-gray-800 text-gray-300 px-4 py-2 text-sm font-mono rounded-t-md flex justify-between items-center">
          <span>{language}</span>
          <CopyButton getText={() => getCodeString(children).trim()} />
        </div>
      )}

      <pre
        className={`bg-gray-900 text-gray-100 p-4 overflow-x-auto ${
          language ? 'rounded-b-md' : 'rounded-md'
        }`}
        {...props}
      >
        <code className="font-mono text-sm">{children}</code>
      </pre>
    </div>
  );
};

// Default components object for react-markdown with proper typing
export const components: Components = {
  code: ({ className, children, ...props }) => {
    if (!className) {
      return <InlineCode {...props}>{children}</InlineCode>;
    }
    return <CodeBlock className={className} {...props}>{children}</CodeBlock>;
  },
  pre: ({ children }) => <>{children}</>, // Let CodeBlock handle the pre tag
};
