import { OpenAI } from 'openai';

// Import all tools
import { getCustomerProfile, getCustomerProfileDefinition } from '../tools/getCustomerProfile';
import { getOrderDetails, getOrderDetailsDefinition } from '../tools/getOrderDetails';
import { getRefundPolicy, getRefundPolicyDefinition } from '../tools/getRefundPolicy';
import { validateRefundEligibility, validateRefundEligibilityDefinition } from '../tools/validateRefundEligibility';
import { processRefund, processRefundDefinition } from '../tools/processRefund';

// Tool definitions for OpenAI
export const toolDefinitions: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: getCustomerProfileDefinition,
  },
  {
    type: 'function',
    function: getOrderDetailsDefinition,
  },
  {
    type: 'function',
    function: getRefundPolicyDefinition,
  },
  {
    type: 'function',
    function: validateRefundEligibilityDefinition,
  },
  {
    type: 'function',
    function: processRefundDefinition,
  },
];

// Tool execution map
export const toolExecutors: Record<string, Function> = {
  getCustomerProfile,
  getOrderDetails,
  getRefundPolicy,
  validateRefundEligibility,
  processRefund,
};


export async function executeTool(
  toolName: string,
  toolArgs: Record<string, unknown>,
  sessionId: string
): Promise<unknown> {
  const executor = toolExecutors[toolName];

  if (!executor) {
    throw new Error(`Unknown tool: ${toolName}`);
  }

  return executor(toolArgs, sessionId);
}