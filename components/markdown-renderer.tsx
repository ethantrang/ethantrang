"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import type { Components } from "react-markdown";
import type { Element, Text } from "hast";

function getHastText(el: Element): string {
  return el.children
    .map(c => {
      if (c.type === "text") return (c as Text).value;
      if (c.type === "element") return getHastText(c as Element);
      return "";
    })
    .join("");
}

export function MarkdownRenderer({ content }: { content: string }) {
  const components: Components = {
    // Paragraphs: if the only child is a single link, render as a nav card
    p({ node, children }) {
      const childNodes = node?.children ?? [];
      if (
        childNodes.length === 1 &&
        childNodes[0].type === "element" &&
        (childNodes[0] as Element).tagName === "a"
      ) {
        const linkEl = childNodes[0] as Element;
        const href = String(linkEl.properties?.href ?? "");
        const text = getHastText(linkEl);

        // Skip mailto — treat as inline paragraph
        if (href.startsWith("mailto:")) {
          return <p>{children}</p>;
        }

        if (href.startsWith("/")) {
          return (
            <Link href={href} className="flex items-center gap-x-2">
              <div className="h-2 w-2 flex-shrink-0 rounded-full bg-gradient-to-br from-gray-800 to-gray-500" />
              <span>{text}</span>
            </Link>
          );
        }

        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-x-2"
          >
            <div className="h-2 w-2 flex-shrink-0 rounded-full bg-gradient-to-br from-gray-800 to-gray-500" />
            <span>{text}</span>
          </a>
        );
      }

      return <p>{children}</p>;
    },

    // Inline links within paragraphs
    a({ href, children }) {
      if (!href) return <span>{children}</span>;
      if (href.startsWith("/")) {
        return <Link href={href}>{children}</Link>;
      }
      return (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    },
  };

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  );
}
