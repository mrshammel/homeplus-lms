// ============================================
// Review Generate API — Home Plus LMS (Phase 4)
// ============================================
// POST: Generates review queue items for students.
// Can be called via cron or on-demand.
//
// Body:
//   { studentId?: string } — if omitted, generates for ALL students
//
// Response:
//   { studentsProcessed: number, itemsCreated: number }

import { NextRequest, NextResponse } from 'next/server';
import { generateReviewQueue, generateAllReviewQueues, expireStaleItems } from '@/lib/review-scheduler';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { studentId } = body as { studentId?: string };

    // Expire stale items first
    await expireStaleItems(7);

    if (studentId) {
      // Single student
      const created = await generateReviewQueue(studentId);
      return NextResponse.json({
        studentsProcessed: 1,
        itemsCreated: created,
      });
    }

    // All students (cron mode)
    const result = await generateAllReviewQueues();
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[review/generate] Error:', err);
    return NextResponse.json(
      { error: 'Failed to generate review queue', detail: err?.message },
      { status: 500 },
    );
  }
}
