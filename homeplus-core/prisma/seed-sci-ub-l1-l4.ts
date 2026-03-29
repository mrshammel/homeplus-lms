// ============================================
// Seed Science Unit B L1-L4 — Plants for Food & Fibre
// ============================================
// Extracted from grade-7/science/unit-b-plants/index.html
// Run: npx tsx prisma/seed-sci-ub-l1-l4.ts

import { config } from 'dotenv';
config({ path: '.env.local' });

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

// ╔═══════════════════════════════════════════════════════════╗
// ║  LESSON 1: Plant Survival                                 ║
// ╚═══════════════════════════════════════════════════════════╝

async function seedLesson1() {
  const ID = 'g7-sci-ub-l1';
  console.log('\n🌿 Seeding UB L1: Plant Survival...');

  await prisma.lesson.update({
    where: { id: ID },
    data: {
      subjectMode: 'SCIENCE',
      estimatedMinutes: 45,
      learningGoal: 'Explain the essential role of plants within ecosystems, identify plant structures and their functions, describe basic plant needs, and explain photosynthesis.',
      successCriteria: 'I can list at least 4 roles plants play in ecosystems, name the 6 main plant structures and their functions, and write the photosynthesis equation.',
      materials: 'Science notebook, coloured pencils',
      reflectionPrompt: 'What surprised you most about plants? How would your daily life be different without them?',
      masteryConfig: { passPercent: 80, maxRetries: 5, reteachEnabled: true, immediateCorrectiveFeedback: false },
    },
  });

  await prisma.lessonBlock.deleteMany({ where: { lessonId: ID } });
  await prisma.quizQuestion.deleteMany({ where: { lessonId: ID } });

  const blocks = [
    { id: 'ub-l1-learn-1', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 1, content: { html: '<h2>🌍 Why Do Plants Matter?</h2><p>Plants are the foundation of nearly every ecosystem on Earth. They perform critical jobs:</p><ul><li><strong>Oxygen Producers</strong> — produce the oxygen we breathe through photosynthesis</li><li><strong>Food Source</strong> — all food chains begin with plants as primary producers</li><li><strong>Habitat</strong> — forests, grasslands, and wetlands provide shelter for countless animals</li><li><strong>Climate Regulators</strong> — absorb CO₂ and release O₂, helping regulate Earth\'s atmosphere</li><li><strong>Fibre & Materials</strong> — cotton, wood, linen, and rubber all come from plants</li><li><strong>Medicine</strong> — many medicines come from plants (aspirin was originally from willow bark!)</li></ul>' } },
    { id: 'ub-l1-learn-2', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 2, content: { html: '<h3>💧 What Do Plants Need to Survive?</h3><p>Plants have basic needs provided by abiotic and biotic factors:</p><ul><li><strong>☀️ Sunlight</strong> — energy source for photosynthesis</li><li><strong>💧 Water</strong> — essential for transporting nutrients and photosynthesis</li><li><strong>🌬️ Carbon Dioxide</strong> — absorbed through stomata in leaves</li><li><strong>🧱 Soil Nutrients</strong> — nitrogen, phosphorus, potassium absorbed through roots</li><li><strong>📐 Space</strong> — room for roots and leaves without competition</li><li><strong>🌡️ Right Temperature</strong> — each species has a preferred range</li></ul>' } },
    { id: 'ub-l1-learn-3', section: 'LEARN' as const, blockType: 'VOCABULARY' as const, order: 3, content: { terms: [
      { term: 'Photosynthesis', definition: 'The process by which plants convert light energy, water, and CO₂ into sugar (food) and oxygen.', example: 'A leaf absorbing sunlight to produce glucose.' },
      { term: 'Producer', definition: 'An organism that makes its own food using energy from the sun.', example: 'Grass, trees, algae.' },
      { term: 'Nutrients', definition: 'Minerals and substances that living things need to grow and stay healthy.', example: 'Nitrogen, phosphorus, potassium in soil.' },
      { term: 'Stomata', definition: 'Tiny pores on leaf surfaces that allow CO₂ in and O₂ out during photosynthesis.', example: 'Microscopic openings on the underside of leaves.' },
      { term: 'Chloroplast', definition: 'The part of a plant cell where photosynthesis takes place. Contains chlorophyll.', example: 'Green organelles inside leaf cells.' },
      { term: 'Structure', definition: 'A part of a plant with a specific shape and purpose.', example: 'Roots, stems, leaves, flowers.' },
      { term: 'Function', definition: 'The job or purpose of a structure.', example: 'The function of roots is to absorb water.' },
    ] } },
    { id: 'ub-l1-learn-4', section: 'LEARN' as const, blockType: 'VIDEO' as const, order: 4, content: { url: 'https://www.youtube.com/embed/A_DF246uVlU', title: 'Amoeba Sisters: Plant Cells & Structures', transcript: 'This video explains plant cell structures and their functions.' } },
    { id: 'ub-l1-learn-5', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 5, content: { html: '<h3>🌳 Plant Structures & Their Functions</h3><table><thead><tr><th>Structure</th><th>Function</th><th>Details</th></tr></thead><tbody><tr><td>🌱 <strong>Roots</strong></td><td>Absorption & Anchor</td><td>Absorb water and minerals from soil; anchor the plant. Some store food (carrots, beets).</td></tr><tr><td>🪵 <strong>Stem</strong></td><td>Transport & Support</td><td>Carries water from roots to leaves and sugar from leaves to roots.</td></tr><tr><td>🍃 <strong>Leaves</strong></td><td>Photosynthesis & Gas Exchange</td><td>Main site of photosynthesis. Stomata allow CO₂ in and O₂ out.</td></tr><tr><td>🌸 <strong>Flowers</strong></td><td>Reproduction</td><td>Attract pollinators. Contain stamen (male) and pistil (female) parts.</td></tr><tr><td>🍇 <strong>Fruit</strong></td><td>Seed Protection & Dispersal</td><td>Protects seeds and helps spread them.</td></tr><tr><td>🌰 <strong>Seeds</strong></td><td>New Plant Growth</td><td>Contain an embryo plant and food supply.</td></tr></tbody></table>' } },
    { id: 'ub-l1-learn-6', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 6, content: { html: '<h3>🔬 Photosynthesis: How Plants Make Food</h3><p>Photosynthesis happens mainly in the <strong>leaves</strong>, inside <strong>chloroplasts</strong>.</p><div style="background:#f0fdf4;padding:16px;border-radius:12px;text-align:center;font-size:1.1rem;margin:12px 0"><p style="font-weight:700">☀️ Light + 💧 Water + 🌬️ CO₂ → 🍬 Sugar + 🫁 O₂</p><p style="font-size:.82rem;color:#666;margin-top:8px">6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂</p></div>' } },
    { id: 'ub-l1-learn-mc1', section: 'LEARN' as const, blockType: 'MICRO_CHECK' as const, order: 7, content: { question: 'Which gas do plants absorb through their stomata for photosynthesis?', options: [{ label: 'Oxygen', value: 'a' }, { label: 'Nitrogen', value: 'b' }, { label: 'Carbon dioxide', value: 'c', correct: true }, { label: 'Hydrogen', value: 'd' }], explanation: 'Plants absorb CO₂ through stomata and use it along with water and light to make sugar.' } },
    { id: 'ub-l1-learn-7', section: 'LEARN' as const, blockType: 'VIDEO' as const, order: 8, content: { url: 'https://www.youtube.com/embed/sQK3Yr4Sc_k', title: 'Crash Course Biology: Photosynthesis', transcript: 'This video explains photosynthesis in detail.' } },
    { id: 'ub-l1-prac-1', section: 'PRACTICE' as const, blockType: 'MATCHING' as const, order: 1, content: { instruction: 'Match each plant structure to its main function:', pairs: [{ left: 'Roots', right: 'Absorb water and anchor the plant' }, { left: 'Stem', right: 'Transport water and provide support' }, { left: 'Leaves', right: 'Photosynthesis and gas exchange' }, { left: 'Flowers', right: 'Reproduction' }, { left: 'Fruit', right: 'Seed protection and dispersal' }, { left: 'Seeds', right: 'Contain embryo for new plant growth' }] } },
    { id: 'ub-l1-prac-2', section: 'PRACTICE' as const, blockType: 'MULTIPLE_CHOICE' as const, order: 2, content: { question: 'In photosynthesis, which of the following is an OUTPUT (product)?', options: [{ label: 'Carbon dioxide', value: 'a' }, { label: 'Water', value: 'b' }, { label: 'Oxygen and sugar', value: 'c', correct: true }, { label: 'Soil nutrients', value: 'd' }], explanation: 'Photosynthesis produces sugar (glucose) and oxygen as outputs.' } },
    { id: 'ub-l1-reflect-1', section: 'REFLECT' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 1, content: { prompt: 'In 2-4 sentences, explain why plants are considered the most important organisms in an ecosystem. Use at least two vocabulary words from this lesson.', minLength: 60, rubricHint: 'Uses vocabulary (photosynthesis, producer, nutrients). Explains plant roles. Shows understanding of energy flow.', teacherReviewRequired: false } },
  ];

  for (const b of blocks) {
    await prisma.lessonBlock.create({ data: { id: b.id, lessonId: ID, section: b.section, blockType: b.blockType, content: b.content, order: b.order } });
  }
  console.log(`  ✅ ${blocks.length} blocks`);

  const questions = [
    { id: 'ub-l1-q1', questionText: 'Which of the following is NOT a role that plants play in ecosystems?', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Producing oxygen', value: 'a' }, { label: 'Providing habitat', value: 'b' }, { label: 'Hunting prey', value: 'c', correct: true }, { label: 'Regulating climate', value: 'd' }], correctAnswer: 'c', explanation: 'Plants are producers, not predators. They produce oxygen, provide habitat, and regulate climate.', outcomeCode: 'SCI.7.B.1.1', difficulty: 1 },
    { id: 'ub-l1-q2', questionText: 'The main site of photosynthesis in a plant is the:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Roots', value: 'a' }, { label: 'Stem', value: 'b' }, { label: 'Leaves', value: 'c', correct: true }, { label: 'Flowers', value: 'd' }], correctAnswer: 'c', explanation: 'Leaves contain chloroplasts where photosynthesis occurs.', outcomeCode: 'SCI.7.B.2.1', difficulty: 1 },
    { id: 'ub-l1-q3', questionText: 'What is the function of stomata?', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Absorb water from soil', value: 'a' }, { label: 'Allow CO₂ in and O₂ out for gas exchange', value: 'b', correct: true }, { label: 'Attract pollinators', value: 'c' }, { label: 'Store food', value: 'd' }], correctAnswer: 'b', explanation: 'Stomata are tiny pores on leaves that allow gas exchange during photosynthesis.', outcomeCode: 'SCI.7.B.2.1', difficulty: 1 },
    { id: 'ub-l1-q4', questionText: 'The correct equation for photosynthesis is:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Sugar + O₂ → CO₂ + Water', value: 'a' }, { label: 'CO₂ + Water + Light → Sugar + O₂', value: 'b', correct: true }, { label: 'O₂ + Sugar → Water + CO₂', value: 'c' }, { label: 'Water → Sugar + CO₂', value: 'd' }], correctAnswer: 'b', explanation: 'Plants use carbon dioxide, water, and light energy to produce sugar and oxygen.', outcomeCode: 'SCI.7.B.2.4', difficulty: 2 },
    { id: 'ub-l1-q5', questionText: 'Which plant structure is responsible for absorbing water and minerals from the soil?', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Leaves', value: 'a' }, { label: 'Stem', value: 'b' }, { label: 'Roots', value: 'c', correct: true }, { label: 'Flowers', value: 'd' }], correctAnswer: 'c', explanation: 'Roots absorb water and minerals from the soil and anchor the plant.', outcomeCode: 'SCI.7.B.2.1', difficulty: 1 },
    { id: 'ub-l1-q6', questionText: 'Plants are called "producers" because they:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Eat other organisms', value: 'a' }, { label: 'Make their own food from sunlight through photosynthesis', value: 'b', correct: true }, { label: 'Break down dead material', value: 'c' }, { label: 'Produce seeds', value: 'd' }], correctAnswer: 'b', explanation: 'Producers make their own food using energy from the sun — plants are the primary producers in ecosystems.', outcomeCode: 'SCI.7.B.1.1', difficulty: 1 },
    { id: 'ub-l1-q7', questionText: 'Chloroplasts are important because they:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Store water', value: 'a' }, { label: 'Contain chlorophyll and carry out photosynthesis', value: 'b', correct: true }, { label: 'Transport sugar', value: 'c' }, { label: 'Protect the plant from disease', value: 'd' }], correctAnswer: 'b', explanation: 'Chloroplasts contain the green pigment chlorophyll, which captures light energy for photosynthesis.', outcomeCode: 'SCI.7.B.2.4', difficulty: 2 },
    { id: 'ub-l1-q8', questionText: 'Alberta\'s boreal forest is important because it:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Is the smallest forest in Canada', value: 'a' }, { label: 'Provides habitat for wildlife and absorbs CO₂', value: 'b', correct: true }, { label: 'Has no plants', value: 'c' }, { label: 'Is entirely man-made', value: 'd' }], correctAnswer: 'b', explanation: 'Alberta\'s boreal forest provides habitat for caribou, bears, and birds while absorbing millions of tonnes of CO₂.', outcomeCode: 'SCI.7.B.1.1', difficulty: 1 },
  ];

  for (const q of questions) {
    await prisma.quizQuestion.create({ data: { id: q.id, lessonId: ID, questionText: q.questionText, questionType: q.questionType, options: q.options, correctAnswer: q.correctAnswer, explanation: q.explanation, outcomeCode: q.outcomeCode, difficulty: q.difficulty } });
  }
  console.log(`  ✅ ${questions.length} questions`);
}

// ╔═══════════════════════════════════════════════════════════╗
// ║  LESSON 2: Growth & Reproduction                          ║
// ╚═══════════════════════════════════════════════════════════╝

async function seedLesson2() {
  const ID = 'g7-sci-ub-l2';
  console.log('\n🌻 Seeding UB L2: Growth & Reproduction...');

  await prisma.lesson.update({
    where: { id: ID },
    data: {
      subjectMode: 'SCIENCE', estimatedMinutes: 45,
      learningGoal: 'Describe the stages of a plant life cycle, explain pollination and seed formation, identify seed dispersal methods, and describe factors affecting growth.',
      successCriteria: 'I can order germination stages, distinguish self-pollination from cross-pollination, match 4 seed dispersal methods to examples, and predict growth factor effects.',
      materials: 'Science notebook, coloured pencils',
      reflectionPrompt: 'Think about the seeds and fruits you see every day. How do the dispersal methods help explain what you see in nature?',
      masteryConfig: { passPercent: 80, maxRetries: 5, reteachEnabled: true, immediateCorrectiveFeedback: false },
    },
  });

  await prisma.lessonBlock.deleteMany({ where: { lessonId: ID } });
  await prisma.quizQuestion.deleteMany({ where: { lessonId: ID } });

  const blocks = [
    { id: 'ub-l2-learn-1', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 1, content: { html: '<h2>🌱 From Seed to Plant: Germination</h2><p>Every plant begins as a <strong>seed</strong>. Inside is a tiny embryo plant and a food supply. When conditions are right, the seed <strong>germinates</strong>.</p><p><strong>Seeds need three things to germinate:</strong></p><ul><li>💧 <strong>Water</strong> — softens the seed coat and activates enzymes</li><li>🌡️ <strong>Warmth</strong> — enzymes need the right temperature range</li><li>🌬️ <strong>Oxygen</strong> — needed for cellular respiration to power initial growth</li></ul><p><strong>Key Idea:</strong> Seeds do NOT need light to germinate — they start underground!</p>' } },
    { id: 'ub-l2-learn-2', section: 'LEARN' as const, blockType: 'VOCABULARY' as const, order: 2, content: { terms: [
      { term: 'Germination', definition: 'The process where a seed begins to grow into a new plant when conditions are right.', example: 'A bean seed sprouting in moist soil.' },
      { term: 'Pollination', definition: 'Transfer of pollen from the male part (anther) to the female part (stigma) of a flower.', example: 'A bee carrying pollen between flowers.' },
      { term: 'Seed Dispersal', definition: 'How seeds are moved away from the parent plant — by wind, water, animals, or explosive pods.', example: 'Dandelion puffs floating in the wind.' },
      { term: 'Stamen', definition: 'Male reproductive part of a flower (anther + filament).', example: 'The pollen-producing part inside a lily.' },
      { term: 'Pistil', definition: 'Female reproductive part (stigma + style + ovary).', example: 'The central part of a flower that receives pollen.' },
      { term: 'Fertilization', definition: 'When pollen reaches the ovule inside the ovary, creating a seed.', example: 'Pollen tube growing down to the ovary.' },
    ] } },
    { id: 'ub-l2-learn-3', section: 'LEARN' as const, blockType: 'VIDEO' as const, order: 3, content: { url: 'https://www.youtube.com/embed/ck8IN24Jnw0', title: 'How Seeds Germinate', transcript: 'This video explains the stages of seed germination.' } },
    { id: 'ub-l2-learn-4', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 4, content: { html: '<h3>🐝 Pollination & Reproduction</h3><p>Flowering plants need <strong>pollination</strong> to make seeds.</p><ul><li><strong>Self-Pollination</strong> — pollen transfers within the same flower or plant. Simple but less genetic variety.</li><li><strong>Cross-Pollination</strong> — pollen moves between different plants via insects, birds, wind, or water. Creates more genetic diversity.</li></ul><p>After pollination, <strong>fertilization</strong> occurs and a <strong>seed</strong> forms. The ovary often develops into a <strong>fruit</strong>.</p><p><strong>Alberta Connection:</strong> Alberta\'s canola industry depends heavily on pollination. Alberta produces over 30% of Canada\'s canola — worth billions annually.</p>' } },
    { id: 'ub-l2-learn-5', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 5, content: { html: '<h3>💨 Seed Dispersal</h3><p>Plants evolved amazing ways to send seeds far away, preventing overcrowding:</p><ul><li>💨 <strong>Wind</strong> — dandelion puffs, maple keys, cottonwood</li><li>🌊 <strong>Water</strong> — coconuts float across oceans; willow seeds travel along rivers</li><li>🐿️ <strong>Animals</strong> — burrs stick to fur; berries are eaten and seeds pass through</li><li>💥 <strong>Explosive</strong> — touch-me-nots and pea pods burst open, flinging seeds</li></ul>' } },
    { id: 'ub-l2-learn-mc1', section: 'LEARN' as const, blockType: 'MICRO_CHECK' as const, order: 6, content: { question: 'What 3 conditions does a seed need to germinate?', options: [{ label: 'Light, soil, fertilizer', value: 'a' }, { label: 'Water, warmth, oxygen', value: 'b', correct: true }, { label: 'Wind, rain, sunlight', value: 'c' }, { label: 'Heat, pressure, darkness', value: 'd' }], explanation: 'Seeds need water (softens coat), warmth (activates enzymes), and oxygen (cellular respiration).' } },
    { id: 'ub-l2-prac-1', section: 'PRACTICE' as const, blockType: 'MATCHING' as const, order: 1, content: { instruction: 'Match each scenario to the correct type of pollination or seed dispersal:', pairs: [{ left: 'A bee carries pollen between rose bushes', right: 'Cross-Pollination' }, { left: 'Dandelion seeds float away in the wind', right: 'Wind Dispersal' }, { left: 'A coconut falls into the ocean and floats to a new island', right: 'Water Dispersal' }, { left: 'Burrs stick to a dog\'s fur on a walk', right: 'Animal Dispersal' }, { left: 'A pea pod dries out and bursts open, scattering seeds', right: 'Explosive Dispersal' }, { left: 'Pollen falls from an anther onto the stigma of the same flower', right: 'Self-Pollination' }] } },
    { id: 'ub-l2-reflect-1', section: 'REFLECT' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 1, content: { prompt: 'A farmer in central Alberta plants canola seeds. In 2-4 sentences, describe the journey from seed to new seeds: what conditions are needed for germination, how the flowers get pollinated, and how the seeds are eventually dispersed. Use at least 3 vocabulary words.', minLength: 60, rubricHint: 'Describes germination conditions. Explains pollination. Mentions dispersal. Uses vocabulary correctly.', teacherReviewRequired: false } },
  ];

  for (const b of blocks) {
    await prisma.lessonBlock.create({ data: { id: b.id, lessonId: ID, section: b.section, blockType: b.blockType, content: b.content, order: b.order } });
  }
  console.log(`  ✅ ${blocks.length} blocks`);

  const questions = [
    { id: 'ub-l2-q1', questionText: 'Seeds need three things to germinate. Which is NOT one of them?', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Water', value: 'a' }, { label: 'Warmth', value: 'b' }, { label: 'Light', value: 'c', correct: true }, { label: 'Oxygen', value: 'd' }], correctAnswer: 'c', explanation: 'Seeds germinate underground — they need water, warmth, and oxygen, not light.', outcomeCode: 'SCI.7.B.2.5', difficulty: 1 },
    { id: 'ub-l2-q2', questionText: 'Cross-pollination produces more genetic diversity than self-pollination because:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'It uses wind', value: 'a' }, { label: 'Pollen comes from a different plant, mixing genes', value: 'b', correct: true }, { label: 'It happens faster', value: 'c' }, { label: 'Self-pollination doesn\'t work', value: 'd' }], correctAnswer: 'b', explanation: 'Cross-pollination mixes genes from two different plants, creating more variety.', outcomeCode: 'SCI.7.B.2.5', difficulty: 2 },
    { id: 'ub-l2-q3', questionText: 'Dandelion seeds are dispersed by:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Water', value: 'a' }, { label: 'Animals', value: 'b' }, { label: 'Wind', value: 'c', correct: true }, { label: 'Explosion', value: 'd' }], correctAnswer: 'c', explanation: 'Dandelion seeds have parachute-like structures that catch the wind.', outcomeCode: 'SCI.7.B.2.5', difficulty: 1 },
    { id: 'ub-l2-q4', questionText: 'The female reproductive part of a flower is called the:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Stamen', value: 'a' }, { label: 'Pistil', value: 'b', correct: true }, { label: 'Petal', value: 'c' }, { label: 'Sepal', value: 'd' }], correctAnswer: 'b', explanation: 'The pistil (stigma + style + ovary) is the female part that receives pollen.', outcomeCode: 'SCI.7.B.2.5', difficulty: 1 },
    { id: 'ub-l2-q5', questionText: 'Why is seed dispersal important for plants?', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'It makes seeds bigger', value: 'a' }, { label: 'It prevents overcrowding and competition', value: 'b', correct: true }, { label: 'It makes plants grow faster', value: 'c' }, { label: 'It is not important', value: 'd' }], correctAnswer: 'b', explanation: 'Dispersal spreads seeds away from the parent, reducing competition for light, water, and nutrients.', outcomeCode: 'SCI.7.B.2.5', difficulty: 1 },
    { id: 'ub-l2-q6', questionText: 'After pollination, what must happen for a seed to form?', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'The flower must close', value: 'a' }, { label: 'Fertilization — pollen reaches the ovule', value: 'b', correct: true }, { label: 'The plant must be watered', value: 'c' }, { label: 'The leaves must fall off', value: 'd' }], correctAnswer: 'b', explanation: 'Pollen grows a tube down to the ovary, joins with the ovule (fertilization), and a seed forms.', outcomeCode: 'SCI.7.B.2.5', difficulty: 2 },
    { id: 'ub-l2-q7', questionText: 'More light generally means more plant growth because:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Light heats the soil', value: 'a' }, { label: 'More light = more photosynthesis = more food for growth', value: 'b', correct: true }, { label: 'Light kills pests', value: 'c' }, { label: 'Light replaces water', value: 'd' }], correctAnswer: 'b', explanation: 'Light energy drives photosynthesis, which produces the sugar (food) plants need to grow.', outcomeCode: 'SCI.7.B.2.3', difficulty: 1 },
    { id: 'ub-l2-q8', questionText: 'Alberta\'s canola industry depends on pollination. What type of pollination is most important for canola?', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Self-pollination only', value: 'a' }, { label: 'Cross-pollination by wind and insects', value: 'b', correct: true }, { label: 'Water pollination', value: 'c' }, { label: 'Canola doesn\'t need pollination', value: 'd' }], correctAnswer: 'b', explanation: 'Canola relies on both wind and insect pollinators for cross-pollination.', outcomeCode: 'SCI.7.B.2.5', difficulty: 2 },
  ];

  for (const q of questions) {
    await prisma.quizQuestion.create({ data: { id: q.id, lessonId: ID, questionText: q.questionText, questionType: q.questionType, options: q.options, correctAnswer: q.correctAnswer, explanation: q.explanation, outcomeCode: q.outcomeCode, difficulty: q.difficulty } });
  }
  console.log(`  ✅ ${questions.length} questions`);
}

// ╔═══════════════════════════════════════════════════════════╗
// ║  LESSON 3: Classification & Adaptations                   ║
// ╚═══════════════════════════════════════════════════════════╝

async function seedLesson3() {
  const ID = 'g7-sci-ub-l3';
  console.log('\n🔬 Seeding UB L3: Classification & Adaptations...');

  await prisma.lesson.update({
    where: { id: ID },
    data: {
      subjectMode: 'SCIENCE', estimatedMinutes: 45,
      learningGoal: 'Distinguish vascular from non-vascular plants, compare flowering and non-flowering plants, describe plant adaptations, and identify common Alberta plants.',
      successCriteria: 'I can sort plants into groups, give 3 examples of adaptations, and identify 4 Alberta plants by their features.',
      materials: 'Science notebook, coloured pencils',
      reflectionPrompt: 'Look outside. What types of plants can you identify? Are they vascular or non-vascular? Angiosperms or gymnosperms?',
      masteryConfig: { passPercent: 80, maxRetries: 5, reteachEnabled: true, immediateCorrectiveFeedback: false },
    },
  });

  await prisma.lessonBlock.deleteMany({ where: { lessonId: ID } });
  await prisma.quizQuestion.deleteMany({ where: { lessonId: ID } });

  const blocks = [
    { id: 'ub-l3-learn-1', section: 'LEARN' as const, blockType: 'VOCABULARY' as const, order: 1, content: { terms: [
      { term: 'Vascular', definition: 'Has tubes (xylem/phloem) to transport water and nutrients.', example: 'Ferns, trees, flowers.' },
      { term: 'Non-vascular', definition: 'No transport tubes — must stay small and moist.', example: 'Mosses, liverworts.' },
      { term: 'Angiosperm', definition: 'Flowering plant that produces seeds inside a fruit.', example: 'Roses, wheat, apple trees.' },
      { term: 'Gymnosperm', definition: 'Non-flowering plant with "naked seeds" in cones.', example: 'Spruce, pine, fir.' },
      { term: 'Adaptation', definition: 'A trait that helps a plant survive in its specific environment.', example: 'Cactus spines reduce water loss.' },
      { term: 'Dichotomous Key', definition: 'A tool that uses yes/no questions to identify organisms.', example: 'Does it have flowers? Yes → angiosperm.' },
    ] } },
    { id: 'ub-l3-learn-2', section: 'LEARN' as const, blockType: 'VIDEO' as const, order: 2, content: { url: 'https://www.youtube.com/embed/bRdq2FbG-OQ', title: 'Plant Classification', transcript: 'This video explains how scientists classify plants into groups.' } },
    { id: 'ub-l3-learn-3', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 3, content: { html: '<h3>🌿 Vascular vs. Non-Vascular Plants</h3><table><thead><tr><th>Feature</th><th>🌿 Vascular</th><th>🟢 Non-Vascular</th></tr></thead><tbody><tr><td>Transport</td><td>Xylem & phloem tubes</td><td>Osmosis/diffusion only</td></tr><tr><td>Size</td><td>Can grow very tall (trees)</td><td>Stay small (a few cm)</td></tr><tr><td>Roots</td><td>True roots</td><td>Root-like structures (rhizoids)</td></tr><tr><td>Examples</td><td>Ferns, grasses, trees, flowers</td><td>Mosses, liverworts, hornworts</td></tr></tbody></table>' } },
    { id: 'ub-l3-learn-4', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 4, content: { html: '<h3>🌸 Flowering vs. Non-Flowering Plants</h3><p><strong>🌸 Angiosperms (Flowering)</strong> — Produce flowers and fruits. Seeds protected inside a fruit. Examples: roses, wheat, apple trees, dandelions.</p><p><strong>🌲 Gymnosperms (Non-Flowering)</strong> — Produce seeds in cones, not flowers. "Naked seeds." Examples: spruce, pine, fir, larch.</p>' } },
    { id: 'ub-l3-learn-5', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 5, content: { html: '<h3>🏔️ Plant Adaptations to Extreme Environments</h3><ul><li><strong>🏜️ Desert:</strong> Cacti have thick stems to store water, waxy coatings, and spines instead of leaves.</li><li><strong>💧 Aquatic:</strong> Water lilies have broad floating leaves, air spaces in stems, and flexible stems.</li><li><strong>🏔️ Alpine:</strong> Plants grow low to resist wind, have hairy leaves for insulation, bloom quickly.</li><li><strong>🌲 Boreal (Alberta):</strong> Conifer needles have waxy coatings, small surface area, conical shape to shed snow.</li></ul>' } },
    { id: 'ub-l3-learn-6', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 6, content: { html: '<h3>🌲 Alberta Plant Identification</h3><ul><li><strong>🌲 White Spruce</strong> — Vascular gymnosperm. Sharp needles, cylindrical cones. Alberta\'s most common tree.</li><li><strong>🍂 Trembling Aspen</strong> — Vascular angiosperm. Round leaves that "tremble." Forms large clonal colonies.</li><li><strong>🌺 Wild Rose</strong> — Vascular angiosperm. Alberta\'s provincial flower. Pink petals, prickly stems.</li><li><strong>🟢 Sphagnum Moss</strong> — Non-vascular. Found in Alberta\'s bogs. Absorbs 20× its weight in water.</li><li><strong>🌾 Western Wheat Grass</strong> — Vascular angiosperm. Important prairie grass. Deep roots prevent erosion.</li></ul>' } },
    { id: 'ub-l3-prac-1', section: 'PRACTICE' as const, blockType: 'MATCHING' as const, order: 1, content: { instruction: 'Match each adaptation to the correct environment:', pairs: [{ left: 'Thick stems that store water', right: 'Desert' }, { left: 'Broad floating leaves', right: 'Aquatic' }, { left: 'Low-growing cushion shape', right: 'Alpine' }, { left: 'Waxy needle-like leaves', right: 'Boreal' }, { left: 'Air spaces in stems for buoyancy', right: 'Aquatic' }, { left: 'Conical shape to shed snow', right: 'Boreal' }] } },
    { id: 'ub-l3-reflect-1', section: 'REFLECT' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 1, content: { prompt: 'Explain why conifers (gymnosperms) are so well-suited to Alberta\'s climate. Include at least 3 specific adaptations.', minLength: 60, rubricHint: 'Names 3+ adaptations (waxy needles, conical shape, small surface area). Connects to Alberta climate. Uses vocabulary.', teacherReviewRequired: false } },
  ];

  for (const b of blocks) {
    await prisma.lessonBlock.create({ data: { id: b.id, lessonId: ID, section: b.section, blockType: b.blockType, content: b.content, order: b.order } });
  }
  console.log(`  ✅ ${blocks.length} blocks`);

  // Quiz questions extracted from quizBanks.quiz3
  const questions = [
    { id: 'ub-l3-q1', questionText: 'Vascular plants have:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'No roots', value: 'a' }, { label: 'Xylem and phloem tubes for transport', value: 'b', correct: true }, { label: 'Only flowers', value: 'c' }, { label: 'No leaves', value: 'd' }], correctAnswer: 'b', explanation: 'Vascular plants have internal tubes (xylem for water, phloem for sugars).', outcomeCode: 'SCI.7.B.2.1', difficulty: 1 },
    { id: 'ub-l3-q2', questionText: 'A gymnosperm is:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'A flowering plant', value: 'a' }, { label: 'A plant that produces naked seeds in cones', value: 'b', correct: true }, { label: 'A moss', value: 'c' }, { label: 'A mushroom', value: 'd' }], correctAnswer: 'b', explanation: 'Gymnosperms produce seeds in cones, not flowers. Examples: spruce, pine.', outcomeCode: 'SCI.7.B.2.2', difficulty: 1 },
    { id: 'ub-l3-q3', questionText: 'Mosses are classified as:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Vascular', value: 'a' }, { label: 'Non-vascular', value: 'b', correct: true }, { label: 'Angiosperms', value: 'c' }, { label: 'Gymnosperms', value: 'd' }], correctAnswer: 'b', explanation: 'Mosses lack transport tubes and must stay small and moist.', outcomeCode: 'SCI.7.B.2.2', difficulty: 1 },
    { id: 'ub-l3-q4', questionText: 'Cacti store water in their stems as an adaptation to:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Cold', value: 'a' }, { label: 'Desert (dry) conditions', value: 'b', correct: true }, { label: 'Aquatic environments', value: 'c' }, { label: 'Wind', value: 'd' }], correctAnswer: 'b', explanation: 'Thick stems store water for long dry periods — key desert adaptation.', outcomeCode: 'SCI.7.B.2.2', difficulty: 1 },
    { id: 'ub-l3-q5', questionText: 'Angiosperms differ from gymnosperms because they:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Have no seeds', value: 'a' }, { label: 'Produce seeds inside fruits', value: 'b', correct: true }, { label: 'Only grow in water', value: 'c' }, { label: 'Are non-vascular', value: 'd' }], correctAnswer: 'b', explanation: 'Angiosperms protect seeds inside fruits; gymnosperms have exposed seeds.', outcomeCode: 'SCI.7.B.2.2', difficulty: 2 },
    { id: 'ub-l3-q6', questionText: 'Conifer needles are adapted to Alberta\'s climate because:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'They are big and flat', value: 'a' }, { label: 'They have small surface area and waxy coatings to reduce water loss', value: 'b', correct: true }, { label: 'They fall off in winter', value: 'c' }, { label: 'They attract pollinators', value: 'd' }], correctAnswer: 'b', explanation: 'Small, waxy needles minimize water loss during cold, dry Alberta winters.', outcomeCode: 'SCI.7.B.2.2', difficulty: 2 },
    { id: 'ub-l3-q7', questionText: 'A dichotomous key helps you:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Count plants', value: 'a' }, { label: 'Identify organisms using yes/no questions', value: 'b', correct: true }, { label: 'Grow plants faster', value: 'c' }, { label: 'Measure photosynthesis', value: 'd' }], correctAnswer: 'b', explanation: 'Dichotomous keys use branching yes/no questions to identify species.', outcomeCode: 'SCI.7.B.2.2', difficulty: 1 },
    { id: 'ub-l3-q8', questionText: 'Alberta\'s provincial flower is the:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Sunflower', value: 'a' }, { label: 'Wild Rose', value: 'b', correct: true }, { label: 'Dandelion', value: 'c' }, { label: 'Alpine Forget-me-not', value: 'd' }], correctAnswer: 'b', explanation: 'The Wild Rose is Alberta\'s provincial flower.', outcomeCode: 'SCI.7.B.2.2', difficulty: 1 },
  ];

  for (const q of questions) {
    await prisma.quizQuestion.create({ data: { id: q.id, lessonId: ID, questionText: q.questionText, questionType: q.questionType, options: q.options, correctAnswer: q.correctAnswer, explanation: q.explanation, outcomeCode: q.outcomeCode, difficulty: q.difficulty } });
  }
  console.log(`  ✅ ${questions.length} questions`);
}

// ╔═══════════════════════════════════════════════════════════╗
// ║  LESSON 4: Growing Conditions                             ║
// ╚═══════════════════════════════════════════════════════════╝

async function seedLesson4() {
  const ID = 'g7-sci-ub-l4';
  console.log('\n🌡️ Seeding UB L4: Growing Conditions...');

  await prisma.lesson.update({
    where: { id: ID },
    data: {
      subjectMode: 'SCIENCE', estimatedMinutes: 45,
      learningGoal: 'Identify factors affecting plant growth, explain how soil type and nutrients influence plant health, compare growing methods, and design a controlled experiment.',
      successCriteria: 'I can list 4 key growth factors, describe advantages of 3 growing methods, and identify variables in an experiment.',
      materials: 'Science notebook',
      reflectionPrompt: 'Why might a farmer in Northern Alberta choose a greenhouse over field growing?',
      masteryConfig: { passPercent: 80, maxRetries: 5, reteachEnabled: true, immediateCorrectiveFeedback: false },
    },
  });

  await prisma.lessonBlock.deleteMany({ where: { lessonId: ID } });
  await prisma.quizQuestion.deleteMany({ where: { lessonId: ID } });

  const blocks = [
    { id: 'ub-l4-learn-1', section: 'LEARN' as const, blockType: 'VOCABULARY' as const, order: 1, content: { terms: [
      { term: 'Nutrients', definition: 'Chemical elements (NPK — nitrogen, phosphorus, potassium) plants need from soil.', example: 'Nitrogen for leaf growth.' },
      { term: 'Fertilizer', definition: 'Substance added to soil to provide nutrients — organic (compost) or synthetic (chemical).', example: 'Adding compost to a garden.' },
      { term: 'Hydroponics', definition: 'Growing plants in nutrient-rich water without soil.', example: 'Lettuce grown in vertical farms.' },
      { term: 'Greenhouse', definition: 'Enclosed structure that traps heat and controls growing conditions.', example: 'Year-round tomato production in Alberta.' },
      { term: 'Controlled Experiment', definition: 'Test that changes only 1 variable while keeping everything else the same.', example: 'Testing how light affects growth by changing only light levels.' },
      { term: 'Soil pH', definition: 'Acidity/alkalinity of soil — affects nutrient availability.', example: 'Blueberries prefer acidic soil (low pH).' },
    ] } },
    { id: 'ub-l4-learn-2', section: 'LEARN' as const, blockType: 'VIDEO' as const, order: 2, content: { url: 'https://www.youtube.com/embed/fHS-OY9XDZc', title: 'Factors Affecting Plant Growth', transcript: 'This video explains the key factors that affect plant growth.' } },
    { id: 'ub-l4-learn-3', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 3, content: { html: '<h3>🌱 The 4 Key Growth Factors</h3><ul><li><strong>☀️ Light:</strong> Powers photosynthesis. Too little → etiolated (pale, stretched) plants.</li><li><strong>💧 Water:</strong> Essential for photosynthesis, nutrient transport, cell structure. Too much → root rot.</li><li><strong>🌡️ Temperature:</strong> Enzymes work best in a specific range. Too cold → slow growth. Too hot → enzymes denature.</li><li><strong>🧪 Soil & Nutrients:</strong> NPK (nitrogen, phosphorus, potassium) are the "big 3". N → leaves. P → roots & flowers. K → overall health.</li></ul>' } },
    { id: 'ub-l4-learn-4', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 4, content: { html: '<h3>🏡 Growing Methods Compared</h3><table><thead><tr><th>Method</th><th>How It Works</th><th>Pros</th><th>Cons</th></tr></thead><tbody><tr><td>🌾 Field</td><td>Open-air, natural soil</td><td>Low cost, large scale</td><td>Weather dependent, pests</td></tr><tr><td>🏡 Greenhouse</td><td>Glass/plastic enclosure</td><td>Year-round, climate control</td><td>High setup cost, energy use</td></tr><tr><td>💧 Hydroponics</td><td>Water + nutrients, no soil</td><td>Faster growth, less water, no weeds</td><td>Expensive, technical, needs electricity</td></tr></tbody></table>' } },
    { id: 'ub-l4-learn-mc1', section: 'LEARN' as const, blockType: 'MICRO_CHECK' as const, order: 5, content: { question: 'Why is nitrogen important for plant growth?', options: [{ label: 'It helps flowers bloom', value: 'a' }, { label: 'It promotes leaf and stem growth', value: 'b', correct: true }, { label: 'It makes roots stronger', value: 'c' }, { label: 'It repels pests', value: 'd' }], explanation: 'Nitrogen is essential for leaf and stem (vegetative) growth in plants.' } },
    { id: 'ub-l4-prac-1', section: 'PRACTICE' as const, blockType: 'MATCHING' as const, order: 1, content: { instruction: 'Match each scenario to the best growing method:', pairs: [{ left: 'Growing 500 hectares of wheat on the prairies', right: 'Field' }, { left: 'Producing tomatoes year-round in Edmonton', right: 'Greenhouse' }, { left: 'Lettuce grown vertically in a city building with LED lights', right: 'Hydroponics' }, { left: 'Summer corn crop in Southern Alberta', right: 'Field' }, { left: 'Herbs grown on a kitchen counter in nutrient water', right: 'Hydroponics' }, { left: 'Peppers in a heated glass building during February', right: 'Greenhouse' }] } },
    { id: 'ub-l4-reflect-1', section: 'REFLECT' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 1, content: { prompt: 'Design a simple experiment to test how light affects plant growth. Identify your independent variable, dependent variable, and at least 2 controlled variables.', minLength: 60, rubricHint: 'Names IV (light), DV (plant height/growth), and 2+ controlled variables. Shows understanding of fair testing.', teacherReviewRequired: false } },
  ];

  for (const b of blocks) {
    await prisma.lessonBlock.create({ data: { id: b.id, lessonId: ID, section: b.section, blockType: b.blockType, content: b.content, order: b.order } });
  }
  console.log(`  ✅ ${blocks.length} blocks`);

  // Quiz questions extracted from quizBanks.quiz4
  const questions = [
    { id: 'ub-l4-q1', questionText: 'The 3 main nutrients plants need are:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'NaCl, H₂O, O₂', value: 'a' }, { label: 'NPK — Nitrogen, Phosphorus, Potassium', value: 'b', correct: true }, { label: 'CO₂, O₂, H₂', value: 'c' }, { label: 'Sugar, starch, protein', value: 'd' }], correctAnswer: 'b', explanation: 'NPK are the "big 3" macronutrients for plant growth.', outcomeCode: 'SCI.7.B.2.3', difficulty: 1 },
    { id: 'ub-l4-q2', questionText: 'A controlled experiment changes:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Everything at once', value: 'a' }, { label: 'Only one variable while keeping others the same', value: 'b', correct: true }, { label: 'Nothing', value: 'c' }, { label: 'At least 3 variables', value: 'd' }], correctAnswer: 'b', explanation: 'Only the independent variable changes; everything else stays constant.', outcomeCode: 'SCI.7.B.2.3', difficulty: 1 },
    { id: 'ub-l4-q3', questionText: 'Hydroponics grows plants in:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Soil', value: 'a' }, { label: 'Sand', value: 'b' }, { label: 'Nutrient-rich water without soil', value: 'c', correct: true }, { label: 'Air', value: 'd' }], correctAnswer: 'c', explanation: 'Hydroponics uses water with dissolved nutrients — no soil needed.', outcomeCode: 'SCI.7.B.3.1', difficulty: 1 },
    { id: 'ub-l4-q4', questionText: 'Nitrogen helps plants with:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Root growth', value: 'a' }, { label: 'Leaf and stem growth', value: 'b', correct: true }, { label: 'Flower production', value: 'c' }, { label: 'Seed dispersal', value: 'd' }], correctAnswer: 'b', explanation: 'Nitrogen is essential for leaf and stem (vegetative) growth.', outcomeCode: 'SCI.7.B.2.3', difficulty: 1 },
    { id: 'ub-l4-q5', questionText: 'A greenhouse helps Alberta farmers because:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'It makes crops organic', value: 'a' }, { label: 'It extends the growing season beyond cold winters', value: 'b', correct: true }, { label: 'It eliminates all pests', value: 'c' }, { label: 'It uses no water', value: 'd' }], correctAnswer: 'b', explanation: 'Greenhouses trap heat, allowing year-round growing despite Alberta\'s cold climate.', outcomeCode: 'SCI.7.B.3.1', difficulty: 1 },
    { id: 'ub-l4-q6', questionText: 'Too much water causes:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Faster growth', value: 'a' }, { label: 'Root rot from lack of oxygen', value: 'b', correct: true }, { label: 'Stronger stems', value: 'c' }, { label: 'More flowers', value: 'd' }], correctAnswer: 'b', explanation: 'Waterlogged soil has no oxygen — roots suffocate and rot.', outcomeCode: 'SCI.7.B.2.3', difficulty: 1 },
    { id: 'ub-l4-q7', questionText: 'The independent variable in an experiment is:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'What you measure', value: 'a' }, { label: 'What you change', value: 'b', correct: true }, { label: 'What you keep the same', value: 'c' }, { label: 'The conclusion', value: 'd' }], correctAnswer: 'b', explanation: 'The independent variable is what the experimenter deliberately changes.', outcomeCode: 'SCI.7.B.2.3', difficulty: 1 },
    { id: 'ub-l4-q8', questionText: 'Loam soil is ideal because it:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Is pure clay', value: 'a' }, { label: 'Drains too fast', value: 'b' }, { label: 'Balances drainage and water retention', value: 'c', correct: true }, { label: 'Has no nutrients', value: 'd' }], correctAnswer: 'c', explanation: 'Loam combines sand, silt, and clay for ideal drainage and nutrient retention.', outcomeCode: 'SCI.7.B.3.2', difficulty: 2 },
  ];

  for (const q of questions) {
    await prisma.quizQuestion.create({ data: { id: q.id, lessonId: ID, questionText: q.questionText, questionType: q.questionType, options: q.options, correctAnswer: q.correctAnswer, explanation: q.explanation, outcomeCode: q.outcomeCode, difficulty: q.difficulty } });
  }
  console.log(`  ✅ ${questions.length} questions`);
}

// ═══════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════

async function main() {
  console.log('🌱 ═══ SCIENCE UNIT B: L1-L4 ═══');
  await seedLesson1();
  await seedLesson2();
  await seedLesson3();
  await seedLesson4();
  console.log('\n✅ Unit B L1-L4 complete!');
}

main().catch(console.error).finally(() => { pool.end(); });
