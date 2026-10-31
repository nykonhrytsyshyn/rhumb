import { type JSX, type RefObject, useEffect, useRef, useState } from "react";

import { useT } from "@shared/i18n";
import { getPageItems } from "@shared/lib/page-range";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@shared/ui/pagination";

export interface DiagramLibraryPaginationProps {
  readonly page: number;
  readonly pageCount: number;
  readonly first: number;
  readonly last: number;
  readonly total: number;
  readonly onPageChange: (page: number) => void;
}

function useDynamicSiblings(ref: RefObject<HTMLDivElement | null>): number {
  const [siblings, setSiblings] = useState(1);

  useEffect(() => {
    const element = ref.current;
    if (element === null) return;

    const observer = new ResizeObserver(([entry]) => {
      const width = entry?.contentRect.width ?? 0;

      setSiblings(width < 260 ? -1 : width < 380 ? 0 : width < 500 ? 1 : 2);
    });

    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return siblings;
}

export function DiagramLibraryPagination({
  page,
  pageCount,
  first,
  last,
  total,
  onPageChange,
}: DiagramLibraryPaginationProps): JSX.Element {
  const t = useT();
  const containerRef = useRef<HTMLDivElement>(null);
  const siblings = useDynamicSiblings(containerRef);

  return (
    <div ref={containerRef} className="flex w-full flex-col items-center">
      <p className="py-2 text-xs text-muted-foreground tabular-nums">
        {t("editor.library.pagination.range", { first, last, total })}
      </p>

      <Pagination
        aria-label={t("editor.library.pagination.label")}
        className="flex flex-col items-center ring-1 ring-border"
      >
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              aria-label={t("editor.library.pagination.previous")}
              disabled={page <= 1}
              onClick={() => {
                onPageChange(page - 1);
              }}
            />
          </PaginationItem>

          {getPageItems(page, pageCount, siblings).map((item, index) => (
            <PaginationItem
              key={typeof item === "number" ? item : `${item}-${String(index)}`}
            >
              {typeof item === "number" ? (
                <PaginationLink
                  isActive={item === page}
                  aria-label={t("editor.library.pagination.goTo", {
                    page: item,
                  })}
                  onClick={() => {
                    onPageChange(item);
                  }}
                  className="border-y-0 tabular-nums"
                >
                  {item}
                </PaginationLink>
              ) : (
                <PaginationEllipsis />
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              aria-label={t("editor.library.pagination.next")}
              disabled={page >= pageCount}
              onClick={() => {
                onPageChange(page + 1);
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
