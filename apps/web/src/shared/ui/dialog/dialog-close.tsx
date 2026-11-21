import type { JSX } from "react";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";

export type DialogCloseProps = DialogPrimitive.Close.Props;

export function DialogClose({ ...props }: DialogCloseProps): JSX.Element {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}
