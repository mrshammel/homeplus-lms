// ============================================
// Seed Science Unit B L5-L7 — Plants for Food & Fibre
// ============================================
// Extracted from grade-7/science/unit-b-plants/index.html
// Run: npx tsx prisma/seed-sci-ub-l5-l7.ts

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
// ║  LESSON 5: Agriculture & Pest Control                     ║
// ╚═══════════════════════════════════════════════════════════╝

async function seedLesson5() {
  const ID = 'g7-sci-ub-l5';
  console.log('\n🐛 Seeding UB L5: Agriculture & Pest Control...');

  await prisma.lesson.update({
    where: { id: ID },
    data: {
      subjectMode: 'SCIENCE', estimatedMinutes: 45,
      learningGoal: 'Compare chemical, biological, and cultural pest control methods, evaluate monocultures vs. crop diversity, and analyze organic vs. conventional farming.',
      successCriteria: 'I can compare 3 pest control methods, explain risks of monocultures, and sort farming practices as organic or conventional.',
      materials: 'Science notebook',
      reflectionPrompt: 'Should all farming be organic? Why or why not?',
      masteryConfig: { passPercent: 80, maxRetries: 5, reteachEnabled: true, immediateCorrectiveFeedback: false },
    },
  });

  await prisma.lessonBlock.deleteMany({ where: { lessonId: ID } });
  await prisma.quizQuestion.deleteMany({ where: { lessonId: ID } });

  const blocks = [
    { id: 'ub-l5-learn-1', section: 'LEARN' as const, blockType: 'VOCABULARY' as const, order: 1, content: { terms: [
      { term: 'Monoculture', definition: 'Growing one single crop species across a large field.', example: 'Thousands of hectares of wheat on the prairies.' },
      { term: 'Biological Control', definition: 'Using natural predators to control pests.', example: 'Ladybugs eating aphids.' },
      { term: 'Chemical Control', definition: 'Using herbicides, pesticides, or fungicides to kill pests.', example: 'Spraying fields with insecticide.' },
      { term: 'IPM (Integrated Pest Management)', definition: 'Combining multiple strategies, using chemicals only as last resort.', example: 'Monitoring → cultural → biological → chemical if needed.' },
      { term: 'Crop Rotation', definition: 'Alternating crops each season to restore soil and break pest cycles.', example: 'Wheat one year, canola the next, peas the third.' },
      { term: 'Organic Farming', definition: 'Farming without synthetic chemicals, using natural methods only.', example: 'Using compost instead of synthetic fertilizer.' },
    ] } },
    { id: 'ub-l5-learn-2', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 2, content: { html: '<h3>🐛 Pest Control Methods</h3><table><thead><tr><th>Method</th><th>How It Works</th><th>Pros</th><th>Cons</th></tr></thead><tbody><tr><td>🧪 Chemical</td><td>Herbicides, pesticides, fungicides</td><td>Fast, effective at scale</td><td>Harms beneficial insects, resistance, pollution</td></tr><tr><td>🐞 Biological</td><td>Natural predators (ladybugs vs. aphids)</td><td>Eco-friendly, no chemicals</td><td>Slow, introduced species may become invasive</td></tr><tr><td>🔄 Cultural</td><td>Crop rotation, companion planting</td><td>Sustainable, improves soil</td><td>Takes planning, slower results</td></tr><tr><td>⚙️ IPM</td><td>Combines all methods, chemicals last</td><td>Best of all approaches</td><td>Requires knowledge, monitoring</td></tr></tbody></table>' } },
    { id: 'ub-l5-learn-3', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 3, content: { html: '<h3>🌾 Monocultures vs. Crop Diversity</h3><p><strong>Monoculture risks:</strong></p><ul><li>One disease can destroy the entire crop</li><li>Depletes specific soil nutrients</li><li>Requires heavy pesticide/fertilizer use</li><li>Reduces biodiversity</li></ul><p><strong>Crop diversity benefits:</strong></p><ul><li>Different crops use different nutrients</li><li>Attracts different pests (breaks cycles)</li><li>More resilient to disease</li></ul><p><strong>Alberta:</strong> Large monocultures of canola, wheat, and barley dominate the prairies.</p>' } },
    { id: 'ub-l5-learn-4', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 4, content: { html: '<h3>🌿 Organic vs. Conventional Farming</h3><table><thead><tr><th>Feature</th><th>🌿 Organic</th><th>🧪 Conventional</th></tr></thead><tbody><tr><td>Chemicals</td><td>None synthetic</td><td>Synthetic pesticides/fertilizers</td></tr><tr><td>Yields</td><td>Generally lower</td><td>Generally higher</td></tr><tr><td>Cost</td><td>Higher (more labour)</td><td>Lower (at scale)</td></tr><tr><td>Environment</td><td>Less pollution</td><td>More chemical runoff</td></tr><tr><td>Soil</td><td>Healthier long-term</td><td>Can degrade over time</td></tr></tbody></table>' } },
    { id: 'ub-l5-prac-1', section: 'PRACTICE' as const, blockType: 'MATCHING' as const, order: 1, content: { instruction: 'Match each scenario to the best pest control method:', pairs: [{ left: 'Aphids on roses — want to avoid chemicals', right: 'Biological (ladybugs)' }, { left: 'Weeds overtaking 1000-hectare wheat field', right: 'Chemical (herbicide)' }, { left: 'Flea beetles return to same canola field every year', right: 'Cultural (crop rotation)' }, { left: 'Large farm wants to reduce chemical use overall', right: 'IPM' }] } },
    { id: 'ub-l5-reflect-1', section: 'REFLECT' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 1, content: { prompt: 'A farmer has a monoculture wheat field with aphid problems. Recommend a pest management plan using at least 2 different methods. Explain why you chose each method.', minLength: 60, rubricHint: 'Recommends 2+ methods (biological, cultural, IPM). Explains reasoning. Connects to monoculture risks.', teacherReviewRequired: false } },
  ];

  for (const b of blocks) {
    await prisma.lessonBlock.create({ data: { id: b.id, lessonId: ID, section: b.section, blockType: b.blockType, content: b.content, order: b.order } });
  }
  console.log(`  ✅ ${blocks.length} blocks`);

  const questions = [
    { id: 'ub-l5-q1', questionText: 'Biological pest control uses:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Chemicals', value: 'a' }, { label: 'Natural predators to control pests', value: 'b', correct: true }, { label: 'Genetic modification', value: 'c' }, { label: 'Radiation', value: 'd' }], correctAnswer: 'b', explanation: 'Biological control introduces natural enemies like ladybugs to eat aphids.', outcomeCode: 'SCI.7.B.3.4', difficulty: 1 },
    { id: 'ub-l5-q2', questionText: 'A monoculture is:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Growing many different crops', value: 'a' }, { label: 'Growing one crop over a large area', value: 'b', correct: true }, { label: 'A type of fertilizer', value: 'c' }, { label: 'Organic farming', value: 'd' }], correctAnswer: 'b', explanation: 'Monoculture = one single crop species across a large field.', outcomeCode: 'SCI.7.B.3.4', difficulty: 1 },
    { id: 'ub-l5-q3', questionText: 'The main risk of monocultures is:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Too much diversity', value: 'a' }, { label: 'One disease can destroy the entire crop', value: 'b', correct: true }, { label: 'Too many pollinators', value: 'c' }, { label: 'Higher labour costs', value: 'd' }], correctAnswer: 'b', explanation: 'With no diversity, a single disease or pest can devastate the whole field.', outcomeCode: 'SCI.7.B.3.4', difficulty: 1 },
    { id: 'ub-l5-q4', questionText: 'IPM stands for:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'International Plant Management', value: 'a' }, { label: 'Integrated Pest Management', value: 'b', correct: true }, { label: 'Internal Pesticide Mixture', value: 'c' }, { label: 'Insect Prevention Method', value: 'd' }], correctAnswer: 'b', explanation: 'IPM combines multiple strategies, using chemicals only as a last resort.', outcomeCode: 'SCI.7.B.3.4', difficulty: 1 },
    { id: 'ub-l5-q5', questionText: 'Organic farming avoids:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'All farming', value: 'a' }, { label: 'Synthetic chemicals', value: 'b', correct: true }, { label: 'Composting', value: 'c' }, { label: 'Crop rotation', value: 'd' }], correctAnswer: 'b', explanation: 'Organic farming uses natural methods only — no synthetic pesticides or fertilizers.', outcomeCode: 'SCI.7.B.3.4', difficulty: 1 },
    { id: 'ub-l5-q6', questionText: 'Crop rotation helps by:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Using more pesticides', value: 'a' }, { label: 'Preventing soil nutrient depletion and breaking pest cycles', value: 'b', correct: true }, { label: 'Increasing monoculture', value: 'c' }, { label: 'Reducing yields', value: 'd' }], correctAnswer: 'b', explanation: 'Different crops use different nutrients and attract different pests.', outcomeCode: 'SCI.7.B.3.3', difficulty: 1 },
    { id: 'ub-l5-q7', questionText: 'A risk of chemical pesticides is:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'They are too slow', value: 'a' }, { label: 'They can harm beneficial insects like pollinators', value: 'b', correct: true }, { label: 'They are organic', value: 'c' }, { label: 'They have no effect', value: 'd' }], correctAnswer: 'b', explanation: 'Pesticides don\'t distinguish between pests and helpful insects.', outcomeCode: 'SCI.7.B.3.4', difficulty: 2 },
    { id: 'ub-l5-q8', questionText: 'Alberta\'s prairies are known for:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Tropical crops', value: 'a' }, { label: 'Large monocultures of canola, wheat, and barley', value: 'b', correct: true }, { label: 'Only organic farming', value: 'c' }, { label: 'No agriculture', value: 'd' }], correctAnswer: 'b', explanation: 'Alberta\'s prairies feature massive grain and oilseed monocultures.', outcomeCode: 'SCI.7.B.3.4', difficulty: 1 },
  ];

  for (const q of questions) {
    await prisma.quizQuestion.create({ data: { id: q.id, lessonId: ID, questionText: q.questionText, questionType: q.questionType, options: q.options, correctAnswer: q.correctAnswer, explanation: q.explanation, outcomeCode: q.outcomeCode, difficulty: q.difficulty } });
  }
  console.log(`  ✅ ${questions.length} questions`);
}

// ╔═══════════════════════════════════════════════════════════╗
// ║  LESSON 6: Plants, People & Sustainability                ║
// ╚═══════════════════════════════════════════════════════════╝

async function seedLesson6() {
  const ID = 'g7-sci-ub-l6';
  console.log('\n🌍 Seeding UB L6: Plants, People & Sustainability...');

  await prisma.lesson.update({
    where: { id: ID },
    data: {
      subjectMode: 'SCIENCE', estimatedMinutes: 45,
      learningGoal: 'Explain selective breeding vs. GMOs, describe Indigenous ecological knowledge (TEK), evaluate sustainable forestry, and connect plants to food security.',
      successCriteria: 'I can compare selective breeding and GMOs, describe 3 TEK practices, and evaluate sustainability decisions.',
      materials: 'Science notebook',
      reflectionPrompt: 'What can modern agriculture learn from Indigenous land management practices?',
      masteryConfig: { passPercent: 80, maxRetries: 5, reteachEnabled: true, immediateCorrectiveFeedback: false },
    },
  });

  await prisma.lessonBlock.deleteMany({ where: { lessonId: ID } });
  await prisma.quizQuestion.deleteMany({ where: { lessonId: ID } });

  const blocks = [
    { id: 'ub-l6-learn-1', section: 'LEARN' as const, blockType: 'VOCABULARY' as const, order: 1, content: { terms: [
      { term: 'Selective Breeding', definition: 'Choosing plants with desired traits to reproduce over generations.', example: 'Breeding wheat for drought resistance.' },
      { term: 'GMO', definition: 'Genetically Modified Organism — genes directly altered in a lab.', example: 'Corn engineered to resist insects.' },
      { term: 'TEK', definition: 'Traditional Ecological Knowledge — Indigenous knowledge about ecosystems built over generations.', example: 'Using prescribed burns to manage grasslands.' },
      { term: 'Sustainable Forestry', definition: 'Harvesting trees while ensuring long-term forest health.', example: 'Replanting within 2 years of harvesting in Alberta.' },
      { term: 'Food Security', definition: 'Having reliable access to enough affordable, nutritious food.', example: 'All families in a community can buy healthy groceries.' },
    ] } },
    { id: 'ub-l6-learn-2', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 2, content: { html: '<h3>🧬 Selective Breeding vs. GMOs</h3><p><strong>Selective Breeding:</strong> Choosing plants with desired traits over many generations. Practiced safely for thousands of years. Example: Canola was bred from rapeseed; broccoli, kale, and cabbage all come from one wild mustard ancestor.</p><p><strong>GMOs:</strong> Genes directly modified using biotechnology. Faster and more precise but raises concerns about ecological effects and corporate control.</p>' } },
    { id: 'ub-l6-learn-3', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 3, content: { html: '<h3>🔥 Traditional Ecological Knowledge (TEK)</h3><p>Indigenous peoples have managed ecosystems for thousands of years using sophisticated knowledge:</p><ul><li>🔥 <strong>Prescribed burns</strong> — clear brush, promote new growth, prevent wildfires</li><li>🌿 <strong>Willow bark</strong> — pain relief (contains salicylic acid, basis of aspirin)</li><li>🫐 <strong>Sustainable harvesting</strong> — taking only what ecosystems can regenerate</li><li>🌾 <strong>Three Sisters</strong> — companion planting corn, beans, squash together</li><li>🫐 <strong>Saskatoon berries</strong> — traditional prairie food plant</li></ul>' } },
    { id: 'ub-l6-learn-4', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 4, content: { html: '<h3>🌲 Sustainable Forestry & Food Security</h3><p><strong>Alberta Forestry:</strong> Alberta requires reforestation within 2 years of harvesting. Buffer zones protect waterways and wildlife corridors. The boreal forest covers over 60% of the province.</p><p><strong>Food Security:</strong> Having consistent access to sufficient nutritious food for all. Plants are central — as food, fibre, and medicine.</p>' } },
    { id: 'ub-l6-prac-1', section: 'PRACTICE' as const, blockType: 'MATCHING' as const, order: 1, content: { instruction: 'Match each Indigenous practice to the modern concept it connects to:', pairs: [{ left: 'Prescribed burns to clear brush', right: 'Forestry' }, { left: 'Willow bark for pain relief', right: 'Medicine' }, { left: 'Harvesting only what is needed', right: 'Sustainability' }, { left: 'Three Sisters companion planting', right: 'Companion Planting' }] } },
    { id: 'ub-l6-reflect-1', section: 'REFLECT' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 1, content: { prompt: 'Do you think GMOs are a good solution to global food security? Explain your position using at least 2 arguments for or against, with evidence from this lesson.', minLength: 60, rubricHint: 'Takes a position. Provides 2+ arguments with evidence. Uses vocabulary. Shows balanced thinking.', teacherReviewRequired: false } },
  ];

  for (const b of blocks) {
    await prisma.lessonBlock.create({ data: { id: b.id, lessonId: ID, section: b.section, blockType: b.blockType, content: b.content, order: b.order } });
  }
  console.log(`  ✅ ${blocks.length} blocks`);

  const questions = [
    { id: 'ub-l6-q1', questionText: 'Selective breeding is:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Genetic modification in a lab', value: 'a' }, { label: 'Choosing plants with desired traits to reproduce over generations', value: 'b', correct: true }, { label: 'Cloning plants', value: 'c' }, { label: 'A type of fertilizer', value: 'd' }], correctAnswer: 'b', explanation: 'Selective breeding gradually changes plant traits through controlled reproduction.', outcomeCode: 'SCI.7.B.4.1', difficulty: 1 },
    { id: 'ub-l6-q2', questionText: 'Canola was developed from:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Corn', value: 'a' }, { label: 'Rapeseed', value: 'b', correct: true }, { label: 'Wheat', value: 'c' }, { label: 'Soybeans', value: 'd' }], correctAnswer: 'b', explanation: 'Canola was selectively bred from rapeseed to reduce harmful acids.', outcomeCode: 'SCI.7.B.4.1', difficulty: 1 },
    { id: 'ub-l6-q3', questionText: 'Indigenous prescribed fire benefits ecosystems by:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Destroying all life', value: 'a' }, { label: 'Clearing brush, promoting new growth, and maintaining healthy ecosystems', value: 'b', correct: true }, { label: 'Only creating smoke', value: 'c' }, { label: 'Killing all animals', value: 'd' }], correctAnswer: 'b', explanation: 'Controlled burns recycle nutrients, prevent wildfires, and promote diverse plant growth.', outcomeCode: 'SCI.7.B.4.3', difficulty: 1 },
    { id: 'ub-l6-q4', questionText: 'Sustainable forestry requires:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Clear-cutting all trees', value: 'a' }, { label: 'Replanting harvested areas within a set time', value: 'b', correct: true }, { label: 'Never cutting trees', value: 'c' }, { label: 'Only planting one species', value: 'd' }], correctAnswer: 'b', explanation: 'Alberta requires reforestation within 2 years of harvesting.', outcomeCode: 'SCI.7.B.4.3', difficulty: 1 },
    { id: 'ub-l6-q5', questionText: 'A GMO is:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'A selectively bred plant', value: 'a' }, { label: 'An organism with genes directly altered in a lab', value: 'b', correct: true }, { label: 'An organic plant', value: 'c' }, { label: 'A wild plant', value: 'd' }], correctAnswer: 'b', explanation: 'GMOs have their DNA directly modified using biotechnology.', outcomeCode: 'SCI.7.B.4.1', difficulty: 1 },
    { id: 'ub-l6-q6', questionText: 'Food security means:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Locking up food', value: 'a' }, { label: 'Having reliable access to enough affordable, nutritious food', value: 'b', correct: true }, { label: 'Growing only organic', value: 'c' }, { label: 'Eating less', value: 'd' }], correctAnswer: 'b', explanation: 'Food security = consistent access to sufficient nutritious food for all.', outcomeCode: 'SCI.7.B.4.3', difficulty: 1 },
    { id: 'ub-l6-q7', questionText: 'Willow bark was used by Indigenous peoples as:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Building material', value: 'a' }, { label: 'Pain relief medicine (contains salicylic acid)', value: 'b', correct: true }, { label: 'Food', value: 'c' }, { label: 'Clothing', value: 'd' }], correctAnswer: 'b', explanation: 'Willow bark contains the compound that became the basis for aspirin.', outcomeCode: 'SCI.7.B.4.3', difficulty: 1 },
    { id: 'ub-l6-q8', questionText: 'Buffer zones in forestry protect:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Only humans', value: 'a' }, { label: 'Waterways and wildlife corridors', value: 'b', correct: true }, { label: 'Only timber companies', value: 'c' }, { label: 'Nothing', value: 'd' }], correctAnswer: 'b', explanation: 'Uncut buffer strips protect water quality and provide wildlife habitat.', outcomeCode: 'SCI.7.B.4.3', difficulty: 2 },
  ];

  for (const q of questions) {
    await prisma.quizQuestion.create({ data: { id: q.id, lessonId: ID, questionText: q.questionText, questionType: q.questionType, options: q.options, correctAnswer: q.correctAnswer, explanation: q.explanation, outcomeCode: q.outcomeCode, difficulty: q.difficulty } });
  }
  console.log(`  ✅ ${questions.length} questions`);
}

// ╔═══════════════════════════════════════════════════════════╗
// ║  LESSON 7: Performance Task                               ║
// ╚═══════════════════════════════════════════════════════════╝

async function seedLesson7() {
  const ID = 'g7-sci-ub-l7';
  console.log('\n🏆 Seeding UB L7: Performance Task...');

  await prisma.lesson.update({
    where: { id: ID },
    data: {
      subjectMode: 'SCIENCE', estimatedMinutes: 60,
      learningGoal: 'Design a sustainable school garden plan that applies knowledge of plant needs, growing methods, soil, pest control, and sustainability.',
      successCriteria: 'I can design a garden plan that addresses plant selection, growing conditions, pest management, and sustainability.',
      materials: 'Science notebook, coloured pencils, ruler',
      reflectionPrompt: 'How does your garden plan demonstrate what you\'ve learned about plants throughout this unit?',
      masteryConfig: { passPercent: 80, maxRetries: 5, reteachEnabled: true, immediateCorrectiveFeedback: false },
    },
  });

  await prisma.lessonBlock.deleteMany({ where: { lessonId: ID } });
  await prisma.quizQuestion.deleteMany({ where: { lessonId: ID } });

  const blocks = [
    { id: 'ub-l7-learn-1', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 1, content: { html: '<h2>🏆 Performance Task: Design a Sustainable School Garden</h2><p>Apply everything you\'ve learned in this unit to design a sustainable garden for your school. Your plan must address:</p><ol><li><strong>Plant Selection</strong> — Which plants will you grow? Why? Consider Alberta\'s climate and growing season.</li><li><strong>Growing Conditions</strong> — What method will you use (field, greenhouse, hydroponics)? How will you manage soil, light, water, and temperature?</li><li><strong>Pest Management</strong> — What pest control strategy will you use? Explain your choice.</li><li><strong>Sustainability</strong> — How will your garden be environmentally responsible? Consider crop rotation, composting, water conservation.</li><li><strong>Community Benefit</strong> — How will the garden benefit the school community? Consider food security, education, well-being.</li></ol>' } },
    { id: 'ub-l7-learn-2', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 2, content: { html: '<h3>📋 Requirements</h3><ul><li>Labeled diagram or map of your garden layout</li><li>List of 5+ plants with reasons for selection</li><li>Explanation of growing method and conditions</li><li>Pest management plan (at least 2 methods)</li><li>Sustainability features (at least 3)</li><li>Community benefit statement</li></ul><p>Use vocabulary from this unit in your explanations.</p>' } },
    { id: 'ub-l7-prac-1', section: 'PRACTICE' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 1, content: { prompt: 'Part 1: Plant Selection — List at least 5 plants you would grow in your school garden. For each, explain why you chose it (consider Alberta\'s climate, growing season, and plant needs).', minLength: 80, rubricHint: 'Lists 5+ plants. Considers Alberta climate. References plant needs from earlier lessons.', teacherReviewRequired: true } },
    { id: 'ub-l7-prac-2', section: 'PRACTICE' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 2, content: { prompt: 'Part 2: Growing Method & Conditions — Describe the growing method you will use and explain how you will manage the 4 key growth factors (light, water, temperature, soil/nutrients).', minLength: 80, rubricHint: 'Names growing method. Addresses all 4 growth factors. Shows understanding of Alberta conditions.', teacherReviewRequired: true } },
    { id: 'ub-l7-prac-3', section: 'PRACTICE' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 3, content: { prompt: 'Part 3: Pest Management & Sustainability — Describe your pest management plan (at least 2 methods) and list at least 3 sustainability features of your garden.', minLength: 80, rubricHint: 'Names 2+ pest methods. Lists 3+ sustainability features. Shows understanding of environmental impact.', teacherReviewRequired: true } },
    { id: 'ub-l7-reflect-1', section: 'REFLECT' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 1, content: { prompt: 'Reflect on the entire unit. What was the most important thing you learned about plants? How does this knowledge connect to real-world issues like food security, climate change, or sustainability?', minLength: 60, rubricHint: 'Makes personal connection. References unit content. Connects to real-world issues.', teacherReviewRequired: false } },
  ];

  for (const b of blocks) {
    await prisma.lessonBlock.create({ data: { id: b.id, lessonId: ID, section: b.section, blockType: b.blockType, content: b.content, order: b.order } });
  }
  console.log(`  ✅ ${blocks.length} blocks`);

  // Performance task has capstone questions that span the unit
  const questions = [
    { id: 'ub-l7-q1', questionText: 'Which plant would be BEST for a school garden in Alberta, considering the short growing season?', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Tropical mangoes', value: 'a' }, { label: 'Potatoes — cold-tolerant and grow in Alberta\'s climate', value: 'b', correct: true }, { label: 'Palm trees', value: 'c' }, { label: 'Bamboo', value: 'd' }], correctAnswer: 'b', explanation: 'Potatoes are well-suited to Alberta\'s climate and short growing season.', outcomeCode: 'SCI.7.B.1.4', difficulty: 1 },
    { id: 'ub-l7-q2', questionText: 'A sustainable school garden should include:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Only chemical pesticides', value: 'a' }, { label: 'Composting, crop rotation, and biological pest control', value: 'b', correct: true }, { label: 'One crop only (monoculture)', value: 'c' }, { label: 'No watering plan', value: 'd' }], correctAnswer: 'b', explanation: 'Sustainable gardens use natural methods to maintain soil health and manage pests.', outcomeCode: 'SCI.7.B.4.3', difficulty: 1 },
    { id: 'ub-l7-q3', questionText: 'The Three Sisters companion planting uses corn, beans, and squash. The beans help by:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Shading the soil', value: 'a' }, { label: 'Fixing nitrogen in the soil', value: 'b', correct: true }, { label: 'Supporting the corn', value: 'c' }, { label: 'Repelling insects', value: 'd' }], correctAnswer: 'b', explanation: 'Beans are legumes that fix nitrogen, enriching the soil for all three plants.', outcomeCode: 'SCI.7.B.4.3', difficulty: 2 },
    { id: 'ub-l7-q4', questionText: 'If your garden has poor, sandy soil, the best improvement would be:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Adding more sand', value: 'a' }, { label: 'Adding compost to improve nutrient content and water retention', value: 'b', correct: true }, { label: 'Removing all soil', value: 'c' }, { label: 'Adding only chemical fertilizer', value: 'd' }], correctAnswer: 'b', explanation: 'Compost adds nutrients and organic matter, improving both fertility and water retention.', outcomeCode: 'SCI.7.B.3.2', difficulty: 1 },
    { id: 'ub-l7-q5', questionText: 'Plant diversity in a garden helps prevent:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Growth', value: 'a' }, { label: 'A single pest or disease from destroying everything', value: 'b', correct: true }, { label: 'Photosynthesis', value: 'c' }, { label: 'Pollination', value: 'd' }], correctAnswer: 'b', explanation: 'Diverse plants attract different pests, so no single pest can devastate the whole garden.', outcomeCode: 'SCI.7.B.4.2', difficulty: 1 },
    { id: 'ub-l7-q6', questionText: 'A greenhouse is valuable in Alberta because:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Alberta has no soil', value: 'a' }, { label: 'It allows year-round growing despite cold winters', value: 'b', correct: true }, { label: 'Plants don\'t need light indoors', value: 'c' }, { label: 'It prevents all diseases', value: 'd' }], correctAnswer: 'b', explanation: 'Greenhouses trap heat and control conditions, extending the growing season.', outcomeCode: 'SCI.7.B.3.1', difficulty: 1 },
    { id: 'ub-l7-q7', questionText: 'Which statement about food security is TRUE?', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Only rich countries have food security', value: 'a' }, { label: 'School gardens can contribute to food security by providing nutritious food to the community', value: 'b', correct: true }, { label: 'Food security means growing only organic food', value: 'c' }, { label: 'Food security is not related to plants', value: 'd' }], correctAnswer: 'b', explanation: 'School gardens provide fresh, nutritious food and education about food systems.', outcomeCode: 'SCI.7.B.1.4', difficulty: 1 },
    { id: 'ub-l7-q8', questionText: 'Crop rotation in a school garden helps by:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Making the garden look nicer', value: 'a' }, { label: 'Replenishing different nutrients and breaking pest cycles', value: 'b', correct: true }, { label: 'Reducing the number of plants', value: 'c' }, { label: 'Eliminating the need for water', value: 'd' }], correctAnswer: 'b', explanation: 'Different crops use different nutrients and attract different pests — rotation keeps the system balanced.', outcomeCode: 'SCI.7.B.3.3', difficulty: 1 },
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
  console.log('🌱 ═══ SCIENCE UNIT B: L5-L7 ═══');
  await seedLesson5();
  await seedLesson6();
  await seedLesson7();
  console.log('\n✅ Unit B L5-L7 complete!');
}

main().catch(console.error).finally(() => { pool.end(); });
