import mongoose, { Document, Schema } from 'mongoose';

export type OrderStatus = 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type RefundStatus = 'NONE' | 'REQUESTED' | 'APPROVED' | 'REFUNDED' | 'DENIED';

export interface IOrder extends Document {
  orderId: string;
  customerId: mongoose.Types.ObjectId;
  productName: string;
  amount: number;
  orderDate: Date;
  deliveryDate: Date;
  status: OrderStatus;
  refundable: boolean;
  refundStatus: RefundStatus;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderId: {
      type: String,
      required: [true, 'Order ID is required'],
      unique: true,
      uppercase: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer ID is required'],
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Order amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    orderDate: {
      type: Date,
      required: [true, 'Order date is required'],
    },
    deliveryDate: {
      type: Date,
      required: [true, 'Delivery date is required'],
    },
    status: {
      type: String,
      enum: ['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
      required: [true, 'Order status is required'],
    },
    refundable: {
      type: Boolean,
      default: true,
    },
    refundStatus: {
      type: String,
      enum: ['NONE', 'REQUESTED', 'APPROVED', 'REFUNDED', 'DENIED'],
      default: 'NONE',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster orderId lookups
OrderSchema.index({ orderId: 1 });
OrderSchema.index({ customerId: 1 });

export const Order =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);