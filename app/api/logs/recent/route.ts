import { NextResponse } from 'next/server';
import { connectDB } from "@/src/lib/db";
import { AgentLog } from '@/src/models/AgentLog';


export async function GET() {
  try {
    await connectDB();

    const logs = await AgentLog.find()
      .sort({ timestamp: -1 })
      .limit(100);

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}