import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id;
  
  try {
    const { step, status, mathData, writingData } = await req.json();

    // Ensure they can't maliciously drop their status back once complete
    const updateData: any = {};
    if (step !== undefined) updateData.onboardingStep = step;
    if (status !== undefined) updateData.onboardingStatus = status;

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { assignedTeacherId: true, name: true }
    });

    // If completed and we got data, save baseline samples
    if (status === 'COMPLETED' && writingData && currentUser?.assignedTeacherId) {
      await prisma.teacherNote.create({
        data: {
          studentId: userId,
          teacherId: currentUser.assignedTeacherId,
          tag: 'Needs Review - Baseline Samples',
          content: `STUDENT ONBOARDING COMPLETE\n\nWriting Baseline:\n"${writingData}"\n\nMath Baseline Status: ${mathData ? 'Completed' : 'Missing'}`,
        }
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({ 
      success: true, 
      onboardingStep: updatedUser.onboardingStep,
      onboardingStatus: updatedUser.onboardingStatus 
    });

  } catch (err: any) {
    console.error('[Onboarding Progress API] Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
