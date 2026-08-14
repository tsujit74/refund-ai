export const REFUND_POLICY = {
  title: "E-Commerce Refund Policy",
  version: "1.0",
  lastUpdated: "2026-08-01",
  rules: [
    {
      id: 1,
      title: "30-Day Window",
      description: "Customers can request a refund within 30 days of delivery.",
      type: "time_based",
      maxDays: 30,
    },
    {
      id: 2,
      title: "Delivery Required",
      description:
        "The order must have been delivered. Pending or shipped orders cannot be refunded.",
      type: "status_based",
      requiredStatus: "DELIVERED",
    },
    {
      id: 3,
      title: "Non-Refundable Products",
      description:
        "Products marked as non-refundable (digital downloads, gift cards, customized items) cannot be refunded.",
      type: "product_based",
      excludedCategories: ["digital", "gift_card", "customized"],
    },
    {
      id: 4,
      title: "No Duplicate Refunds",
      description:
        "An order that has already been refunded cannot be refunded again.",
      type: "history_based",
      excludedRefundStatuses: ["REFUNDED"],
    },
    {
      id: 5,
      title: "Cancelled Orders",
      description:
        "Orders cancelled before shipment are eligible for a full refund regardless of time window.",
      type: "exception",
      cancelledOrderEligible: true,
    },
    {
      id: 6,
      title: "Maximum Refund Amount",
      description: "The maximum refund amount is the original order amount.",
      type: "amount_based",
      maxRefundPercentage: 100,
    },
  ],
};

export function getRefundPolicyText(): string {
  return `
REFUND POLICY (Version ${REFUND_POLICY.version})

1. Customers can request a refund within 30 days of delivery.

2. The order must have been delivered (status: DELIVERED).

3. Products marked as non-refundable cannot be refunded.
   - This includes: digital downloads, gift cards, customized items.

4. An order that has already been refunded cannot be refunded again.

5. Orders cancelled before shipment are eligible for a full refund.

6. The maximum refund amount is the original order amount.

7. Refund eligibility must be determined using the order information and these rules.
`.trim();
}
