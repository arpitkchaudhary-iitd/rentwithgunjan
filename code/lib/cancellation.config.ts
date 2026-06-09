/**
 * Cancellation Policy Config
 * ─────────────────────────────────────────────────────────────
 * Edit the tiers below to change the cancellation/refund rules.
 *
 * Each tier means: "if the customer cancels at least
 * `minDaysBeforePickup` days before the pickup date, they receive
 * a `refundPercent`% refund of the rental total (not the deposit)."
 *
 * Rules:
 * - List tiers from most generous to least (highest days first).
 * - The last tier should have minDaysBeforePickup: 0 to cover
 *   same-day and last-minute cancellations.
 * - refundPercent must be 0–100.
 */

export type CancellationTier = {
  minDaysBeforePickup: number;
  refundPercent: number;
  label: string;
  description: string;
};

export const CANCELLATION_POLICY: CancellationTier[] = [
  {
    minDaysBeforePickup: 14,
    refundPercent: 100,
    label: 'Full refund',
    description: 'Cancel 14 or more days before pickup — full rental total refunded.',
  },
  {
    minDaysBeforePickup: 7,
    refundPercent: 50,
    label: '50% refund',
    description: 'Cancel 7–13 days before pickup — 50% of the rental total refunded.',
  },
  {
    minDaysBeforePickup: 0,
    refundPercent: 0,
    label: 'No refund',
    description: 'Cancellations within 7 days of pickup receive no refund.',
  },
];

/** Returns the applicable refund tier for the given days-until-pickup. */
export function getRefundTier(daysUntilPickup: number): CancellationTier {
  const sorted = [...CANCELLATION_POLICY].sort(
    (a, b) => b.minDaysBeforePickup - a.minDaysBeforePickup,
  );
  return (
    sorted.find((t) => daysUntilPickup >= t.minDaysBeforePickup) ?? {
      minDaysBeforePickup: 0,
      refundPercent: 0,
      label: 'No refund',
      description: 'No refund applicable.',
    }
  );
}
