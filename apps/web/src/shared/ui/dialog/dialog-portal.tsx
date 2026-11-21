import type { JSX } from "react";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";

export type DialogPortalProps = DialogPrimitive.Portal.Props;

export function DialogPortal({ ...props }: DialogPortalProps): JSX.Element {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}
