import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PhonicsMasteryEngine } from '@/lib/mastery-engine';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id as string;
  const { lessonId } = await params;

  const { decodingCorrect, decodingTotal, encodingCorrect, encodingTotal } = await request.json();

  // Verify lesson exists and is phonics
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      subjectMode: true,
      masteryDecodingAccuracy: true,
      masteryEncodingAccuracy: true,
    },
  });

  if (!lesson || lesson.subjectMode !== 'PHONICS') {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
  }

  const decodingAccuracy = decodingTotal > 0 ? decodingCorrect / decodingTotal : 1.0;
  const encodingAccuracy = encodingTotal > 0 ? encodingCorrect / encodingTotal : 1.0;

  const decodingThreshold = lesson.masteryDecodingAccuracy ?? 0.9;
  const encodingThreshold = lesson.masteryEncodingAccuracy ?? 0.85;

  const passed = decodingAccuracy >= decodingThreshold && encodingAccuracy >= encodingThreshold;

  // Get current attempt count
  const existingMastery = await prisma.studentMastery.findUnique({
    where: { studentId_lessonId: { studentId: userId, lessonId } },
  });
  const attempts = (existingMastery?.attempts ?? 0) + 1;
  const needsReteach = !passed && attempts >= 3;

  const newStatus = passed ? 'mastered' : needsReteach ? 'struggling' : 'in_progress';

  // Upsert StudentMastery
  await prisma.studentMastery.upsert({
    where: { studentId_lessonId: { studentId: userId, lessonId } },
    update: {
      status: newStatus,
      attempts,
      lastDecodingAccuracy: decodingAccuracy,
      lastEncodingAccuracy: encodingAccuracy,
      updatedAt: new Date(),
    },
    create: {
      studentId: userId,
      lessonId,
      status: newStatus,
      attempts,
      lastDecodingAccuracy: decodingAccuracy,
      lastEncodingAccuracy: encodingAccuracy,
    },
  });

  // Update PhonicsProfile currentLessonId if student passed
  if (passed) {
    // Find next lesson in sequence
    const currentLesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { order: true, unitId: true },
    });

    if (currentLesson) {
      const nextLesson = await prisma.lesson.findFirst({
        where: {
          unitId: currentLesson.unitId,
          subjectMode: 'PHONICS',
          order: { gt: currentLesson.order },
        },
        orderBy: { order: 'asc' },
        select: { id: true },
      });

      await prisma.phonicsProfile.upsert({
        where: { studentId: userId },
        update: {
          currentLessonId: nextLesson?.id ?? lessonId,
          updatedAt: new Date(),
        },
        create: {
          studentId: userId,
          currentLessonId: nextLesson?.id ?? lessonId,
        },
      });
    }

    // Update StudentProgress for lesson completion
    await prisma.studentProgress.upsert({
      where: { studentId_lessonId: { studentId: userId, lessonId } },
      update: { status: 'MASTERED', completedAt: new Date() },
      create: {
        studentId: userId,
        lessonId,
        status: 'MASTERED',
        completedAt: new Date(),
      },
    });
  }

  // Check edge cases for PhonicsProfile flags
  if (passed && attempts === 1) {
    // Perfect first pass — might be under-placed
    // Count consecutive perfect first-passes
    const recentPerfect = await prisma.studentMastery.count({
      where: {
        studentId: userId,
        attempts: 1,
        lastDecodingAccuracy: 1.0,
        lastEncodingAccuracy: 1.0,
        status: 'mastered',
      },
    });

    if (recentPerfect >= 3) {
      await prisma.phonicsProfile.upsert({
        where: { studentId: userId },
        update: { placementUnderMatchSuspected: true },
        create: { studentId: userId, placementUnderMatchSuspected: true },
      });
    }
  }

  if (!passed && attempts === 1 && (existingMastery === null)) {
    // First attempt failure at placement lesson — over-placed
    await prisma.phonicsProfile.upsert({
      where: { studentId: userId },
      update: { placementMismatchSuspected: true },
      create: { studentId: userId, placementMismatchSuspected: true },
    });
  }

  let feedback = '';
  if (passed) {
    feedback = `🏆 Mastered! Decoding: ${Math.round(decodingAccuracy * 100)}%, Encoding: ${Math.round(encodingAccuracy * 100)}%`;
  } else if (needsReteach) {
    feedback = `After 3 attempts, let's get some extra practice. Your teacher has been notified.`;
  } else {
    const decodingPct = Math.round(decodingAccuracy * 100);
    const encodingPct = Math.round(encodingAccuracy * 100);
    feedback = `Keep going! Decoding: ${decodingPct}% (need ${Math.round(decodingThreshold * 100)}%), Encoding: ${encodingPct}% (need ${Math.round(encodingThreshold * 100)}%). Try again!`;
  }

  return NextResponse.json({
    passed,
    needsReteach,
    status: newStatus,
    attempts,
    decodingAccuracy,
    encodingAccuracy,
    feedback,
  });
}
