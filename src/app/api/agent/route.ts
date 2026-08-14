import { NextRequest, NextResponse } from 'next/server';
import { runAgent } from '../../../agent/agent';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, customerEmail } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Run the agent
    const result = await runAgent(message, customerEmail);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Agent API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}