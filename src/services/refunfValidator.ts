import { Order, IOrder } from '../models/Order';
import { RefundValidationResult } from '../types';


function getDaysSinceDelivery(deliveryDate: Date): number {
  const now = new Date();
  const delivery = new Date(deliveryDate);
  const diffMs = now.getTime() - delivery.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays;
}


export async function validateRefundEligibility(orderId: string): Promise<RefundValidationResult> {
  // Find the order
  const order = await Order.findOne({ orderId });

  if (!order) {
    return {
      eligible: false,
      reason: `Order ${orderId} was not found in our system.`,
      orderId,
    };
  }

  // Rule 5: Cancelled orders are always eligible
  if (order.status === 'CANCELLED') {
    return {
      eligible: true,
      reason: 'Order was cancelled before shipment. Full refund approved.',
      orderId,
    };
  }

  // Rule 4: Already refunded orders cannot be refunded again
  if (order.refundStatus === 'REFUNDED') {
    return {
      eligible: false,
      reason: 'This order has already been refunded. Duplicate refunds are not allowed.',
      orderId,
    };
  }

  // Rule 3: Non-refundable products cannot be refunded
  if (!order.refundable) {
    return {
      eligible: false,
      reason: 'This product is marked as non-refundable (digital download, gift card, or customized item).',
      orderId,
    };
  }

  // Rule 2: Order must be delivered
  if (order.status !== 'DELIVERED') {
    return {
      eligible: false,
      reason: `Order status is ${order.status}. Refunds can only be processed for delivered orders.`,
      orderId,
    };
  }

  // Rule 1: Must be within 30 days of delivery
  const daysSinceDelivery = getDaysSinceDelivery(order.deliveryDate);
  if (daysSinceDelivery > 30) {
    return {
      eligible: false,
      reason: `Order was delivered ${daysSinceDelivery} days ago. Refunds are only allowed within 30 days of delivery.`,
      orderId,
    };
  }

  // All rules passed - refund is eligible
  return {
    eligible: true,
    reason: `Order is eligible for refund. Delivered ${daysSinceDelivery} days ago (within 30-day window).`,
    orderId,
  };
}


export async function processRefund(orderId: string): Promise<{ success: boolean; message: string }> {
  const order = await Order.findOne({ orderId });

  if (!order) {
    return {
      success: false,
      message: `Order ${orderId} was not found.`,
    };
  }

  // Double-check: Don't process if already refunded
  if (order.refundStatus === 'REFUNDED') {
    return {
      success: false,
      message: 'This order has already been refunded.',
    };
  }

  // Update refund status
  order.refundStatus = 'REFUNDED';
  await order.save();

  return {
    success: true,
    message: `Refund of $${order.amount.toFixed(2)} for order ${orderId} has been processed successfully.`,
  };
}