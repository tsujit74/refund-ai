'use client';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export function ChatMessage({
  role,
  content,
  timestamp,
}: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div
      className={`mb-5 flex items-end gap-2.5 ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {!isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 8.6 8.6 0 0 1-3.8-.9L3 21l1.9-4.9A8.5 8.5 0 1 1 21 11.5Z" />
            <path d="M8 12h.01M12 12h.01M16 12h.01" />
          </svg>
        </div>
      )}

      <div
        className={`max-w-[82%] sm:max-w-[70%] ${
          isUser ? 'items-end' : 'items-start'
        }`}
      >
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm ${
            isUser
              ? 'rounded-br-md bg-blue-600 text-white'
              : 'rounded-bl-md border border-slate-200 bg-white text-slate-800'
          }`}
        >
          <div className="whitespace-pre-wrap text-sm leading-6">
            {content}
          </div>
        </div>

        {timestamp && (
          <div
            className={`mt-1.5 px-1 text-[10px] text-slate-400 ${
              isUser ? 'text-right' : 'text-left'
            }`}
          >
            {timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-xs font-bold text-slate-600">
          You
        </div>
      )}
    </div>
  );
}