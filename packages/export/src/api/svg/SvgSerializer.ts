import type { SvgNode } from "@rhumb/kernel";

const ESCAPES: Readonly<Record<string, string>> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
};

function escapeText(value: string): string {
  return value.replace(/[&<>"]/g, (char) => ESCAPES[char] ?? char);
}

export class SvgSerializer {
  public serialize(node: SvgNode): string {
    const attrs = Object.entries(node.attrs)
      .map(([name, value]) => ` ${name}="${escapeText(String(value))}"`)
      .join("");

    if (node.children.length === 0) {
      return `<${node.tag}${attrs}/>`;
    }

    const inner = node.children
      .map((child) =>
        typeof child === "string" ? escapeText(child) : this.serialize(child),
      )
      .join("");

    return `<${node.tag}${attrs}>${inner}</${node.tag}>`;
  }
}
