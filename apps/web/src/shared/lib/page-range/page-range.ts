export type PageItem = number | "start-ellipsis" | "end-ellipsis";

export function getPageItems(
  page: number,
  pageCount: number,
  siblings = 1,
): readonly PageItem[] {
  if (pageCount <= 0) {
    return [];
  }

  if (pageCount === 1) {
    return [1];
  }

  if (siblings < 0) {
    if (pageCount <= 3) {
      return Array.from({ length: pageCount }, (_, i) => i + 1);
    }

    if (page >= pageCount) {
      return [1, "start-ellipsis", pageCount];
    }

    if (page === 1) {
      return [1, "end-ellipsis", pageCount];
    }

    return [page, "end-ellipsis", pageCount];
  }

  const slots = siblings * 2 + 5;

  if (pageCount <= slots) {
    return Array.from({ length: Math.max(pageCount, 0) }, (_, i) => i + 1);
  }

  const current = Math.min(Math.max(page, 1), pageCount);
  const left = Math.max(current - siblings, 1);
  const right = Math.min(current + siblings, pageCount);

  const gapBefore = left > 3;
  const gapAfter = right < pageCount - 2;
  const edge = siblings * 2 + 3;

  if (!gapBefore) {
    return [
      ...Array.from({ length: edge }, (_, i) => i + 1),
      "end-ellipsis",
      pageCount,
    ];
  }

  if (!gapAfter) {
    return [
      1,
      "start-ellipsis",
      ...Array.from({ length: edge }, (_, i) => pageCount - edge + 1 + i),
    ];
  }

  return [
    1,
    "start-ellipsis",
    ...Array.from({ length: right - left + 1 }, (_, i) => left + i),
    "end-ellipsis",
    pageCount,
  ];
}
