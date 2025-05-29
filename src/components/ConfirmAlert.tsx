"use client";
import React from "react";
import { Alert, type AlertProps } from "./Alert";
import {
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

export interface ConfirmAlertProps extends Omit<AlertProps, "children"> {
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
}

export const ConfirmAlert = React.memo(
  ({
    open,
    onOpenChange,
    title = "Confirm",
    description,
    variant = "default",
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
  }: ConfirmAlertProps) => {
    const handleConfirm = () => {
      onConfirm();
      onOpenChange(false);
    };

    return (
      <Alert
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        description={description}
        variant={variant}
      >
        <AlertDialogCancel className="button-ghost hover:bg-muted/50 transition-all duration-200">
          {cancelLabel}
        </AlertDialogCancel>
        <AlertDialogAction
          onClick={handleConfirm}
          className={
            variant === "destructive"
              ? "bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              : "button-primary shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          }
        >
          {confirmLabel}
        </AlertDialogAction>
      </Alert>
    );
  },
);

ConfirmAlert.displayName = "ConfirmAlert";
