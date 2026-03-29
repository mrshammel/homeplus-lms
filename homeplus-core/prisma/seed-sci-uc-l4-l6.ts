// ============================================
// Seed Science Unit C L4-L6 — Heat & Temperature
// ============================================
// Extracted from grade-7/science/unit-c-heat/index.html
// Run: npx tsx prisma/seed-sci-uc-l4-l6.ts

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
// ║  LESSON 4: Heating & Cooling Technology                   ║
// ╚═══════════════════════════════════════════════════════════╝

async function seedLesson4() {
  const ID = 'g7-sci-uc-l4';
  console.log('\n⚙️ Seeding UC L4: Heating & Cooling Technology...');

  await prisma.lesson.update({
    where: { id: ID },
    data: {
      subjectMode: 'SCIENCE', estimatedMinutes: 45,
      learningGoal: 'Describe historical and modern heat technologies, explain how devices generate/transfer/control thermal energy, and compare passive and active solar heating.',
      successCriteria: 'I can describe 4 heat technologies from different eras, explain passive vs. active solar, and describe how a thermostat works.',
      materials: 'Science notebook',
      reflectionPrompt: 'How does your home or school use heat technology? Think about heating systems, insulation, and windows.',
      masteryConfig: { passPercent: 80, maxRetries: 5, reteachEnabled: true, immediateCorrectiveFeedback: false },
    },
  });

  await prisma.lessonBlock.deleteMany({ where: { lessonId: ID } });
  await prisma.quizQuestion.deleteMany({ where: { lessonId: ID } });

  const blocks = [
    { id: 'uc-l4-learn-1', section: 'LEARN' as const, blockType: 'VOCABULARY' as const, order: 1, content: { terms: [
      { term: 'Passive Solar', definition: 'Capturing the sun\'s heat without mechanical devices — south-facing windows, thermal mass.', example: 'A sunroom that heats up from south-facing windows.' },
      { term: 'Active Solar', definition: 'Using mechanical systems (pumps, fans) to collect and distribute solar heat.', example: 'Solar water heater panels on a roof.' },
      { term: 'Thermostat', definition: 'Device that regulates temperature by turning heating/cooling on and off.', example: 'A smart thermostat that adjusts room temperature.' },
      { term: 'Combustion', definition: 'Chemical reaction (burning) that releases thermal energy from fuel.', example: 'Natural gas furnace burning methane for heat.' },
    ] } },
    { id: 'uc-l4-learn-2', section: 'LEARN' as const, blockType: 'VIDEO' as const, order: 2, content: { url: 'https://www.youtube.com/embed/axCR3uIn3Vs', title: 'History of Heat Technology', transcript: 'This video explores the history of human heat technology from fire to modern systems.' } },
    { id: 'uc-l4-learn-3', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 3, content: { html: '<h3>⏳ Heat Technology Through History</h3><ul><li>🔥 <strong>Ancient:</strong> Fire (100,000+ years ago) — cooking, warmth, protection. First controlled heat technology.</li><li>🏛️ <strong>Roman:</strong> Hypocaust — underfloor heating using hot air. First central heating!</li><li>🚂 <strong>Industrial:</strong> Steam engine — converting heat to motion. Powered the Industrial Revolution.</li><li>🏠 <strong>Modern:</strong> Furnaces, heat pumps, thermostats, solar panels — precise heat control.</li><li>☀️ <strong>Future:</strong> Geothermal energy, hydrogen fuel cells, smart home heating with AI control.</li></ul>' } },
    { id: 'uc-l4-learn-4', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 4, content: { html: '<h3>☀️ Solar Heating: Passive vs Active</h3><table><thead><tr><th>Feature</th><th>☀️ Passive Solar</th><th>⚙️ Active Solar</th></tr></thead><tbody><tr><td>How it works</td><td>Design captures heat naturally</td><td>Mechanical devices collect & move heat</td></tr><tr><td>Examples</td><td>South-facing windows, concrete floors</td><td>Solar water heaters, solar panels</td></tr><tr><td>Cost</td><td>Low (built into design)</td><td>Higher (equipment needed)</td></tr><tr><td>Maintenance</td><td>Almost none</td><td>Regular</td></tr></tbody></table>' } },
    { id: 'uc-l4-learn-mc1', section: 'LEARN' as const, blockType: 'MICRO_CHECK' as const, order: 5, content: { question: 'South-facing windows that warm a room naturally are an example of:', options: [{ label: 'Active solar heating', value: 'a' }, { label: 'Passive solar heating', value: 'b', correct: true }, { label: 'Geothermal heating', value: 'c' }, { label: 'Nuclear heating', value: 'd' }], explanation: 'Passive solar uses building design (like window orientation) to capture heat without mechanical systems.' } },
    { id: 'uc-l4-prac-1', section: 'PRACTICE' as const, blockType: 'MATCHING' as const, order: 1, content: { instruction: 'Match each technology to its era or type:', pairs: [{ left: 'Fire for cooking and warmth', right: 'Ancient' }, { left: 'Hypocaust underfloor heating', right: 'Roman' }, { left: 'Steam engine powering factories', right: 'Industrial' }, { left: 'Smart thermostat with Wi-Fi', right: 'Modern/Future' }, { left: 'South-facing windows warming a room', right: 'Passive Solar' }, { left: 'Rooftop solar water heater with pump', right: 'Active Solar' }] } },
    { id: 'uc-l4-reflect-1', section: 'REFLECT' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 1, content: { prompt: 'Choose a heat technology from any era and explain HOW it works using your knowledge of heat transfer (conduction, convection, or radiation).', minLength: 60, rubricHint: 'Names specific technology. Correctly identifies heat transfer type. Explains mechanism using vocabulary.', teacherReviewRequired: false } },
  ];

  for (const b of blocks) {
    await prisma.lessonBlock.create({ data: { id: b.id, lessonId: ID, section: b.section, blockType: b.blockType, content: b.content, order: b.order } });
  }
  console.log(`  ✅ ${blocks.length} blocks`);

  const questions = [
    { id: 'uc-l4-q1', questionText: 'The Roman hypocaust was an early example of:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Solar heating', value: 'a' }, { label: 'Central heating using hot air under floors', value: 'b', correct: true }, { label: 'Nuclear power', value: 'c' }, { label: 'Air conditioning', value: 'd' }], correctAnswer: 'b', explanation: 'Romans heated air under raised floors — the first central heating system (convection).', outcomeCode: 'SCI.7.C.1.3', difficulty: 1 },
    { id: 'uc-l4-q2', questionText: 'Passive solar heating uses:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Pumps and fans to move heat', value: 'a' }, { label: 'Building design to capture heat naturally (no machinery)', value: 'b', correct: true }, { label: 'Nuclear energy', value: 'c' }, { label: 'Electricity from the grid', value: 'd' }], correctAnswer: 'b', explanation: 'Passive solar uses building orientation, thermal mass, and window placement — no mechanical devices.', outcomeCode: 'SCI.7.C.1.3', difficulty: 1 },
    { id: 'uc-l4-q3', questionText: 'A thermostat controls temperature by:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Creating heat', value: 'a' }, { label: 'Turning heating/cooling on and off at set temperatures', value: 'b', correct: true }, { label: 'Adding insulation', value: 'c' }, { label: 'Blocking radiation', value: 'd' }], correctAnswer: 'b', explanation: 'Thermostats sense temperature and trigger heating/cooling systems to maintain a set point.', outcomeCode: 'SCI.7.C.1.4', difficulty: 1 },
    { id: 'uc-l4-q4', questionText: 'The steam engine converted heat energy into:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Light energy', value: 'a' }, { label: 'Motion (mechanical) energy', value: 'b', correct: true }, { label: 'Sound energy', value: 'c' }, { label: 'Potential energy', value: 'd' }], correctAnswer: 'b', explanation: 'Steam engines use combustion to boil water → steam pressure → mechanical motion.', outcomeCode: 'SCI.7.C.1.3', difficulty: 1 },
    { id: 'uc-l4-q5', questionText: 'Active solar heating differs from passive because it:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Is cheaper', value: 'a' }, { label: 'Uses mechanical devices (pumps, fans) to collect and move heat', value: 'b', correct: true }, { label: 'Only works at night', value: 'c' }, { label: 'Is the same thing', value: 'd' }], correctAnswer: 'b', explanation: 'Active solar uses mechanical systems to collect, store, and distribute solar heat.', outcomeCode: 'SCI.7.C.1.3', difficulty: 2 },
    { id: 'uc-l4-q6', questionText: 'Many Alberta homes use which type of heating?', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Geothermal', value: 'a' }, { label: 'Natural gas forced-air furnace', value: 'b', correct: true }, { label: 'Nuclear', value: 'c' }, { label: 'Solar only', value: 'd' }], correctAnswer: 'b', explanation: 'Most Alberta homes use natural gas furnaces that heat air (combustion + convection).', outcomeCode: 'SCI.7.C.1.3', difficulty: 1 },
    { id: 'uc-l4-q7', questionText: 'Fire was important to early humans because:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'It provided entertainment', value: 'a' }, { label: 'It provided warmth, cooking, light, and protection', value: 'b', correct: true }, { label: 'It was easy to control', value: 'c' }, { label: 'They could make electricity', value: 'd' }], correctAnswer: 'b', explanation: 'Fire was the first controlled heat technology — essential for survival.', outcomeCode: 'SCI.7.C.1.3', difficulty: 1 },
    { id: 'uc-l4-q8', questionText: 'A bimetallic strip in a thermostat works because:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Both metals are the same', value: 'a' }, { label: 'Two metals expand at different rates, causing bending', value: 'b', correct: true }, { label: 'It measures light', value: 'c' }, { label: 'It uses electricity to heat', value: 'd' }], correctAnswer: 'b', explanation: 'Unequal thermal expansion causes the strip to bend, triggering a switch.', outcomeCode: 'SCI.7.C.1.4', difficulty: 2 },
  ];

  for (const q of questions) {
    await prisma.quizQuestion.create({ data: { id: q.id, lessonId: ID, questionText: q.questionText, questionType: q.questionType, options: q.options, correctAnswer: q.correctAnswer, explanation: q.explanation, outcomeCode: q.outcomeCode, difficulty: q.difficulty } });
  }
  console.log(`  ✅ ${questions.length} questions`);
}

// ╔═══════════════════════════════════════════════════════════╗
// ║  LESSON 5: Energy Sources & Climate                       ║
// ╚═══════════════════════════════════════════════════════════╝

async function seedLesson5() {
  const ID = 'g7-sci-uc-l5';
  console.log('\n⚡ Seeding UC L5: Energy Sources & Climate...');

  await prisma.lesson.update({
    where: { id: ID },
    data: {
      subjectMode: 'SCIENCE', estimatedMinutes: 45,
      learningGoal: 'Compare fossil fuels with renewable energy for heating, evaluate environmental impacts of energy choices, and propose personal and societal energy solutions.',
      successCriteria: 'I can compare 4 energy sources, explain the greenhouse effect, and propose 2 solutions for sustainable energy use.',
      materials: 'Science notebook',
      reflectionPrompt: 'What changes could your family make to use energy more sustainably?',
      masteryConfig: { passPercent: 80, maxRetries: 5, reteachEnabled: true, immediateCorrectiveFeedback: false },
    },
  });

  await prisma.lessonBlock.deleteMany({ where: { lessonId: ID } });
  await prisma.quizQuestion.deleteMany({ where: { lessonId: ID } });

  const blocks = [
    { id: 'uc-l5-learn-1', section: 'LEARN' as const, blockType: 'VOCABULARY' as const, order: 1, content: { terms: [
      { term: 'Fossil Fuel', definition: 'Coal, oil, natural gas — formed from ancient organisms. Release CO₂ when burned.', example: 'Burning natural gas in a furnace.' },
      { term: 'Renewable Energy', definition: 'Solar, wind, geothermal, hydro — naturally replenished and sustainable.', example: 'Wind turbines generating electricity.' },
      { term: 'Greenhouse Effect', definition: 'CO₂ and other gases trap heat in Earth\'s atmosphere, warming the planet.', example: 'Burning fossil fuels increases atmospheric CO₂.' },
      { term: 'Energy Efficiency', definition: 'Using less energy to achieve the same result — reduces waste and cost.', example: 'An LED bulb using 75% less energy than incandescent.' },
    ] } },
    { id: 'uc-l5-learn-2', section: 'LEARN' as const, blockType: 'VIDEO' as const, order: 2, content: { url: 'https://www.youtube.com/embed/1kUE0BZtTRc', title: 'Energy Sources Explained', transcript: 'This video compares different energy sources and their environmental impacts.' } },
    { id: 'uc-l5-learn-3', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 3, content: { html: '<h3>⛽ Energy Sources Compared</h3><table><thead><tr><th>Source</th><th>Type</th><th>Pros</th><th>Cons</th></tr></thead><tbody><tr><td>Natural Gas</td><td>Fossil</td><td>Efficient, widely available in Alberta</td><td>CO₂ emissions, non-renewable</td></tr><tr><td>Solar</td><td>Renewable</td><td>Free fuel, clean</td><td>Intermittent, expensive setup</td></tr><tr><td>Geothermal</td><td>Renewable</td><td>Constant, reliable</td><td>Location-limited, high initial cost</td></tr><tr><td>Biomass</td><td>Renewable</td><td>Uses waste, carbon neutral-ish</td><td>Emissions, land use</td></tr><tr><td>Wind</td><td>Renewable</td><td>Clean, scalable</td><td>Intermittent, visual impact</td></tr></tbody></table><p><strong>Alberta:</strong> Canada\'s largest oil and gas producer but rapidly growing solar and wind capacity. Over 20% of electricity now comes from renewables.</p>' } },
    { id: 'uc-l5-learn-4', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 4, content: { html: '<h3>🌍 The Greenhouse Effect & Climate</h3><p>Burning fossil fuels releases <strong>CO₂</strong> into the atmosphere. CO₂ acts like a blanket, trapping heat (radiation) that would normally escape to space.</p><p><strong>Results:</strong> Rising global temperatures, melting ice, more extreme weather events, rising sea levels.</p><p><strong>Solutions:</strong></p><ul><li>Switch to renewable energy sources</li><li>Improve energy efficiency (better insulation, LED bulbs)</li><li>Reduce personal energy consumption</li><li>Support policies for clean energy transition</li></ul>' } },
    { id: 'uc-l5-learn-mc1', section: 'LEARN' as const, blockType: 'MICRO_CHECK' as const, order: 5, content: { question: 'Which is a renewable energy source?', options: [{ label: 'Coal', value: 'a' }, { label: 'Natural gas', value: 'b' }, { label: 'Wind', value: 'c', correct: true }, { label: 'Oil', value: 'd' }], explanation: 'Wind is naturally replenished — coal, gas, and oil are finite fossil fuels.' } },
    { id: 'uc-l5-prac-1', section: 'PRACTICE' as const, blockType: 'MATCHING' as const, order: 1, content: { instruction: 'Classify each energy source as fossil fuel or renewable:', pairs: [{ left: 'Natural gas', right: 'Fossil Fuel' }, { left: 'Solar panels', right: 'Renewable' }, { left: 'Coal power plant', right: 'Fossil Fuel' }, { left: 'Wind turbines', right: 'Renewable' }, { left: 'Geothermal heat pump', right: 'Renewable' }, { left: 'Oil/petroleum', right: 'Fossil Fuel' }] } },
    { id: 'uc-l5-reflect-1', section: 'REFLECT' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 1, content: { prompt: 'Should Alberta transition away from fossil fuels for home heating? Discuss at least 2 advantages and 2 challenges, then give your evidence-based opinion.', minLength: 80, rubricHint: 'Discusses 2+ advantages and 2+ challenges. Provides evidence-based opinion. Uses vocabulary correctly.', teacherReviewRequired: false } },
  ];

  for (const b of blocks) {
    await prisma.lessonBlock.create({ data: { id: b.id, lessonId: ID, section: b.section, blockType: b.blockType, content: b.content, order: b.order } });
  }
  console.log(`  ✅ ${blocks.length} blocks`);

  const questions = [
    { id: 'uc-l5-q1', questionText: 'Fossil fuels include:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Solar and wind', value: 'a' }, { label: 'Coal, oil, and natural gas', value: 'b', correct: true }, { label: 'Geothermal and hydro', value: 'c' }, { label: 'Biomass only', value: 'd' }], correctAnswer: 'b', explanation: 'Fossil fuels formed from ancient organisms over millions of years — coal, oil, and natural gas.', outcomeCode: 'SCI.7.C.2.4', difficulty: 1 },
    { id: 'uc-l5-q2', questionText: 'The greenhouse effect is caused by:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Too much oxygen', value: 'a' }, { label: 'CO₂ and other gases trapping heat in the atmosphere', value: 'b', correct: true }, { label: 'The ozone layer', value: 'c' }, { label: 'Solar panels', value: 'd' }], correctAnswer: 'b', explanation: 'CO₂ acts like a blanket, trapping radiated heat and warming the planet.', outcomeCode: 'SCI.7.C.2.4', difficulty: 1 },
    { id: 'uc-l5-q3', questionText: 'A key advantage of renewable energy is:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'It runs out eventually', value: 'a' }, { label: 'It\'s naturally replenished and sustainable', value: 'b', correct: true }, { label: 'It produces more CO₂', value: 'c' }, { label: 'It\'s always cheaper', value: 'd' }], correctAnswer: 'b', explanation: 'Renewable sources (solar, wind, geothermal) are replenished naturally and don\'t deplete.', outcomeCode: 'SCI.7.C.2.4', difficulty: 1 },
    { id: 'uc-l5-q4', questionText: 'Alberta generates over 20% of its electricity from:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Nuclear power', value: 'a' }, { label: 'Renewable sources (wind, solar)', value: 'b', correct: true }, { label: 'Geothermal only', value: 'c' }, { label: 'Hydro only', value: 'd' }], correctAnswer: 'b', explanation: 'Alberta is rapidly expanding wind and solar capacity alongside traditional oil and gas.', outcomeCode: 'SCI.7.C.2.4', difficulty: 2 },
    { id: 'uc-l5-q5', questionText: 'Energy efficiency means:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Using more energy', value: 'a' }, { label: 'Using less energy to achieve the same result', value: 'b', correct: true }, { label: 'Turning off all devices', value: 'c' }, { label: 'Only using fossil fuels', value: 'd' }], correctAnswer: 'b', explanation: 'Energy efficiency reduces waste — same result, less energy consumed.', outcomeCode: 'SCI.7.C.2.4', difficulty: 1 },
    { id: 'uc-l5-q6', questionText: 'A challenge of solar energy is:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'It produces CO₂', value: 'a' }, { label: 'It\'s intermittent — depends on sunlight', value: 'b', correct: true }, { label: 'It runs out', value: 'c' }, { label: 'It\'s free', value: 'd' }], correctAnswer: 'b', explanation: 'Solar panels only generate energy when the sun shines — cloudy days and nighttime reduce output.', outcomeCode: 'SCI.7.C.2.4', difficulty: 1 },
    { id: 'uc-l5-q7', questionText: 'Burning fossil fuels contributes to climate change because:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'It cools the atmosphere', value: 'a' }, { label: 'It releases CO₂ that traps heat in the atmosphere', value: 'b', correct: true }, { label: 'It creates ozone', value: 'c' }, { label: 'It has no environmental effect', value: 'd' }], correctAnswer: 'b', explanation: 'Burning fossil fuels releases CO₂, which traps heat through the greenhouse effect.', outcomeCode: 'SCI.7.C.2.4', difficulty: 1 },
    { id: 'uc-l5-q8', questionText: 'An LED bulb is more energy efficient than incandescent because:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'It uses more electricity', value: 'a' }, { label: 'It converts more energy to light and less to waste heat', value: 'b', correct: true }, { label: 'It\'s bigger', value: 'c' }, { label: 'It burns fuel', value: 'd' }], correctAnswer: 'b', explanation: 'LEDs convert ~90% of energy to light; incandescent bulbs waste ~90% as heat.', outcomeCode: 'SCI.7.C.2.4', difficulty: 2 },
  ];

  for (const q of questions) {
    await prisma.quizQuestion.create({ data: { id: q.id, lessonId: ID, questionText: q.questionText, questionType: q.questionType, options: q.options, correctAnswer: q.correctAnswer, explanation: q.explanation, outcomeCode: q.outcomeCode, difficulty: q.difficulty } });
  }
  console.log(`  ✅ ${questions.length} questions`);
}

// ╔═══════════════════════════════════════════════════════════╗
// ║  LESSON 6: Performance Task                               ║
// ╚═══════════════════════════════════════════════════════════╝

async function seedLesson6() {
  const ID = 'g7-sci-uc-l6';
  console.log('\n🏆 Seeding UC L6: Performance Task...');

  await prisma.lesson.update({
    where: { id: ID },
    data: {
      subjectMode: 'SCIENCE', estimatedMinutes: 60,
      learningGoal: 'Design an energy-efficient shelter that stays warm in Alberta\'s -30°C winters using minimal energy, applying concepts of heat transfer, insulation, and sustainable energy.',
      successCriteria: 'I can design a shelter plan addressing materials, insulation, heating, thermal expansion, and sustainability.',
      materials: 'Science notebook, coloured pencils, ruler',
      reflectionPrompt: 'How does your shelter design demonstrate what you\'ve learned about heat throughout this unit?',
      masteryConfig: { passPercent: 80, maxRetries: 5, reteachEnabled: true, immediateCorrectiveFeedback: false },
    },
  });

  await prisma.lessonBlock.deleteMany({ where: { lessonId: ID } });
  await prisma.quizQuestion.deleteMany({ where: { lessonId: ID } });

  const blocks = [
    { id: 'uc-l6-learn-1', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 1, content: { html: '<h2>🏆 Energy-Efficient Shelter Design Challenge</h2><p>You are an energy consultant designing a shelter that stays warm in Alberta\'s -30°C winters using minimal energy. Complete all 5 sections below:</p><ol><li><strong>Shelter Design & Materials</strong> — Shape, size, and materials. How does each choice relate to heat transfer?</li><li><strong>Insulation Strategy</strong> — What insulation and why? How does it block each type of heat transfer?</li><li><strong>Heating System</strong> — Energy source(s) including at least one renewable. Explain how each works.</li><li><strong>Thermal Expansion</strong> — How will you account for temperature swings? Pipes, joints, etc.</li><li><strong>Sustainability & Efficiency</strong> — How does your shelter minimize environmental impact?</li></ol>' } },
    { id: 'uc-l6-prac-1', section: 'PRACTICE' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 1, content: { prompt: 'Part 1: Shelter Design & Materials — Describe your shelter\'s shape, size, and materials. Explain how each material choice relates to heat transfer (conduction, convection, or radiation).', minLength: 80, rubricHint: 'Names specific materials. Connects to heat transfer types. Shows understanding of conductors/insulators.', teacherReviewRequired: true } },
    { id: 'uc-l6-prac-2', section: 'PRACTICE' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 2, content: { prompt: 'Part 2: Insulation Strategy — What insulation will you use? Explain how it minimizes conduction, convection, and radiation.', minLength: 80, rubricHint: 'Names insulation materials. Addresses all 3 transfer types. Shows understanding of insulator properties.', teacherReviewRequired: true } },
    { id: 'uc-l6-prac-3', section: 'PRACTICE' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 3, content: { prompt: 'Part 3: Heating System — Describe your energy source(s), including at least one renewable option. Explain how each method transfers heat.', minLength: 80, rubricHint: 'Includes renewable energy. Explains heating mechanism. Uses heat transfer vocabulary.', teacherReviewRequired: true } },
    { id: 'uc-l6-prac-4', section: 'PRACTICE' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 4, content: { prompt: 'Part 4: Thermal Expansion — How will you account for temperature swings in Alberta (from -40°C to +35°C)? Think about pipes, joints, and building materials.', minLength: 60, rubricHint: 'References thermal expansion. Names specific solutions. Connects to Alberta conditions.', teacherReviewRequired: true } },
    { id: 'uc-l6-prac-5', section: 'PRACTICE' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 5, content: { prompt: 'Part 5: Sustainability & Efficiency — How does your shelter minimize environmental impact? What trade-offs did you make between cost, comfort, and sustainability?', minLength: 60, rubricHint: 'Names sustainability features. Discusses trade-offs. Shows critical thinking.', teacherReviewRequired: true } },
    { id: 'uc-l6-reflect-1', section: 'REFLECT' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 1, content: { prompt: 'Reflect on the entire Heat & Temperature unit. What was the most important concept you learned? How does understanding heat connect to real-world issues like climate change and energy sustainability?', minLength: 60, rubricHint: 'Makes personal connection. References unit content. Connects to real-world issues.', teacherReviewRequired: false } },
  ];

  for (const b of blocks) {
    await prisma.lessonBlock.create({ data: { id: b.id, lessonId: ID, section: b.section, blockType: b.blockType, content: b.content, order: b.order } });
  }
  console.log(`  ✅ ${blocks.length} blocks`);

  const questions = [
    { id: 'uc-l6-q1', questionText: 'The best insulation for a shelter wall would be:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Solid steel', value: 'a' }, { label: 'Foam filled with trapped air pockets', value: 'b', correct: true }, { label: 'Single-pane glass', value: 'c' }, { label: 'Thin aluminum sheet', value: 'd' }], correctAnswer: 'b', explanation: 'Foam traps air (an insulator) in tiny pockets, reducing conduction, convection, and radiation.', outcomeCode: 'SCI.7.C.2.2', difficulty: 1 },
    { id: 'uc-l6-q2', questionText: 'An energy-efficient shelter should have south-facing windows to use:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Active solar heating', value: 'a' }, { label: 'Passive solar heating from the sun', value: 'b', correct: true }, { label: 'Geothermal energy', value: 'c' }, { label: 'Wind power', value: 'd' }], correctAnswer: 'b', explanation: 'South-facing windows capture the sun\'s heat naturally — a passive solar design feature.', outcomeCode: 'SCI.7.C.1.3', difficulty: 1 },
    { id: 'uc-l6-q3', questionText: 'In a -30°C Alberta winter, heat escapes a building mainly through:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Only conduction', value: 'a' }, { label: 'All three types: conduction, convection, and radiation', value: 'b', correct: true }, { label: 'Only radiation', value: 'c' }, { label: 'Only convection', value: 'd' }], correctAnswer: 'b', explanation: 'Heat escapes through walls (conduction), drafts (convection), and windows (radiation).', outcomeCode: 'SCI.7.C.2.1', difficulty: 2 },
    { id: 'uc-l6-q4', questionText: 'Expansion joints in a shelter\'s pipe system prevent:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Heat transfer', value: 'a' }, { label: 'Pipes cracking from thermal expansion/contraction', value: 'b', correct: true }, { label: 'Water flow', value: 'c' }, { label: 'Rust', value: 'd' }], correctAnswer: 'b', explanation: 'Temperature changes cause pipes to expand/contract — joints allow movement without cracking.', outcomeCode: 'SCI.7.C.1.4', difficulty: 2 },
    { id: 'uc-l6-q5', questionText: 'Combining natural gas with solar panels in a shelter is an example of:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Using only fossil fuels', value: 'a' }, { label: 'A balanced energy approach using both conventional and renewable sources', value: 'b', correct: true }, { label: 'Being wasteful', value: 'c' }, { label: 'Only using renewables', value: 'd' }], correctAnswer: 'b', explanation: 'A balanced approach uses renewable energy where possible while keeping reliable backup.', outcomeCode: 'SCI.7.C.2.4', difficulty: 1 },
    { id: 'uc-l6-q6', questionText: 'Double-pane windows improve energy efficiency because:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'They look nicer', value: 'a' }, { label: 'The air gap between panes acts as an insulator', value: 'b', correct: true }, { label: 'They block all light', value: 'c' }, { label: 'They are cheaper', value: 'd' }], correctAnswer: 'b', explanation: 'The trapped air between two glass panes slows heat conduction and convection.', outcomeCode: 'SCI.7.C.2.2', difficulty: 1 },
    { id: 'uc-l6-q7', questionText: 'The most sustainable way to heat a shelter is:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Burning coal', value: 'a' }, { label: 'Combining good insulation with renewable energy sources', value: 'b', correct: true }, { label: 'Opening windows and using a fireplace', value: 'c' }, { label: 'Using no heat at all', value: 'd' }], correctAnswer: 'b', explanation: 'Good insulation reduces heat loss; renewable energy provides clean heat — the most sustainable combination.', outcomeCode: 'SCI.7.C.2.4', difficulty: 1 },
    { id: 'uc-l6-q8', questionText: 'Reflective foil behind a radiator helps by:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Making the room darker', value: 'a' }, { label: 'Reflecting radiated heat back into the room instead of into the wall', value: 'b', correct: true }, { label: 'Cooling the radiator', value: 'c' }, { label: 'Reducing convection', value: 'd' }], correctAnswer: 'b', explanation: 'Reflective surfaces bounce radiated heat back into the room, reducing loss through the wall.', outcomeCode: 'SCI.7.C.2.1', difficulty: 2 },
  ];

  for (const q of questions) {
    await prisma.quizQuestion.create({ data: { id: q.id, lessonId: ID, questionText: q.questionText, questionType: q.questionType, options: q.options, correctAnswer: q.correctAnswer, explanation: q.explanation, outcomeCode: q.outcomeCode, difficulty: q.difficulty } });
  }
  console.log(`  ✅ ${questions.length} questions`);
}

async function main() {
  console.log('🔥 ═══ SCIENCE UNIT C: L4-L6 ═══');
  await seedLesson4();
  await seedLesson5();
  await seedLesson6();
  console.log('\n✅ Unit C L4-L6 complete!');
}

main().catch(console.error).finally(() => { pool.end(); });
