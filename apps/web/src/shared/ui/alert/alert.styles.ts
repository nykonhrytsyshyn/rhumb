import { type VariantProps, cva } from "class-variance-authority";

export const alertVariants = cva(
  "group/alert relative grid w-full gap-0.5 px-2.5 py-2 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "rounded-xl border bg-background/25 text-card-foreground",
        warn: "rounded-xl border border-amber-400/40 bg-amber-400/10 text-amber-400",
        destructive:
          "rounded-xl border border-destructive/40 bg-destructive/10 whitespace-pre-wrap text-destructive",
        banner: "flex items-start gap-2 border-t px-3 py-3 whitespace-pre-wrap",
        "banner-warn":
          "flex items-start gap-2 border-t border-amber-400/40 bg-amber-400/10 px-3 py-3 whitespace-pre-wrap text-amber-400",
        "banner-destructive":
          "flex items-start gap-2 border-t border-destructive/40 bg-destructive/10 px-3 py-3 whitespace-pre-wrap text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type AlertVariantsProps = VariantProps<typeof alertVariants>;
