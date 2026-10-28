import { type VariantProps, cva } from "class-variance-authority";

export const codeBlockVariants = cva(
  "group/code-block relative flex w-full min-w-0 flex-col overflow-hidden rounded-2xl text-sm has-[>[data-slot=code-block-content]:focus-visible]:ring-3 has-[>[data-slot=code-block-content]:focus-visible]:ring-ring/30 data-[size=sm]:rounded-xl data-[size=sm]:text-xs",
  {
    variants: {
      variant: {
        default: "border bg-background/25 text-foreground",
        destructive:
          "bg-destructive/5 text-destructive ring-1 ring-destructive/15 dark:bg-destructive/10 dark:ring-destructive/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type CodeBlockVariantsProps = VariantProps<typeof codeBlockVariants>;
