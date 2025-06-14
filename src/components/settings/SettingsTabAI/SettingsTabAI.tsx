"use client";

import * as React from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { SettingsAiProviderCard } from "./SettingsAiProviderCard";
import { AI_PROVIDERS, ENABLED_AI_PROVIDERS } from "@/config/ai-providers";
import { useUserSetting } from "@/hooks/useUserSetting";
import { type PreferenceKey } from "@/types/user-preferences";

export function SettingsTabAI() {
  // Reference for auto-animation
  const [animateRef] = useAutoAnimate();

  // Filter providers to only show the enabled ones from config
  const filteredProviders = AI_PROVIDERS.filter((provider) =>
    ENABLED_AI_PROVIDERS.includes(provider.id),
  );

  // Create a mapping of provider states - we'll need to handle this differently
  // For now, let's create the provider states without the enabled check
  const providerStates = filteredProviders.map((provider) => ({
    ...provider,
    isEnabled: false, // We'll fix this with a proper solution
  }));

  // Sort providers with enabled ones at the top
  const sortedProviders = [...providerStates].sort((a, b) => {
    if (a.isEnabled && !b.isEnabled) return -1;
    if (!a.isEnabled && b.isEnabled) return 1;
    return 0;
  });

  return (
    <SettingsPanel
      title="AI Providers"
      description="Connect your AI model providers to the platform. Enable the providers you want to use and add your API keys."
    >
      <div className="space-y-4" ref={animateRef}>
        {sortedProviders.map((provider) => (
          <SettingsAiProviderCard
            key={provider.id}
            providerId={provider.id}
            name={provider.name}
            description={provider.description}
            capabilities={provider.capabilities}
          />
        ))}
      </div>
    </SettingsPanel>
  );
}
