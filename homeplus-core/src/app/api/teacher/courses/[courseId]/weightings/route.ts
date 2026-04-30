// ============================================
// Teacher Course Category Weightings API
// ============================================
import { NextRequest, NextResponse } from 'next/server';
import { getTeacherIdOrNull } from '@/lib/teacher-auth';
import { prisma } from '@/lib/db';
import { ActivityType } from '@prisma/client';

interface RouteParams {
  params: Promise<{ courseId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const teacherId = await getTeacherIdOrNull();
  if (!teacherId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { courseId } = await params;

  // Verify course exists
  const existing = await prisma.subject.findUnique({ where: { id: courseId } });
  if (!existing) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

  const weightings = await prisma.categoryWeighting.findMany({
    where: { subjectId: courseId },
    orderBy: { displayOrder: 'asc' }
  });

  return NextResponse.json(weightings);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const teacherId = await getTeacherIdOrNull();
  if (!teacherId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { courseId } = await params;
  const body = await request.json();
  const weightings = body.weightings as Array<{
    id?: string;
    activityType: ActivityType;
    displayName: string | null;
    description: string | null;
    weightPercent: number;
    displayOrder: number;
  }>;

  // Verify course exists
  const existing = await prisma.subject.findUnique({ where: { id: courseId } });
  if (!existing) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

  // Validate the total weight is exactly 100%
  const totalWeight = weightings.reduce((sum, w) => sum + w.weightPercent, 0);
  if (Math.abs(totalWeight - 100) > 0.01) {
    return NextResponse.json({ error: `Total weight must equal exactly 100%. Currently ${totalWeight}%` }, { status: 400 });
  }

  // Update rows in a transaction
  try {
    const results = await prisma.$transaction(
      weightings.map((w) => {
        return prisma.categoryWeighting.upsert({
          where: {
            subjectId_activityType: {
              subjectId: courseId,
              activityType: w.activityType
            }
          },
          update: {
            displayName: w.displayName ? w.displayName.trim() : null,
            description: w.description ? w.description.trim() : null,
            weightPercent: w.weightPercent,
            displayOrder: w.displayOrder
          },
          create: {
            subjectId: courseId,
            activityType: w.activityType,
            displayName: w.displayName ? w.displayName.trim() : null,
            description: w.description ? w.description.trim() : null,
            weightPercent: w.weightPercent,
            displayOrder: w.displayOrder
          }
        });
      })
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error('Failed to update weightings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
