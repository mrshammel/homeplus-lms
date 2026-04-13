/**
 * seed-enrollments.ts
 *
 * One-time migration: give every existing student an explicit SubjectEnrollment
 * for all active subjects at their grade level.
 *
 * Run with: npm run db:seed:enrollments
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  const students = await prisma.user.findMany({
    where: { role: 'STUDENT', gradeLevel: { not: null } },
    select: { id: true, name: true, gradeLevel: true },
  });

  const activeSubjects = await prisma.subject.findMany({
    where: { active: true },
    select: { id: true, gradeLevel: true, name: true },
  });

  const subjectsByGrade = new Map<number, typeof activeSubjects>();
  for (const s of activeSubjects) {
    if (!subjectsByGrade.has(s.gradeLevel)) subjectsByGrade.set(s.gradeLevel, []);
    subjectsByGrade.get(s.gradeLevel)!.push(s);
  }

  let created = 0;
  let skipped = 0;

  for (const student of students) {
    const grade = student.gradeLevel!;
    const subjects = subjectsByGrade.get(grade) ?? [];

    for (const subject of subjects) {
      try {
        await prisma.subjectEnrollment.upsert({
          where: { studentId_subjectId: { studentId: student.id, subjectId: subject.id } },
          create: { studentId: student.id, subjectId: subject.id },
          update: {},
        });
        created++;
      } catch {
        skipped++;
      }
    }
    console.log(`  ✓ ${student.name} (Grade ${grade}) — ${subjects.length} subject(s)`);
  }

  console.log(`\nDone. Created/updated ${created} enrollments, skipped ${skipped}.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
