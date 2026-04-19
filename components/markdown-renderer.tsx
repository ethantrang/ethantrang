"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n');

  let titleLine = '';
  const dateLines: string[] = [];
  const bodyLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith('Title:')) {
      const value = line.replace(/^Title:\s*/, '').trim();
      titleLine = value ? `# ${value}` : '';
    } else if (line.startsWith('Slug:')) {
      // filtered out
    } else if (line.startsWith('Created At:') || line.startsWith('Updated At:')) {
      dateLines.push(line);
    } else {
      bodyLines.push(line);
    }
  }

  const sections = [
    titleLine,
    dateLines.join('\n'),
    bodyLines.join('\n').replace(/^\n+/, ''),
  ].filter(Boolean);

  const processedContent = sections.join('\n\n');

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {processedContent}
    </ReactMarkdown>
  );
}
