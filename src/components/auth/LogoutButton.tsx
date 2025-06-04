"use client";

import { useLogout } from "@/hooks/useLogout";

export function LogoutButton() {
  const { logout } = useLogout();

  return (
    <button
      onClick={() => logout()}
      className="rounded bg-destructive px-4 py-2 text-destructive-foreground hover:bg-destructive/90 dark:bg-destructive dark:text-destructive-foreground dark:hover:bg-destructive/90"
    >
      Logout
    </button>
  );
}
