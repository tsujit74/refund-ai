import { NextRequest } from 'next/server';
import { AgentLog } from '../../../models/AgentLog';
import { connectDB } from '../../../lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  const limit = parseInt(searchParams.get('limit') || '100');

  // Connect to database
  await connectDB();

  // Create encoder for SSE
  const encoder = new TextEncoder();

  // Create streaming response
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send initial connection message
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`)
        );

        // Fetch recent logs
        const query = sessionId ? { sessionId } : {};
        const logs = await AgentLog.find(query)
          .sort({ timestamp: -1 })
          .limit(limit);

        // Send existing logs
        for (const log of logs.reverse()) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'log',
              data: {
                id: log._id,
                sessionId: log.sessionId,
                type: log.type,
                tool: log.tool,
                input: log.input,
                output: log.output,
                status: log.status,
                timestamp: log.timestamp,
              },
            })}\n\n`)
          );
        }

        // Set up polling for new logs (simple approach)
        const pollInterval = setInterval(async () => {
          try {
            const query = sessionId ? { sessionId } : {};
            const newLogs = await AgentLog.find(query)
              .sort({ timestamp: -1 })
              .limit(10);

            if (newLogs.length > 0) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({
                  type: 'logs',
                  data: newLogs.map(log => ({
                    id: log._id,
                    sessionId: log.sessionId,
                    type: log.type,
                    tool: log.tool,
                    input: log.input,
                    output: log.output,
                    status: log.status,
                    timestamp: log.timestamp,
                  })),
                })}\n\n`)
              );
            }
          } catch (error) {
            console.error('Error polling logs:', error);
          }
        }, 2000); // Poll every 2 seconds

        // Clean up on close
        request.signal.addEventListener('abort', () => {
          clearInterval(pollInterval);
          controller.close();
        });
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}