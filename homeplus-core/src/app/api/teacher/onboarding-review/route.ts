import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// PATCH /api/teacher/onboarding-review
// Body: { noteId: string }
// Marks a TeacherNote as reviewed by the authenticated teacher.
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = session.user as any;
  if (user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { noteId } = await req.json();
    if (!noteId) {
      return NextResponse.json({ error: 'noteId required' }, { status: 400 });
    }

    // Ensure note belongs to this teacher
    const note = await prisma.teacherNote.findFirst({
      where: { id: noteId, teacherId: user.id },
    });
    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    await prisma.teacherNote.update({
      where: { id: noteId },
      data: { reviewed: true, reviewedAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[onboarding-review] PATCH failed:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
