import { z } from 'zod';
import { AgentLog } from '../models/AgentLog';
import { getRefundPolicyText } from '../lib/refundPolicy';

// Input validation schema (no parameters needed)
const GetRefundPolicyInputSchema = z.object({});

type GetRefundPolicyInput = z.infer<typeof GetRefundPolicyInputSchema>;

// Output type
interface GetRefundPolicyOutput {
  success: boolean;
  policy?: string;
  error?: string;
}

/**
 * Tool: Get Refund Policy
 * 
 * Returns the complete refund policy document.
 * Used by the agent to understand refund rules and explain them to customers.
 * 
 * @param params - Empty object (no parameters needed)
 * @param sessionId - For logging purposes
 * @returns Refund policy text
 */
export async function getRefundPolicy(
  params: GetRefundPolicyInput,
  sessionId: string
): Promise<GetRefundPolicyOutput> {
  try {
    // Validate input
    const validatedInput = GetRefundPolicyInputSchema.parse(params);

    // Log tool call started
    await AgentLog.create({
      sessionId,
      type: 'TOOL_CALL',
      tool: 'getRefundPolicy',
      input: validatedInput,
      status: 'STARTED',
    });

    // Get policy text
    const policyText = getRefundPolicyText();

    // Log tool call completed
    await AgentLog.create({
      sessionId,
      type: 'TOOL_RESULT',
      tool: 'getRefundPolicy',
      input: validatedInput,
      output: { policyLength: policyText.length },
      status: 'COMPLETED',
    });

    return {
      success: true,
      policy: policyText,
    };
  } catch (error) {
    // Log error
    await AgentLog.create({
      sessionId,
      type: 'ERROR',
      tool: 'getRefundPolicy',
      input: params,
      output: { error: error instanceof Error ? error.message : 'Unknown error' },
      status: 'FAILED',
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve refund policy',
    };
  }
}

// Export schema for OpenAI tool definition
export const getRefundPolicyDefinition = {
  name: 'getRefundPolicy',
  description: 'Retrieve the complete refund policy document with all rules and conditions',
  parameters: {
    type: 'object',
    properties: {},
    additionalProperties: false,
  },
};