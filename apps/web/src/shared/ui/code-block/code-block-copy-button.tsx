import { type ComponentProps, type JSX } from "react";

import { IconCheck, IconCopy } from "@tabler/icons-react";

import { useI18n } from "@shared/i18n";
import { cn } from "@shared/lib/cn";
import { useCopyFeedback } from "@shared/lib/use-copy-feedback";
import { Button } from "@shared/ui/button";

export interface CodeBlockCopyButtonProps extends ComponentProps<
  typeof Button
> {
  value: string;
}

export function CodeBlockCopyButton({
  value,
  variant = "ghost",
  size = "xs",
  className,
  onClick,
  ...props
}: CodeBlockCopyButtonProps): JSX.Element {
  const { t } = useI18n();
  const { copied, copy } = useCopyFeedback();

  return (
    <>
      <Button
        data-slot="code-block-copy-button"
        data-copied={copied || undefined}
        variant={variant}
        size={size}
        className={cn(
          "hover:bg-foreground/5 dark:hover:bg-foreground/10",
          className,
        )}
        onClick={(event) => {
          onClick?.(event);
          copy(value);
        }}
        {...props}
      >
        {copied ? <IconCheck /> : <IconCopy />}
        {copied ? t("docs.copied") : t("docs.copy")}
      </Button>
    </>
  );
}
