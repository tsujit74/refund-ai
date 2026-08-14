import { z } from 'zod';
import { Order, IOrder } from '../models/Order';
import { AgentLog } from '../models/AgentLog';

// Input validation schema
const GetOrderDetailsInputSchema = z.object({
  orderId: z.string().describe('Order ID (e.g., ORD-1001)'),
});

type GetOrderDetailsInput = z.infer<typeof GetOrderDetailsInputSchema>;

// Output type
interface GetOrderDetailsOutput {
  success: boolean;
  order?: {
    orderId: string;
    customerId: string;
    productName: string;
    amount: number;
    orderDate: string;
    deliveryDate: string;
    status: string;
    refundable: boolean;
    refundStatus: string;
  };
  error?: string;
}

export async function getOrderDetails(
  params: GetOrderDetailsInput,
  sessionId: string
): Promise<GetOrderDetailsOutput> {
  try {
    // Validate input
    const validatedInput = GetOrderDetailsInputSchema.parse(params);

    // Log tool call started
    await AgentLog.create({
      sessionId,
      type: 'TOOL_CALL',
      tool: 'getOrderDetails',
      input: validatedInput,
      status: 'STARTED',
    });

    // Find order
    const order = await Order.findOne({ orderId: validatedInput.orderId });

    if (!order) {
      // Log tool call failed
      await AgentLog.create({
        sessionId,
        type: 'TOOL_RESULT',
        tool: 'getOrderDetails',
        input: validatedInput,
        output: { error: 'Order not found' },
        status: 'FAILED',
      });

      return {
        success: false,
        error: `Order ${validatedInput.orderId} was not found. Please provide a valid order ID.`,
      };
    }

    // Log tool call completed
    await AgentLog.create({
      sessionId,
      type: 'TOOL_RESULT',
      tool: 'getOrderDetails',
      input: validatedInput,
      output: {
        orderId: order.orderId,
        productName: order.productName,
        amount: order.amount,
        status: order.status,
        refundStatus: order.refundStatus,
      },
      status: 'COMPLETED',
    });

    return {
      success: true,
      order: {
        orderId: order.orderId,
        customerId: order.customerId.toString(),
        productName: order.productName,
        amount: order.amount,
        orderDate: order.orderDate.toISOString(),
        deliveryDate: order.deliveryDate.toISOString(),
        status: order.status,
        refundable: order.refundable,
        refundStatus: order.refundStatus,
      },
    };
  } catch (error) {
    // Log error
    await AgentLog.create({
      sessionId,
      type: 'ERROR',
      tool: 'getOrderDetails',
      input: params,
      output: { error: error instanceof Error ? error.message : 'Unknown error' },
      status: 'FAILED',
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve order details',
    };
  }
}

// Export schema for OpenAI tool definition
export const getOrderDetailsDefinition = {
  name: 'getOrderDetails',
  description: 'Retrieve order details by order ID',
  parameters: {
    type: 'object',
    properties: {
      orderId: {
        type: 'string',
        description: 'Order ID (e.g., ORD-1001)',
      },
    },
    required: ['orderId'],
    additionalProperties: false,
  },
};