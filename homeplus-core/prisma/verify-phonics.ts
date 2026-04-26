import { config } from 'dotenv';
config({ path: '.env.local' });

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { validateContentIsDecodable } from '../src/lib/phonics-validator';
import { processSpacedReviewItem } from '../src/lib/phonics-mastery';
import { updatePhonicsProfileEdgeCases } from '../src/lib/phonics-profile';
import { getMasteryEngine } from '../src/lib/mastery-engine';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });


async function runTests() {
  console.log('🧪 Starting Phonics Verification Tests...');

  // 1. Setup Test User
  const testUser = await prisma.user.upsert({
    where: { email: 'phonics-test@homeplus.com' },
    update: {},
    create: {
      id: 'test_student_phonics_1',
      name: 'Phonics Test Student',
      email: 'phonics-test@homeplus.com',
      studentAgeBand: 'early_primary',
      requiresDecodableText: true
    }
  });
  const studentId = testUser.id;

  // Cleanup past test data
  await prisma.phonicsProfile.deleteMany({ where: { studentId } });
  await prisma.studentMastery.deleteMany({ where: { studentId } });
  await prisma.spacedReviewItem.deleteMany({ where: { studentId } });
  await prisma.studentProgress.deleteMany({ where: { studentId } });

  // Baseline Profile
  await prisma.phonicsProfile.create({
    data: {
      studentId,
      currentLessonId: 'ufli-004'
    }
  });

  // ==========================================
  // TEST 1 & 2: Decodability Validator
  // ==========================================
  console.log('\n--- Test 1 & 2: Decodability Validator ---');
  
  // Student has mastered ufli-001 (short a) and ufli-002 (m)
  await prisma.studentMastery.createMany({
    data: [
      { studentId, lessonId: 'ufli-001', status: 'mastered', attempts: 1, lastDecodingAccuracy: 1.0, lastEncodingAccuracy: 1.0 },
      { studentId, lessonId: 'ufli-002', status: 'mastered', attempts: 1, lastDecodingAccuracy: 1.0, lastEncodingAccuracy: 1.0 }
    ]
  });

  const passageA = "am I a bat"; 
  // 'am' uses 'a' and 'm' (valid). 'I' is heart word from lesson 3 (invalid). 'a' is heart word from lesson 1 (valid). 'bat' uses 'b' (invalid).
  const validation1 = await validateContentIsDecodable(passageA, studentId);
  console.log(`Validator on "${passageA}": valid=${validation1.isValid}, invalidWords=${validation1.invalidWords}`);
  if (!validation1.isValid && validation1.invalidWords.includes('I') && validation1.invalidWords.includes('bat')) {
    console.log('✅ PASS: Blocked passage with untaught grapheme (bat) and heart word (I)');
  } else {
    console.log('❌ FAIL: Validator did not block correctly.', validation1);
  }

  // ==========================================
  // TEST 3 & 4: Mastery Computation & 3-Strike
  // ==========================================
  console.log('\n--- Test 3 & 4: Mastery Engine ---');
  const engine = getMasteryEngine('PHONICS');

  // Attempt 1: Fail Decoding, Pass Encoding
  const attempt1 = engine.evaluate(
    [], // answers
    [
      { id: 'q1', outcomeCode: 'DECODING_STEP4', correctAnswer: null, options: null, questionType: 'TEXT' },
      { id: 'q2', outcomeCode: 'ENCODING_STEP8', correctAnswer: null, options: null, questionType: 'TEXT' },
    ],
    [], // previous
    { passPercent: 90, maxRetries: 3 }
  );
  // Hack the scoreAnswers via prototype or just simulate the math
  // Since we can't easily mock scoreAnswers inside the engine without passing valid answers,
  // let's pass actual answers that match the outcome.
  const answers1 = [
    { questionId: 'q1', response: 'wrong' }, // Decoding fail
    { questionId: 'q2', response: 'correct' }, // Encoding pass
  ];
  const questions1 = [
    { id: 'q1', outcomeCode: 'DECODING_STEP4', correctAnswer: 'correct', options: null, questionType: 'TEXT' },
    { id: 'q2', outcomeCode: 'ENCODING_STEP8', correctAnswer: 'correct', options: null, questionType: 'TEXT' },
  ];
  
  const eval1 = engine.evaluate(answers1, questions1, [], { passPercent: 90, maxRetries: 3 });
  if (!eval1.passed) {
    console.log('✅ PASS: Mastery failed when decoding threshold not met.');
  }

  // 3-Strike Rule simulation
  const prevAttempts = [
    { questionId: 'q1', correct: false, attemptNumber: 1 },
    { questionId: 'q1', correct: false, attemptNumber: 2 }
  ];
  const eval3 = engine.evaluate(answers1, questions1, prevAttempts, { passPercent: 90, maxRetries: 3 });
  if (eval3.needsReteach) {
    console.log('✅ PASS: 3 consecutive failures triggers needsReteach (teacher flag).');
  } else {
    console.log('❌ FAIL: 3-strike rule not enforced.', eval3);
  }

  // ==========================================
  // TEST 5 & 6: Over/Under Placement Edge Cases
  // ==========================================
  console.log('\n--- Test 5 & 6: Placement Edge Cases ---');
  
  // Over-placement: Fails first attempt at placement lesson
  await prisma.studentMastery.create({
    data: { studentId, lessonId: 'ufli-004', status: 'in_progress', attempts: 1, lastDecodingAccuracy: 0.5, lastEncodingAccuracy: 0.5 }
  });
  await updatePhonicsProfileEdgeCases(studentId, 'ufli-004', 'PHONICS', false, 50);
  
  let p = await prisma.phonicsProfile.findUnique({ where: { studentId } });
  if (p?.placementMismatchSuspected) {
    console.log('✅ PASS: First-attempt failure flagged placementMismatchSuspected (Over-placement).');
  }

  // Under-placement: 3 perfect passes
  await prisma.studentMastery.deleteMany({ where: { studentId } });
  await prisma.phonicsProfile.update({ where: { studentId }, data: { placementMismatchSuspected: false } });

  await prisma.studentMastery.createMany({
    data: [
      { studentId, lessonId: 'ufli-005', status: 'mastered', attempts: 1, lastDecodingAccuracy: 1.0, lastEncodingAccuracy: 1.0 },
      { studentId, lessonId: 'ufli-006', status: 'mastered', attempts: 1, lastDecodingAccuracy: 1.0, lastEncodingAccuracy: 1.0 },
      { studentId, lessonId: 'ufli-007', status: 'mastered', attempts: 1, lastDecodingAccuracy: 1.0, lastEncodingAccuracy: 1.0 },
    ]
  });

  await updatePhonicsProfileEdgeCases(studentId, 'ufli-007', 'PHONICS', true, 100);
  p = await prisma.phonicsProfile.findUnique({ where: { studentId } });
  if (p?.placementUnderMatchSuspected) {
    console.log('✅ PASS: Three 100% first-passes flagged placementUnderMatchSuspected (Under-placement).');
  }

  // ==========================================
  // TEST 7: Comprehension Lag
  // ==========================================
  console.log('\n--- Test 7: Comprehension Lag ---');
  // Reading tutor (ELA) score < 60, but recent phonics decoding > 95%
  await updatePhonicsProfileEdgeCases(studentId, 'ela-101', 'ELA', false, 50);
  p = await prisma.phonicsProfile.findUnique({ where: { studentId } });
  if (p?.comprehensionGapSuspected) {
    console.log('✅ PASS: High decoding + low comprehension flagged comprehensionGapSuspected.');
  }

  // ==========================================
  // TEST 8: Spaced Review Engine
  // ==========================================
  console.log('\n--- Test 8: Spaced Review Engine ---');
  let review = await processSpacedReviewItem(studentId, 'g_a_short', 'grapheme', 0.95);
  if (review.currentIntervalIndex === 0) {
    console.log('✅ PASS: New item enters queue at Day 1 (index 0).');
  }

  // Advance
  review = await processSpacedReviewItem(studentId, 'g_a_short', 'grapheme', 0.95);
  if (review.currentIntervalIndex === 1) {
    console.log('✅ PASS: Successful review (>=90%) advanced item to next interval.');
  }

  // Fail
  review = await processSpacedReviewItem(studentId, 'g_a_short', 'grapheme', 0.80);
  if (review.currentIntervalIndex === 0 && review.consecutiveFailures === 1) {
    console.log('✅ PASS: Failed review (<90%) reset interval to Day 1.');
  }

  console.log('\n🎉 All Phonics Verification Tests Completed!');
}

runTests()
  .catch(e => { console.error('Tests failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
