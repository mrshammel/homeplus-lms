import { prisma } from './db';

/**
 * Updates the PhonicsProfile flags based on recent mastery attempts.
 * This function should be called after a student submits a Phonics lesson or Reading Tutor quiz.
 */
export async function updatePhonicsProfileEdgeCases(studentId: string, lessonId: string, subjectMode: string, passed: boolean, score: number) {
  // 1. Ensure PhonicsProfile exists
  let profile = await prisma.phonicsProfile.findUnique({
    where: { studentId }
  });

  if (!profile) {
    profile = await prisma.phonicsProfile.create({
      data: {
        studentId,
        currentLessonId: lessonId,
      }
    });
  }

  // 2. Comprehension Lag (Decoding strong, Comprehension weak)
  if (subjectMode === 'ELA' || subjectMode === 'SOCIAL_STUDIES') {
    if (score < 60) {
      const recentPhonics = await prisma.studentMastery.findMany({
        where: { studentId },
        orderBy: { updatedAt: 'desc' },
        take: 3
      });
      
      const strongDecoding = recentPhonics.length > 0 && recentPhonics.every(p => p.lastDecodingAccuracy && p.lastDecodingAccuracy > 0.95);
      
      if (strongDecoding) {
        await prisma.phonicsProfile.update({
          where: { id: profile.id },
          data: { comprehensionGapSuspected: true }
        });
      }
    }
  }

  // 3. Phonics-specific flags
  if (subjectMode === 'PHONICS') {
    const masteryRecord = await prisma.studentMastery.findUnique({
      where: { studentId_lessonId: { studentId, lessonId } }
    });

    if (masteryRecord) {
      // Over-placement: Fails on FIRST attempt
      if (!passed && masteryRecord.attempts === 1) {
        await prisma.phonicsProfile.update({
          where: { id: profile.id },
          data: { placementMismatchSuspected: true }
        });
      }

      // Under-placement: 100% on first attempt for 3 consecutive lessons
      if (passed && masteryRecord.attempts === 1 && score === 100) {
        const recentMasteries = await prisma.studentMastery.findMany({
          where: { studentId },
          orderBy: { updatedAt: 'desc' },
          take: 3
        });

        // Use lastDecodingAccuracy to check for perfect score, as score might be an aggregate
        const perfectStreak = recentMasteries.length === 3 && recentMasteries.every(m => m.attempts === 1 && m.lastDecodingAccuracy === 1 && m.lastEncodingAccuracy === 1);
        
        if (perfectStreak) {
          await prisma.phonicsProfile.update({
            where: { id: profile.id },
            data: { placementUnderMatchSuspected: true }
          });
        }
      }
    }
  }
}
