import { z } from "zod";
import { AgentLog } from "../models/AgentLog";
import {
  validateRefundEligibility as validateRefund,
} from "../services/refunfValidator";
import { RefundValidationResult } from "../types";

// Input validation schema
const ValidateRefundEligibilityInputSchema = z.object({
  orderId: z.string().describe('Order ID to validate (e.g., ORD-1001)'),
});

type ValidateRefundEligibilityInput = z.infer<typeof ValidateRefundEligibilityInputSchema>;

// Output type (same as RefundValidationResult)
interface ValidateRefundEligibilityOutput extends RefundValidationResult {}

export async function validateRefundEligibility(
  params: ValidateRefundEligibilityInput,
  sessionId: string
): Promise<ValidateRefundEligibilityOutput> {
  try {
    // Validate input
    const validatedInput = ValidateRefundEligibilityInputSchema.parse(params);

    // Log tool call started
    await AgentLog.create({
      sessionId,
      type: 'TOOL_CALL',
      tool: 'validateRefundEligibility',
      input: validatedInput,
      status: 'STARTED',
    });

    // Perform validation (deterministic business logic)
    const result = await validateRefund(validatedInput.orderId);

    // Log validation result
    await AgentLog.create({
      sessionId,
      type: 'VALIDATION_RESULT',
      tool: 'validateRefundEligibility',
      input: validatedInput,
      output: {
        eligible: result.eligible,
        reason: result.reason,
      },
      status: 'COMPLETED',
    });

    // Log refund approved/denied
    if (result.eligible) {
      await AgentLog.create({
        sessionId,
        type: 'REFUND_APPROVED',
        tool: 'validateRefundEligibility',
        input: validatedInput,
        output: { reason: result.reason },
        status: 'COMPLETED',
      });
    } else {
      await AgentLog.create({
        sessionId,
        type: 'REFUND_DENIED',
        tool: 'validateRefundEligibility',
        input: validatedInput,
        output: { reason: result.reason },
        status: 'COMPLETED',
      });
    }

    return result;
  } catch (error) {
    // Log error
    await AgentLog.create({
      sessionId,
      type: 'ERROR',
      tool: 'validateRefundEligibility',
      input: params,
      output: { error: error instanceof Error ? error.message : 'Unknown error' },
      status: 'FAILED',
    });

    return {
      eligible: false,
      reason: error instanceof Error ? error.message : 'Validation failed due to an error',
      orderId: params.orderId,
    };
  }
}

// Export schema for OpenAI tool definition
export const validateRefundEligibilityDefinition = {
  name: 'validateRefundEligibility',
  description: 'Validate if an order is eligible for refund based on policy rules. Returns eligible (boolean) and reason (string).',
  parameters: {
    type: 'object',
    properties: {
      orderId: {
        type: 'string',
        description: 'Order ID to validate (e.g., ORD-1001)',
      },
    },
    required: ['orderId'],
    additionalProperties: false,
  },
};