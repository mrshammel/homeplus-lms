// ============================================
// Seed Unit A — LessonSkill Mappings
// ============================================
// Links each lesson to its associated Knowledge and Skills outcomes.
// This tells the mastery engine which skills a lesson teaches/assesses.
//
// Run: npx tsx prisma/seed-sci7a-lessonskills.ts

import { config } from 'dotenv';
config({ path: '.env.local' });

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

// Schema uses SkillRelationship enum: TARGET | PREREQUISITE | REVIEW | TRANSFER
type SkillRel = 'TARGET' | 'PREREQUISITE' | 'REVIEW' | 'TRANSFER';

// Mapping: lessonId → array of { code, relationship }
const lessonSkillMap: Record<string, { code: string; rel: SkillRel }[]> = {
  // L1: What Is an Ecosystem?
  'g7-sci-ua-l1': [
    { code: 'SCI.7.A.K.1', rel: 'TARGET' },
    { code: 'SCI.6.LS.1', rel: 'PREREQUISITE' },
  ],
  // L2: Producers, Consumers, & Decomposers
  'g7-sci-ua-l2': [
    { code: 'SCI.7.A.K.1', rel: 'TARGET' },
    { code: 'SCI.7.A.K.2', rel: 'REVIEW' },
  ],
  // L3: Food Webs — When One Thing Changes
  'g7-sci-ua-l3': [
    { code: 'SCI.7.A.K.2', rel: 'TARGET' },
    { code: 'SCI.7.A.K.1', rel: 'REVIEW' },
  ],
  // L4: Cycles — Water and Carbon
  'g7-sci-ua-l4': [
    { code: 'SCI.7.A.K.2', rel: 'TARGET' },
    { code: 'SCI.7.A.K.1', rel: 'REVIEW' },
  ],
  // L5: Monitoring My Backyard
  'g7-sci-ua-l5': [
    { code: 'SCI.7.A.K.3', rel: 'TARGET' },
    { code: 'SCI.7.A.S.1', rel: 'TARGET' },
    { code: 'SCI.7.A.S.2', rel: 'TARGET' },
  ],
  // L6: Succession — How Ecosystems Recover
  'g7-sci-ua-l6': [
    { code: 'SCI.7.A.K.3', rel: 'TARGET' },
  ],
  // L7: Human Impacts — Intended & Unintended
  'g7-sci-ua-l7': [
    { code: 'SCI.7.A.K.4', rel: 'TARGET' },
    { code: 'SCI.7.A.S.3', rel: 'TARGET' },
    { code: 'SCI.7.A.S.4', rel: 'TARGET' },
  ],
  // L8: Synthesis — Ecosystem Action Plan
  'g7-sci-ua-l8': [
    { code: 'SCI.7.A.K.4', rel: 'TARGET' },
    { code: 'SCI.7.A.K.1', rel: 'REVIEW' },
    { code: 'SCI.7.A.K.2', rel: 'REVIEW' },
    { code: 'SCI.7.A.K.3', rel: 'REVIEW' },
  ],
};

async function main() {
  console.log('🔗 Seeding LessonSkill mappings for Unit A...\n');

  // Look up all skill IDs by code
  const allSkills = await prisma.skill.findMany({
    where: {
      code: {
        in: [
          'SCI.7.A.K.1', 'SCI.7.A.K.2', 'SCI.7.A.K.3', 'SCI.7.A.K.4',
          'SCI.7.A.S.1', 'SCI.7.A.S.2', 'SCI.7.A.S.3', 'SCI.7.A.S.4',
          'SCI.6.LS.1',
        ],
      },
    },
    select: { id: true, code: true },
  });

  const codeToId: Record<string, string> = {};
  for (const s of allSkills) {
    codeToId[s.code] = s.id;
  }

  console.log(`  Found ${allSkills.length} skills in database`);

  let created = 0;
  let skipped = 0;

  for (const [lessonId, skills] of Object.entries(lessonSkillMap)) {
    for (const { code, rel } of skills) {
      const skillId = codeToId[code];
      if (!skillId) {
        console.warn(`  ⚠️  Skill ${code} not found in DB — skipping for ${lessonId}`);
        skipped++;
        continue;
      }

      // Upsert to avoid duplicates on (lessonId, skillId, relationshipType)
      await prisma.lessonSkill.upsert({
        where: {
          lessonId_skillId_relationshipType: { lessonId, skillId, relationshipType: rel },
        },
        update: {},
        create: {
          lessonId,
          skillId,
          relationshipType: rel,
        },
      });
      created++;
    }
  }

  console.log(`\n✅ LessonSkill mappings: ${created} created/updated, ${skipped} skipped`);
  console.log('   Lessons 1-8 now linked to K and S outcome skills');
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
