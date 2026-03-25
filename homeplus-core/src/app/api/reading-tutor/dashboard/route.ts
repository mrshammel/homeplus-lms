import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/reading-tutor/dashboard
 * Returns comprehensive dashboard data for the reading tutor.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    if (!userId) {
      return NextResponse.json({
        totalSessions: 0,
        avgAccuracy: 0,
        avgWpm: 0,
        currentLexile: 0,
        streak: 0,
        recentWords: [],
        sessions: [],
        accuracyTrend: [],
      });
    }

    // All completed sessions
    const allSessions = await prisma.readingSession.findMany({
      where: { studentId: userId, completedAt: { not: null } },
      orderBy: { sessionDate: 'desc' },
      include: { passage: { select: { title: true } } },
    });

    if (allSessions.length === 0) {
      return NextResponse.json({
        totalSessions: 0,
        avgAccuracy: 0,
        avgWpm: 0,
        currentLexile: 0,
        streak: 0,
        recentWords: [],
        sessions: [],
        accuracyTrend: [],
      });
    }

    // Stats
    const avgAccuracy = allSessions.reduce((sum, s) => sum + (s.accuracyRate || 0), 0) / allSessions.length;
    const avgWpm = allSessions.reduce((sum, s) => sum + (s.wordsPerMinute || 0), 0) / allSessions.length;
    const currentLexile = allSessions.find((s) => s.lexileEstimate)?.lexileEstimate || 0;

    // Streak
    let streak = 0;
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

    // Recent miscued words
    const wordCounts: Record<string, number> = {};
    for (const s of allSessions.slice(0, 10)) {
      const miscues = s.miscues as { expected?: string; type?: string }[];
      if (Array.isArray(miscues)) {
        for (const m of miscues) {
          if (m.expected && m.type === 'SUBSTITUTION') {
            wordCounts[m.expected] = (wordCounts[m.expected] || 0) + 1;
          }
        }
      }
    }

    const recentWords = Object.entries(wordCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([word, count]) => ({
        word,
        count,
        status: count >= 3 ? 'struggle' as const : count >= 2 ? 'improving' as const : 'mastered' as const,
      }));

    // Accuracy trend (last 15 sessions, oldest first)
    const accuracyTrend = allSessions
      .slice(0, 15)
      .reverse()
      .map((s) => Math.round(s.accuracyRate || 0));

    return NextResponse.json({
      totalSessions: allSessions.length,
      avgAccuracy: Math.round(avgAccuracy),
      avgWpm: Math.round(avgWpm),
      currentLexile,
      streak,
      recentWords,
      sessions: allSessions.slice(0, 15).map((s) => ({
        id: s.id,
        date: s.sessionDate.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }),
        passageTitle: s.passage.title,
        accuracy: s.accuracyRate || 0,
        wpm: s.wordsPerMinute || 0,
        comprehension: s.comprehensionScore || 0,
        lexile: s.lexileEstimate || 0,
      })),
      accuracyTrend,
    });
  } catch (error) {
    console.error('[API /reading-tutor/dashboard]', error);
    return NextResponse.json({
      totalSessions: 0,
      avgAccuracy: 0,
      avgWpm: 0,
      currentLexile: 0,
      streak: 0,
      recentWords: [],
      sessions: [],
      accuracyTrend: [],
    });
  }
}
