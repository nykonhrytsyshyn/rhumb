import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "@shared/lib/cn";

import { type BadgeVariantsProps, badgeVariants } from "./badge.styles";

export type BadgeProps = useRender.ComponentProps<"span"> & BadgeVariantsProps;

export function Badge({
  className,
  variant = "default",
  render,
  ...props
}: BadgeProps): ReturnType<typeof useRender> {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  });
}
