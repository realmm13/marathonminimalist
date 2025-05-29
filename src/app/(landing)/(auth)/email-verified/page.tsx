"use client";

import { CustomButton } from "@/components/CustomButton";
import { authClient } from "@/server/auth/client";
import { Spinner } from "@/components/Spinner";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EmailVerifiedPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = use(searchParams);
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // If user is authenticated and no error, redirect to dashboard
    if (session?.user && !error && !isRedirecting) {
      setIsRedirecting(true);
      // Use window.location.href to avoid Next.js caching issues
      window.location.href = "/";
    }
  }, [session?.user, error, isRedirecting]);

  if (error) {
    return (
      <div className="flex grow flex-col items-center justify-center p-4">
        <h1 className="mb-4 text-2xl font-bold text-red-500">
          Error verifying email 🥲
        </h1>
        <CustomButton href="/signin">Try again</CustomButton>
      </div>
    );
  }

  // Show loading state while checking authentication or redirecting
  if (isPending || isRedirecting) {
    return (
      <div className="flex grow flex-col items-center justify-center p-4">
        <div className="mb-4">
          <Spinner size="lg" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-green-500">
          Email Verified!
        </h1>
        <p className="text-gray-600">
          {isRedirecting ? "Redirecting to dashboard..." : "Signing you in..."}
        </p>
      </div>
    );
  }

  // If not authenticated after loading, show manual login option
  return (
    <div className="flex grow flex-col items-center justify-center p-4">
      <h1 className="mb-4 text-2xl font-bold text-green-500">
        Email Verified!
      </h1>
      <p className="mb-4 text-gray-600">
        Your email has been successfully verified.
      </p>
      <CustomButton href="/signin">Continue to Login</CustomButton>
    </div>
  );
}
