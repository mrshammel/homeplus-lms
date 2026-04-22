import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/reading-tutor/status
 * Returns the student's calibration status, recent sessions, and stats.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    if (!userId) {
      // Return demo data for unauthenticated users
      return NextResponse.json({
        isCalibrated: false,
        recentSessions: [],
        stats: { streak: 0, avgAccuracy: 0, sessionsCount: 0, lexileLevel: 0 },
      });
    }

    // Check voice profile
    const voiceProfile = await prisma.voiceProfile.findUnique({
      where: { studentId: userId },
    });

    // Check pending phonics gaps
    const pendingGaps = await prisma.phonicsGap.findMany({
      where: { studentId: userId, status: 'PENDING' },
      orderBy: { identifiedAt: 'asc' },
    });

    // Recent sessions
    const recentSessions = await prisma.readingSession.findMany({
      where: { studentId: userId, completedAt: { not: null } },
      orderBy: { sessionDate: 'desc' },
      take: 10,
      include: { passage: { select: { title: true } } },
    });

    // Calculate stats
    const allSessions = await prisma.readingSession.findMany({
      where: { studentId: userId, completedAt: { not: null } },
      orderBy: { sessionDate: 'desc' },
    });

    let streak = 0;
    if (allSessions.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let checkDate = new Date(today);

      for (const s of allSessions) {
        const sDate = new Date(s.sessionDate);
        sDate.setHours(0, 0, 0, 0);

        if (sDate.getTime() === checkDate.getTime()) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (sDate < checkDate) {
          break;
        }
      }
    }

    const avgAccuracy =
      allSessions.length > 0
        ? allSessions.reduce((sum, s) => sum + (s.accuracyRate || 0), 0) / allSessions.length
        : 0;

    const lastLexile = allSessions.find((s) => s.lexileEstimate)?.lexileEstimate || 0;

    return NextResponse.json({
      isCalibrated: voiceProfile?.isCalibrated || false,
      recentSessions: recentSessions.map((s) => ({
        id: s.id,
        date: s.sessionDate.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }),
        passageTitle: s.passage.title,
        accuracy: s.accuracyRate || 0,
        wpm: s.wordsPerMinute || 0,
        comprehension: s.comprehensionScore || 0,
      })),
      stats: {
        streak,
        avgAccuracy: Math.round(avgAccuracy),
        sessionsCount: allSessions.length,
        lexileLevel: lastLexile,
      },
      pendingGaps: pendingGaps.map(g => ({
        id: g.id,
        conceptCode: g.conceptCode,
        conceptName: g.conceptName,
      })),
    });
  } catch (error) {
    console.error('[API /reading-tutor/status]', error);
    return NextResponse.json({
      isCalibrated: false,
      recentSessions: [],
      stats: { streak: 0, avgAccuracy: 0, sessionsCount: 0, lexileLevel: 0 },
      pendingGaps: [],
    });
  }
}
