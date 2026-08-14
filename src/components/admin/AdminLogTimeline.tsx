'use client';

export interface LogEntry {
  _id: string;
  sessionId: string;
  type: string;
  tool?: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown> | string;
  status: string;
  timestamp: string;
}

interface LogTimelineProps {
  logs: LogEntry[];
  sessionId?: string;
}

const eventConfig: Record<
  string,
  {
    icon: string;
    color: string;
    label: string;
  }
> = {
  REQUEST_RECEIVED: {
    icon: '→',
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    label: 'Request received',
  },
  INTENT_IDENTIFIED: {
    icon: '◎',
    color: 'bg-violet-50 text-violet-600 border-violet-200',
    label: 'Intent identified',
  },
  TOOL_CALL: {
    icon: '⚙',
    color: 'bg-amber-50 text-amber-600 border-amber-200',
    label: 'Tool call',
  },
  TOOL_RESULT: {
    icon: '✓',
    color: 'bg-cyan-50 text-cyan-600 border-cyan-200',
    label: 'Tool result',
  },
  VALIDATION_RESULT: {
    icon: '◆',
    color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    label: 'Policy validation',
  },
  REFUND_APPROVED: {
    icon: '✓',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    label: 'Refund approved',
  },
  REFUND_DENIED: {
    icon: '×',
    color: 'bg-red-50 text-red-600 border-red-200',
    label: 'Refund denied',
  },
  PROCESS_REFUND: {
    icon: '$',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    label: 'Processing refund',
  },
  AGENT_RESPONSE: {
    icon: '✦',
    color: 'bg-purple-50 text-purple-600 border-purple-200',
    label: 'Agent response',
  },
  ERROR: {
    icon: '!',
    color: 'bg-red-50 text-red-600 border-red-200',
    label: 'Error',
  },
};

function getStatusClass(status: string) {
  switch (status) {
    case 'COMPLETED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';

    case 'FAILED':
      return 'bg-red-50 text-red-700 border-red-200';

    case 'STARTED':
      return 'bg-blue-50 text-blue-700 border-blue-200';

    case 'SKIPPED':
      return 'bg-gray-100 text-gray-500 border-gray-200';

    default:
      return 'bg-gray-100 text-gray-500 border-gray-200';
  }
}

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatOutput(
  output?: Record<string, unknown> | string
): string {
  if (!output) return '';

  if (typeof output === 'string') {
    return output;
  }

  if (output.eligible !== undefined) {
    const eligible = output.eligible
      ? 'Refund eligible'
      : 'Refund not eligible';

    const reason = output.reason;

    return reason
      ? `${eligible} — ${String(reason)}`
      : eligible;
  }

  if (output.success !== undefined) {
    const message = output.message;

    return output.success
      ? `Success${message ? ` — ${String(message)}` : ''}`
      : `Failed${message ? ` — ${String(message)}` : ''}`;
  }

  return JSON.stringify(output);
}

export function LogTimeline({
  logs,
  sessionId,
}: LogTimelineProps) {
  const filteredLogs = sessionId
    ? logs.filter((log) => log.sessionId === sessionId)
    : logs;

  const sortedLogs = [...filteredLogs].sort(
    (a, b) =>
      new Date(a.timestamp).getTime() -
      new Date(b.timestamp).getTime()
  );

  if (sortedLogs.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl text-gray-400">
            ◌
          </div>

          <p className="font-medium text-gray-700">
            No execution logs
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Agent activity will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute bottom-5 left-[19px] top-5 w-px bg-gray-200" />

      <div className="space-y-5">
        {sortedLogs.map((log) => {
          const config = eventConfig[log.type] ?? {
            icon: '•',
            color: 'bg-gray-100 text-gray-500 border-gray-200',
            label: log.type,
          };

          const output = formatOutput(log.output);

          return (
            <div
              key={log._id}
              className="relative flex gap-4"
            >
              <div
                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-semibold ${config.color}`}
              >
                {config.icon}
              </div>

              <div className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {config.label}
                  </span>

                  {log.tool && (
                    <span className="rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 font-mono text-[11px] text-gray-600">
                      {log.tool}
                    </span>
                  )}

                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${getStatusClass(
                      log.status
                    )}`}
                  >
                    {log.status}
                  </span>

                  <span className="ml-auto text-xs text-gray-400">
                    {formatTime(log.timestamp)}
                  </span>
                </div>

                {output && (
                  <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                    <p className="break-words text-xs leading-5 text-gray-600">
                      {output}
                    </p>
                  </div>
                )}

                <div className="mt-3 text-[10px] text-gray-400">
                  Session: {log.sessionId}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}