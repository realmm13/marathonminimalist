import React from "react";
import { toast } from "sonner";
import { EditProfileForm, type EditProfileFormValues } from "./EditProfileForm";
import { api } from "@/trpc/react";
import { Spinner } from "@/components/Spinner";

interface EditProfileFormWithDataProps {
  onSubmit?: (data: EditProfileFormValues) => Promise<void>;
  close?: () => void;
  hideSaveButton?: boolean;
}

export const EditProfileFormWithData: React.FC<
  EditProfileFormWithDataProps
> = ({ onSubmit: externalOnSubmit, close, hideSaveButton = false }) => {
  const updateProfileMutation = api.user.updateProfile.useMutation();
  const { data: user, isFetching } =
    api.user.getUserForSimpleProfile.useQuery(
      undefined,
      {
        gcTime: 0,
        staleTime: 0,
      },
    );

  const utils = api.useUtils();

  if (isFetching || !user) {
    return <Spinner />;
  }

  const handleSubmit = async (values: EditProfileFormValues) => {
    // For the simplified profile form, we only need to update the name
    // The updateProfile mutation will handle preserving other fields
    const updateData = {
      name: values.name,
    };

    try {
      await updateProfileMutation.mutateAsync(updateData);
      await utils.user.getCurrentUser.invalidate();
      await utils.user.getUserForEditingProfile.invalidate();
      await utils.user.getUserForSimpleProfile.invalidate();

      if (externalOnSubmit) {
        await externalOnSubmit(values);
      } else if (close) {
        close();
      }

      toast.success("Success!", {
        description: "Profile updated!",
      });
      close?.();
    } catch (error) {
      console.error("Failed to update profile:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error("Failed to update profile", {
        description: errorMessage,
      });
    }
  };

  return (
    <EditProfileForm
      key={user.id}
      initialValues={user}
      onSubmit={handleSubmit}
      isSubmitting={updateProfileMutation.isPending}
      onCancel={close}
      hideSaveButton={hideSaveButton}
    />
  );
};

export default EditProfileFormWithData;
