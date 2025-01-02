import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from "@/lib/authOptions";

type RiskAssessmentRequestBody = {
  riskData: any;
  assessmentParams: any;
};

export async function POST(
  request: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const session = await getAuthSession();
    const userId = parseInt(params.userId, 10);
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID' },
        { status: 400 },
      );
    }

    if (!session || session.user.id !== userId.toString()) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access' },
        { status: 403 },
      );
    }

    const body: RiskAssessmentRequestBody = await request.json();
    const { riskData, assessmentParams } = body;

    const user = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 },
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'User is not authorized to create a risk assessment' },
        { status: 403 },
      );
    }

    const impact = Math.random() * 10; 
    const likelihood = Math.random() * 10; 
    const severity = impact * likelihood > 50 ? 'High' : 'Low'; 
    const report = `Risk Assessment Report: Impact - ${impact}, Likelihood - ${likelihood}, Severity - ${severity}`;

    const riskAssessment = await prisma.riskAssessment.create({
      data: {
        userId,
        riskData,
        impact,
        likelihood,
        severity,
        assessmentParams,
        report,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Risk assessment created successfully',
        data: {
          id: riskAssessment.id,
          riskData: riskAssessment.riskData,
          impact: riskAssessment.impact,
          likelihood: riskAssessment.likelihood,
          severity: riskAssessment.severity,
          assessmentParams: riskAssessment.assessmentParams,
          report: riskAssessment.report,
          createdAt: riskAssessment.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('Error creating risk assessment:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: error },
      { status: 500 },
    );
  }
}