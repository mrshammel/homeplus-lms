// ============================================
// Grade 7 Science — Full Seed Orchestrator
// ============================================
// Runs all seed scripts in the correct dependency order:
//   1. Base seed.ts     — users, subjects, units, lessons (all 5 units)
//   2. Unit A (new)     — spec-compliant L1–L8 content (replaces legacy)
//   3. Unit B           — Plants for Food & Fibre (L1–L7)
//   4. Unit C           — Heat & Temperature (L1–L6)
//   5. Unit D           — Structures & Forces (L1–L8)
//   6. Unit E           — Planet Earth (L1–L7)
//   7. Mastery skills   — full hybrid skill tree + LessonSkill mappings
//
// Usage: npm run db:seed:science
//
// IMPORTANT: This fully replaces existing lesson content with clean data.
// There is no student data to protect — build phase only.

import { execSync } from 'child_process';
import path from 'path';

const prismaDir = __dirname;

function run(scriptName: string, label: string): void {
  const scriptPath = path.join(prismaDir, scriptName);
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`▶  ${label}`);
  console.log(`   ${scriptName}`);
  console.log('═'.repeat(60));

  try {
    execSync(`npx tsx "${scriptPath}"`, {
      stdio: 'inherit',
      cwd: path.join(prismaDir, '..'), // homeplus-core root
    });
    console.log(`✅ Done: ${label}`);
  } catch (err) {
    console.error(`\n❌ FAILED: ${label}`);
    console.error(`   Script: ${scriptName}`);
    throw err;
  }
}

async function main() {
  console.log('\n🌱 Grade 7 Science — Full Seed Orchestrator');
  console.log('='.repeat(60));
  console.log('Seeding full Grade 7 Science curriculum into database.');
  console.log('Runs in dependency order. Each step replaces prior content.\n');

  const start = Date.now();

  // ─── Step 1: Base scaffold ───────────────────────────────────────────
  // Creates: teacher, students, subjects (g7-science, g6-ela),
  // all 5 science units, all 82 lessons, sample activities, outcomes,
  // pacing targets, student progress, submissions, mastery judgments.
  run('seed.ts', 'Step 1/8 — Base scaffold (users, subjects, units, lessons)');

  // ─── Step 2: Unit A — Interactions & Ecosystems (L1–L8, new spec) ───
  // Deletes legacy Unit A blocks and quiz questions, then seeds:
  //   seed-lesson-content.ts    → L1 (Lesson 1 spec content)
  //   seed-unit-a-content.ts    → L2, L3, L4 (Lessons 2–4 spec content)
  //   seed-unit-a-l5-l8.ts     → L5, L6, L7, L8 (Lessons 5–8 spec content)
  //   seed-sci7a-lessonskills.ts → LessonSkill tags for Unit A
  run('seed-lesson-content.ts', 'Step 2a/8 — Unit A: L1 (Ecosystem Basics)');
  run('seed-unit-a-content.ts', 'Step 2b/8 — Unit A: L2–L4 (Producers, Relationships, Cycles)');
  run('seed-unit-a-l5-l8.ts',   'Step 2c/8 — Unit A: L5–L8 (Field Study → Action Plan)');
  run('seed-sci7a-lessonskills.ts', 'Step 2d/8 — Unit A: LessonSkill mappings');

  // ─── Step 3: Unit B — Plants for Food & Fibre (7 lessons) ───────────
  run('seed-sci-ub-l1-l4.ts', 'Step 3a/8 — Unit B: L1–L4 (Plant Survival → Growing Conditions)');
  run('seed-sci-ub-l5-l7.ts', 'Step 3b/8 — Unit B: L5–L7 (Agriculture → Performance Task)');

  // ─── Step 4: Unit C — Heat & Temperature (6 lessons) ────────────────
  run('seed-sci-uc-l1-l3.ts', 'Step 4a/8 — Unit C: L1–L3 (Particle Model → Thermal Expansion)');
  run('seed-sci-uc-l4-l6.ts', 'Step 4b/8 — Unit C: L4–L6 (Heating Tech → Performance Task)');

  // ─── Step 5: Unit D — Structures & Forces (8 lessons) ───────────────
  run('seed-sci-ud-l1-l3.ts', 'Step 5a/8 — Unit D: L1–L3 (Structures → Stability)');
  run('seed-sci-ud-l4-l8.ts', 'Step 5b/8 — Unit D: L4–L8 (Materials → Performance Task)');

  // ─── Step 6: Unit E — Planet Earth (7 lessons) ──────────────────────
  run('seed-sci-ue-l1-l3.ts', 'Step 6a/8 — Unit E: L1–L3 (Earth Layers → Weathering)');
  run('seed-sci-ue-l4-l7.ts', 'Step 6b/8 — Unit E: L4–L7 (Plate Tectonics → Performance Task)');

  // ─── Step 7: Mastery Skill Tree ──────────────────────────────────────
  // Seeds parent + child skill nodes and creates all LessonSkill +
  // ActivitySkill mappings across all seeded lessons.
  // Must run LAST — depends on all lessons and quiz questions existing.
  run('seed-mastery-skills.ts', 'Step 7/8 — Mastery skill tree + LessonSkill/ActivitySkill mappings');

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`🎉 COMPLETE — Grade 7 Science fully seeded in ${elapsed}s`);
  console.log('═'.repeat(60));
  console.log('\nWhat was seeded:');
  console.log('  • 5 Science Units (A–E)');
  console.log('  • 36 Lessons with full block + quiz question content');
  console.log('  • Mastery skill tree (parent + child skills)');
  console.log('  • LessonSkill + ActivitySkill relationship mappings');
  console.log('\nNext step: npm run dev — then walk through Units A–E as a demo student.');
  console.log('See task.md for the full verification checklist.\n');
}

main().catch((err) => {
  console.error('\n❌ Orchestrator failed:', err.message || err);
  process.exit(1);
});
