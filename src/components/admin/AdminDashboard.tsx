'use client';

import { useEffect, useMemo, useState } from 'react';
import { Stats, StatsData } from './Stats';
import { LogTimeline, LogEntry } from './AdminLogTimeline';

export function AdminDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] =
    useState<string | null>(null);

  async function fetchData(showLoading = false) {
    try {
      if (showLoading) {
        setLoading(true);
      }

      const [statsRes, logsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/logs/recent'),
      ]);

      if (!statsRes.ok || !logsRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const [statsData, logsData] = await Promise.all([
        statsRes.json(),
        logsRes.json(),
      ]);

      setStats(statsData);
      setLogs(logsData);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load dashboard'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData(true);

    const interval = setInterval(() => {
      fetchData(false);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const sessions = useMemo(() => {
    const grouped = new Map<string, LogEntry[]>();

    logs.forEach((log) => {
      if (!grouped.has(log.sessionId)) {
        grouped.set(log.sessionId, []);
      }

      grouped.get(log.sessionId)!.push(log);
    });

    return Array.from(grouped.entries())
      .map(([sessionId, sessionLogs]) => ({
        sessionId,
        logs: sessionLogs,
        timestamp: sessionLogs[0]?.timestamp,
      }))
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() -
          new Date(a.timestamp).getTime()
      );
  }, [logs]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />

          <p className="text-sm text-gray-500">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md rounded-xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
            !
          </div>

          <h2 className="text-lg font-semibold text-gray-900">
            Dashboard unavailable
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {error}
          </p>

          <button
            onClick={() => fetchData(true)}
            className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
              R
            </div>

            <div>
              <h1 className="text-sm font-semibold text-gray-900">
                RefundAI
              </h1>

              <p className="text-xs text-gray-500">
                Agent Operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {error && (
              <span className="hidden text-xs text-amber-600 sm:block">
                Last update failed
              </span>
            )}

            <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <span className="text-xs font-medium text-emerald-700">
                Agent online
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-6 py-8">
        {/* Heading */}
        <div className="mb-8">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-blue-600">
            Operations
          </p>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-gray-900">
                Refund Agent Dashboard
              </h2>

              <p className="mt-2 max-w-2xl text-sm text-gray-500">
                Monitor customer requests, refund decisions,
                policy validation, tool execution, and agent
                responses.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-500 shadow-sm">
              Updates every 5 seconds
            </div>
          </div>
        </div>

        {/* Overview */}
        {stats && (
          <section className="mb-8">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-gray-900">
                Overview
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Customer, order, and refund activity.
              </p>
            </div>

            <Stats stats={stats} />
          </section>
        )}

        {/* Agent activity */}
        <section>
          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-900">
              Agent Activity
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Follow each request through intent detection,
              tools, validation, and final response.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
            {/* Sessions */}
            <aside className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      Sessions
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      Recent requests
                    </p>
                  </div>

                  <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600">
                    {sessions.length}
                  </span>
                </div>
              </div>

              <div className="max-h-[650px] overflow-y-auto p-2">
                <button
                  onClick={() => setSelectedSession(null)}
                  className={`mb-1 w-full rounded-lg px-3 py-3 text-left transition ${
                    !selectedSession
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      All activity
                    </span>

                    <span className="text-xs opacity-70">
                      {logs.length}
                    </span>
                  </div>
                </button>

                {sessions.map((session) => {
                  const active =
                    selectedSession === session.sessionId;

                  return (
                    <button
                      key={session.sessionId}
                      onClick={() =>
                        setSelectedSession(session.sessionId)
                      }
                      className={`mb-1 w-full rounded-lg px-3 py-3 text-left transition ${
                        active
                          ? 'bg-blue-50 ring-1 ring-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-medium ${
                            active
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          AI
                        </div>

                        <div className="min-w-0 flex-1">
                          <p
                            className={`truncate text-xs font-medium ${
                              active
                                ? 'text-blue-700'
                                : 'text-gray-700'
                            }`}
                          >
                            {session.sessionId}
                          </p>

                          <div className="mt-1 flex items-center justify-between">
                            <span className="text-[11px] text-gray-400">
                              {session.logs.length} events
                            </span>

                            <span className="text-[11px] text-gray-400">
                              {new Date(
                                session.timestamp
                              ).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Timeline */}
            <section className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Execution Timeline
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    {selectedSession
                      ? `Events for ${selectedSession}`
                      : 'Live agent execution events'}
                  </p>
                </div>

                {selectedSession && (
                  <button
                    onClick={() => setSelectedSession(null)}
                    className="w-fit rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                  >
                    Clear filter
                  </button>
                )}
              </div>

              <div className="max-h-[700px] overflow-y-auto p-5">
                <LogTimeline
                  logs={logs}
                  sessionId={selectedSession || undefined}
                />
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}