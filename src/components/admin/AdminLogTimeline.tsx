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
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    label: 'Request received',
  },
  INTENT_IDENTIFIED: {
    icon: '◎',
    color: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    label: 'Intent identified',
  },
  TOOL_CALL: {
    icon: '⚙',
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    label: 'Tool call',
  },
  TOOL_RESULT: {
    icon: '✓',
    color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    label: 'Tool result',
  },
  VALIDATION_RESULT: {
    icon: '◆',
    color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    label: 'Policy validation',
  },
  REFUND_APPROVED: {
    icon: '✓',
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    label: 'Refund approved',
  },
  REFUND_DENIED: {
    icon: '×',
    color: 'bg-red-500/10 text-red-400 border-red-500/20',
    label: 'Refund denied',
  },
  PROCESS_REFUND: {
    icon: '$',
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    label: 'Processing refund',
  },
  AGENT_RESPONSE: {
    icon: '✦',
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    label: 'Agent response',
  },
  ERROR: {
    icon: '!',
    color: 'bg-red-500/10 text-red-400 border-red-500/20',
    label: 'Error',
  },
};

function getStatusClass(status: string) {
  switch (status) {
    case 'COMPLETED':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

    case 'FAILED':
      return 'bg-red-500/10 text-red-400 border-red-500/20';

    case 'STARTED':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';

    case 'SKIPPED':
      return 'bg-zinc-800 text-zinc-400 border-zinc-700';

    default:
      return 'bg-zinc-800 text-zinc-400 border-zinc-700';
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
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800 text-xl">
            ◌
          </div>

          <p className="font-medium text-zinc-300">
            No execution logs
          </p>

          <p className="mt-1 text-sm text-zinc-500">
            Agent activity will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute bottom-5 left-[19px] top-5 w-px bg-zinc-800" />

      <div className="space-y-5">
        {sortedLogs.map((log) => {
          const config = eventConfig[log.type] ?? {
            icon: '•',
            color:
              'bg-zinc-800 text-zinc-400 border-zinc-700',
            label: log.type,
          };

          const output = formatOutput(log.output);

          return (
            <div
              key={log._id}
              className="relative flex gap-4"
            >
              {/* Icon */}
              <div
                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-semibold ${config.color}`}
              >
                {config.icon}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 transition-colors hover:border-zinc-700">
                {/* Header */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-white">
                    {config.label}
                  </span>

                  {log.tool && (
                    <span className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-0.5 font-mono text-[11px] text-zinc-300">
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

                  <span className="ml-auto text-xs text-zinc-500">
                    {formatTime(log.timestamp)}
                  </span>
                </div>

                {/* Output */}
                {output && (
                  <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-950/70 px-3 py-2.5">
                    <p className="break-words text-xs leading-5 text-zinc-400">
                      {output}
                    </p>
                  </div>
                )}

                {/* Session */}
                <div className="mt-3 text-[10px] text-zinc-600">
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