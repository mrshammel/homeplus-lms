/**
 * seed-demo-enrollments.ts
 *
 * Ensures the demo user (Ava Chen, student-1) exists in the database
 * and is enrolled in ALL active demo courses:
 *   - Grade 6 ELA         (g6-ela)
 *   - Grade 7 Science     (g7-science)
 *   - Grade 8 Social      (g8-social)
 *   - Grade 9 Math        (g9-math)
 *   - Phonics (UFLI)      (subj_phonics_1)
 *
 * Run with: npm run db:seed:demo
 *
 * Safe to re-run at any time — uses upsert throughout.
 */

import { readFileSync } from 'fs';

// Load .env.local without dotenv (avoids npx module resolution issues)
try {
  const raw = readFileSync('.env.local', 'utf-8');
  for (const line of raw.split('\n')) {
    const match = line.match(/^([^#=\s][^=]*)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim()
        .replace(/^["']|["']$/g, '')
        .replace(/\\[nrt]/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  }
} catch { /* rely on env vars already set */ }

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

const DEMO_SUBJECTS = [
  'g6-ela',
  'g7-science',
  'g8-social',
  'g9-math',
  'subj_phonics_1',
] as const;

const DEMO_TEACHER = {
  id: 'teacher-1',
  name: 'Mrs. Shammel',
  email: 'shammel@hpln.ca',
};

const DEMO_STUDENT = {
  id: 'student-1',
  name: 'Ava Chen',
  email: 'ava.chen@student.hpln.ca',
};

async function main() {
  console.log('🌱 Setting up demo mode enrollments...\n');

  // ─── 1. Ensure teacher exists ───
  await prisma.user.upsert({
    where: { email: DEMO_TEACHER.email },
    update: { onboardingStatus: 'COMPLETED' },
    create: {
      id: DEMO_TEACHER.id,
      name: DEMO_TEACHER.name,
      email: DEMO_TEACHER.email,
      role: 'TEACHER',
      gradeLevel: 7,
      onboardingStatus: 'COMPLETED',
    },
  });
  console.log(`✅ Teacher: ${DEMO_TEACHER.name}`);

  // ─── 2. Ensure Ava Chen (demo student) exists ───
  // Look up teacher ID from DB (may differ from hardcoded if created via OAuth)
  const teacherRecord = await prisma.user.findUnique({ where: { email: DEMO_TEACHER.email }, select: { id: true } });
  const teacherId = teacherRecord?.id ?? DEMO_TEACHER.id;

  await prisma.user.upsert({
    where: { email: DEMO_STUDENT.email },
    update: { onboardingStatus: 'COMPLETED' },
    create: {
      id: DEMO_STUDENT.id,
      name: DEMO_STUDENT.name,
      email: DEMO_STUDENT.email,
      role: 'STUDENT',
      gradeLevel: 7,
      enrolledAt: new Date('2025-09-03'),
      assignedTeacherId: teacherId,
      onboardingStatus: 'COMPLETED',
      studentAgeBand: 'middle',
    },
  });
  console.log(`✅ Student: ${DEMO_STUDENT.name} (onboarding: COMPLETED)`);

  // Resolve actual DB id (may differ from hardcoded if created via OAuth)
  const studentRecord = await prisma.user.findUnique({ where: { email: DEMO_STUDENT.email }, select: { id: true } });
  const studentId = studentRecord?.id ?? DEMO_STUDENT.id;

  // ─── 3. Verify which subjects exist in the DB ───
  console.log('\n🔍 Checking subjects...');
  const existingSubjects = await prisma.subject.findMany({
    where: { id: { in: [...DEMO_SUBJECTS] } },
    select: { id: true, name: true, gradeLevel: true },
  });

  const existingIds = new Set(existingSubjects.map(s => s.id));

  for (const id of DEMO_SUBJECTS) {
    if (existingIds.has(id)) {
      console.log(`  ✅ Found: ${id} (${existingSubjects.find(s => s.id === id)?.name})`);
    } else {
      console.warn(`  ⚠️  Missing: ${id} — run the relevant seed script first!`);
    }
  }

  // ─── 4. Enroll Ava in all found subjects ───
  console.log(`\n📚 Enrolling ${DEMO_STUDENT.name} (db id: ${studentId}) in all demo subjects...`);
  let enrolled = 0;
  let skipped = 0;

  for (const subjectId of DEMO_SUBJECTS) {
    if (!existingIds.has(subjectId)) {
      console.log(`  ⏭️  Skipping ${subjectId} (subject not seeded)`);
      skipped++;
      continue;
    }

    await prisma.subjectEnrollment.upsert({
      where: {
        studentId_subjectId: {
          studentId,
          subjectId,
        },
      },
      update: {},
      create: {
        studentId,
        subjectId,
      },
    });

    const subName = existingSubjects.find(s => s.id === subjectId)?.name;
    console.log(`  ✅ Enrolled in: ${subName} (${subjectId})`);
    enrolled++;
  }

  // ─── 5. Summary ───
  console.log(`\n🎉 Demo enrollment complete!`);
  console.log(`   ${enrolled} subjects enrolled`);
  if (skipped > 0) {
    console.log(`   ${skipped} subjects skipped (missing — run their seed scripts first)`);
    console.log(`\n   To seed missing subjects:`);
    console.log(`     npm run db:seed           # seeds G7 Science + G6 ELA + Math 9 + Social 8`);
    console.log(`     npm run db:seed:phonics   # seeds Phonics (UFLI)`);
  }
  console.log(`\n   Demo sign-in: click "Try Demo" → Student → Ava Chen`);
}

main()
  .catch((e) => {
    console.error('❌ Demo enrollment failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
