import { z } from 'zod';
import { Customer, ICustomer } from '../models/Customer';
import { AgentLog } from '../models/AgentLog';

// Input validation schema
const GetCustomerProfileInputSchema = z.object({
  customerId: z.string().optional().describe('Customer ID (MongoDB ObjectId)'),
  email: z.string().email().optional().describe('Customer email address'),
});

type GetCustomerProfileInput = z.infer<typeof GetCustomerProfileInputSchema>;

// Output type
interface GetCustomerProfileOutput {
  success: boolean;
  customer?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  error?: string;
}


export async function getCustomerProfile(
  params: GetCustomerProfileInput,
  sessionId: string
): Promise<GetCustomerProfileOutput> {
  try {
    // Validate input
    const validatedInput = GetCustomerProfileInputSchema.parse(params);

    if (!validatedInput.customerId && !validatedInput.email) {
      return {
        success: false,
        error: 'Either customerId or email must be provided',
      };
    }

    // Log tool call started
    await AgentLog.create({
      sessionId,
      type: 'TOOL_CALL',
      tool: 'getCustomerProfile',
      input: validatedInput,
      status: 'STARTED',
    });

    // Find customer
    let customer: ICustomer | null = null;

    if (validatedInput.customerId) {
      customer = await Customer.findById(validatedInput.customerId);
    } else if (validatedInput.email) {
      customer = await Customer.findOne({ email: validatedInput.email.toLowerCase() });
    }

    if (!customer) {
      // Log tool call failed
      await AgentLog.create({
        sessionId,
        type: 'TOOL_RESULT',
        tool: 'getCustomerProfile',
        input: validatedInput,
        output: { error: 'Customer not found' },
        status: 'FAILED',
      });

      return {
        success: false,
        error: 'Customer not found. Please provide a valid customer ID or email.',
      };
    }

    // Log tool call completed
    await AgentLog.create({
      sessionId,
      type: 'TOOL_RESULT',
      tool: 'getCustomerProfile',
      input: validatedInput,
      output: {
        id: customer._id.toString(),
        name: customer.name,
        email: customer.email,
      },
      status: 'COMPLETED',
    });

    return {
      success: true,
      customer: {
        id: customer._id.toString(),
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
    };
  } catch (error) {
    // Log error
    await AgentLog.create({
      sessionId,
      type: 'ERROR',
      tool: 'getCustomerProfile',
      input: params,
      output: { error: error instanceof Error ? error.message : 'Unknown error' },
      status: 'FAILED',
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve customer profile',
    };
  }
}

// Export schema for OpenAI tool definition
export const getCustomerProfileDefinition = {
  name: 'getCustomerProfile',
  description: 'Retrieve customer profile information by customer ID or email',
  parameters: {
    type: 'object',
    properties: {
      customerId: {
        type: 'string',
        description: 'Customer ID (MongoDB ObjectId)',
      },
      email: {
        type: 'string',
        format: 'email',
        description: 'Customer email address',
      },
    },
    required: [],
    additionalProperties: false,
  },
};