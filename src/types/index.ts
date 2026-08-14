// Customer
export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
}

// Order
export interface Order {
  _id: string;
  orderId: string;
  customerId: string;
  productName: string;
  amount: number;
  orderDate: Date;
  deliveryDate: Date;
  status: "PENDING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  refundable: boolean;
  refundStatus: "NONE" | "REQUESTED" | "APPROVED" | "REFUNDED" | "DENIED";
}

// Agent Log
export type LogType = "REQUEST_RECEIVED";
("INTENT_IDENTIFIED");
("TOOL_CALL");
("TOOL_RESULT");
("VALIDATION_RESULT");
("REFUND_APPROVED");
("REFUND_DENIED");
("PROCESS_REFUND");
("AGENT_RESPONSE");
("ERROR");

export interface AgentLog {
  _id: string;
  sessionId: string;
  type: LogType;
  tool?: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown> | string;
  status: "STARTED" | "COMPLETED" | "FAILED" | "SKIPPED";
  timestamp: Date;
}

// Tool definitions
export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

// Refund validation result
export interface RefundValidationResult {
  eligible: boolean;
  reason: string;
  orderId: string;
}
