// ============================================
// Seed ELA Unit 6 — "Publish and Reflect" (Lessons 5–6)
// ============================================
// Publishing showcase and year-end celebration.
// Run: npx tsx prisma/seed-ela-u6-l5-l6.ts

import { config } from 'dotenv';
config({ path: '.env.local' });
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding ELA Unit 6 "Publish and Reflect" — L5-L6');

  const lessonDefs = [
    { id: 'g6-ela-u6-l5', title: 'Publishing Your Work', order: 5, learningGoal: 'Prepare polished writing for publication, including formatting, presentation, and audience-awareness.', successCriteria: 'I can format a piece of writing for publication.\nI can adapt my writing for a specific audience.\nI can present my published work with confidence.', reflectionPrompt: 'What does it feel like to share your polished writing with the world? How does knowing someone will READ your work change how you write?' },
    { id: 'g6-ela-u6-l6', title: 'Celebration of Learning', order: 6, learningGoal: 'Celebrate your growth as a reader, writer, speaker, and thinker through sharing, reflection, and goal-setting.', successCriteria: 'I can share my portfolio with an audience.\nI can articulate my growth with specific examples.\nI can set meaningful goals for future learning.\nI can celebrate both my growth and the growth of my peers.', reflectionPrompt: 'What is your proudest accomplishment from Grade 6 ELA? What will you carry with you into Grade 7?' },
  ];

  for (const l of lessonDefs) {
    await prisma.lesson.upsert({
      where: { id: l.id },
      update: { title: l.title, order: l.order, subjectMode: 'ELA', estimatedMinutes: 40, learningGoal: l.learningGoal, successCriteria: l.successCriteria, reflectionPrompt: l.reflectionPrompt, masteryConfig: { passPercent: 80, maxRetries: 5, reteachEnabled: true, immediateCorrectiveFeedback: false } },
      create: { id: l.id, unitId: 'g6-ela-u6', title: l.title, order: l.order, subjectMode: 'ELA', estimatedMinutes: 40, learningGoal: l.learningGoal, successCriteria: l.successCriteria, reflectionPrompt: l.reflectionPrompt, masteryConfig: { passPercent: 80, maxRetries: 5, reteachEnabled: true, immediateCorrectiveFeedback: false } },
    });
  }
  console.log('Lessons 5-6 upserted');

  for (const l of lessonDefs) {
    await prisma.lessonBlock.deleteMany({ where: { lessonId: l.id } });
    await prisma.quizQuestion.deleteMany({ where: { lessonId: l.id } });
  }

  // L5: Publishing Your Work — WC.1, WC.5, Review: WC.3, OC.4
  const L5 = 'g6-ela-u6-l5';
  const l5Blocks = [
    { id: 'u6-l5-learn-1', section: 'LEARN', blockType: 'TEXT', order: 1, content: { html: '<h3>From Draft to Published</h3><p><strong>Publishing</strong> is the final stage of the writing process — sharing your polished work with a real audience.</p><p>Publishing can take many forms:</p><ul><li>A class anthology or literary magazine</li><li>A digital portfolio or blog post</li><li>A spoken word performance</li><li>A display in the hallway or classroom</li><li>Sharing with family at a celebration of learning</li></ul><p>The key shift in publishing is <strong>audience</strong> — your writing is no longer just for you and your teacher. Someone ELSE is going to read it. This changes how you think about clarity, formatting, and impact.</p>' } },
    { id: 'u6-l5-learn-2', section: 'LEARN', blockType: 'TEXT', order: 2, content: { html: '<h3>Formatting for Publication</h3><ul><li><strong>Title:</strong> Choose a title that is engaging and reflects the content</li><li><strong>Layout:</strong> Use consistent formatting (font, spacing, margins)</li><li><strong>Visual elements:</strong> Add images or decorations that support the content where appropriate</li><li><strong>Author credit:</strong> Include your name and a brief author bio</li><li><strong>Final proofread:</strong> One last check for errors before sharing</li></ul>' } },
    { id: 'u6-l5-learn-3', section: 'LEARN', blockType: 'MICRO_CHECK', order: 3, content: { question: 'Publishing is the final stage of the writing process. The MOST important shift when publishing is:', options: [{ label: 'Choosing a font', value: 'a' }, { label: 'AUDIENCE AWARENESS — your writing is now being read by others, which changes how you think about clarity and impact', value: 'b', correct: true }, { label: 'Making it longer', value: 'c' }], explanation: 'When writing is shared, every choice matters more. Clarity, impact, and presentation all serve the reader experience.' } },
    { id: 'u6-l5-prac-1', section: 'PRACTICE', blockType: 'CONSTRUCTED_RESPONSE', order: 1, content: { prompt: 'Prepare your strongest portfolio piece for publication:\n\n1. Give it a polished TITLE (if it does not have one already)\n2. Write a 3-4 sentence AUTHOR BIO about yourself as a writer\n3. Do one FINAL PROOFREAD and list 3 specific things you checked and fixed\n4. Describe the FORMAT you chose and WHY (digital, printed, performed, etc.)\n5. Who is your intended AUDIENCE? How does knowing your audience affect your choices?', minLength: 50 } },
    { id: 'u6-l5-refl-1', section: 'REFLECT', blockType: 'CONSTRUCTED_RESPONSE', order: 1, content: { prompt: 'What does it feel like to share your polished writing with the world? How does knowing someone will READ your work change how you write?', minLength: 30 } },
  ];
  for (const b of l5Blocks) { await prisma.lessonBlock.create({ data: { id: b.id, lessonId: L5, section: b.section, blockType: b.blockType, content: b.content, order: b.order } }); }
  console.log('L5: ' + l5Blocks.length + ' blocks');

  const l5Qs = [
    { id: 'u6-l5-q1', questionText: 'PUBLISHING in the writing process means:', options: [{ label: 'Writing a first draft', value: 'a' }, { label: 'Sharing your polished, final work with a real audience', value: 'b', correct: true }, { label: 'Saving your file', value: 'c' }, { label: 'Deleting your draft', value: 'd' }], correctAnswer: 'b', explanation: 'Publishing is the culmination of plan, draft, revise, edit. The work is shared with readers beyond yourself and your teacher.', outcomeCode: 'ELA.6.WC.1', difficulty: 1 },
    { id: 'u6-l5-q2', questionText: 'Audience awareness matters in publishing because:', options: [{ label: 'It does not matter', value: 'a' }, { label: 'Knowing someone will read your work makes you think more carefully about clarity, formatting, and impact', value: 'b', correct: true }, { label: 'Only teachers read student work', value: 'c' }, { label: 'Publishing means no one reads it', value: 'd' }], correctAnswer: 'b', explanation: 'A real audience creates accountability. You revise more carefully when you know a reader depends on your clarity.', outcomeCode: 'ELA.6.WC.1', difficulty: 1 },
    { id: 'u6-l5-q3', questionText: 'A final proofread should check for:', options: [{ label: 'Only the title', value: 'a' }, { label: 'Spelling, grammar, punctuation, and formatting errors before publishing', value: 'b', correct: true }, { label: 'Word count only', value: 'c' }, { label: 'Nothing — revision is already done', value: 'd' }], correctAnswer: 'b', explanation: 'The final proofread is the last quality check. It catches small errors that revision may have missed.', outcomeCode: 'ELA.6.WC.5', difficulty: 1 },
    { id: 'u6-l5-q4', questionText: 'An AUTHOR BIO in a published piece:', options: [{ label: 'Is unnecessary', value: 'a' }, { label: 'Introduces the writer to the audience and builds personal connection with readers', value: 'b', correct: true }, { label: 'Should be the longest part', value: 'c' }, { label: 'Should list every grade you received', value: 'd' }], correctAnswer: 'b', explanation: 'A bio gives readers context about who wrote the piece. It humanizes the writer and creates connection.', outcomeCode: 'ELA.6.WC.1', difficulty: 1 },
    { id: 'u6-l5-q5', questionText: 'The complete writing process in order is:', options: [{ label: 'Publish, then write', value: 'a' }, { label: 'Plan, draft, revise, edit, publish', value: 'b', correct: true }, { label: 'Draft, publish, revise', value: 'c' }, { label: 'There is no order', value: 'd' }], correctAnswer: 'b', explanation: 'The process builds logically: plan your ideas, draft them, revise for quality, edit for conventions, and finally share with the world.', outcomeCode: 'ELA.6.WC.1', difficulty: 1 },
    { id: 'u6-l5-q6', questionText: 'Choosing the RIGHT FORMAT for publishing depends on:', options: [{ label: 'Nothing', value: 'a' }, { label: 'The type of writing, the intended audience, and the purpose of sharing', value: 'b', correct: true }, { label: 'Only what the teacher prefers', value: 'c' }, { label: 'The length of the piece', value: 'd' }], correctAnswer: 'b', explanation: 'A poem might be best performed; a research report might be best as a printed document; a blog post works for informal writing.', outcomeCode: 'ELA.6.WC.3', difficulty: 2 },
    { id: 'u6-l5-q7', questionText: 'Adapting a presentation for a specific audience requires:', options: [{ label: 'Using the same approach for everyone', value: 'a' }, { label: 'Choosing language, tone, examples, and format that connect with your specific audience', value: 'b', correct: true }, { label: 'Using the longest words', value: 'c' }, { label: 'Ignoring who will read it', value: 'd' }], correctAnswer: 'b', explanation: 'Audience awareness means adjusting to your readers: peers, family, younger students, or a broader community all require different approaches.', outcomeCode: 'ELA.6.OC.4', difficulty: 2 },
    { id: 'u6-l5-q8', questionText: 'Publishing gives writers the experience of:', options: [{ label: 'Only getting grades', value: 'a' }, { label: 'Sharing ideas with the world, receiving real feedback, and understanding writing as a form of communication', value: 'b', correct: true }, { label: 'Nothing different from drafting', value: 'c' }, { label: 'Only showing the teacher', value: 'd' }], correctAnswer: 'b', explanation: 'Publishing transforms writing from a school task to a real act of communication. The writer speaks to a reader, and that changes everything.', outcomeCode: 'ELA.6.WC.1', difficulty: 1 },
  ];
  for (const q of l5Qs) { await prisma.quizQuestion.create({ data: { id: q.id, lessonId: L5, questionText: q.questionText, questionType: 'MULTIPLE_CHOICE', options: q.options, correctAnswer: q.correctAnswer, explanation: q.explanation, outcomeCode: q.outcomeCode, difficulty: q.difficulty } }); }
  console.log('L5: ' + l5Qs.length + ' questions');

  // L6: Celebration of Learning — OC.5, WC.4, Review: OC.3, RC.3
  const L6 = 'g6-ela-u6-l6';
  const l6Blocks = [
    { id: 'u6-l6-learn-1', section: 'LEARN', blockType: 'TEXT', order: 1, content: { html: '<h3>Celebration of Learning</h3><p>This is the final lesson of Grade 6 ELA. You have:</p><ul><li>Read and analyzed fiction, non-fiction, poetry, and drama</li><li>Written narratives, research reports, arguments, poems, and reflections</li><li>Presented to audiences, given peer feedback, and collaborated in discussions</li><li>Explored identity, perspective, justice, wonder, and creativity</li></ul><p>Today, you share your portfolio, your reflections, and your growth with an audience. This is not an end — it is a launching point for Grade 7.</p>' } },
    { id: 'u6-l6-prac-1', section: 'PRACTICE', blockType: 'CONSTRUCTED_RESPONSE', order: 1, content: { prompt: 'Celebration of Learning Presentation:\n\n1. Share your portfolio with your audience (family, classmates, or teacher)\n2. Present your reflective essay highlights: Where you started, what you learned, what challenged you, and where you are going\n3. Read or perform ONE selected piece from your portfolio\n\nAfter sharing, write:\n- What feedback did you receive?\n- What are you MOST proud of from this year?\n- What are your top 3 GOALS for Grade 7 ELA?', minLength: 50 } },
    { id: 'u6-l6-refl-1', section: 'REFLECT', blockType: 'CONSTRUCTED_RESPONSE', order: 1, content: { prompt: 'What is your proudest accomplishment from Grade 6 ELA? What will you carry with you as a reader, writer, speaker, and thinker into Grade 7 and beyond?', minLength: 30 } },
  ];
  for (const b of l6Blocks) { await prisma.lessonBlock.create({ data: { id: b.id, lessonId: L6, section: b.section, blockType: b.blockType, content: b.content, order: b.order } }); }
  console.log('L6: ' + l6Blocks.length + ' blocks');

  const l6Qs = [
    { id: 'u6-l6-q1', questionText: 'A "Celebration of Learning" is:', options: [{ label: 'A final test', value: 'a' }, { label: 'An opportunity to share your portfolio, reflect on growth, and set goals for the future', value: 'b', correct: true }, { label: 'A party with no purpose', value: 'c' }, { label: 'Only for the teacher', value: 'd' }], correctAnswer: 'b', explanation: 'Celebrations of learning honour the journey, share achievements, and look forward. They make learning visible and celebrated.', outcomeCode: 'ELA.6.OC.5', difficulty: 1 },
    { id: 'u6-l6-q2', questionText: 'Presenting your portfolio to an audience develops:', options: [{ label: 'Nothing', value: 'a' }, { label: 'Public speaking confidence, self-assessment skills, and the ability to communicate your learning journey', value: 'b', correct: true }, { label: 'Only volume', value: 'c' }, { label: 'Fear', value: 'd' }], correctAnswer: 'b', explanation: 'Portfolio presentations combine oral communication, metacognition, and creative expression — all core ELA skills.', outcomeCode: 'ELA.6.OC.5', difficulty: 1 },
    { id: 'u6-l6-q3', questionText: 'Celebrating the growth of your PEERS is important because:', options: [{ label: 'It wastes time', value: 'a' }, { label: 'It builds community, empathy, and shared appreciation for learning', value: 'b', correct: true }, { label: 'It only matters at events', value: 'c' }, { label: 'It replaces your own reflection', value: 'd' }], correctAnswer: 'b', explanation: 'Recognizing others growth builds empathy and community. Collaborative celebration makes learning a shared experience.', outcomeCode: 'ELA.6.OC.3', difficulty: 1 },
    { id: 'u6-l6-q4', questionText: 'Setting GOALS for Grade 7 shows:', options: [{ label: 'You failed Grade 6', value: 'a' }, { label: 'Forward-thinking self-awareness and understanding that learning is a continuous, lifelong journey', value: 'b', correct: true }, { label: 'Nothing meaningful', value: 'c' }, { label: 'You are done learning', value: 'd' }], correctAnswer: 'b', explanation: 'Goals transform reflection into action. They show maturity, self-awareness, and commitment to continued growth.', outcomeCode: 'ELA.6.RC.3', difficulty: 1 },
    { id: 'u6-l6-q5', questionText: 'Looking back at ALL 6 units, ELA skills are:', options: [{ label: 'Separate and unrelated', value: 'a' }, { label: 'INTERCONNECTED — reading supports writing, speaking supports reading, and all skills build on each other', value: 'b', correct: true }, { label: 'Only about spelling', value: 'c' }, { label: 'Only important in English class', value: 'd' }], correctAnswer: 'b', explanation: 'ELA is a web of connected skills. Strong reading improves writing. Speaking builds confidence. Critical thinking deepens all the others.', outcomeCode: 'ELA.6.RC.3', difficulty: 2 },
    { id: 'u6-l6-q6', questionText: 'The MOST meaningful way to demonstrate mastery is:', options: [{ label: 'Getting a high grade on a test', value: 'a' }, { label: 'Showing growth through a portfolio with reflections, evidence, and honest self-assessment', value: 'b', correct: true }, { label: 'Memorizing vocabulary', value: 'c' }, { label: 'Completing every assignment', value: 'd' }], correctAnswer: 'b', explanation: 'Mastery goes beyond scores. A curated portfolio with reflective analysis shows deep, authentic learning and metacognition.', outcomeCode: 'ELA.6.WC.4', difficulty: 2 },
    { id: 'u6-l6-q7', questionText: 'Performing or reading a selected piece from your portfolio builds:', options: [{ label: 'Nothing', value: 'a' }, { label: 'Confidence, voice, and the connection between written and oral expression', value: 'b', correct: true }, { label: 'Only reading speed', value: 'c' }, { label: 'Anxiety', value: 'd' }], correctAnswer: 'b', explanation: 'Performing your own work connects writing to speaking. It makes your words come alive and builds confidence in YOUR voice.', outcomeCode: 'ELA.6.OC.5', difficulty: 1 },
    { id: 'u6-l6-q8', questionText: 'Grade 6 ELA has prepared you for Grade 7 by developing:', options: [{ label: 'Only reading skills', value: 'a' }, { label: 'Critical thinking, evidence-based reasoning, creative expression, communication, empathy, and metacognition', value: 'b', correct: true }, { label: 'Only writing skills', value: 'c' }, { label: 'Only spelling', value: 'd' }], correctAnswer: 'b', explanation: 'Grade 6 ELA is a foundation of interconnected skills: reading, writing, speaking, listening, thinking, and reflecting. All transfer to Grade 7 and beyond.', outcomeCode: 'ELA.6.RC.3', difficulty: 1 },
  ];
  for (const q of l6Qs) { await prisma.quizQuestion.create({ data: { id: q.id, lessonId: L6, questionText: q.questionText, questionType: 'MULTIPLE_CHOICE', options: q.options, correctAnswer: q.correctAnswer, explanation: q.explanation, outcomeCode: q.outcomeCode, difficulty: q.difficulty } }); }
  console.log('L6: ' + l6Qs.length + ' questions');

  console.log('\n=== ELA UNIT 6 (L5-L6) SEED COMPLETE ===');
  console.log('Lessons:   2');
  console.log('Blocks:    ' + (l5Blocks.length + l6Blocks.length));
  console.log('Questions: ' + (l5Qs.length + l6Qs.length));
}

main()
  .catch((e) => { console.error('Seed error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); pool.end(); });
