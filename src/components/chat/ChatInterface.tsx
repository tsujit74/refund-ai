'use client';

import { useEffect, useRef, useState } from 'react';
import { Customer, useCustomers } from './useCustomer';
import { CustomerSelector } from './CustomerSelector';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function ChatInterface() {
  const { customers, loading: customersLoading } = useCustomers();

  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages, loading]);

  const handleSend = async (content: string) => {
    if (!selectedCustomer) {
      setError('Please select a customer first.');
      return;
    }

    setError(null);
    setLoading(true);

    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          customerEmail: selectedCustomer.email,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from the AI agent.');
      }

      const data = await response.json();

      const assistantMessages = data.messages?.filter(
        (message: { role: string }) => message.role === 'assistant'
      );

      const lastMessage =
        assistantMessages?.[assistantMessages.length - 1];

      if (lastMessage?.content) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: lastMessage.content,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.';

      setError(errorMessage);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'I’m sorry, I couldn’t process your request right now. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (message: string) => {
    if (!loading && selectedCustomer) {
      handleSend(message);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 8.6 8.6 0 0 1-3.8-.9L3 21l1.9-4.9A8.5 8.5 0 1 1 21 11.5Z" />
                <path d="M8 12h.01M12 12h.01M16 12h.01" />
              </svg>
            </div>

            <div>
              <h1 className="text-base font-semibold text-slate-900">
                RefundAI
              </h1>

              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-slate-500">
                  AI Customer Support
                </span>
              </div>
            </div>
          </div>

          <div className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 sm:block">
            Agent online
          </div>
        </div>
      </header>

      {/* Customer */}
      <CustomerSelector
        customers={customers}
        selectedCustomer={selectedCustomer}
        onSelectCustomer={(customer) => {
          setSelectedCustomer(customer);
          setMessages([]);
          setError(null);
        }}
        loading={customersLoading}
      />

      {/* Messages */}
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
          {messages.length === 0 && !loading ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
                <svg
                  viewBox="0 0 24 24"
                  className="h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 8.6 8.6 0 0 1-3.8-.9L3 21l1.9-4.9A8.5 8.5 0 1 1 21 11.5Z" />
                  <path d="M8 12h.01M12 12h.01M16 12h.01" />
                </svg>
              </div>

              <h2 className="text-xl font-semibold text-slate-900">
                How can I help today?
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Ask about a refund, order status, or refund eligibility.
                The AI agent will check the customer and policy data before
                responding.
              </p>

              {!selectedCustomer && (
                <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  Select a customer above to start a conversation.
                </div>
              )}

              {selectedCustomer && (
                <div className="mt-7 flex flex-wrap justify-center gap-2">
                  {[
                    'I want a refund for my order',
                    'Am I eligible for a refund?',
                    'Why was my refund denied?',
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSuggestion(suggestion)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <ChatMessage
                  key={`${message.timestamp.getTime()}-${index}`}
                  role={message.role}
                  content={message.content}
                  timestamp={message.timestamp}
                />
              ))}

              {loading && (
                <div className="mb-5 flex justify-start">
                  <div className="flex max-w-[85%] items-center gap-3 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:300ms]" />
                    </div>

                    <span className="text-xs font-medium text-slate-500">
                      AI agent is checking your request...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </main>

      {/* Error */}
      {error && (
        <div className="mx-auto w-full max-w-4xl px-4 pb-2 sm:px-6">
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>⚠</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        disabled={loading || !selectedCustomer}
        placeholder={
          selectedCustomer
            ? 'Ask about a refund or order...'
            : 'Select a customer to start chatting'
        }
      />
    </div>
  );
}