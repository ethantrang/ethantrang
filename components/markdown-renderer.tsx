"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const components: Components = {
  p({ children }) {
    const text = typeof children === "string" ? children : Array.isArray(children) ? children.join("") : "";
    if (text.startsWith("Created At:") || text.startsWith("Updated At:")) {
      return <p className="text-muted-foreground mb-2">{children}</p>;
    }
    return <p>{children}</p>;
  },
};

export function MarkdownRenderer({ content }: { content: string }) {
  const processedContent = content
    .split('\n')
    .filter(line => !line.startsWith('Title:') && !line.startsWith('Slug:'))
    .join('\n');

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {processedContent}
    </ReactMarkdown>
  );
}
