// ============================================
// Seed Unit A Content — Lessons 5-8
// ============================================
// Completes Grade 7 Science Unit A: Interactions & Ecosystems
// Adds Lessons 5–8 covering A.K.3 (monitoring, human impact)
// and A.K.4 (stewardship, conservation).
//
// Run: npx tsx prisma/seed-unit-a-l5-l8.ts

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
// ║  LESSON 5: Food Webs & Energy Pyramids                   ║
// ╚═══════════════════════════════════════════════════════════╝

async function seedLesson5() {
  const LESSON_ID = 'g7-sci-ua-l5';
  console.log('\n📗 Seeding Lesson 5: Food Webs & Energy Pyramids...');

  await prisma.lesson.update({
    where: { id: LESSON_ID },
    data: {
      subjectMode: 'SCIENCE',
      estimatedMinutes: 40,
      learningGoal: 'Construct food webs from food chains and explain how energy decreases at each trophic level.',
      successCriteria: 'I can build a food web from multiple food chains and explain why there are fewer top predators than producers.',
      materials: 'Science notebook, coloured pencils, ecosystem organism cards (optional)',
      reflectionPrompt: 'Compare the food chain you drew in Lesson 2 to the food web you built today. What surprised you about how interconnected ecosystems really are?',
      warmUpConfig: {
        type: 'retrieval',
        prompt: 'From Lesson 3: In the Yellowstone wolves example, what happened when wolves were reintroduced? Name one ripple effect on another species.',
        options: [
          { label: 'Elk/deer populations decreased, allowing trees and plants to regrow', value: 'a', correct: true },
          { label: 'All the animals left the park', value: 'b', correct: false },
          { label: 'Nothing changed', value: 'c', correct: false },
          { label: 'The wolves ate all the plants', value: 'd', correct: false },
        ],
      },
      masteryConfig: {
        passPercent: 80,
        maxRetries: 5,
        reteachEnabled: true,
        immediateCorrectiveFeedback: false,
      },
    },
  });

  await prisma.lessonBlock.deleteMany({ where: { lessonId: LESSON_ID } });
  await prisma.quizQuestion.deleteMany({ where: { lessonId: LESSON_ID } });

  // ─── Blocks ───
  const blocks = [
    {
      id: 'l5-learn-1',
      section: 'LEARN' as const,
      blockType: 'TEXT' as const,
      order: 1,
      content: {
        html: `
          <h2>🕸️ From Food Chains to Food Webs</h2>
          <p>In Lesson 2, you built simple <strong>food chains</strong> — a straight line showing energy flowing from one organism to the next. But real ecosystems are much more complex!</p>
          <p>A <strong>food web</strong> is a network of interconnected food chains. Most organisms eat more than one thing and are eaten by more than one predator. For example:</p>
          <ul>
            <li>A rabbit eats grass AND clover AND berries</li>
            <li>A rabbit is eaten by foxes AND hawks AND coyotes</li>
            <li>A hawk also eats mice AND snakes AND insects</li>
          </ul>
          <p>This creates a <em>web</em> of connections, not just a chain. Food webs show the real complexity of how energy moves through an ecosystem.</p>
        `,
      },
    },
    {
      id: 'l5-learn-2',
      section: 'LEARN' as const,
      blockType: 'TEXT' as const,
      order: 2,
      content: {
        html: `
          <h2>🔺 Energy Pyramids & The 10% Rule</h2>
          <p>Energy doesn't transfer perfectly from one trophic level to the next. At each level, about <strong>90% of energy is lost as heat</strong> through life processes (breathing, moving, growing). Only about <strong>10%</strong> is passed to the next consumer.</p>
          <p>This is called the <strong>10% Rule</strong>, and it explains why:</p>
          <ul>
            <li>There are <em>many</em> producers (plants/algae) at the bottom</li>
            <li>Fewer herbivores (primary consumers)</li>
            <li>Even fewer secondary consumers (small predators)</li>
            <li>Very few top predators (tertiary consumers) at the top</li>
          </ul>
          <p>An <strong>energy pyramid</strong> is a diagram that shows this pattern — wide at the bottom (lots of energy), narrow at the top (very little energy left).</p>
        `,
      },
    },
    {
      id: 'l5-learn-vocab',
      section: 'LEARN' as const,
      blockType: 'VOCABULARY' as const,
      order: 3,
      content: {
        terms: [
          { term: 'Food Web', definition: 'A network of interconnected food chains showing the complex feeding relationships in an ecosystem.', example: 'A grassland food web connects grass to rabbits, mice, insects, hawks, foxes, and decomposers.' },
          { term: 'Trophic Level', definition: 'A step or level in a food chain or energy pyramid.', example: 'Producers are trophic level 1; herbivores are trophic level 2.' },
          { term: 'Energy Pyramid', definition: 'A diagram showing the decrease in energy at each trophic level.', example: 'The base (producers) holds 10,000 kJ; the next level holds 1,000 kJ; the next holds 100 kJ.' },
          { term: '10% Rule', definition: 'Only about 10% of energy at one trophic level is passed to the next level; the rest is lost as heat.', example: 'If plants capture 10,000 kJ, herbivores get ~1,000 kJ, and carnivores get ~100 kJ.' },
          { term: 'Tertiary Consumer', definition: 'A top predator that eats secondary consumers.', example: 'An eagle that eats a snake (which ate a frog, which ate insects).' },
        ],
      },
    },
    {
      id: 'l5-learn-video',
      section: 'LEARN' as const,
      blockType: 'VIDEO' as const,
      order: 4,
      content: {
        url: 'https://www.youtube.com/watch?v=GibiNy4d4gc',
        title: 'Food Webs & Energy Pyramids Explained',
        aiSummary: 'A food web shows how multiple food chains in an ecosystem overlap and connect. Unlike a single food chain (which is a simple straight line), a food web is more realistic because most organisms eat more than one thing and are eaten by more than one predator. Energy enters the food web through producers (plants) that capture sunlight via photosynthesis. At each trophic level, only about 10% of the energy is passed on to the next level — the rest is lost as heat through life processes like movement and body temperature. This is called the 10% Rule. An energy pyramid is a diagram that shows this decrease: the bottom level (producers) has the most energy, and each level above has less. This is why there are always more producers than top predators in any ecosystem.',
      },
    },
    {
      id: 'l5-learn-mc1',
      section: 'LEARN' as const,
      blockType: 'MICRO_CHECK' as const,
      order: 5,
      content: {
        question: 'If plants capture 10,000 units of energy, how much energy would be available to a secondary consumer (like a snake)?',
        options: [
          { label: '10,000 units', value: 'a' },
          { label: '1,000 units', value: 'b' },
          { label: '100 units', value: 'c', correct: true },
          { label: '10 units', value: 'd' },
        ],
        explanation: 'Apply the 10% rule twice: Plants (10,000) → Herbivores get 10% = 1,000 → Secondary consumers get 10% of that = 100 units.',
      },
    },
    {
      id: 'l5-practice-1',
      section: 'PRACTICE' as const,
      blockType: 'MATCHING' as const,
      order: 6,
      content: {
        instruction: 'Match each trophic level to its correct description:',
        pairs: [
          { left: 'Producer (Level 1)', right: 'Makes its own food from sunlight' },
          { left: 'Primary Consumer (Level 2)', right: 'Eats producers (herbivore)' },
          { left: 'Secondary Consumer (Level 3)', right: 'Eats herbivores (small predator)' },
          { left: 'Tertiary Consumer (Level 4)', right: 'Top predator, eats other predators' },
          { left: 'Decomposer', right: 'Breaks down dead organisms at all levels' },
        ],
      },
    },
    {
      id: 'l5-practice-2',
      section: 'PRACTICE' as const,
      blockType: 'DRAWING' as const,
      order: 7,
      content: {
        instruction: 'Build a FOOD WEB using at least 6 organisms from a prairie ecosystem. Include: grass, grasshopper, mouse, snake, hawk, and decomposer (mushroom). Draw arrows showing the direction energy flows. Your web should have at least 8 arrows connecting organisms.',
      },
    },
    {
      id: 'l5-practice-3',
      section: 'PRACTICE' as const,
      blockType: 'CONSTRUCTED_RESPONSE' as const,
      order: 8,
      content: {
        prompt: 'Look at the food web you just drew. Imagine that a disease kills most of the mice in this prairie ecosystem. Using your food web, explain:\n\n1. Which organisms would be DIRECTLY affected? (Name at least 2)\n2. Would the grasshopper population increase or decrease? Why?\n3. What would happen to the hawk population? Explain using the food web connections.',
        rubricHint: 'Names specific organisms from the food web drawing (e.g. snake, hawk, grasshopper). Shows cause-and-effect reasoning through at least 2 food web connections. Uses vocabulary (food web, trophic level, consumer, energy). Explains how removing one species cascades through the web.',
        minLength: 80,
        teacherReviewRequired: false,
      },
    },
    {
      id: 'l5-practice-mc2',
      section: 'PRACTICE' as const,
      blockType: 'MICRO_CHECK' as const,
      order: 9,
      content: {
        question: 'Why is a food WEB more realistic than a food CHAIN?',
        options: [
          { label: 'Food webs are shorter', value: 'a' },
          { label: 'Food webs show that most organisms eat and are eaten by multiple species', value: 'b', correct: true },
          { label: 'Food chains include decomposers but webs do not', value: 'c' },
          { label: 'Food webs only exist in oceans', value: 'd' },
        ],
        explanation: 'In real ecosystems, most organisms have multiple food sources and multiple predators. A food web captures this complexity; a single chain does not.',
      },
    },
    {
      id: 'l5-bridge',
      section: 'PRACTICE' as const,
      blockType: 'TEXT' as const,
      order: 10,
      content: {
        html: `
          <h3>🔮 Looking Ahead</h3>
          <p>Now you understand how complex and interconnected ecosystems really are. But what happens when something <em>disrupts</em> these connections? In Lesson 6, you will explore how ecosystems change — both naturally and because of human activity — and what happens when food webs are thrown out of balance.</p>
        `,
      },
    },
  ];

  for (const block of blocks) {
    await prisma.lessonBlock.create({
      data: {
        id: block.id,
        lessonId: LESSON_ID,
        section: block.section,
        blockType: block.blockType,
        order: block.order,
        content: block.content,
      },
    });
  }
  console.log(`  ✅ ${blocks.length} blocks created`);

  // ─── Questions ───
  const questions = [
    {
      id: 'l5-q1',
      questionText: 'What is the main difference between a food chain and a food web?',
      questionType: 'MULTIPLE_CHOICE' as const,
      options: [
        { label: 'A food chain is longer than a food web', value: 'a' },
        { label: 'A food web shows multiple interconnected food chains in an ecosystem', value: 'b', correct: true },
        { label: 'A food chain includes decomposers but a food web does not', value: 'c' },
        { label: 'There is no difference', value: 'd' },
      ],
      correctAnswer: 'b',
      explanation: 'A food web is a network of many food chains showing all the feeding relationships in an ecosystem.',
      outcomeCode: 'SCI.7.A.1',
      difficulty: 1,
    },
    {
      id: 'l5-q2',
      questionText: 'According to the 10% rule, if producers capture 5,000 kJ of energy, how much reaches the secondary consumers?',
      questionType: 'MULTIPLE_CHOICE' as const,
      options: [
        { label: '5,000 kJ', value: 'a' },
        { label: '500 kJ', value: 'b' },
        { label: '50 kJ', value: 'c', correct: true },
        { label: '5 kJ', value: 'd' },
      ],
      correctAnswer: 'c',
      explanation: '5,000 → 500 (primary consumers get 10%) → 50 (secondary consumers get 10% of 500).',
      outcomeCode: 'SCI.7.A.2',
      difficulty: 2,
    },
    {
      id: 'l5-q3',
      questionText: 'Why are there usually fewer top predators than herbivores in an ecosystem?',
      questionType: 'MULTIPLE_CHOICE' as const,
      options: [
        { label: 'Top predators are less important', value: 'a' },
        { label: 'There is not enough energy at the top of the pyramid to support many top predators', value: 'b', correct: true },
        { label: 'Top predators reproduce less often', value: 'c' },
        { label: 'Herbivores are bigger and need more space', value: 'd' },
      ],
      correctAnswer: 'b',
      explanation: 'Energy decreases at each trophic level (10% rule). By the top, very little energy remains to support organisms.',
      outcomeCode: 'SCI.7.A.2',
      difficulty: 2,
    },
    {
      id: 'l5-q4',
      questionText: 'In a pond food web, algae are eaten by snails, snails are eaten by fish, and fish are eaten by herons. If all the snails died, what would MOST LIKELY happen?',
      questionType: 'MULTIPLE_CHOICE' as const,
      options: [
        { label: 'Algae population would increase because nothing is eating them', value: 'a', correct: true },
        { label: 'Herons would eat algae instead', value: 'b' },
        { label: 'Nothing would change', value: 'c' },
        { label: 'Fish population would increase', value: 'd' },
      ],
      correctAnswer: 'a',
      explanation: 'Without snails, algae have no predator and would grow unchecked (algal bloom). Fish lose a food source and decline, which also affects herons.',
      outcomeCode: 'SCI.7.A.1',
      difficulty: 2,
    },
    {
      id: 'l5-q5',
      questionText: 'What does the width of each level in an energy pyramid represent?',
      questionType: 'MULTIPLE_CHOICE' as const,
      options: [
        { label: 'How many species are at that level', value: 'a' },
        { label: 'The physical size of organisms', value: 'b' },
        { label: 'The amount of energy available at that trophic level', value: 'c', correct: true },
        { label: 'How fast organisms can move', value: 'd' },
      ],
      correctAnswer: 'c',
      explanation: 'An energy pyramid shows energy quantity at each level. The base is widest (most energy) and narrows toward the top (least energy).',
      outcomeCode: 'SCI.7.A.2',
      difficulty: 1,
    },
    {
      id: 'l5-q6',
      questionText: 'A student draws a food web with 4 organisms and only 3 arrows. Is this a good food web?',
      questionType: 'MULTIPLE_CHOICE' as const,
      options: [
        { label: 'Yes, food webs only need one arrow per organism', value: 'a' },
        { label: 'No, a realistic food web needs more connections because most organisms have multiple food sources and predators', value: 'b', correct: true },
        { label: 'Yes, more arrows would make it too confusing', value: 'c' },
        { label: 'No, food webs require exactly 10 arrows', value: 'd' },
      ],
      correctAnswer: 'b',
      explanation: 'The whole point of a food web is to show MULTIPLE connections. 4 organisms with only 3 arrows is basically a chain, not a web.',
      outcomeCode: 'SCI.7.A.1',
      difficulty: 1,
    },
    {
      id: 'l5-q7',
      questionText: 'Where does the 90% of "lost" energy at each trophic level actually go?',
      questionType: 'MULTIPLE_CHOICE' as const,
      options: [
        { label: 'It disappears completely', value: 'a' },
        { label: 'It is stored in bones and shells', value: 'b' },
        { label: 'It is released as heat through life processes like breathing, moving, and growing', value: 'c', correct: true },
        { label: 'It flows backward down the food chain', value: 'd' },
      ],
      correctAnswer: 'c',
      explanation: 'Energy is never destroyed, but organisms use most of it for life processes (metabolism), releasing it as heat. Only ~10% gets stored in body tissue for the next consumer.',
      outcomeCode: 'SCI.7.A.2',
      difficulty: 2,
    },
    {
      id: 'l5-q8',
      questionText: 'In a forest food web, if a new predator is introduced that eats squirrels, which trophic level would you expect to DECREASE?',
      questionType: 'MULTIPLE_CHOICE' as const,
      options: [
        { label: 'Producers (trees and plants)', value: 'a' },
        { label: 'Primary consumers (squirrels)', value: 'b', correct: true },
        { label: 'Decomposers (fungi)', value: 'c' },
        { label: 'All levels would decrease equally', value: 'd' },
      ],
      correctAnswer: 'b',
      explanation: 'Adding a new predator that eats squirrels would decrease the squirrel (primary consumer) population. This could cascade up and down through the food web.',
      outcomeCode: 'SCI.7.A.1',
      difficulty: 1,
    },
    {
      id: 'l5-q9',
      questionText: 'An ecosystem has 4 trophic levels. Which statement is TRUE?',
      questionType: 'MULTIPLE_CHOICE' as const,
      options: [
        { label: 'Level 4 has the most energy', value: 'a' },
        { label: 'Level 1 has the least energy', value: 'b' },
        { label: 'Level 1 has the most energy and Level 4 has the least', value: 'c', correct: true },
        { label: 'All levels have equal energy', value: 'd' },
      ],
      correctAnswer: 'c',
      explanation: 'Producers (Level 1) capture the most energy from the sun. Each level above loses ~90%, so the top level has the least.',
      outcomeCode: 'SCI.7.A.2',
      difficulty: 1,
    },
    {
      id: 'l5-q10',
      questionText: 'Why are food webs more stable than single food chains?',
      questionType: 'MULTIPLE_CHOICE' as const,
      options: [
        { label: 'Food webs have fewer organisms', value: 'a' },
        { label: 'If one species disappears, organisms in a web can switch to alternative food sources', value: 'b', correct: true },
        { label: 'Food webs do not include decomposers', value: 'c' },
        { label: 'Food webs have no top predators', value: 'd' },
      ],
      correctAnswer: 'b',
      explanation: 'Food webs have many connections, so if one species is lost, consumers can often eat other organisms. In a simple chain, losing one link collapses everything above it.',
      outcomeCode: 'SCI.7.A.1',
      difficulty: 2,
    },
  ];

  for (const q of questions) {
    await prisma.quizQuestion.create({
      data: {
        id: q.id,
        lessonId: LESSON_ID,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        outcomeCode: q.outcomeCode,
        difficulty: q.difficulty,
      },
    });
  }
  console.log(`  ✅ ${questions.length} quiz questions created`);
}

// Placeholder for remaining lessons — will be added next
async function seedLesson6() {
  const LESSON_ID = 'g7-sci-ua-l6';
  console.log('\n📗 Seeding Lesson 6: Ecosystem Change & Human Impact...');

  await prisma.lesson.update({
    where: { id: LESSON_ID },
    data: {
      subjectMode: 'SCIENCE',
      estimatedMinutes: 40,
      learningGoal: 'Describe how ecosystems change naturally and through human activity, and explain the effects of these changes on organisms.',
      successCriteria: 'I can explain at least two natural changes and two human-caused changes to ecosystems and predict how they affect food webs.',
      materials: 'Science notebook',
      reflectionPrompt: 'Think about the food web you built in Lesson 5. Choose ONE human impact from today\'s lesson and explain how it would affect YOUR food web. Which connections would break?',
      warmUpConfig: {
        type: 'retrieval',
        prompt: 'From Lesson 5: In a food web, if one species is removed, why don\'t ALL the species above it die immediately?',
        options: [
          { label: 'Because food webs have multiple connections, so organisms can switch to other food sources', value: 'a', correct: true },
          { label: 'Because all organisms can survive without food', value: 'b', correct: false },
          { label: 'Because decomposers replace the missing species', value: 'c', correct: false },
          { label: 'Because energy flows backward in emergencies', value: 'd', correct: false },
        ],
      },
      masteryConfig: { passPercent: 80, maxRetries: 5, reteachEnabled: true, immediateCorrectiveFeedback: false },
    },
  });

  await prisma.lessonBlock.deleteMany({ where: { lessonId: LESSON_ID } });
  await prisma.quizQuestion.deleteMany({ where: { lessonId: LESSON_ID } });

  const blocks = [
    {
      id: 'l6-learn-1', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 1,
      content: {
        html: `
          <h2>🔄 Natural Ecosystem Change</h2>
          <p>Ecosystems are NOT frozen in time — they naturally change over years, decades, and centuries. This process is called <strong>ecological succession</strong>.</p>
          <p><strong>Primary succession</strong> happens in places with no soil at all (like bare rock after a volcano). Lichens and mosses are the first to colonize, slowly building soil for larger plants.</p>
          <p><strong>Secondary succession</strong> happens after a disturbance (like a forest fire or flood) where soil still exists. Grasses and small plants return first, then shrubs, then trees.</p>
          <p>Natural disturbances like <strong>fire, floods, storms, and droughts</strong> are a normal part of ecosystem cycles. Many ecosystems actually <em>need</em> these disturbances to stay healthy — for example, some pine trees need fire to release their seeds!</p>
        `,
      },
    },
    {
      id: 'l6-learn-2', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 2,
      content: {
        html: `
          <h2>🏭 Human Impact on Ecosystems</h2>
          <p>While natural changes happen slowly, human activities can change ecosystems very quickly. Major human impacts include:</p>
          <ul>
            <li><strong>Habitat loss</strong> — clearing forests for farming, cities, or roads destroys the homes of countless organisms</li>
            <li><strong>Pollution</strong> — chemicals, garbage, and runoff poison water, soil, and air</li>
            <li><strong>Invasive species</strong> — organisms introduced to new ecosystems where they have no natural predators, outcompeting native species</li>
            <li><strong>Overexploitation</strong> — hunting, fishing, or harvesting faster than species can reproduce</li>
            <li><strong>Climate change</strong> — rising temperatures alter habitats, migration patterns, and food availability</li>
          </ul>
          <p>Unlike natural disturbances, many human impacts happen too fast for ecosystems to recover on their own.</p>
        `,
      },
    },
    {
      id: 'l6-learn-vocab', section: 'LEARN' as const, blockType: 'VOCABULARY' as const, order: 3,
      content: {
        terms: [
          { term: 'Ecological Succession', definition: 'The gradual process by which ecosystems change and develop over time.', example: 'After a forest fire, grasses grow first, then shrubs, then trees over many years.' },
          { term: 'Invasive Species', definition: 'An organism introduced to an ecosystem where it is not native and causes harm.', example: 'Purple loosestrife is a plant that invades Canadian wetlands, choking out native plants.' },
          { term: 'Habitat Loss', definition: 'The destruction of an organism\'s natural home, usually by human activity.', example: 'Clearing a forest for a shopping mall removes the habitat for birds, deer, and insects.' },
          { term: 'Pollution', definition: 'The introduction of harmful substances into the environment.', example: 'Fertilizer runoff from farms causes algal blooms in lakes, depleting oxygen for fish.' },
          { term: 'Biodiversity', definition: 'The variety of different species living in an ecosystem.', example: 'A tropical rainforest has very high biodiversity; a parking lot has very low biodiversity.' },
        ],
      },
    },
    {
      id: 'l6-learn-video', section: 'LEARN' as const, blockType: 'VIDEO' as const, order: 4,
      content: {
        url: 'https://www.youtube.com/watch?v=HrVhit3Wziw',
        title: 'Human Impact on Biodiversity',
        aiSummary: 'Humans affect ecosystems and biodiversity in many significant ways. Deforestation removes habitat for thousands of species and reduces the number of trees available to absorb carbon dioxide. Pollution — including air pollution, water pollution, and soil contamination — can poison organisms and disrupt food chains. Urbanization (building cities, roads, and factories) replaces natural habitats with concrete and pavement. Introducing invasive species — organisms that are brought to a new environment where they have no natural predators — can outcompete native species and collapse food webs. Climate change, driven by burning fossil fuels, is warming the planet and shifting weather patterns, which forces species to migrate, adapt, or face extinction. However, humans can also help through conservation efforts like protected areas, habitat restoration, sustainable agriculture, and reducing pollution.',
      },
    },
    {
      id: 'l6-learn-mc1', section: 'LEARN' as const, blockType: 'MICRO_CHECK' as const, order: 5,
      content: {
        question: 'What is the difference between primary and secondary succession?',
        options: [
          { label: 'Primary succession is faster', value: 'a' },
          { label: 'Primary succession starts on bare rock with no soil; secondary succession starts where soil already exists', value: 'b', correct: true },
          { label: 'Secondary succession only happens in water', value: 'c' },
          { label: 'There is no difference', value: 'd' },
        ],
        explanation: 'Primary succession starts from nothing (bare rock) and is very slow. Secondary succession starts where soil remains after a disturbance (fire, flood) and is faster.',
      },
    },
    {
      id: 'l6-practice-1', section: 'PRACTICE' as const, blockType: 'MATCHING' as const, order: 6,
      content: {
        instruction: 'Match each human impact to its effect on ecosystems:',
        pairs: [
          { left: 'Deforestation', right: 'Destroys habitats and reduces biodiversity' },
          { left: 'Fertilizer runoff', right: 'Causes algal blooms that deplete oxygen in water' },
          { left: 'Introducing rabbits to Australia', right: 'Invasive species outcompetes native grazers' },
          { left: 'Overfishing cod in Atlantic Canada', right: 'Population collapse from overexploitation' },
          { left: 'Burning fossil fuels', right: 'Increases greenhouse gases and changes climate' },
        ],
      },
    },
    {
      id: 'l6-practice-2', section: 'PRACTICE' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 7,
      content: {
        prompt: 'Read this scenario:\n\nA wetland near a city is being drained to build a new housing development. The wetland currently contains: cattails, frogs, dragonflies, muskrats, herons, and many species of bacteria in the soil.\n\nUsing what you learned about habitat loss and food webs:\n1. Name at least 3 organisms that would lose their habitat.\n2. Explain how removing the wetland would affect the heron population specifically.\n3. Suggest ONE way the development could be designed to reduce harm to the ecosystem.',
        rubricHint: 'Names at least 3 organisms from the wetland scenario (cattails, frogs, herons, etc.). Explains habitat loss cause-and-effect on herons via food web connections. Suggestion for reducing harm is specific and realistic. Uses vocabulary (habitat loss, biodiversity, food web, population).',
        minLength: 80,
        teacherReviewRequired: false,
      },
    },
    {
      id: 'l6-practice-3', section: 'PRACTICE' as const, blockType: 'MULTIPLE_CHOICE' as const, order: 8,
      content: {
        question: 'A scientist visits a forest that burned 5 years ago. She sees grasses, wildflowers, and small shrubs growing. What stage of succession is this?',
        options: [
          { label: 'Primary succession — bare rock is being colonized', value: 'a' },
          { label: 'Secondary succession — the ecosystem is recovering after a disturbance', value: 'b', correct: true },
          { label: 'Climax community — the forest is fully mature', value: 'c' },
          { label: 'No succession — the forest is dead', value: 'd' },
        ],
        explanation: 'A burned forest still has soil, so this is secondary succession. Grasses and wildflowers are among the first species to return.',
      },
    },
    {
      id: 'l6-bridge', section: 'PRACTICE' as const, blockType: 'TEXT' as const, order: 9,
      content: {
        html: `
          <h3>🔮 Looking Ahead</h3>
          <p>Now you know HOW ecosystems change and how human activity can disrupt them. But how do scientists actually <em>monitor</em> whether an ecosystem is healthy or in trouble? In Lesson 7, you will learn about <strong>indicator species</strong> — special organisms that act like a "health report card" for their ecosystem.</p>
        `,
      },
    },
  ];

  for (const block of blocks) {
    await prisma.lessonBlock.create({ data: { id: block.id, lessonId: LESSON_ID, section: block.section, blockType: block.blockType, order: block.order, content: block.content } });
  }
  console.log(`  ✅ ${blocks.length} blocks created`);

  const questions = [
    { id: 'l6-q1', questionText: 'What is ecological succession?', questionType: 'MULTIPLE_CHOICE' as const, options: [
      { label: 'The sudden extinction of all species', value: 'a' },
      { label: 'The gradual process by which ecosystems change and develop over time', value: 'b', correct: true },
      { label: 'The introduction of invasive species', value: 'c' },
      { label: 'A type of pollution', value: 'd' },
    ], correctAnswer: 'b', explanation: 'Succession is the natural, gradual process of ecosystem change — from bare ground to a mature community.', outcomeCode: 'SCI.7.A.3', difficulty: 1 },
    { id: 'l6-q2', questionText: 'Which of the following is an example of an INVASIVE species in Canada?', questionType: 'MULTIPLE_CHOICE' as const, options: [
      { label: 'A beaver building a dam in a Canadian river', value: 'a' },
      { label: 'Purple loosestrife taking over Canadian wetlands', value: 'b', correct: true },
      { label: 'A moose eating willow branches', value: 'c' },
      { label: 'Salmon swimming upstream to spawn', value: 'd' },
    ], correctAnswer: 'b', explanation: 'Purple loosestrife was brought from Europe and aggressively outcompetes native wetland plants. The other examples are native Canadian species.', outcomeCode: 'SCI.7.A.3', difficulty: 1 },
    { id: 'l6-q3', questionText: 'What is the MAIN difference between primary and secondary succession?', questionType: 'MULTIPLE_CHOICE' as const, options: [
      { label: 'Primary starts on bare rock (no soil); secondary starts where soil exists after a disturbance', value: 'a', correct: true },
      { label: 'Primary is caused by humans; secondary is natural', value: 'b' },
      { label: 'Primary happens in water; secondary on land', value: 'c' },
      { label: 'There is no difference', value: 'd' },
    ], correctAnswer: 'a', explanation: 'Primary succession begins on bare rock or lava (no soil exists). Secondary succession begins after a disturbance like fire or flood where soil remains.', outcomeCode: 'SCI.7.A.3', difficulty: 2 },
    { id: 'l6-q4', questionText: 'Fertilizer from a farm washes into a lake. What is the MOST LIKELY effect?', questionType: 'MULTIPLE_CHOICE' as const, options: [
      { label: 'Fish grow larger and healthier', value: 'a' },
      { label: 'Algae grow rapidly, depleting oxygen and killing fish', value: 'b', correct: true },
      { label: 'The water becomes cleaner', value: 'c' },
      { label: 'Nothing changes', value: 'd' },
    ], correctAnswer: 'b', explanation: 'Fertilizer causes algal blooms (eutrophication). When algae die, bacteria decompose them and use up dissolved oxygen, suffocating fish.', outcomeCode: 'SCI.7.A.3', difficulty: 2 },
    { id: 'l6-q5', questionText: 'A forest is cleared to build a highway. Which term BEST describes this?', questionType: 'MULTIPLE_CHOICE' as const, options: [
      { label: 'Ecological succession', value: 'a' },
      { label: 'Habitat loss', value: 'b', correct: true },
      { label: 'Mutualism', value: 'c' },
      { label: 'Natural disturbance', value: 'd' },
    ], correctAnswer: 'b', explanation: 'Clearing a forest for construction destroys the habitat where organisms live. This is habitat loss — one of the biggest threats to biodiversity.', outcomeCode: 'SCI.7.A.3', difficulty: 1 },
    { id: 'l6-q6', questionText: 'Why do some ecosystems NEED natural disturbances like fire?', questionType: 'MULTIPLE_CHOICE' as const, options: [
      { label: 'Fire kills all organisms permanently', value: 'a' },
      { label: 'Fire clears old growth, returns nutrients to soil, and triggers seed release in some species', value: 'b', correct: true },
      { label: 'Fire is always harmful to ecosystems', value: 'c' },
      { label: 'Fire only affects abiotic factors', value: 'd' },
    ], correctAnswer: 'b', explanation: 'Some pine and eucalyptus species need fire to open their cones and release seeds. Fire also clears undergrowth and recycles nutrients.', outcomeCode: 'SCI.7.A.3', difficulty: 2 },
    { id: 'l6-q7', questionText: 'What makes invasive species so harmful to ecosystems?', questionType: 'MULTIPLE_CHOICE' as const, options: [
      { label: 'They are always larger than native species', value: 'a' },
      { label: 'They have no natural predators in the new ecosystem, so their population grows unchecked', value: 'b', correct: true },
      { label: 'They cannot survive in the new ecosystem', value: 'c' },
      { label: 'They only eat abiotic factors', value: 'd' },
    ], correctAnswer: 'b', explanation: 'Without natural predators or diseases, invasive species reproduce rapidly and outcompete native species for food and habitat.', outcomeCode: 'SCI.7.A.3', difficulty: 1 },
    { id: 'l6-q8', questionText: 'Which human activity MOST DIRECTLY reduces biodiversity?', questionType: 'MULTIPLE_CHOICE' as const, options: [
      { label: 'Planting a garden', value: 'a' },
      { label: 'Clearing a rainforest for cattle ranching', value: 'b', correct: true },
      { label: 'Walking on a nature trail', value: 'c' },
      { label: 'Watching a nature documentary', value: 'd' },
    ], correctAnswer: 'b', explanation: 'Rainforest clearing (deforestation) directly destroys the most biodiverse ecosystems on Earth, eliminating thousands of species.', outcomeCode: 'SCI.7.A.3', difficulty: 1 },
    { id: 'l6-q9', questionText: 'After a volcanic eruption covers an island in lava, what is the FIRST step of succession?', questionType: 'MULTIPLE_CHOICE' as const, options: [
      { label: 'Trees immediately grow back', value: 'a' },
      { label: 'Lichens and mosses colonize the bare rock, slowly creating soil', value: 'b', correct: true },
      { label: 'Animals return and dig burrows', value: 'c' },
      { label: 'Rain washes the lava away', value: 'd' },
    ], correctAnswer: 'b', explanation: 'Primary succession starts with pioneer species like lichens and mosses that can grow on bare rock. They break down rock into soil over many years.', outcomeCode: 'SCI.7.A.3', difficulty: 2 },
    { id: 'l6-q10', questionText: 'How does climate change affect ecosystems differently from a forest fire?', questionType: 'MULTIPLE_CHOICE' as const, options: [
      { label: 'Climate change is a local event; fire is global', value: 'a' },
      { label: 'Climate change happens gradually and globally, affecting all ecosystems; fire is local and temporary', value: 'b', correct: true },
      { label: 'Fire is always worse than climate change', value: 'c' },
      { label: 'Climate change only affects aquatic ecosystems', value: 'd' },
    ], correctAnswer: 'b', explanation: 'Fire is a local disturbance that ecosystems can recover from through succession. Climate change alters temperature and weather globally, changing conditions for all ecosystems simultaneously.', outcomeCode: 'SCI.7.A.3', difficulty: 2 },
  ];

  for (const q of questions) {
    await prisma.quizQuestion.create({ data: { id: q.id, lessonId: LESSON_ID, questionText: q.questionText, questionType: q.questionType, options: q.options, correctAnswer: q.correctAnswer, explanation: q.explanation, outcomeCode: q.outcomeCode, difficulty: q.difficulty } });
  }
  console.log(`  ✅ ${questions.length} quiz questions created`);
}
async function seedLesson7() {
  const LESSON_ID = 'g7-sci-ua-l7';
  console.log('\n📗 Seeding Lesson 7: Monitoring & Indicator Species...');

  await prisma.lesson.update({
    where: { id: LESSON_ID },
    data: {
      subjectMode: 'SCIENCE',
      estimatedMinutes: 40,
      learningGoal: 'Explain how scientists use indicator species and monitoring techniques to assess ecosystem health.',
      successCriteria: 'I can identify indicator species, explain why they are useful, and design a simple monitoring plan for a local ecosystem.',
      materials: 'Science notebook',
      reflectionPrompt: 'Imagine you are a scientist checking the health of a stream near your school. Based on what you learned today, which 2 indicator species would you look for, and what would their presence or absence tell you?',
      warmUpConfig: {
        type: 'retrieval',
        prompt: 'From Lesson 6: Name ONE human activity that reduces biodiversity and explain HOW it harms ecosystems.',
        options: [
          { label: 'Deforestation — destroys habitats and removes food/shelter for organisms', value: 'a', correct: true },
          { label: 'Sleeping — it rests the ecosystem', value: 'b', correct: false },
          { label: 'Photosynthesis — it removes carbon dioxide', value: 'c', correct: false },
          { label: 'Rain — it washes away pollution', value: 'd', correct: false },
        ],
      },
      masteryConfig: { passPercent: 80, maxRetries: 5, reteachEnabled: true, immediateCorrectiveFeedback: false },
    },
  });

  await prisma.lessonBlock.deleteMany({ where: { lessonId: LESSON_ID } });
  await prisma.quizQuestion.deleteMany({ where: { lessonId: LESSON_ID } });

  const blocks = [
    {
      id: 'l7-learn-1', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 1,
      content: {
        html: `
          <h2>🔍 How Do Scientists Monitor Ecosystems?</h2>
          <p>In Lesson 6, you learned that ecosystems can be damaged by human activity. But how do scientists know <em>when</em> an ecosystem is in trouble — or recovering?</p>
          <p>Scientists use several monitoring techniques:</p>
          <ul>
            <li><strong>Species surveys</strong> — counting and identifying organisms in a specific area</li>
            <li><strong>Water quality testing</strong> — measuring dissolved oxygen, pH, temperature, and pollutant levels</li>
            <li><strong>Biodiversity indices</strong> — calculating the variety and abundance of species present</li>
            <li><strong>Satellite imagery</strong> — tracking changes in vegetation, land use, and habitat loss over time</li>
          </ul>
          <p>One of the most powerful methods is using <strong>indicator species</strong> — organisms whose presence, absence, or health tells scientists about the condition of the entire ecosystem.</p>
        `,
      },
    },
    {
      id: 'l7-learn-2', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 2,
      content: {
        html: `
          <h2>🐸 Indicator Species</h2>
          <p>An <strong>indicator species</strong> is an organism that is particularly sensitive to environmental changes. Their health reflects the health of their whole ecosystem.</p>
          <p>Examples of indicator species:</p>
          <ul>
            <li><strong>Frogs & amphibians</strong> — their skin absorbs water directly, so they are very sensitive to water pollution. Declining frog populations often signal water contamination.</li>
            <li><strong>Lichens</strong> — they absorb nutrients directly from air and rain, making them sensitive to air pollution. Abundant lichens = clean air.</li>
            <li><strong>Mayfly larvae</strong> — they can only survive in clean, oxygen-rich water. Finding mayfly larvae in a stream means the water quality is excellent.</li>
            <li><strong>Tubifex worms</strong> — they thrive in polluted, low-oxygen water. Finding them in large numbers indicates poor water quality.</li>
          </ul>
          <p>By monitoring these species, scientists can detect problems early — often before they become visible to humans.</p>
        `,
      },
    },
    {
      id: 'l7-learn-vocab', section: 'LEARN' as const, blockType: 'VOCABULARY' as const, order: 3,
      content: {
        terms: [
          { term: 'Indicator Species', definition: 'An organism whose presence or health signals the condition of an ecosystem.', example: 'Frogs are indicator species for water quality — declining populations may indicate pollution.' },
          { term: 'Biodiversity Index', definition: 'A measure of the variety and number of different species in an ecosystem.', example: 'A forest with 50 different species has higher biodiversity than one with only 5.' },
          { term: 'Species Survey', definition: 'A systematic count and identification of organisms in a specific area.', example: 'Scientists count bird species in a wetland every spring to track population trends.' },
          { term: 'Water Quality', definition: 'A measure of how clean or polluted water is, based on factors like dissolved oxygen, pH, and pollutants.', example: 'High dissolved oxygen and neutral pH usually indicate good water quality.' },
          { term: 'Citizen Science', definition: 'Scientific research conducted by members of the public, often contributing data to larger studies.', example: 'Students counting butterflies in their schoolyard and reporting data to a national database.' },
        ],
      },
    },
    {
      id: 'l7-learn-video', section: 'LEARN' as const, blockType: 'VIDEO' as const, order: 4,
      content: {
        url: 'https://www.youtube.com/watch?v=hIJdNGKiSIk',
        title: 'What Are Indicator Species?',
        aiSummary: 'Indicator species are organisms whose presence, absence, or health tells scientists about the overall condition of an ecosystem. For example, mayfly larvae can only survive in clean, well-oxygenated water — if you find them in a stream, the water quality is excellent. If they disappear, something is wrong. Lichens are indicator species for air quality — they are very sensitive to air pollution and will not grow in polluted areas. Frogs and amphibians are indicators of wetland health because they absorb water and pollutants through their skin, making them very sensitive to environmental changes. Scientists use indicator species as a quick, efficient way to monitor ecosystem health without having to test every single factor. If the indicator species are thriving, the ecosystem is likely healthy. If they are declining, it signals that something in the environment has changed and needs investigation.',
      },
    },
    {
      id: 'l7-learn-mc1', section: 'LEARN' as const, blockType: 'MICRO_CHECK' as const, order: 5,
      content: {
        question: 'A scientist finds many mayfly larvae in a stream. What does this tell her about the water quality?',
        options: [
          { label: 'The water is severely polluted', value: 'a' },
          { label: 'The water is clean and oxygen-rich — excellent quality', value: 'b', correct: true },
          { label: 'The water has no organisms', value: 'c' },
          { label: 'Nothing — mayflies are not related to water quality', value: 'd' },
        ],
        explanation: 'Mayfly larvae can only survive in clean, well-oxygenated water. Their presence is a strong indicator of excellent water quality.',
      },
    },
    {
      id: 'l7-practice-1', section: 'PRACTICE' as const, blockType: 'MATCHING' as const, order: 6,
      content: {
        instruction: 'Match each indicator species to what it tells scientists:',
        pairs: [
          { left: 'Frogs declining in a wetland', right: 'Water may be contaminated with pollutants' },
          { left: 'Thick lichen growth on trees', right: 'Air quality is clean and healthy' },
          { left: 'Mayfly larvae in a stream', right: 'Water is clean and oxygen-rich' },
          { left: 'Large numbers of tubifex worms', right: 'Water is polluted and low in oxygen' },
          { left: 'Diverse bird species in a forest', right: 'Ecosystem is healthy with high biodiversity' },
        ],
      },
    },
    {
      id: 'l7-practice-2', section: 'PRACTICE' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 7,
      content: {
        prompt: 'You are a scientist hired to check the health of a lake near a farm. Design a simple monitoring plan:\n\n1. Name TWO indicator species you would look for and explain what they would tell you.\n2. Name TWO abiotic factors you would measure (think back to Lesson 1).\n3. Explain why monitoring BOTH biotic and abiotic factors gives a more complete picture of ecosystem health.\n\nUse specific vocabulary from today\'s and previous lessons.',
        rubricHint: 'Names specific indicator species (frogs, mayfly larvae, lichens, tubifex worms) and explains what each indicates. References abiotic factors from Lesson 1 (temperature, pH, dissolved oxygen, sunlight, etc.). Connects biotic monitoring to abiotic monitoring with clear reasoning. Uses vocabulary (indicator species, biotic, abiotic, biodiversity, water quality, ecosystem health).',
        minLength: 80,
        teacherReviewRequired: false,
      },
    },
    {
      id: 'l7-practice-3', section: 'PRACTICE' as const, blockType: 'FILL_IN_BLANK' as const, order: 8,
      content: {
        sentence: 'An organism whose presence or health signals the overall condition of an ecosystem is called an _____ _____.',
        correctAnswer: 'indicator species',
        caseSensitive: false,
        hint: 'Two words. Think about species that "indicate" something about the environment.',
      },
    },
    {
      id: 'l7-practice-4', section: 'PRACTICE' as const, blockType: 'MULTIPLE_CHOICE' as const, order: 9,
      content: {
        question: 'Students at a school near a river notice that the frog population has decreased dramatically over 3 years. What should they do FIRST?',
        options: [
          { label: 'Ignore it — frogs are not important', value: 'a' },
          { label: 'Investigate possible causes like water pollution or habitat loss, since frogs are an indicator species', value: 'b', correct: true },
          { label: 'Bring frogs from another area to replace them', value: 'c' },
          { label: 'Build more houses near the river', value: 'd' },
        ],
        explanation: 'Frogs are indicator species. A declining population signals something is wrong — investigation of water quality and habitat should come first.',
      },
    },
    {
      id: 'l7-bridge', section: 'PRACTICE' as const, blockType: 'TEXT' as const, order: 10,
      content: {
        html: `
          <h3>🔮 Looking Ahead</h3>
          <p>Now you know how to DETECT ecosystem problems. But what can we actually DO about them? In Lesson 8, you will design your own <strong>Alberta Ecosystem Conservation Plan</strong> — pulling together everything you have learned in this entire unit to protect a real Alberta ecosystem.</p>
        `,
      },
    },
  ];

  for (const block of blocks) {
    await prisma.lessonBlock.create({ data: { id: block.id, lessonId: LESSON_ID, section: block.section, blockType: block.blockType, order: block.order, content: block.content } });
  }
  console.log(`  ✅ ${blocks.length} blocks created`);

  const questions = [
    { id: 'l7-q1', questionText: 'What is an indicator species?', questionType: 'MULTIPLE_CHOICE' as const, options: [
      { label: 'The largest species in an ecosystem', value: 'a' },
      { label: 'An organism whose presence or health reflects the overall condition of an ecosystem', value: 'b', correct: true },
      { label: 'Any species that is endangered', value: 'c' },
      { label: 'A species that eats all other species', value: 'd' },
    ], correctAnswer: 'b', explanation: 'Indicator species are sensitive to environmental changes, so their health tells us about the health of the whole ecosystem.', outcomeCode: 'SCI.7.A.3', difficulty: 1 },
    { id: 'l7-q2', questionText: 'Why are frogs considered good indicator species for water quality?', questionType: 'MULTIPLE_CHOICE' as const, options: [
      { label: 'Frogs are the largest animals in wetlands', value: 'a' },
      { label: 'Frogs\' permeable skin absorbs water directly, making them very sensitive to pollutants', value: 'b', correct: true },
      { label: 'Frogs only live near clean water', value: 'c' },
      { label: 'Frogs eat pollutants', value: 'd' },
    ], correctAnswer: 'b', explanation: 'Frogs absorb water and chemicals through their skin. Pollutants in water directly affect their health, making them early-warning systems for contamination.', outcomeCode: 'SCI.7.A.3', difficulty: 2 },
    { id: 'l7-q3', questionText: 'A stream has abundant mayfly larvae. What does this indicate?', questionType: 'MULTIPLE_CHOICE' as const, options: [
      { label: 'The stream is heavily polluted', value: 'a' },
      { label: 'The stream has excellent, clean water quality', value: 'b', correct: true },
      { label: 'The stream has no fish', value: 'c' },
      { label: 'The stream is about to dry up', value: 'd' },
    ], correctAnswer: 'b', explanation: 'Mayfly larvae can only survive in clean, oxygen-rich water. Their presence is a strong positive indicator of water quality.', outcomeCode: 'SCI.7.A.3', difficulty: 1 },
    { id: 'l7-q4', questionText: 'Why is monitoring BOTH biotic and abiotic factors important for understanding ecosystem health?', questionType: 'MULTIPLE_CHOICE' as const, options: [
      { label: 'It is not important — only abiotic factors matter', value: 'a' },
      { label: 'Because biotic factors show which organisms are present, while abiotic factors reveal the environmental conditions that support (or threaten) those organisms', value: 'b', correct: true },
      { label: 'Because biotic factors are easier to measure', value: 'c' },
      { label: 'Because abiotic factors never change', value: 'd' },
    ], correctAnswer: 'b', explanation: 'Together, biotic and abiotic data give a complete picture — you can see both what is happening to organisms AND what environmental conditions might be causing it.', outcomeCode: 'SCI.7.A.3', difficulty: 2 },
    { id: 'l7-q5', questionText: 'What is citizen science?', questionType: 'MULTIPLE_CHOICE' as const, options: [
      { label: 'Science that only professional scientists can do', value: 'a' },
      { label: 'Scientific research conducted by members of the public, often contributing data to larger studies', value: 'b', correct: true },
      { label: 'Science about cities', value: 'c' },
      { label: 'A type of pollution monitoring machine', value: 'd' },
    ], correctAnswer: 'b', explanation: 'Citizen science involves everyday people collecting scientific data. Students counting butterflies or birdwatchers reporting sightings are examples.', outcomeCode: 'SCI.7.A.3', difficulty: 1 },
    { id: 'l7-q6', questionText: 'Large numbers of tubifex worms are found in a river near a factory. What does this suggest?', questionType: 'MULTIPLE_CHOICE' as const, options: [
      { label: 'The river is very clean', value: 'a' },
      { label: 'The river is likely polluted and low in oxygen', value: 'b', correct: true },
      { label: 'The factory is helping the ecosystem', value: 'c' },
      { label: 'Tubifex worms are endangered', value: 'd' },
    ], correctAnswer: 'b', explanation: 'Tubifex worms thrive in polluted, low-oxygen water. Finding them in large numbers near a factory is a red flag for water contamination.', outcomeCode: 'SCI.7.A.3', difficulty: 1 },
    { id: 'l7-q7', questionText: 'A scientist notices that lichens have disappeared from trees in a city neighbourhood. What is the MOST LIKELY cause?', questionType: 'MULTIPLE_CHOICE' as const, options: [
      { label: 'The trees are too old', value: 'a' },
      { label: 'Air pollution has increased in the area', value: 'b', correct: true },
      { label: 'Lichens only grow in tropical climates', value: 'c' },
      { label: 'Someone removed them for decoration', value: 'd' },
    ], correctAnswer: 'b', explanation: 'Lichens absorb nutrients directly from the air. They are very sensitive to air pollution — their disappearance is a strong indicator of poor air quality.', outcomeCode: 'SCI.7.A.3', difficulty: 2 },
    { id: 'l7-q8', questionText: 'Which monitoring technique would BEST detect habitat loss over 20 years?', questionType: 'MULTIPLE_CHOICE' as const, options: [
      { label: 'Measuring water pH', value: 'a' },
      { label: 'Comparing satellite images from different years', value: 'b', correct: true },
      { label: 'Counting fish in a single pond', value: 'c' },
      { label: 'Testing soil temperature', value: 'd' },
    ], correctAnswer: 'b', explanation: 'Satellite imagery shows changes in land use, vegetation cover, and habitat loss over time — making it perfect for tracking long-term ecosystem changes.', outcomeCode: 'SCI.7.A.3', difficulty: 2 },
    { id: 'l7-q9', questionText: 'What is a biodiversity index?', questionType: 'MULTIPLE_CHOICE' as const, options: [
      { label: 'A list of all endangered species in the world', value: 'a' },
      { label: 'A measure of the variety and number of different species in an ecosystem', value: 'b', correct: true },
      { label: 'The number of abiotic factors in an area', value: 'c' },
      { label: 'A type of ecosystem', value: 'd' },
    ], correctAnswer: 'b', explanation: 'A biodiversity index tells you how many different species live in an area and how evenly they are distributed. Higher = healthier.', outcomeCode: 'SCI.7.A.3', difficulty: 1 },
    { id: 'l7-q10', questionText: 'A lake used to have frogs, dragonflies, and fish. Now only tubifex worms remain. What has MOST LIKELY happened?', questionType: 'MULTIPLE_CHOICE' as const, options: [
      { label: 'The lake improved in quality', value: 'a' },
      { label: 'The lake has become severely polluted, and only pollution-tolerant organisms survive', value: 'b', correct: true },
      { label: 'The other species migrated voluntarily', value: 'c' },
      { label: 'Tubifex worms ate all the other species', value: 'd' },
    ], correctAnswer: 'b', explanation: 'Frogs, dragonflies, and fish need clean water. Tubifex worms thrive in polluted water. This shift in indicator species shows the lake has been severely degraded.', outcomeCode: 'SCI.7.A.3', difficulty: 2 },
  ];

  for (const q of questions) {
    await prisma.quizQuestion.create({ data: { id: q.id, lessonId: LESSON_ID, questionText: q.questionText, questionType: q.questionType, options: q.options, correctAnswer: q.correctAnswer, explanation: q.explanation, outcomeCode: q.outcomeCode, difficulty: q.difficulty } });
  }
  console.log(`  ✅ ${questions.length} quiz questions created`);
}
async function seedLesson8() {
  const LESSON_ID = 'g7-sci-ua-l8';
  console.log('\n📗 Seeding Lesson 8: Conservation & Stewardship — Final Unit Project...');

  await prisma.lesson.update({
    where: { id: LESSON_ID },
    data: {
      subjectMode: 'SCIENCE',
      estimatedMinutes: 55,
      learningGoal: 'Design a conservation plan for an Alberta ecosystem that addresses human impacts, uses monitoring strategies, and balances human needs with ecosystem health.',
      successCriteria: 'I can identify threats to an Alberta ecosystem, propose conservation strategies using evidence from the unit, and explain how stewardship benefits both ecosystems and communities.',
      materials: 'Science notebook, coloured pencils, access to previous lesson work',
      reflectionPrompt: 'Think about everything you learned in this unit — from biotic/abiotic factors in Lesson 1 to indicator species in Lesson 7. What is the ONE most important idea about ecosystems that you will remember?',
      warmUpConfig: {
        type: 'retrieval',
        prompt: 'From Lesson 7: Name one indicator species and explain what its presence or absence tells scientists about an ecosystem.',
        options: [
          { label: 'Frogs — declining populations may indicate water pollution because their skin absorbs pollutants', value: 'a', correct: true },
          { label: 'Bears — they indicate cold weather', value: 'b', correct: false },
          { label: 'Grass — it indicates dry soil', value: 'c', correct: false },
          { label: 'Rocks — they indicate erosion', value: 'd', correct: false },
        ],
      },
      masteryConfig: { passPercent: 80, maxRetries: 5, reteachEnabled: true, immediateCorrectiveFeedback: false },
    },
  });

  await prisma.lessonBlock.deleteMany({ where: { lessonId: LESSON_ID } });
  await prisma.quizQuestion.deleteMany({ where: { lessonId: LESSON_ID } });

  const blocks = [
    {
      id: 'l8-learn-1', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 1,
      content: {
        html: `
          <h2>🌲 Conservation & Stewardship</h2>
          <p>Throughout this unit, you have learned HOW ecosystems work, how energy flows, how organisms interact, how humans impact ecosystems, and how scientists monitor ecosystem health.</p>
          <p>Now it is time for the big question: <strong>What can we DO about it?</strong></p>
          <p><strong>Conservation</strong> means protecting and managing ecosystems and their organisms to prevent damage, reduce harm, and allow recovery.</p>
          <p><strong>Stewardship</strong> means taking personal responsibility for caring for the environment — not just leaving it to scientists and governments.</p>
          <p>Effective conservation requires:</p>
          <ul>
            <li>Understanding the ecosystem (what you learned in Lessons 1-5)</li>
            <li>Identifying threats (what you learned in Lesson 6)</li>
            <li>Monitoring for change (what you learned in Lesson 7)</li>
            <li>Taking informed action (what you will learn today!)</li>
          </ul>
        `,
      },
    },
    {
      id: 'l8-learn-2', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 2,
      content: {
        html: `
          <h2>🍁 Alberta's Ecosystems Under Pressure</h2>
          <p>Alberta is home to diverse ecosystems, each facing unique threats:</p>
          <ul>
            <li><strong>Boreal Forest</strong> — covers northern Alberta. Threatened by oil sands development, logging, and wildfire changes due to climate change.</li>
            <li><strong>Grasslands</strong> — southern Alberta prairies. Over 70% of native grasslands have been converted to farmland. Endangered species include the burrowing owl and swift fox.</li>
            <li><strong>Wetlands</strong> — marshes, bogs, and fens across the province. Drained for agriculture and urban development, removing critical water filtration and wildlife habitat.</li>
            <li><strong>Rocky Mountain</strong> — western Alberta's mountain ecosystems. Affected by tourism, forestry, and climate-driven changes to snowpack and glaciers.</li>
          </ul>
          <p>Your final project: <strong>Design a conservation plan for ONE of these Alberta ecosystems.</strong></p>
        `,
      },
    },
    {
      id: 'l8-learn-vocab', section: 'LEARN' as const, blockType: 'VOCABULARY' as const, order: 3,
      content: {
        terms: [
          { term: 'Conservation', definition: 'The protection and careful management of natural resources and ecosystems.', example: 'Setting aside protected areas where no logging or development is allowed.' },
          { term: 'Stewardship', definition: 'Taking personal responsibility for caring for the environment.', example: 'A student organizing a wetland cleanup day at their school.' },
          { term: 'Sustainability', definition: 'Meeting human needs without depleting resources for future generations.', example: 'Selective logging (cutting some trees, not all) allows forests to regrow.' },
          { term: 'Protected Area', definition: 'A region designated by law to conserve its natural ecosystems and wildlife.', example: 'Banff National Park protects the Rocky Mountain ecosystem from development.' },
          { term: 'Restoration', definition: 'Actively rebuilding or repairing a damaged ecosystem.', example: 'Replanting native grasses in an area where farmland has been retired.' },
        ],
      },
    },
    {
      id: 'l8-learn-mc1', section: 'LEARN' as const, blockType: 'MICRO_CHECK' as const, order: 4,
      content: {
        question: 'What is the difference between conservation and stewardship?',
        options: [
          { label: 'They are the same thing', value: 'a' },
          { label: 'Conservation is about protecting ecosystems; stewardship is about taking personal responsibility for caring for the environment', value: 'b', correct: true },
          { label: 'Stewardship means destroying ecosystems', value: 'c' },
          { label: 'Conservation is only done by governments', value: 'd' },
        ],
        explanation: 'Conservation = the broader effort to protect ecosystems. Stewardship = YOUR personal role in that effort. Both are needed!',
      },
    },
    {
      id: 'l8-practice-choice', section: 'PRACTICE' as const, blockType: 'MULTIPLE_CHOICE' as const, order: 5,
      content: {
        question: 'Choose the Alberta ecosystem you will design a conservation plan for:',
        options: [
          { label: '🌲 Boreal Forest — threatened by oil sands, logging, wildfire', value: 'boreal' },
          { label: '🌾 Grasslands — over 70% lost to farming, endangered species', value: 'grasslands' },
          { label: '🦆 Wetlands — drained for development, critical water filtration', value: 'wetlands' },
          { label: '🏔️ Rocky Mountain — tourism, forestry, climate change', value: 'rocky_mountain' },
        ],
      },
    },
    {
      id: 'l8-practice-1', section: 'PRACTICE' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 6,
      content: {
        prompt: 'PART 1: Ecosystem Analysis\n\nFor your chosen Alberta ecosystem, answer these questions using concepts from the ENTIRE unit:\n\n1. Name at least 3 biotic factors and 2 abiotic factors in this ecosystem (Lesson 1).\n2. Draw or describe 1 food chain AND 1 food web in this ecosystem, labelling producers, consumers, and decomposers (Lessons 2 & 5).\n3. Name at least 1 symbiotic relationship between organisms in this ecosystem (Lesson 3).\n4. Explain how the 10% rule affects the number of top predators in this ecosystem (Lesson 5).',
        rubricHint: 'Correctly names at least 3 biotic and 2 abiotic factors for the chosen ecosystem. Food chain/web labels producers, consumers, and decomposers correctly. Symbiotic relationship is accurately classified. 10% rule explanation connects to predator numbers. Uses vocabulary from Lessons 1-5 accurately (biotic, abiotic, producer, consumer, decomposer, food web, trophic level, 10% rule, symbiosis).',
        minLength: 120,
        teacherReviewRequired: true,
      },
    },
    {
      id: 'l8-practice-2', section: 'PRACTICE' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 7,
      content: {
        prompt: 'PART 2: Threats & Monitoring\n\nFor your chosen ecosystem:\n\n1. Identify at least 2 specific human impacts threatening this ecosystem (Lesson 6).\n2. Explain how each impact would affect the food web you described in Part 1.\n3. Design a monitoring plan: name 2 indicator species AND 2 abiotic measurements you would use (Lesson 7).\n4. Explain WHAT changes in your indicator species would tell you the ecosystem is in trouble.',
        rubricHint: 'Identifies 2+ specific and realistic human impacts on the chosen ecosystem (e.g. pollution, habitat loss, invasive species). Explains how each impact cascades through the food web from Part 1. Monitoring plan names specific indicator species and explains what each indicates. Abiotic measurements are appropriate for the ecosystem. Uses vocabulary (habitat loss, invasive species, pollution, indicator species, biodiversity, water quality).',
        minLength: 120,
        teacherReviewRequired: true,
      },
    },
    {
      id: 'l8-practice-3', section: 'PRACTICE' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 8,
      content: {
        prompt: 'PART 3: Conservation Plan\n\nDesign your conservation plan:\n\n1. Propose at least 3 specific conservation strategies to protect your ecosystem.\n   For each strategy, explain HOW it addresses a specific threat from Part 2.\n2. Explain how your plan balances human needs (jobs, development) with ecosystem health.\n3. Describe one way STUDENTS your age could practice stewardship for this ecosystem.\n4. Predict: If your conservation plan is implemented, what would your indicator species look like in 10 years?',
        rubricHint: 'Each conservation strategy directly addresses a specific threat from Part 2 (not generic). Discusses real trade-offs between human needs and ecosystem health. Student stewardship suggestion is realistic and specific. Prediction uses indicator species from Part 2 with logical reasoning. Uses vocabulary (conservation, stewardship, sustainability, biodiversity, indicator species, ecosystem health).',
        minLength: 120,
        teacherReviewRequired: true,
      },
    },
    {
      id: 'l8-practice-drawing', section: 'PRACTICE' as const, blockType: 'DRAWING' as const, order: 9,
      content: {
        instruction: 'Create a visual model of your conservation plan. Draw or diagram your chosen ecosystem showing: 1) The key organisms and their connections, 2) The threats (mark them with red X or warning symbols), 3) Your conservation strategies (mark them with green checkmarks or arrows). Label everything clearly. Upload a photo of your drawing.',
      },
    },
    {
      id: 'l8-practice-4', section: 'PRACTICE' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 10,
      content: {
        prompt: 'FINAL REFLECTION: Unit Synthesis\n\nLook back at your warm-up prediction from Lesson 1 (what would happen if sunlight was blocked from a pond). Compare your thinking THEN to your understanding NOW.\n\n1. How has your understanding of ecosystems changed from Lesson 1 to Lesson 8?\n2. What concept from this unit do you think is most important for humans to understand? Why?\n3. If you could teach one lesson from this unit to a younger student, which would it be and why?',
        rubricHint: 'References specific content from at least 3 different lessons by name or concept. Shows genuine, specific reflection on how understanding changed (not generic statements like "I learned a lot"). Explains WHY the chosen concept matters with reasoning. Teaching choice shows understanding of what makes that lesson important.',
        minLength: 80,
        teacherReviewRequired: false,
      },
    },
    {
      id: 'l8-teacher-note', section: 'PRACTICE' as const, blockType: 'TEXT' as const, order: 11,
      content: {
        html: `
          <div style="background: #fef3c7; border: 1.5px solid #f59e0b; border-radius: 10px; padding: 14px 18px;">
            <p style="font-weight: 700; color: #92400e; margin: 0 0 6px;">📋 Teacher Review Required</p>
            <p style="font-size: 0.88rem; color: #78350f; margin: 0;">Parts 1, 2, and 3 of your conservation plan will be reviewed by your teacher. Your teacher will provide feedback on the quality of your analysis, the strength of your conservation strategies, and how well you connected concepts from across the unit. This is a major assignment.</p>
          </div>
        `,
      },
    },
  ];

  for (const block of blocks) {
    await prisma.lessonBlock.create({ data: { id: block.id, lessonId: LESSON_ID, section: block.section, blockType: block.blockType, order: block.order, content: block.content } });
  }
  console.log(`  ✅ ${blocks.length} blocks created`);

  const questions = [
    { id: 'l8-q1', questionText: 'What is conservation?', questionType: 'MULTIPLE_CHOICE' as const, options: [
      { label: 'Destroying ecosystems to build cities', value: 'a' },
      { label: 'The protection and careful management of natural resources and ecosystems', value: 'b', correct: true },
      { label: 'Using up all natural resources as fast as possible', value: 'c' },
      { label: 'Only studying ecosystems without protecting them', value: 'd' },
    ], correctAnswer: 'b', explanation: 'Conservation means actively protecting and managing ecosystems so they can remain healthy for current and future generations.', outcomeCode: 'SCI.7.A.4', difficulty: 1 },
    { id: 'l8-q2', questionText: 'A community wants to build a new school on wetland. Which approach BEST demonstrates stewardship?', questionType: 'MULTIPLE_CHOICE' as const, options: [
      { label: 'Drain the wetland and build immediately', value: 'a' },
      { label: 'Assess the wetland\'s ecological value, consider alternative sites, and if building there, include wetland restoration nearby', value: 'b', correct: true },
      { label: 'Ignore the wetland — it is not important', value: 'c' },
      { label: 'Never build any schools anywhere', value: 'd' },
    ], correctAnswer: 'b', explanation: 'Stewardship means balancing human needs with environmental responsibility. Assessing impact, considering alternatives, and including restoration shows responsible decision-making.', outcomeCode: 'SCI.7.A.4', difficulty: 2 },
    { id: 'l8-q3', questionText: 'What does sustainability mean?', questionType: 'MULTIPLE_CHOICE' as const, options: [
      { label: 'Using resources faster than they can be replaced', value: 'a' },
      { label: 'Meeting human needs today without depleting resources for future generations', value: 'b', correct: true },
      { label: 'Never using any natural resources', value: 'c' },
      { label: 'Only using resources in summer', value: 'd' },
    ], correctAnswer: 'b', explanation: 'Sustainability is about balance — using resources wisely so that future generations can still benefit from healthy ecosystems.', outcomeCode: 'SCI.7.A.4', difficulty: 1 },
    { id: 'l8-q4', questionText: 'Over 70% of Alberta\'s native grasslands have been converted to farmland. Which conservation strategy would BEST help protect the remaining grasslands?', questionType: 'MULTIPLE_CHOICE' as const, options: [
      { label: 'Convert the remaining grasslands to parking lots', value: 'a' },
      { label: 'Establish protected areas for remaining native grasslands and restore some converted land with native grasses', value: 'b', correct: true },
      { label: 'Remove all wildlife from the grasslands', value: 'c' },
      { label: 'Introduce invasive species to replace native ones', value: 'd' },
    ], correctAnswer: 'b', explanation: 'Protection of remaining habitat + restoration of degraded areas is the most effective approach. This preserves biodiversity while allowing some land for agriculture.', outcomeCode: 'SCI.7.A.4', difficulty: 2 },
    { id: 'l8-q5', questionText: 'Which of the following is an example of ecosystem RESTORATION?', questionType: 'MULTIPLE_CHOICE' as const, options: [
      { label: 'Cutting down all the trees in a forest', value: 'a' },
      { label: 'Replanting native vegetation along a riverbank that was previously eroded', value: 'b', correct: true },
      { label: 'Dumping garbage in a wetland', value: 'c' },
      { label: 'Building a factory on farmland', value: 'd' },
    ], correctAnswer: 'b', explanation: 'Restoration means actively repairing damaged ecosystems — replanting native species, cleaning pollution, or rebuilding habitats.', outcomeCode: 'SCI.7.A.4', difficulty: 1 },
    { id: 'l8-q6', questionText: 'Why is it important to balance human needs with ecosystem protection?', questionType: 'MULTIPLE_CHOICE' as const, options: [
      { label: 'It is not important — humans always come first', value: 'a' },
      { label: 'Because humans depend on healthy ecosystems for clean air, water, food, and other resources', value: 'b', correct: true },
      { label: 'Because ecosystems do not provide anything useful to humans', value: 'c' },
      { label: 'Because laws require it, but it has no practical value', value: 'd' },
    ], correctAnswer: 'b', explanation: 'Humans are PART of ecosystems. We depend on them for air, water, food, medicines, and climate regulation. Destroying ecosystems ultimately harms humans too.', outcomeCode: 'SCI.7.A.4', difficulty: 2 },
    { id: 'l8-q7', questionText: 'Which of the following is the BEST example of stewardship that a Grade 7 student could practice?', questionType: 'MULTIPLE_CHOICE' as const, options: [
      { label: 'Organizing a school cleanup of a local stream and reporting water quality observations', value: 'a', correct: true },
      { label: 'Ignoring litter in the school yard', value: 'b' },
      { label: 'Leaving lights on all day', value: 'c' },
      { label: 'Wasting paper', value: 'd' },
    ], correctAnswer: 'a', explanation: 'Stewardship means taking personal action. Organizing a cleanup AND reporting observations (citizen science) is a practical way students can contribute.', outcomeCode: 'SCI.7.A.4', difficulty: 1 },
    { id: 'l8-q8', questionText: 'A conservation plan for the boreal forest includes "selective logging" — cutting some trees but leaving many standing. Why is this more sustainable than clearcutting?', questionType: 'MULTIPLE_CHOICE' as const, options: [
      { label: 'Selective logging removes more trees', value: 'a' },
      { label: 'Selective logging maintains habitat, preserves food web connections, and allows the forest to regenerate', value: 'b', correct: true },
      { label: 'There is no difference', value: 'c' },
      { label: 'Clearcutting is always better for biodiversity', value: 'd' },
    ], correctAnswer: 'b', explanation: 'Selective logging keeps most of the forest intact — wildlife still has habitat, food webs remain functional, and seeds from remaining trees can regenerate the harvested areas.', outcomeCode: 'SCI.7.A.4', difficulty: 2 },
    { id: 'l8-q9', questionText: 'Throughout this unit, you studied food webs, human impacts, and monitoring. If you were asked to summarize WHY ecosystems matter, which answer BEST captures the key idea?', questionType: 'MULTIPLE_CHOICE' as const, options: [
      { label: 'Ecosystems are nice to look at but not essential', value: 'a' },
      { label: 'All living things — including humans — are interconnected through ecosystems, and healthy ecosystems provide the resources and conditions we need to survive', value: 'b', correct: true },
      { label: 'Ecosystems only matter for scientists', value: 'c' },
      { label: 'We can always build artificial replacements for ecosystems', value: 'd' },
    ], correctAnswer: 'b', explanation: 'This is the central message of Unit A: ecosystems are complex, interconnected systems that ALL life depends on. Protecting them is protecting ourselves.', outcomeCode: 'SCI.7.A.4', difficulty: 2 },
    { id: 'l8-q10', questionText: 'A protected area has been established, but scientists notice that indicator species (frogs) are still declining. What should happen NEXT?', questionType: 'MULTIPLE_CHOICE' as const, options: [
      { label: 'Nothing — the area is already protected', value: 'a' },
      { label: 'Investigate WHY the decline is continuing (check for pollution from outside the protected area, invasive species, or climate effects) and adapt the conservation plan', value: 'b', correct: true },
      { label: 'Remove the protected area status', value: 'c' },
      { label: 'Replace the frogs with a different species', value: 'd' },
    ], correctAnswer: 'b', explanation: 'Conservation requires ongoing monitoring and adaptation. Protection alone may not be enough — scientists must investigate root causes and update their strategies (adaptive management).', outcomeCode: 'SCI.7.A.4', difficulty: 2 },
  ];

  for (const q of questions) {
    await prisma.quizQuestion.create({ data: { id: q.id, lessonId: LESSON_ID, questionText: q.questionText, questionType: q.questionType, options: q.options, correctAnswer: q.correctAnswer, explanation: q.explanation, outcomeCode: q.outcomeCode, difficulty: q.difficulty } });
  }
  console.log(`  ✅ ${questions.length} quiz questions created`);
}

// ─── Main ───
async function main() {
  console.log('🌿 Seeding Unit A Lessons 5-8: Interactions & Ecosystems\n');
  await seedLesson5();
  await seedLesson6();
  await seedLesson7();
  await seedLesson8();
  console.log('\n✅ All Unit A Lessons 5-8 seeded successfully!');
  console.log('   📊 Unit A is now a complete 8-lesson exemplar unit.');
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
