export async function loadMermaidHighlighter() {
  return (await import("./highlight-mermaid")).highlightMermaid;
}
