import { api } from "@/trpc/react";
import { authClient } from "@/server/auth/client";
import {
  type PreferenceKey,
  getDefaultPreferenceValue,
  type UserPreferences,
} from "@/types/user-preferences";

export function useUserSetting<K extends PreferenceKey>(
  key: K,
  defaultValue?: UserPreferences[K],
) {
  // Get the schema default if no explicit default was provided
  const finalDefaultValue = defaultValue ?? getDefaultPreferenceValue(key);

  // Check authentication status
  const { data: session } = authClient.useSession();
  const isAuthenticated = !!session?.user;

  const utils = api.useUtils();
  const { data, isLoading } = api.user.getSinglePreference.useQuery(
    {
      key,
      defaultValue:
        finalDefaultValue !== undefined ? finalDefaultValue : undefined,
    },
    { 
      enabled: isAuthenticated, // Only run query if user is authenticated
    },
  );

  const updatePreferenceMutation = api.user.updatePreference.useMutation({
    onSuccess: () => {
      utils.user.getSinglePreference.invalidate({ key });
    },
  });

  const setValue = (newValue: UserPreferences[K]) => {
    if (!isAuthenticated) {
      console.warn('Cannot update user preference: user not authenticated');
      return;
    }
    updatePreferenceMutation.mutate({
      key,
      value: newValue,
    });
  };

  return {
    value: data?.value ?? finalDefaultValue,
    setValue,
    isLoading: isAuthenticated ? isLoading : false,
    isUpdating: updatePreferenceMutation.isPending,
    isAuthenticated,
  };
}
