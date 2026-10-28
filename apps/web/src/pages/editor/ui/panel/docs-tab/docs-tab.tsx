import type { JSX } from "react";

import { useT } from "@shared/i18n";
import { Accordion } from "@shared/ui/accordion";

import { DOCS_SECTIONS } from "../../../config/docs-sections";
import { useScrollMemory } from "../../../lib/use-scroll-memory";
import { useDocsState } from "../../../model/use-docs-state";
import { DocsSectionView } from "./docs-section";

export function DocsTab(): JSX.Element {
  const t = useT();
  const { open, setOpen } = useDocsState();
  const ref = useScrollMemory("docs");

  return (
    <div ref={ref} className="flex flex-col gap-5 p-4 text-sm">
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

      <Accordion
        multiple
        value={[...open]}
        onValueChange={(next) => {
          setOpen(next);
        }}
      >
        {DOCS_SECTIONS.map((section) => (
          <DocsSectionView key={section.id} section={section} />
        ))}
      </Accordion>
    </div>
  );
}
