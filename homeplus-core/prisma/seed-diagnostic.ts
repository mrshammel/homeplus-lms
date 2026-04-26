import { config } from 'dotenv';
config({ path: '.env.local' });

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, SubjectMode, QuestionType } from '@prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting Diagnostic Placement Test Seeding...');

  const assessment = await prisma.diagnosticAssessment.upsert({
    where: { id: 'diag_phonics_placement' },
    update: {},
    create: {
      id: 'diag_phonics_placement',
      title: 'UFLI Phonics Placement Test',
      gradeLevel: 1,
      subjectMode: SubjectMode.PHONICS,
      isActive: true,
      questions: {
        create: [
          // Tutor-Administered (Multiple Choice)
          {
            questionText: 'Which letter makes the /ă/ sound?',
            questionType: QuestionType.MULTIPLE_CHOICE,
            options: JSON.stringify(['a', 'm', 's', 't']),
            correctAnswer: 'a',
            targetOutcome: 'g_a_short',
            order: 1
          },
          {
            questionText: 'Select the heart word "the"',
            questionType: QuestionType.MULTIPLE_CHOICE,
            options: JSON.stringify(['then', 'the', 'them', 'they']),
            correctAnswer: 'the',
            targetOutcome: 'hw_the',
            order: 2
          },
          // Teacher-Administered (Teacher scores Yes/No based on observation)
          {
            questionText: 'Teacher: Ask student to read the nonsense word "bif". Did they decode correctly?',
            questionType: QuestionType.MULTIPLE_CHOICE,
            options: JSON.stringify(['Correct', 'Incorrect']),
            correctAnswer: 'Correct',
            targetOutcome: 'nonsense_cvc',
            order: 3
          },
          {
            questionText: 'Teacher: Ask student to perform Oral Reading Fluency passage 1. Did they meet threshold?',
            questionType: QuestionType.MULTIPLE_CHOICE,
            options: JSON.stringify(['Correct', 'Incorrect']),
            correctAnswer: 'Correct',
            targetOutcome: 'orf_level_1',
            order: 4
          }
        ]
      }
    }
  });

  console.log('✅ Diagnostic seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during diagnostic seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
