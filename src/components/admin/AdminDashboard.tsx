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
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />

          <p className="text-sm text-zinc-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-6">
        <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
            !
          </div>

          <h2 className="text-lg font-semibold text-white">
            Dashboard unavailable
          </h2>

          <p className="mt-2 text-sm text-zinc-400">
            {error}
          </p>

          <button
            onClick={() => fetchData(true)}
            className="mt-5 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute left-1/3 top-0 h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-violet-500/5 blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black font-bold">
              R
            </div>

            <div>
              <h1 className="text-sm font-semibold tracking-tight">
                RefundAI
              </h1>

              <p className="text-xs text-zinc-500">
                Agent Operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {error && (
              <span className="hidden text-xs text-amber-400 sm:block">
                Update failed
              </span>
            )}

            <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>

              <span className="text-xs font-medium text-emerald-400">
                Agent online
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 mx-auto max-w-[1600px] px-6 py-8">
        {/* Page heading */}
        <div className="mb-8">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
            Overview
          </p>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">
                Agent Dashboard
              </h2>

              <p className="mt-2 max-w-2xl text-sm text-zinc-500">
                Monitor refund requests, policy decisions, tool
                execution, and agent activity in real time.
              </p>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-xs text-zinc-500">
              Auto-refreshing every 5s
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="mb-8">
            <Stats stats={stats} />
          </div>
        )}

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          {/* Sessions */}
          <aside className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50">
            <div className="border-b border-zinc-800 px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">
                    Sessions
                  </h3>

                  <p className="mt-1 text-xs text-zinc-500">
                    Recent agent activity
                  </p>
                </div>

                <span className="rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-400">
                  {sessions.length}
                </span>
              </div>
            </div>

            <div className="max-h-[650px] overflow-y-auto p-2">
              {/* All sessions */}
              <button
                onClick={() => setSelectedSession(null)}
                className={`mb-1 w-full rounded-xl px-3 py-3 text-left transition ${
                  !selectedSession
                    ? 'bg-white text-black'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    All activity
                  </span>

                  <span className="text-xs opacity-60">
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
                    className={`mb-1 w-full rounded-xl px-3 py-3 text-left transition ${
                      active
                        ? 'bg-blue-500/10 ring-1 ring-blue-500/20'
                        : 'hover:bg-zinc-800/70'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs ${
                          active
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        AI
                      </div>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-xs font-medium ${
                            active
                              ? 'text-blue-300'
                              : 'text-zinc-300'
                          }`}
                        >
                          {session.sessionId}
                        </p>

                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-[11px] text-zinc-600">
                            {session.logs.length} events
                          </span>

                          <span className="text-[11px] text-zinc-600">
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
          <section className="min-w-0 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50">
            <div className="flex flex-col gap-3 border-b border-zinc-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold">
                  Execution Timeline
                </h3>

                <p className="mt-1 text-xs text-zinc-500">
                  {selectedSession
                    ? `Showing events for ${selectedSession}`
                    : 'Live agent execution events'}
                </p>
              </div>

              {selectedSession && (
                <button
                  onClick={() => setSelectedSession(null)}
                  className="w-fit rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:border-zinc-600 hover:text-white"
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
      </main>
    </div>
  );
}