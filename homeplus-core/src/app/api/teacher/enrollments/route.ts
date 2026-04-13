import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// ── GET /api/teacher/enrollments?studentId=xxx ─────────────────────────────
// Returns: { enrolled: SubjectRow[], available: GradeGroup[] }
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user || user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const studentId = req.nextUrl.searchParams.get('studentId');
  if (!studentId) return NextResponse.json({ error: 'studentId required' }, { status: 400 });

  // Verify student belongs to this teacher
  const student = await prisma.user.findFirst({
    where: { id: studentId, role: 'STUDENT', assignedTeacherId: user.id },
    select: { id: true, gradeLevel: true },
  });
  if (!student) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Current enrollments
  const enrollments = await prisma.subjectEnrollment.findMany({
    where: { studentId },
    include: { subject: { select: { id: true, name: true, icon: true, gradeLevel: true } } },
    orderBy: { subject: { gradeLevel: 'asc' } },
  });

  // All available active subjects (grouped by grade for modal)
  const allSubjects = await prisma.subject.findMany({
    where: { active: true },
    orderBy: [{ gradeLevel: 'asc' }, { order: 'asc' }],
    select: { id: true, name: true, icon: true, gradeLevel: true },
  });

  // Group by grade
  const gradeMap = new Map<number, typeof allSubjects>();
  for (const s of allSubjects) {
    if (!gradeMap.has(s.gradeLevel)) gradeMap.set(s.gradeLevel, []);
    gradeMap.get(s.gradeLevel)!.push(s);
  }
  const grouped = Array.from(gradeMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([grade, subjects]) => ({ grade, subjects }));

  const enrolledIds = new Set(enrollments.map((e) => e.subjectId));

  return NextResponse.json({
    enrolled: enrollments.map((e) => ({
      enrollmentId: e.id,
      subjectId: e.subject.id,
      name: e.subject.name,
      icon: e.subject.icon,
      gradeLevel: e.subject.gradeLevel,
      enrolledAt: e.enrolledAt,
    })),
    available: grouped,
    enrolledIds: Array.from(enrolledIds),
  });
}

// ── POST /api/teacher/enrollments ─────────────────────────────────────────
// Body: { studentId, subjectId }
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user || user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { studentId, subjectId } = await req.json();
  if (!studentId || !subjectId) {
    return NextResponse.json({ error: 'studentId and subjectId required' }, { status: 400 });
  }

  // Verify ownership
  const student = await prisma.user.findFirst({
    where: { id: studentId, assignedTeacherId: user.id },
  });
  if (!student) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Upsert (idempotent)
  const enrollment = await prisma.subjectEnrollment.upsert({
    where: { studentId_subjectId: { studentId, subjectId } },
    create: { studentId, subjectId, enrolledBy: user.id },
    update: {},
    include: { subject: { select: { id: true, name: true, icon: true, gradeLevel: true } } },
  });

  return NextResponse.json({ ok: true, enrollment });
}

// ── DELETE /api/teacher/enrollments ───────────────────────────────────────
// Body: { studentId, subjectId }
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user || user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { studentId, subjectId } = await req.json();
  if (!studentId || !subjectId) {
    return NextResponse.json({ error: 'studentId and subjectId required' }, { status: 400 });
  }

  // Verify ownership
  const student = await prisma.user.findFirst({
    where: { id: studentId, assignedTeacherId: user.id },
  });
  if (!student) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Guard: prevent removing last enrollment
  const count = await prisma.subjectEnrollment.count({ where: { studentId } });
  if (count <= 1) {
    return NextResponse.json({ error: 'Cannot remove last enrollment' }, { status: 400 });
  }

  await prisma.subjectEnrollment.delete({
    where: { studentId_subjectId: { studentId, subjectId } },
  });

  return NextResponse.json({ ok: true });
}
