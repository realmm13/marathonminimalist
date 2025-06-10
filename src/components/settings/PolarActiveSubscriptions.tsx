"use client";

import { PolarActiveSubscriptionCard } from "./PolarActiveSubscriptionCard";

// Union types (just the literals, no mixed string type)
type SubscriptionStatus = "active" | "canceled";

type BillingInterval = "month" | "year";

interface Subscription {
  id: string;
  status: "active" | "canceled";
  amount: number;
  currency: string;
  recurringInterval: "month" | "year";
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

interface PolarActiveSubscriptionsProps {
  subscriptions: Subscription[];
}

export function PolarActiveSubscriptions({
  subscriptions,
}: PolarActiveSubscriptionsProps) {
  if (!subscriptions || subscriptions.length === 0) {
    return (
      <p className="text-muted-foreground">No active subscriptions found.</p>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-md font-medium">Active Subscriptions</h4>
      {subscriptions.map((sub) => (
        <PolarActiveSubscriptionCard key={sub.id} subscription={sub} />
      ))}
    </div>
  );
}
