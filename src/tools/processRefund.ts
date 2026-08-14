import { z } from 'zod';
import { AgentLog } from '../models/AgentLog';
import { 
    processRefund as processRefundService,
 } from '../services/refunfValidator';

// Input validation schema
const ProcessRefundInputSchema = z.object({
  orderId: z.string().describe('Order ID to refund (e.g., ORD-1001)'),
});

type ProcessRefundInput = z.infer<typeof ProcessRefundInputSchema>;

// Output type
interface ProcessRefundOutput {
  success: boolean;
  message: string;
  orderId: string;
}


export async function processRefund(
  params: ProcessRefundInput,
  sessionId: string
): Promise<ProcessRefundOutput> {
  try {
    // Validate input
    const validatedInput = ProcessRefundInputSchema.parse(params);

    // Log tool call started
    await AgentLog.create({
      sessionId,
      type: 'TOOL_CALL',
      tool: 'processRefund',
      input: validatedInput,
      status: 'STARTED',
    });

    
    // This is a safety check - the agent should have already validated
    const { validateRefundEligibility } = await import('./validateRefundEligibility');
    const eligibility = await validateRefundEligibility(validatedInput, sessionId);

    if (!eligibility.eligible) {
      // Log skipped (not eligible)
      await AgentLog.create({
        sessionId,
        type: 'PROCESS_REFUND',
        tool: 'processRefund',
        input: validatedInput,
        output: { skipped: true, reason: eligibility.reason },
        status: 'SKIPPED',
      });

      return {
        success: false,
        message: `Cannot process refund: ${eligibility.reason}`,
        orderId: validatedInput.orderId,
      };
    }

    // Process the refund
    const result = await processRefundService(validatedInput.orderId);

    // Log tool call completed
    await AgentLog.create({
      sessionId,
      type: 'PROCESS_REFUND',
      tool: 'processRefund',
      input: validatedInput,
      output: { success: result.success, message: result.message },
      status: result.success ? 'COMPLETED' : 'FAILED',
    });

    return {
      success: result.success,
      message: result.message,
      orderId: validatedInput.orderId,
    };
  } catch (error) {
    // Log error
    await AgentLog.create({
      sessionId,
      type: 'ERROR',
      tool: 'processRefund',
      input: params,
      output: { error: error instanceof Error ? error.message : 'Unknown error' },
      status: 'FAILED',
    });

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to process refund',
      orderId: params.orderId,
    };
  }
}

// Export schema for OpenAI tool definition
export const processRefundDefinition = {
  name: 'processRefund',
  description: 'Process a refund for an order. Should only be called after validateRefundEligibility confirms the order is eligible.',
  parameters: {
    type: 'object',
    properties: {
      orderId: {
        type: 'string',
        description: 'Order ID to refund (e.g., ORD-1001)',
      },
    },
    required: ['orderId'],
    additionalProperties: false,
  },
};