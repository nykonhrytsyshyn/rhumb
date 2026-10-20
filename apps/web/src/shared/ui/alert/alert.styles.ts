import { type VariantProps, cva } from "class-variance-authority";

export const alertVariants = cva("", {
  variants: {
    variant: {
      destructive:
        "rounded-2xl border border-destructive/40 px-3 py-2 font-mono text-xs whitespace-pre-wrap text-destructive",
      banner:
        "flex items-center gap-2 border-t border-destructive/40 bg-destructive/10 px-3 py-3 text-xs whitespace-pre-wrap text-destructive",
    },
  },
  defaultVariants: {
    variant: "destructive",
  },
});

export type AlertVariantsProps = VariantProps<typeof alertVariants>;
