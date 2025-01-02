import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type ComplianceAuditRequestBody = {
  auditType: string;
  requirements: any;
  documentation: any;
  status: string;
  reminders: any;
};

export async function POST(
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

    const body: ComplianceAuditRequestBody = await request.json();

    const { auditType, requirements, documentation, status, reminders } = body;
    if (!auditType || !status) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 },
      );
    }

    const complianceAudit = await prisma.complianceAudit.create({
      data: {
        userId,
        auditType,
        requirements,
        documentation,
        status,
        reminders,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Compliance audit created successfully',
        data: {
          id: complianceAudit.id,
          auditType: complianceAudit.auditType,
          requirements: complianceAudit.requirements,
          documentation: complianceAudit.documentation,
          status: complianceAudit.status,
          reminders: complianceAudit.reminders,
          createdAt: complianceAudit.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('Error creating compliance audit:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: error },
      { status: 500 },
    );
  }
}