import { type ComponentProps, type JSX } from "react";

import { cn } from "@shared/lib/cn";

import { CodeBlockLine } from "./code-block-line";

export interface CodeBlockContentProps extends ComponentProps<"pre"> {
  wrap?: boolean;
  lineNumbers?: boolean;
  startLine?: number;
}

export function CodeBlockContent({
  className,
  children,
  style,
  wrap = false,
  lineNumbers = false,
  startLine = 1,
  ...props
}: CodeBlockContentProps): JSX.Element {
  return (
    <pre
      data-slot="code-block-content"
      data-wrap={wrap || undefined}
      data-numbered={lineNumbers || undefined}
      dir="ltr"
      tabIndex={0}
      style={{ counterReset: `line ${String(startLine - 1)}`, ...style }}
      className={cn(
        "scroll-fade-x data-wrap:scroll-fade-y min-h-0 min-w-0 overflow-auto px-4 py-4 text-start font-mono leading-relaxed outline-none group-has-data-[slot=code-block-footer]/code-block:pb-2 group-has-data-[slot=code-block-header]/code-block:pt-2 group-data-[size=sm]/code-block:px-3 group-data-[size=sm]/code-block:py-3 group-data-[size=sm]/code-block:group-has-data-[slot=code-block-header]/code-block:pt-1.5 data-wrap:wrap-break-word data-wrap:whitespace-pre-wrap",
        className,
      )}
      {...props}
    >
      <code
        data-slot="code-block-code"
        className="grid min-h-lh min-w-max content-start in-data-numbered:grid-cols-[auto_1fr] in-data-wrap:min-w-0"
      >
        {lineNumbers && typeof children === "string"
          ? children
              .replace(/\n$/, "")
              .split("\n")
              .map((line, index) => (
                <CodeBlockLine key={index}>{line}</CodeBlockLine>
              ))
          : children}
      </code>
    </pre>
  );
}
