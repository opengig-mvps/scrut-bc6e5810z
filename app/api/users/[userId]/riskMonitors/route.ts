import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const userId = parseInt(params.userId, 10);
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID' },
        { status: 400 },
      );
    }

    const riskMonitors = await prisma.riskMonitor.findMany({
      where: { userId },
      select: {
        id: true,
        riskStatus: true,
        riskTrends: true,
        alerts: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Risk monitor data retrieved successfully',
        data: riskMonitors,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error('Error retrieving risk monitor data:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: error },
      { status: 500 },
    );
  }
}