import type { JSX } from "react";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";

export type DialogTriggerProps = DialogPrimitive.Trigger.Props;

export function DialogTrigger({ ...props }: DialogTriggerProps): JSX.Element {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}
