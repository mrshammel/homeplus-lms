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
    const body = await req.json();
    const { step, status, sectionId, sectionData, sectionDone, allSections } = body;

    // Build the user update payload
    const updateData: any = {};
    if (step !== undefined) updateData.onboardingStep = step;
    if (status !== undefined) updateData.onboardingStatus = status;

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { assignedTeacherId: true, name: true },
    });

    // On COMPLETED - write a comprehensive baseline note for the teacher
    if (status === 'COMPLETED' && allSections && currentUser?.assignedTeacherId) {
      const about   = allSections.about?.data   || {};
      const math    = allSections.math?.data    || {};
      const ela     = allSections.ela?.data     || {};
      const reading = allSections.reading?.data || {};

      const note = [
        `STUDENT ONBOARDING COMPLETE - ${currentUser.name}`,
        `Date: ${new Date().toLocaleDateString('en-CA')}`,
        '',
        '━━━ ABOUT ME ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        `Preferred name:     ${about.nickname || '(not set)'}`,
        `Favourite activity: ${about.favourite_activity || '(not set)'}`,
        `Favourite subject:  ${about.favourite_subject || '(not set)'}`,
        `Learning goal:      ${about.learning_goal || '(not set)'}`,
        `Fun fact:           ${about.fun_fact || '(not set)'}`,
        '',
        '━━━ MATH DIAGNOSTIC (Grade 5-6 Alberta) ━━━━━',
        ...Object.entries(math).map(([qId, ans]) => `  ${qId}: ${ans}`),
        '',
        '━━━ ELA BASELINE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        'Writing Sample:',
        ela.writing_sample ? `  "${ela.writing_sample}"` : '  (not completed)',
        '',
        'Story Elements:',
        ela.story_elements ? `  "${ela.story_elements}"` : '  (not completed)',
        '',
        'Conventions (correction task):',
        ela.conventions ? `  "${ela.conventions}"` : '  (not completed)',
        '',
        '━━━ READING COMPREHENSION ━━━━━━━━━━━━━━━━━━━',
        ...Object.entries(reading).map(([qId, ans]) => `  ${qId}: ${ans}`),
        '',
        '- Review this data to set initial mastery baselines for this student. -',
      ].join('\n');

      await prisma.teacherNote.create({
        data: {
          studentId: userId,
          teacherId: currentUser.assignedTeacherId,
          tag: 'Needs Review - Onboarding Baseline',
          content: note,
        },
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      onboardingStep: updatedUser.onboardingStep,
      onboardingStatus: updatedUser.onboardingStatus,
    });

  } catch (err: any) {
    console.error('[Onboarding Progress API] Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
