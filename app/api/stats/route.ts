import { NextResponse } from 'next/server';
import { connectDB } from '@/src/lib/db';
import { Customer } from "@/src/models/Customer";
import { Order } from "@/src/models/Order";
import { AgentLog } from "@/src/models/AgentLog";


export async function GET() {
  try {
    await connectDB();

    const totalCustomers = await Customer.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    const refundRequests = await AgentLog.countDocuments({
      type: 'REQUEST_RECEIVED',
    });
    
    const approvedRefunds = await AgentLog.countDocuments({
      type: 'REFUND_APPROVED',
    });
    
    const deniedRefunds = await AgentLog.countDocuments({
      type: 'REFUND_DENIED',
    });

    return NextResponse.json({
      totalCustomers,
      totalOrders,
      refundRequests,
      approvedRefunds,
      deniedRefunds,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}