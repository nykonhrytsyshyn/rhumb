import { type JSX, type ReactNode, useMemo, useRef, useState } from "react";

import { cn } from "@shared/lib/cn";

import { EditorPanelContext, useBlurOnClose } from "../model";

export interface EditorPanelShellProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly defaultTab: string;
  readonly children: ReactNode;
}

export function EditorPanelShell({
  open,
  onOpenChange,
  defaultTab,
  children,
}: EditorPanelShellProps): JSX.Element {
  const panelRef = useRef<HTMLElement>(null);
  const [activeTab, setActiveTab] = useState(defaultTab);

  useBlurOnClose(panelRef, open);

  const value = useMemo(
    () => ({ open, onOpenChange, activeTab, setActiveTab }),
    [open, onOpenChange, activeTab],
  );

  return (
    <EditorPanelContext.Provider value={value}>
      <aside
        ref={panelRef}
        data-open={open}
        className={cn(
          "z-30 flex shrink-0 flex-col overflow-hidden bg-background",

          // Mobile: fixed height, reveal the panel by translating it.
          "fixed inset-x-0 bottom-0 h-[72dvh] border-t",
          "translate-y-[calc(100%-2.5rem)]",
          "transition-transform duration-300 ease-out",
          "data-[open=true]:translate-y-0",
          "motion-reduce:transition-none",

          // Desktop: static height, reveal the panel by changing its width.
          "md:static md:h-full md:w-0 md:translate-y-0",
          "md:rounded-none md:border-t-0 md:border-r",
          "md:transition-[width] md:duration-300 md:ease-out",
          "md:data-[open=false]:border-r-0",
          "md:data-[open=true]:h-full",
          "md:data-[open=true]:w-1/3",
          "md:data-[open=true]:max-w-xl",
          "md:motion-reduce:transition-none",
        )}
      >
        {children}
      </aside>
    </EditorPanelContext.Provider>
  );
}
