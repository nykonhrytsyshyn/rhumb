import { type VariantProps, cva } from "class-variance-authority";

export const inputGroupButtonVariants = cva(
  "flex items-center gap-2 rounded-2xl text-sm shadow-none",
  {
    variants: {
      size: {
        xs: "h-6 gap-1 rounded-xl px-1.5 [&>svg:not([class*='size-'])]:size-3.5",
        sm: "",
        "icon-xs": "size-6 rounded-xl p-0 has-[>svg]:p-0",
        "icon-sm": "size-8 p-0 has-[>svg]:p-0",
      },
    },
    defaultVariants: {
      size: "xs",
    },
  },
);

export type InputGroupButtonVariantsProps = VariantProps<
  typeof inputGroupButtonVariants
>;
