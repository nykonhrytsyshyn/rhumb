import type { JSX } from "react";

import { useT } from "@shared/i18n";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@shared/ui/accordion";

import type { DocsSection } from "../../../config/docs-sections";
import { DocsItemView } from "./docs-item";

export interface DocsSectionViewProps {
  readonly section: DocsSection;
}

export function DocsSectionView({
  section,
}: DocsSectionViewProps): JSX.Element {
  const t = useT();

  return (
    <AccordionItem value={section.id}>
      <AccordionTrigger>{t(section.title)}</AccordionTrigger>

      <AccordionContent>
        <div className="flex flex-col gap-3">
          {section.items.map((item, index) => (
            <DocsItemView key={index} item={item} />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
