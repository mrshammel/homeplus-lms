import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { selectNextPassageLevel } from '@/lib/reading-tutor';

/**
 * GET /api/reading-tutor/next-passage
 * Selects an appropriate passage based on student's reading history.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    // Get recent sessions for adaptive selection
    let targetLexile = 200; // Default: Grade 1

    if (userId) {
      const recentSessions = await prisma.readingSession.findMany({
        where: { studentId: userId, completedAt: { not: null } },
        orderBy: { sessionDate: 'desc' },
        take: 5,
        include: { passage: { select: { lexileLevel: true } } },
      });

      if (recentSessions.length > 0) {
        const { targetLexile: tl } = selectNextPassageLevel(
          recentSessions.map((s) => ({
            accuracyRate: s.accuracyRate || 0,
            comprehensionScore: s.comprehensionScore || 0,
            passageLexile: s.passage.lexileLevel,
          }))
        );
        targetLexile = tl;
      }
    }

    // Find passages near the target Lexile, excluding recently read ones
    const recentPassageIds = userId
      ? (await prisma.readingSession.findMany({
          where: { studentId: userId },
          orderBy: { sessionDate: 'desc' },
          take: 5,
          select: { passageId: true },
        })).map((s) => s.passageId)
      : [];

    // Build the where clause
    const whereClause: Record<string, unknown> = {
      isActive: true,
      lexileLevel: {
        gte: targetLexile - 100,
        lte: targetLexile + 100,
      },
    };

    if (recentPassageIds.length > 0) {
      whereClause.id = { notIn: recentPassageIds };
    }

    const passage = await prisma.readingPassage.findFirst({
      where: whereClause,
      orderBy: { lexileLevel: 'asc' },
    });

    // Fallback: any active passage
    const fallback = passage || await prisma.readingPassage.findFirst({
      where: { isActive: true },
      orderBy: { lexileLevel: 'asc' },
    });

    if (!fallback) {
      return NextResponse.json({ error: 'No passages available' }, { status: 404 });
    }

    return NextResponse.json({
      passage: {
        id: fallback.id,
        title: fallback.title,
        text: fallback.text,
        wordCount: fallback.wordCount,
        lexileLevel: fallback.lexileLevel,
        gradeLevel: fallback.gradeLevel,
      },
    });
  } catch (error) {
    console.error('[API /reading-tutor/next-passage]', error);
    return NextResponse.json({ error: 'Failed to load passage' }, { status: 500 });
  }
}
