import { type VariantProps, cva } from "class-variance-authority";

export const codeBlockLineVariants = cva(
  "relative block min-h-lh before:min-w-2.5 before:text-end before:text-muted-foreground after:absolute after:start-1 after:top-0 after:text-muted-foreground after:select-none in-data-numbered:col-span-2 in-data-numbered:grid in-data-numbered:grid-cols-subgrid in-data-numbered:gap-x-3 in-data-numbered:[counter-increment:line] in-data-numbered:before:content-[counter(line)] in-data-numbered:before:select-none in-data-numbered:supports-[content:counter(line)_/_'']:before:content-[counter(line)_/_'']",
  {
    variants: {
      variant: {
        default: "",
        added: "bg-foreground/5 after:content-['+']",
        removed: "bg-destructive/10 after:text-destructive after:content-['−']",
        highlighted: "bg-foreground/5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type CodeBlockLineVariantsProps = VariantProps<
  typeof codeBlockLineVariants
>;
