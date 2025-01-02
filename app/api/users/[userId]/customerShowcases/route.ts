import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type CustomerShowcaseRequestBody = {
  certifications: any;
  branding: any;
  testimonials: any;
  seoElements: any;
  accessibility: any;
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

    const body: CustomerShowcaseRequestBody = await request.json();

    const { certifications, branding, testimonials, seoElements, accessibility } = body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 },
      );
    }

    const customerShowcase = await prisma.customerShowcase.create({
      data: {
        userId,
        certifications,
        branding,
        testimonials,
        seoElements,
        accessibility,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Customer showcase created successfully',
        data: {
          id: customerShowcase.id,
          certifications: customerShowcase.certifications,
          branding: customerShowcase.branding,
          testimonials: customerShowcase.testimonials,
          seoElements: customerShowcase.seoElements,
          accessibility: customerShowcase.accessibility,
          createdAt: customerShowcase.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('Error creating customer showcase:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: error },
      { status: 500 },
    );
  }
}