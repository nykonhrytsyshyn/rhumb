import type { JSX } from "react";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";

export type DialogProps = DialogPrimitive.Root.Props;

export function Dialog({ ...props }: DialogProps): JSX.Element {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}
