"use client";

import * as React from "react";
import { useDialog } from "@/components/DialogManager";
import { SettingsModal } from "@/components/settings/SettingsModal";

export function useSettingsDialog() {
  const dialog = useDialog();

  const openSettings = React.useCallback((defaultTab?: string) => {
    dialog.openDialog({
      size: "xl",
      showCancel: false,
      showCloseButton: false,
      component: ({ close }: { close: () => void }) => (
        <SettingsModal
          open={true}
          onOpenChange={(open) => {
            if (!open) close();
          }}
          defaultTab={defaultTab}
        />
      ),
    });
  }, [dialog]);

  return { openSettings };
}
