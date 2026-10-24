import type { JSX } from "react";

import { useT } from "@shared/i18n";

import { DOCS_BLOCKS } from "../../../config/docs-blocks";
import { DOCS_EXTRAS, DOCS_STRUCTURE } from "../../../config/docs-extras";
import { DOCS_LINES } from "../../../config/docs-lines";
import { DocsHeading } from "./docs-heading";
import { DocsRows } from "./docs-rows";

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
        <DocsHeading>{t("docs.syntax.title")}</DocsHeading>

        <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
          <li>{t("docs.syntax.header")}</li>
          <li>{t("docs.syntax.chain")}</li>
          <li>{t("docs.syntax.label")}</li>
          <li>{t("docs.syntax.comment")}</li>
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <DocsHeading>{t("docs.blocks.title")}</DocsHeading>
        <DocsRows rows={DOCS_BLOCKS.map(([code, key]) => [code, t(key)])} />
      </section>

      <section className="flex flex-col gap-2">
        <DocsHeading>{t("docs.shapes.title")}</DocsHeading>
        <p className="text-muted-foreground">{t("docs.shapes.text")}</p>
        <DocsRows rows={DOCS_EXTRAS.map(([code, key]) => [code, t(key)])} />
      </section>

      <section className="flex flex-col gap-2">
        <DocsHeading>{t("docs.structure.title")}</DocsHeading>
        <p className="text-muted-foreground">{t("docs.structure.text")}</p>
        <DocsRows rows={DOCS_STRUCTURE.map(([code, key]) => [code, t(key)])} />
      </section>

      <section className="flex flex-col gap-2">
        <DocsHeading>{t("docs.lines.title")}</DocsHeading>
        <DocsRows rows={DOCS_LINES.map(([code, key]) => [code, t(key)])} />
      </section>

      <section className="flex flex-col gap-2">
        <DocsHeading>{t("docs.decisions.title")}</DocsHeading>
        <p className="text-muted-foreground">{t("docs.decisions.text")}</p>
      </section>

      <section className="flex flex-col gap-2">
        <DocsHeading>{t("docs.preparation.title")}</DocsHeading>
        <p className="text-muted-foreground">{t("docs.preparation.text")}</p>
      </section>

      <section className="flex flex-col gap-2">
        <DocsHeading>{t("docs.standards.title")}</DocsHeading>
        <p className="text-muted-foreground">{t("docs.standards.text")}</p>
      </section>
    </div>
  );
}
