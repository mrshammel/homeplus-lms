/**
 * Default Category Weightings Seed Script
 * 
 * This script populates the database with the default category weightings for all 
 * existing subjects. The defaults are derived from the original hardcoded 
 * DEFAULT_WEIGHTS in src/lib/grades.ts:
 * 
 * - QUIZ: 30% ("Quizzes")
 * - ASSIGNMENT: 30% ("Assignments")
 * - ACTIVITY: 25% ("Activities")
 * - REFLECTION: 15% ("Reflections")
 * 
 * It uses INSERT IF NOT EXISTS semantics (via upsert) to ensure that if a teacher 
 * has already customized weights for a subject, their values are never clobbered.
 */

import { PrismaClient, ActivityType } from '@prisma/client';
import { DEFAULT_WEIGHTS } from '../src/lib/grades';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding default category weightings...');
  
  const subjects = await prisma.subject.findMany({
    select: { id: true, name: true }
  });

  console.log(`Found ${subjects.length} subjects to process.`);

  let inserted = 0;
  let skipped = 0;

  for (const subject of subjects) {
    // Map the DEFAULT_WEIGHTS entries into an ordered array
    const defaultEntries = [
      { type: ActivityType.QUIZ, config: DEFAULT_WEIGHTS.QUIZ, order: 1 },
      { type: ActivityType.ASSIGNMENT, config: DEFAULT_WEIGHTS.ASSIGNMENT, order: 2 },
      { type: ActivityType.ACTIVITY, config: DEFAULT_WEIGHTS.ACTIVITY, order: 3 },
      { type: ActivityType.REFLECTION, config: DEFAULT_WEIGHTS.REFLECTION, order: 4 },
    ];

    for (const { type, config, order } of defaultEntries) {
      // Check if this subject already has a weighting for this type
      const existing = await prisma.categoryWeighting.findUnique({
        where: {
          subjectId_activityType: {
            subjectId: subject.id,
            activityType: type,
          }
        }
      });

      if (!existing) {
        // Insert only if it does not exist
        await prisma.categoryWeighting.create({
          data: {
            subjectId: subject.id,
            activityType: type,
            displayName: config.label,
            weightPercent: config.weight * 100, // Storing as 30 instead of 0.3 for easier display math
            displayOrder: order,
          }
        });
        inserted++;
      } else {
        skipped++;
      }
    }
  }

  console.log(`✅ Category Weighting seed complete. Inserted: ${inserted}, Skipped (already existed): ${skipped}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
