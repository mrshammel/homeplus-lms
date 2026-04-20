// ============================================
// Review Questions API - Home Plus LMS (Phase 4)
// ============================================
// GET: Fetches review queue items with questions for student.
// Also triggers on-demand generation if no items exist.
//
// Response:
//   {
//     reviewItems: Array<{
//       itemId, skillId, skillTitle, skillCode, priority, isOverdue,
//       questions: Array<{ id, text, type, options, difficulty }>
//     }>,
//     completedToday: number
//   }

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getStudentReviewDue, generateReviewQueue } from '@/lib/review-scheduler';

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Try to generate review items on-demand if none exist
    let reviewData = await getStudentReviewDue(userId);
    if (reviewData.dueCount === 0) {
      await generateReviewQueue(userId);
      reviewData = await getStudentReviewDue(userId);
    }

    // For each review item, find related questions
    const reviewItems = await Promise.all(
      reviewData.items.map(async (item) => {
        // Find questions linked to this skill via outcomeCode
        const skill = await prisma.skill.findUnique({
          where: { id: item.skillId },
          select: { code: true },
        });

        let questions: Array<{
          id: string;
          text: string;
          type: string;
          options: any;
          difficulty: number;
        }> = [];

        if (skill?.code) {
          const rawQuestions = await prisma.quizQuestion.findMany({
            where: { outcomeCode: skill.code },
            select: {
              id: true,
              questionText: true,
              questionType: true,
              options: true,
              difficulty: true,
            },
            take: 3, // Up to 3 questions per review skill
          });

          questions = rawQuestions.map((q) => ({
            id: q.id,
            text: q.questionText,
            type: q.questionType,
            options: q.options,
            difficulty: q.difficulty,
          }));
        }

        return {
          itemId: item.id,
          skillId: item.skillId,
          skillTitle: item.skillTitle,
          skillCode: item.skillCode,
          priority: item.priority,
          isOverdue: item.isOverdue,
          questions,
        };
      }),
    );

    return NextResponse.json({
      reviewItems,
      completedToday: reviewData.completedTodayCount,
    });
  } catch (err: any) {
    console.error('[review/questions] Error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch review data', detail: err?.message },
      { status: 500 },
    );
  }
}
