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
  console.log('Enrolling Ava Chen (student-1) in Grade 8 Social Studies and Grade 9 Math...');

  await prisma.subjectEnrollment.upsert({
    where: { studentId_subjectId: { studentId: 'student-1', subjectId: 'g8-social' } },
    update: {},
    create: { studentId: 'student-1', subjectId: 'g8-social' },
  });

  await prisma.subjectEnrollment.upsert({
    where: { studentId_subjectId: { studentId: 'student-1', subjectId: 'g9-math' } },
    update: {},
    create: { studentId: 'student-1', subjectId: 'g9-math' },
  });

  console.log('✅ Done!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
