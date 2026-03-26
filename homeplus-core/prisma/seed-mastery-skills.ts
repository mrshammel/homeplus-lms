// ============================================
// Mastery Skill Seeder — Home Plus LMS
// ============================================
// Phase 1b: Seeds Skill records from existing LearningOutcome data
// and outcomeCode patterns found in QuizQuestions.
// Also creates LessonSkill and ActivitySkill mappings.
//
// Run: npx tsx prisma/seed-mastery-skills.ts

import { config } from 'dotenv';
config({ path: '.env.local' });

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// Use the pg adapter to match the app's db.ts configuration
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Mastery Skill Seeder — Phase 1b');
  console.log('====================================\n');

  // ─── 1. Seed Skills ───

  const skills = [
    // ── Grade 7 Science — Unit A: Interactions & Ecosystems ──
    { id: 'skill-sci7-a1', code: 'SCI.7.A.1', title: 'Ecosystems & Interactions', description: 'Describe ecosystems and identify biotic/abiotic components and their interactions', subject: 'Science', gradeLevel: 7, strand: 'Interactions & Ecosystems', curriculumOutcomeCode: 'SCI.7.A.1', isCorePrerequisite: true },
    { id: 'skill-sci7-a2', code: 'SCI.7.A.2', title: 'Ecological Relationships', description: 'Identify examples of predator-prey and symbiotic relationships', subject: 'Science', gradeLevel: 7, strand: 'Interactions & Ecosystems', curriculumOutcomeCode: 'SCI.7.A.2', isCorePrerequisite: false },
    { id: 'skill-sci7-a3', code: 'SCI.7.A.3', title: 'Ecosystem Change & Human Impact', description: 'Explain succession, invasive species, and human impacts on ecosystems', subject: 'Science', gradeLevel: 7, strand: 'Interactions & Ecosystems', curriculumOutcomeCode: 'SCI.7.A.3', isCorePrerequisite: false },
    { id: 'skill-sci7-a4', code: 'SCI.7.A.4', title: 'Conservation & Stewardship', description: 'Describe conservation strategies and explain stewardship responsibilities', subject: 'Science', gradeLevel: 7, strand: 'Interactions & Ecosystems', curriculumOutcomeCode: 'SCI.7.A.4', isCorePrerequisite: false },

    // ── Grade 7 Science — Unit B: Plants for Food & Fibre ──
    { id: 'skill-sci7-b1', code: 'SCI.7.B.1', title: 'Plant Growth & Requirements', description: 'Describe the conditions and processes needed for plant growth', subject: 'Science', gradeLevel: 7, strand: 'Plants for Food & Fibre', curriculumOutcomeCode: 'SCI.7.B.1', isCorePrerequisite: true },
    { id: 'skill-sci7-b2', code: 'SCI.7.B.2', title: 'Plant Adaptations', description: 'Examine plant adaptations to different environments', subject: 'Science', gradeLevel: 7, strand: 'Plants for Food & Fibre', curriculumOutcomeCode: 'SCI.7.B.2', isCorePrerequisite: false },

    // ── Grade 7 Science — Unit C: Heat & Temperature ──
    { id: 'skill-sci7-c1', code: 'SCI.7.C.1', title: 'Heat & Heat Transfer', description: 'Describe heat as a form of energy and identify methods of heat transfer', subject: 'Science', gradeLevel: 7, strand: 'Heat & Temperature', curriculumOutcomeCode: 'SCI.7.C.1', isCorePrerequisite: true },

    // ── Grade 6 ELA — Unit 1: Identity, Belonging & Voice ──
    { id: 'skill-ela6-1', code: 'ELA.6.1', title: 'Reading Comprehension & Inference', description: 'Make inferences, distinguish explicit from implicit information, and make text connections', subject: 'ELA', gradeLevel: 6, strand: 'Reading & Comprehension', curriculumOutcomeCode: 'ELA.6.1', isCorePrerequisite: true },
    { id: 'skill-ela6-2', code: 'ELA.6.2', title: 'Vocabulary & Word Analysis', description: 'Understand and use context clues, figurative language, and vocabulary strategies', subject: 'ELA', gradeLevel: 6, strand: 'Vocabulary & Language', curriculumOutcomeCode: 'ELA.6.2', isCorePrerequisite: true },
    { id: 'skill-ela6-3', code: 'ELA.6.3', title: 'Literary Analysis & Theme', description: 'Identify theme, plot structure, and analyze literary elements in narrative texts', subject: 'ELA', gradeLevel: 6, strand: 'Literary Analysis', curriculumOutcomeCode: 'ELA.6.3', isCorePrerequisite: false },
    { id: 'skill-ela6-4', code: 'ELA.6.4', title: 'Writing Craft & Conventions', description: 'Apply grammar, punctuation, figurative language, and narrative writing techniques', subject: 'ELA', gradeLevel: 6, strand: 'Writing & Conventions', curriculumOutcomeCode: 'ELA.6.4', isCorePrerequisite: false },
    { id: 'skill-ela6-5', code: 'ELA.6.5', title: 'Communication & Collaboration', description: 'Practice active listening, constructive feedback, and collaborative discussion skills', subject: 'ELA', gradeLevel: 6, strand: 'Oral Communication', curriculumOutcomeCode: 'ELA.6.5', isCorePrerequisite: false },
  ];

  let skillCount = 0;
  for (const s of skills) {
    await prisma.skill.upsert({
      where: { code: s.code },
      update: { title: s.title, description: s.description, strand: s.strand },
      create: s,
    });
    skillCount++;
  }
  console.log(`✅ Skills: ${skillCount} upserted`);

  // ─── 2. Create LessonSkill Mappings ───

  // Query all lessons and their quiz questions to infer skill mappings
  const lessons = await prisma.lesson.findMany({
    include: {
      quizQuestions: { select: { outcomeCode: true } },
      unit: { include: { subject: true } },
    },
  });

  let lessonSkillCount = 0;

  for (const lesson of lessons) {
    // Get unique outcome codes from this lesson's quiz questions
    const outcomeCodes = [...new Set(
      lesson.quizQuestions
        .map((q) => q.outcomeCode)
        .filter((c): c is string => c != null)
    )];

    if (outcomeCodes.length === 0) continue;

    // Find matching skills
    const matchedSkills = await prisma.skill.findMany({
      where: { code: { in: outcomeCodes } },
    });

    for (const skill of matchedSkills) {
      // Create TARGET mapping
      try {
        await prisma.lessonSkill.upsert({
          where: {
            lessonId_skillId_relationshipType: {
              lessonId: lesson.id,
              skillId: skill.id,
              relationshipType: 'TARGET',
            },
          },
          update: {},
          create: {
            lessonId: lesson.id,
            skillId: skill.id,
            relationshipType: 'TARGET',
          },
        });
        lessonSkillCount++;
      } catch {
        // Skip duplicates
      }
    }

    // If this lesson has prerequisite skills (earlier skills in same subject)
    // Mark previous unit skills as PREREQUISITE for later lessons
    const unitOrder = lesson.unit.order;
    if (unitOrder > 0) {
      const prerequisiteSkills = skills.filter(
        (s) =>
          s.subject === lesson.unit.subject.name.split(' ')[0] && // Match subject
          s.isCorePrerequisite &&
          !outcomeCodes.includes(s.code) // Don't mark target skills as prereqs
      );

      for (const prereqSkill of prerequisiteSkills) {
        const dbSkill = await prisma.skill.findUnique({ where: { code: prereqSkill.code } });
        if (!dbSkill) continue;

        // Only mark as prerequisite if the skill is from an earlier unit
        const prereqStrand = prereqSkill.strand || '';
        const lessonStrand = matchedSkills[0]?.strand || '';
        if (prereqStrand !== lessonStrand) {
          try {
            await prisma.lessonSkill.upsert({
              where: {
                lessonId_skillId_relationshipType: {
                  lessonId: lesson.id,
                  skillId: dbSkill.id,
                  relationshipType: 'PREREQUISITE',
                },
              },
              update: {},
              create: {
                lessonId: lesson.id,
                skillId: dbSkill.id,
                relationshipType: 'PREREQUISITE',
              },
            });
            lessonSkillCount++;
          } catch {
            // Skip duplicates
          }
        }
      }
    }
  }
  console.log(`✅ LessonSkill mappings: ${lessonSkillCount} created`);

  // ─── 3. Create ActivitySkill Mappings ───

  // Map activities to skills through their parent lesson's target skills
  const activities = await prisma.activity.findMany({
    include: {
      lesson: {
        include: {
          quizQuestions: { select: { outcomeCode: true } },
        },
      },
    },
  });

  let activitySkillCount = 0;

  for (const activity of activities) {
    const outcomeCodes = [...new Set(
      activity.lesson.quizQuestions
        .map((q) => q.outcomeCode)
        .filter((c): c is string => c != null)
    )];

    if (outcomeCodes.length === 0) continue;

    const matchedSkills = await prisma.skill.findMany({
      where: { code: { in: outcomeCodes } },
    });

    // Weight based on activity type
    const weightMap: Record<string, number> = {
      QUIZ: 1.0,
      ASSIGNMENT: 0.8,
      ACTIVITY: 0.6,
      REFLECTION: 0.4,
    };

    for (const skill of matchedSkills) {
      try {
        await prisma.activitySkill.upsert({
          where: {
            activityId_skillId: {
              activityId: activity.id,
              skillId: skill.id,
            },
          },
          update: {},
          create: {
            activityId: activity.id,
            skillId: skill.id,
            weight: weightMap[activity.type] ?? 0.6,
          },
        });
        activitySkillCount++;
      } catch {
        // Skip duplicates
      }
    }
  }
  console.log(`✅ ActivitySkill mappings: ${activitySkillCount} created`);

  // ─── 4. Summary ───

  const totalSkills = await prisma.skill.count();
  const totalLessonSkills = await prisma.lessonSkill.count();
  const totalActivitySkills = await prisma.activitySkill.count();

  console.log(`
╔════════════════════════════════════╗
║     MASTERY SEED COMPLETE         ║
╠════════════════════════════════════╣
║ Skills:          ${String(totalSkills).padStart(4)}             ║
║ LessonSkills:    ${String(totalLessonSkills).padStart(4)}             ║
║ ActivitySkills:  ${String(totalActivitySkills).padStart(4)}             ║
╚════════════════════════════════════╝`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
