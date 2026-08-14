import mongoose, { Document, Schema } from 'mongoose';

export type LogType =
   'REQUEST_RECEIVED'
   'INTENT_IDENTIFIED'
   'TOOL_CALL'
   'TOOL_RESULT'
   'VALIDATION_RESULT'
   'REFUND_APPROVED'
   'REFUND_DENIED'
   'PROCESS_REFUND'
   'AGENT_RESPONSE'
   'ERROR';

export type LogStatus = 'STARTED' | 'COMPLETED' | 'FAILED' | 'SKIPPED';

export interface IAgentLog extends Document {
  sessionId: string;
  type: LogType;
  tool?: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown> | string;
  status: LogStatus;
  timestamp: Date;
}

const AgentLogSchema = new Schema<IAgentLog>(
  {
    sessionId: {
      type: String,
      required: [true, 'Session ID is required'],
      index: true,
    },
    type: {
      type: String,
      enum: [
        'REQUEST_RECEIVED',
        'INTENT_IDENTIFIED',
        'TOOL_CALL',
        'TOOL_RESULT',
        'VALIDATION_RESULT',
        'REFUND_APPROVED',
        'REFUND_DENIED',
        'PROCESS_REFUND',
        'AGENT_RESPONSE',
        'ERROR',
      ],
      required: [true, 'Log type is required'],
    },
    tool: {
      type: String,
      trim: true,
    },
    input: {
      type: Schema.Types.Mixed,
    },
    output: {
      type: Schema.Types.Mixed,
    },
    status: {
      type: String,
      enum: ['STARTED', 'COMPLETED', 'FAILED', 'SKIPPED'],
      required: [true, 'Log status is required'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const AgentLog =
  mongoose.models.AgentLog || mongoose.model<IAgentLog>('AgentLog', AgentLogSchema);