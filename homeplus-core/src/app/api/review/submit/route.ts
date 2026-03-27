// ============================================
// Review Submit API — Home Plus LMS (Phase 4)
// ============================================
// POST: Processes a student's review answer(s).
// Records evidence, updates mastery, refreshes summaries.
//
// Body:
//   {
//     itemId: string,          — ReviewQueueItem ID
//     answers: { questionId: string, response: string }[]
//   }
//
// Response:
//   {
//     correct: number,
//     total: number,
//     passed: boolean,
//     feedback: string,
//     masteryUpdate: { skillId, newState, newScore }
//   }

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { processReviewResult } from '@/lib/review-scheduler';
import { refreshStudentDashboardSummary } from '@/lib/summary-service';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { itemId, answers } = body as {
      itemId: string;
      answers: { questionId: string; response: string }[];
    };

    if (!itemId) {
      return NextResponse.json({ error: 'itemId required' }, { status: 400 });
    }

    // Verify the item belongs to this student
    const item = await prisma.reviewQueueItem.findUnique({
      where: { id: itemId },
      include: { skill: { select: { id: true, code: true, title: true } } },
    });

    if (!item) {
      return NextResponse.json({ error: 'Review item not found' }, { status: 404 });
    }
    if (item.studentId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    if (item.status !== 'DUE') {
      return NextResponse.json({ error: 'Review item already completed' }, { status: 400 });
    }

    // Score the answers against the questions
    let correct = 0;
    let total = 0;

    if (answers && answers.length > 0) {
      const questionIds = answers.map((a) => a.questionId);
      const questions = await prisma.quizQuestion.findMany({
        where: { id: { in: questionIds } },
      });

      for (const answer of answers) {
        const q = questions.find((qq) => qq.id === answer.questionId);
        if (!q) continue;
        total++;

        let isCorrect = false;
        if (q.questionType === 'MULTIPLE_CHOICE' && q.options) {
          const opts = q.options as Array<{ value: string; correct?: boolean }>;
          const selected = opts.find((o) => o.value === answer.response);
          isCorrect = !!selected?.correct;
        } else {
          isCorrect =
            q.correctAnswer !== null &&
            answer.response.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
        }

        if (isCorrect) correct++;
      }
    } else {
      // No answers — treat as skipped (0/1)
      total = 1;
      correct = 0;
    }

    const score = total > 0 ? correct : 0;
    const maxScore = total > 0 ? total : 1;
    const passed = total > 0 && correct / total >= 0.7;

    // Process the review result (updates mastery + records evidence)
    await processReviewResult({
      itemId,
      score,
      maxScore,
    });

    // Refresh summary
    try {
      await refreshStudentDashboardSummary(userId);
    } catch (e) {
      console.error('[review/submit] Summary refresh failed:', e);
    }

    // Get updated mastery for response
    const updatedMastery = await prisma.studentSkillMastery.findUnique({
      where: { studentId_skillId: { studentId: userId, skillId: item.skillId } },
    });

    // Generate feedback
    let feedback: string;
    if (passed) {
      if (correct === total) {
        feedback = `Perfect! You got all ${total} question${total !== 1 ? 's' : ''} right. 🎉`;
      } else {
        feedback = `Nice work! You got ${correct}/${total} correct. Keep it up! 💪`;
      }
    } else {
      feedback = `You got ${correct}/${total} correct. This skill needs more practice. Review the lesson content and try again later.`;
    }

    return NextResponse.json({
      correct,
      total,
      passed,
      feedback,
      masteryUpdate: updatedMastery ? {
        skillId: item.skillId,
        skillTitle: item.skill.title,
        newState: updatedMastery.masteryState,
        newScore: updatedMastery.masteryScore,
      } : null,
    });
  } catch (err: any) {
    console.error('[review/submit] Error:', err);
    return NextResponse.json(
      { error: 'Failed to process review', detail: err?.message },
      { status: 500 },
    );
  }
}
