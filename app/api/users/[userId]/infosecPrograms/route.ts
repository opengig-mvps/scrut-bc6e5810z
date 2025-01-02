import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type InfosecProgramRequestBody = {
  template: string;
  customization: any;
  versionControl: any;
  permissions: any;
};

export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = Number(params.userId);
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const body: InfosecProgramRequestBody = await request.json();
    const { template, customization, versionControl, permissions } = body;

    if (!template || !customization || !versionControl || !permissions) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const infosecProgram = await prisma.infosecProgram.create({
      data: {
        userId,
        template,
        customization,
        versionControl,
        permissions,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Infosec program created successfully',
        data: {
          id: infosecProgram.id,
          template: infosecProgram.template,
          customization: infosecProgram.customization,
          versionControl: infosecProgram.versionControl,
          permissions: infosecProgram.permissions,
          createdAt: infosecProgram.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating infosec program:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}