// ============================================
// Mastery Skill Seeder — Hybrid Parent/Child Tree
// ============================================
// Phase 4: Seeds the full hybrid skill tree.
//
// Architecture:
//   Parent skills = reporting containers (dashboard, unit summaries, family reporting)
//   Child skills  = assessable targets (lesson tagging, quiz tagging, mastery evidence,
//                   retrieval, review scheduling, interleaving)
//
// Run: npx tsx prisma/seed-mastery-skills.ts

import { config } from 'dotenv';
config({ path: '.env.local' });

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { parentSkills } from './skill-data-parents';
import { scienceChildSkills } from './skill-data-children-science';
import { elaChildSkills } from './skill-data-children-ela';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Mastery Skill Seeder — Phase 4 (Hybrid Tree)');
  console.log('=================================================\n');

  // ─── 1. Seed Parent Skills ───
  console.log('── Step 1: Parent Skills ──');

  let parentCount = 0;
  for (const s of parentSkills) {
    await prisma.skill.upsert({
      where: { code: s.code },
      update: { title: s.title, description: s.description, strand: s.strand },
      create: s,
    });
    parentCount++;
  }
  console.log(`✅ Parent Skills: ${parentCount} upserted (${parentSkills.filter(s => s.subject === 'Science').length} Science, ${parentSkills.filter(s => s.subject === 'ELA').length} ELA)`);

  // ─── 2. Build parent code → id lookup ───
  const parentLookup = new Map<string, string>();
  for (const s of parentSkills) {
    const dbSkill = await prisma.skill.findUnique({ where: { code: s.code } });
    if (dbSkill) parentLookup.set(s.code, dbSkill.id);
  }

  // ─── 3. Seed Child Skills ───
  console.log('\n── Step 2: Child Skills ──');

  const allChildren = [...scienceChildSkills, ...elaChildSkills];
  let childCount = 0;
  let missingParents = 0;

  for (const child of allChildren) {
    const parentId = parentLookup.get(child.parentCode);
    if (!parentId) {
      console.warn(`⚠️  No parent found for ${child.code} (expected parent: ${child.parentCode})`);
      missingParents++;
      continue;
    }

    await prisma.skill.upsert({
      where: { code: child.code },
      update: {
        title: child.title,
        description: child.description,
        strand: child.strand,
        parentSkillId: parentId,
      },
      create: {
        id: child.id,
        code: child.code,
        title: child.title,
        description: child.description,
        subject: child.subject,
        gradeLevel: child.gradeLevel,
        strand: child.strand,
        curriculumOutcomeCode: child.curriculumOutcomeCode,
        isCorePrerequisite: false,
        parentSkillId: parentId,
      },
    });
    childCount++;
  }

  const sciChildCount = scienceChildSkills.length;
  const elaChildCount = elaChildSkills.length;
  console.log(`✅ Child Skills: ${childCount} upserted (${sciChildCount} Science, ${elaChildCount} ELA)`);
  if (missingParents > 0) console.warn(`⚠️  ${missingParents} children had missing parents`);

  // ─── 4. Create LessonSkill Mappings ───
  console.log('\n── Step 3: LessonSkill Mappings ──');

  const lessons = await prisma.lesson.findMany({
    include: {
      quizQuestions: { select: { outcomeCode: true } },
      unit: { include: { subject: true } },
    },
  });

  let lessonSkillCount = 0;

  for (const lesson of lessons) {
    const outcomeCodes = [...new Set(
      lesson.quizQuestions
        .map((q) => q.outcomeCode)
        .filter((c): c is string => c != null)
    )];

    if (outcomeCodes.length === 0) continue;

    // Match against both parent AND child skills
    const matchedSkills = await prisma.skill.findMany({
      where: { code: { in: outcomeCodes } },
    });

    for (const skill of matchedSkills) {
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

    // Prerequisite mapping for later units
    const unitOrder = lesson.unit.order;
    if (unitOrder > 0) {
      const prerequisiteSkills = parentSkills.filter(
        (s) =>
          s.subject === lesson.unit.subject.name.split(' ')[0] &&
          s.isCorePrerequisite &&
          !outcomeCodes.includes(s.code)
      );

      for (const prereqSkill of prerequisiteSkills) {
        const dbSkill = await prisma.skill.findUnique({ where: { code: prereqSkill.code } });
        if (!dbSkill) continue;

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

  // ─── 5. Create ActivitySkill Mappings ───
  console.log('\n── Step 4: ActivitySkill Mappings ──');

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

  // ─── 6. Verification ───
  console.log('\n── Step 5: Verification ──');

  const totalSkills = await prisma.skill.count();
  const totalParents = await prisma.skill.count({ where: { parentSkillId: null } });
  const totalChildren = await prisma.skill.count({ where: { NOT: { parentSkillId: null } } });
  const orphanChildren = await prisma.skill.count({
    where: {
      NOT: { parentSkillId: null },
      parent: null,
    },
  });
  const totalLessonSkills = await prisma.lessonSkill.count();
  const totalActivitySkills = await prisma.activitySkill.count();

  console.log(`
╔═══════════════════════════════════════════╗
║     HYBRID SKILL TREE — SEED COMPLETE    ║
╠═══════════════════════════════════════════╣
║ Total Skills:        ${String(totalSkills).padStart(4)}                ║
║   ├ Parents:         ${String(totalParents).padStart(4)}                ║
║   └ Children:        ${String(totalChildren).padStart(4)}                ║
║ Orphan Children:     ${String(orphanChildren).padStart(4)}                ║
║ LessonSkills:        ${String(totalLessonSkills).padStart(4)}                ║
║ ActivitySkills:      ${String(totalActivitySkills).padStart(4)}                ║
╚═══════════════════════════════════════════╝`);

  if (orphanChildren > 0) {
    console.error(`\n❌ ERROR: ${orphanChildren} child skills have invalid parentSkillId!`);
    process.exit(1);
  }

  console.log('\n✅ All parent/child relationships verified.');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    pool.end();
  });
