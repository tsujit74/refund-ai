import { NextResponse } from 'next/server';
import { connectDB } from '@/src/lib/db';
import { Customer } from '@/src/models/Customer';

export async function GET() {
  try {
    await connectDB();

    const customers = await Customer.find({})
      .select('-__v')
      .lean();

    return NextResponse.json({
      success: true,
      customers,
    });
  } catch (error) {
    console.error('Failed to fetch customers:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch customers',
      },
      { status: 500 }
    );
  }
}