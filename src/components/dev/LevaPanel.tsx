"use client";

import { IS_DEV } from "@/config/dev-prod";
import { Leva } from "leva";

/**
 * Renders the Leva debug panel conditionally based on IS_DEV.
 * This needs to be a client component because Leva uses React hooks/context.
 */
export function LevaPanel() {
  // Don't render anything in production to prevent any visual artifacts
  if (!IS_DEV) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-[9999] pointer-events-auto">
      <Leva 
        oneLineLabels 
        collapsed={true}
        hideCopyButton={true}
        titleBar={{
          title: "Debug",
          drag: false,
          filter: false
        }}
        theme={{
          sizes: {
            rootWidth: "280px",
            controlWidth: "160px"
          },
          colors: {
            elevation1: "rgba(255, 255, 255, 0.95)",
            elevation2: "rgba(248, 250, 252, 0.95)",
            elevation3: "rgba(241, 245, 249, 0.95)"
          }
        }}
      />
    </div>
  );
}
