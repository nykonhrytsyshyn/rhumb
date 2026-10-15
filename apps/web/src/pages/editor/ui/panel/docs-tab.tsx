import type { JSX } from "react";

import { useT } from "@shared/i18n";
import type { TranslationKey } from "@shared/i18n";

const BLOCKS: readonly (readonly [string, TranslationKey])[] = [
  ["A[text]", "docs.blocks.process"],
  ["A([text])", "docs.blocks.terminator"],
  ["A{text}", "docs.blocks.decision"],
  ["A[/text/]", "docs.blocks.io"],
  ["A{{text}}", "docs.blocks.preparation"],
  ["A[[text]]", "docs.blocks.predefined"],
  ["A((text))", "docs.blocks.connector"],
];

const LINES: readonly (readonly [string, TranslationKey])[] = [
  ["A --> B", "docs.lines.solid"],
  ["A --- B", "docs.lines.plain"],
  ["A -.-> B", "docs.lines.dashed"],
  ["A ==> B", "docs.lines.thick"],
];

function Heading({ children }: { readonly children: string }): JSX.Element {
  return <h3 className="text-xs tracking-wider uppercase">{children}</h3>;
}

function Rows({
  rows,
}: {
  readonly rows: readonly (readonly [string, string])[];
}): JSX.Element {
  return (
    <dl className="divide-y rounded-2xl border">
      {rows.map(([code, text]) => (
        <div
          key={code}
          className="flex items-center justify-between gap-3 px-3 py-2"
        >
          <dt>
            <code className="font-mono text-xs">{code}</code>
          </dt>

          <dd className="text-right text-sm text-muted-foreground">{text}</dd>
        </div>
      ))}
    </dl>
  );
}

export function DocsTab(): JSX.Element {
  const t = useT();

  return (
    <div className="flex flex-col gap-5 p-4 text-sm">
      <img
        src="/assets/logo/logo-text-light.png"
        alt={t("common.app.name")}
        className="block h-auto w-full object-contain dark:hidden"
      />

      <img
        src="/assets/logo/logo-text-dark.png"
        alt={t("common.app.name")}
        className="hidden h-auto w-full object-contain dark:block"
      />

      <p className="text-muted-foreground">{t("docs.intro")}</p>

      <section className="flex flex-col gap-2">
        <Heading>{t("docs.syntax.title")}</Heading>

        <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
          <li>{t("docs.syntax.header")}</li>
          <li>{t("docs.syntax.chain")}</li>
          <li>{t("docs.syntax.label")}</li>
          <li>{t("docs.syntax.comment")}</li>
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <Heading>{t("docs.blocks.title")}</Heading>
        <Rows rows={BLOCKS.map(([code, key]) => [code, t(key)])} />
      </section>

      <section className="flex flex-col gap-2">
        <Heading>{t("docs.lines.title")}</Heading>
        <Rows rows={LINES.map(([code, key]) => [code, t(key)])} />
      </section>

      <section className="flex flex-col gap-2">
        <Heading>{t("docs.decisions.title")}</Heading>
        <p className="text-muted-foreground">{t("docs.decisions.text")}</p>
      </section>

      <section className="flex flex-col gap-2">
        <Heading>{t("docs.loops.title")}</Heading>
        <p className="text-muted-foreground">{t("docs.loops.text")}</p>
      </section>

      <section className="flex flex-col gap-2">
        <Heading>{t("docs.standards.title")}</Heading>
        <p className="text-muted-foreground">{t("docs.standards.text")}</p>
      </section>
    </div>
  );
}
