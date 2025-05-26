"use client";

import React from "react";
import { SettingsPanel } from "./SettingsPanel";
import { MarathonTrainingSettings } from "./MarathonTrainingSettings";

export function SettingsTabMarathonTraining() {
  return (
    <SettingsPanel
      title="Marathon Training"
      description="Configure your marathon training preferences, goals, and workout schedule."
    >
      <MarathonTrainingSettings />
    </SettingsPanel>
  );
} 