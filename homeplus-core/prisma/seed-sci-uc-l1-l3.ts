// ============================================
// Seed Science Unit C L1-L3 — Heat & Temperature
// ============================================
// Extracted from grade-7/science/unit-c-heat/index.html
// Run: npx tsx prisma/seed-sci-uc-l1-l3.ts

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
// ║  LESSON 1: Hot & Cold — The Particle Model                ║
// ╚═══════════════════════════════════════════════════════════╝

async function seedLesson1() {
  const ID = 'g7-sci-uc-l1';
  console.log('\n🌡️ Seeding UC L1: Hot & Cold — The Particle Model...');

  await prisma.lesson.update({
    where: { id: ID },
    data: {
      subjectMode: 'SCIENCE', estimatedMinutes: 45,
      learningGoal: 'Explain the difference between heat and temperature, describe thermal energy using the particle model, and identify sources of heat energy.',
      successCriteria: 'I can explain heat vs. temperature, describe particle behaviour in solids/liquids/gases, give the bathtub vs. boiling water example, and name 4+ heat sources.',
      materials: 'Science notebook',
      reflectionPrompt: 'What was the most surprising thing about heat and temperature? Can you think of a real-life example where understanding the difference matters?',
      masteryConfig: { passPercent: 80, maxRetries: 5, reteachEnabled: true, immediateCorrectiveFeedback: false },
    },
  });

  await prisma.lessonBlock.deleteMany({ where: { lessonId: ID } });
  await prisma.quizQuestion.deleteMany({ where: { lessonId: ID } });

  const blocks = [
    { id: 'uc-l1-learn-1', section: 'LEARN' as const, blockType: 'VOCABULARY' as const, order: 1, content: { terms: [
      { term: 'Heat', definition: 'The transfer of thermal energy from a warmer object to a cooler one. Measured in joules (J).', example: 'A hot pan warming your hand when you hold it.' },
      { term: 'Temperature', definition: 'A measure of the average kinetic energy (speed) of particles in a substance. Measured in °C or K.', example: 'A thermometer reading 37°C.' },
      { term: 'Thermal Energy', definition: 'The total kinetic energy of all particles in a substance. Depends on temperature AND amount of matter.', example: 'A bathtub of warm water has more thermal energy than a cup of boiling water.' },
      { term: 'Kinetic Energy', definition: 'The energy of motion. Faster particles = more kinetic energy = higher temperature.', example: 'Gas particles zooming around rapidly.' },
      { term: 'Particle Model', definition: 'A scientific model explaining that all matter is made of tiny particles that are always moving.', example: 'Particles in a solid vibrate in fixed positions.' },
      { term: 'Combustion', definition: 'A chemical reaction (burning) that releases heat and light energy.', example: 'Burning wood or natural gas.' },
    ] } },
    { id: 'uc-l1-learn-2', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 2, content: { html: '<h3>🤔 Heat vs. Temperature — What\'s the Difference?</h3><table><thead><tr><th>Concept</th><th>Heat</th><th>Temperature</th></tr></thead><tbody><tr><td><strong>What is it?</strong></td><td>The <strong>transfer</strong> of thermal energy from warmer to cooler</td><td>A <strong>measure</strong> of average kinetic energy of particles</td></tr><tr><td><strong>Units</strong></td><td>Joules (J) or calories</td><td>Degrees Celsius (°C) or Kelvin (K)</td></tr><tr><td><strong>Analogy</strong></td><td>Like pouring water from one cup to another</td><td>Like checking the water level in a cup</td></tr><tr><td><strong>Key idea</strong></td><td>Heat always flows from hot → cold</td><td>Temperature tells you how hot or cold something is</td></tr></tbody></table><div style="background:#fef3c7;padding:12px;border-radius:8px;margin-top:12px"><p>💡 <strong>Key Distinction:</strong> A bathtub of warm water has MORE thermal energy than a cup of boiling water, even though the boiling water has a HIGHER temperature. Heat depends on both temperature AND the amount of matter.</p></div>' } },
    { id: 'uc-l1-learn-3', section: 'LEARN' as const, blockType: 'VIDEO' as const, order: 3, content: { url: 'https://www.youtube.com/embed/xoAvOVz3lp8', title: 'Crash Course Physics: Temperature', transcript: 'This video explains the difference between heat and temperature.' } },
    { id: 'uc-l1-learn-4', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 4, content: { html: '<h3>⚛️ The Particle Model of Matter</h3><p>The particle model helps us understand heat at a microscopic level:</p><ul><li>🧊 <strong>Solid:</strong> Particles vibrate in fixed positions. Closely packed. Low kinetic energy.</li><li>💧 <strong>Liquid:</strong> Particles slide past each other. More space. Moderate kinetic energy.</li><li>💨 <strong>Gas:</strong> Particles move freely and rapidly. Spread apart. High kinetic energy.</li></ul><p><strong>Adding heat</strong> increases kinetic energy → particles move faster and spread apart. This is why solids melt into liquids and liquids evaporate into gases. <strong>Removing heat</strong> does the opposite.</p>' } },
    { id: 'uc-l1-learn-mc1', section: 'LEARN' as const, blockType: 'MICRO_CHECK' as const, order: 5, content: { question: 'A lake at 10°C has more thermal energy than a cup of tea at 80°C. Why?', options: [{ label: 'The lake is hotter', value: 'a' }, { label: 'The lake has far more particles', value: 'b', correct: true }, { label: 'Tea has no energy', value: 'c' }, { label: 'They have the same energy', value: 'd' }], explanation: 'Thermal energy = total kinetic energy of ALL particles. The lake has billions more particles than the cup, so its total thermal energy is greater.' } },
    { id: 'uc-l1-learn-5', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 6, content: { html: '<h3>🔋 Sources of Heat Energy</h3><ul><li>☀️ <strong>Solar (Sun)</strong> — Earth\'s primary heat source. Solar panels convert it to electricity.</li><li>🔥 <strong>Chemical (Combustion)</strong> — Burning wood, gas, or coal releases stored chemical energy.</li><li>⚡ <strong>Electrical</strong> — Heaters, stoves, toasters convert electrical energy to heat.</li><li>🤲 <strong>Friction (Mechanical)</strong> — Rubbing hands together or braking a car.</li><li>🌋 <strong>Geothermal</strong> — Heat from Earth\'s interior.</li><li>⚛️ <strong>Nuclear</strong> — Splitting atoms releases enormous thermal energy.</li></ul><p><strong>Alberta Connection:</strong> Natural gas (chemical energy) heats most Alberta homes. Solar panels are growing in southern Alberta. Some communities near the Rocky Mountain foothills are exploring geothermal heating.</p>' } },
    { id: 'uc-l1-learn-6', section: 'LEARN' as const, blockType: 'VIDEO' as const, order: 7, content: { url: 'https://www.youtube.com/embed/qg-xEj-0xX0', title: 'Amoeba Sisters: States of Matter', transcript: 'This video shows how particles behave in different states of matter.' } },
    { id: 'uc-l1-prac-1', section: 'PRACTICE' as const, blockType: 'MATCHING' as const, order: 1, content: { instruction: 'Classify each statement as describing HEAT or TEMPERATURE:', pairs: [{ left: 'Energy flowing from a hot pan to your hand', right: 'Heat' }, { left: 'The thermometer reads 37°C', right: 'Temperature' }, { left: 'A warm drink cools down when left on the counter', right: 'Heat' }, { left: 'Boiling water is 100°C', right: 'Temperature' }, { left: 'The stove transfers energy to the soup', right: 'Heat' }, { left: 'Average kinetic energy of particles in a gas', right: 'Temperature' }] } },
    { id: 'uc-l1-prac-2', section: 'PRACTICE' as const, blockType: 'MATCHING' as const, order: 2, content: { instruction: 'Classify each example by its heat source type:', pairs: [{ left: 'A solar panel heating water', right: 'Solar' }, { left: 'Burning natural gas in a furnace', right: 'Chemical' }, { left: 'A toaster browning bread', right: 'Electrical' }, { left: 'Rubbing your hands together for warmth', right: 'Friction' }, { left: 'Hot springs in Iceland', right: 'Geothermal' }, { left: 'A nuclear power plant', right: 'Nuclear' }] } },
    { id: 'uc-l1-reflect-1', section: 'REFLECT' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 1, content: { prompt: 'In 2-4 sentences, explain why a bathtub full of warm water has more thermal energy than a small cup of boiling water. Use the terms "particles," "kinetic energy," and "thermal energy."', minLength: 60, rubricHint: 'Uses vocabulary correctly. Explains that thermal energy depends on both temperature and amount of matter.', teacherReviewRequired: false } },
  ];

  for (const b of blocks) {
    await prisma.lessonBlock.create({ data: { id: b.id, lessonId: ID, section: b.section, blockType: b.blockType, content: b.content, order: b.order } });
  }
  console.log(`  ✅ ${blocks.length} blocks`);

  const questions = [
    { id: 'uc-l1-q1', questionText: 'Heat is best defined as:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'The temperature of an object', value: 'a' }, { label: 'The transfer of thermal energy from warmer to cooler objects', value: 'b', correct: true }, { label: 'The speed of particles', value: 'c' }, { label: 'A measure of cold', value: 'd' }], correctAnswer: 'b', explanation: 'Heat is the TRANSFER of thermal energy — it flows from hot to cold.', outcomeCode: 'SCI.7.C.1.1', difficulty: 1 },
    { id: 'uc-l1-q2', questionText: 'Temperature measures:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Total thermal energy', value: 'a' }, { label: 'The average kinetic energy of particles', value: 'b', correct: true }, { label: 'How much heat is being transferred', value: 'c' }, { label: 'The number of particles', value: 'd' }], correctAnswer: 'b', explanation: 'Temperature reflects average particle motion (kinetic energy).', outcomeCode: 'SCI.7.C.1.1', difficulty: 1 },
    { id: 'uc-l1-q3', questionText: 'In the particle model, adding heat to a solid causes particles to:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Stop moving', value: 'a' }, { label: 'Vibrate faster and eventually break free', value: 'b', correct: true }, { label: 'Shrink in size', value: 'c' }, { label: 'Become heavier', value: 'd' }], correctAnswer: 'b', explanation: 'More heat → more kinetic energy → particles vibrate faster → eventually melt.', outcomeCode: 'SCI.7.C.1.2', difficulty: 1 },
    { id: 'uc-l1-q4', questionText: 'A bathtub of warm water has MORE thermal energy than a cup of boiling water because:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'It\'s hotter', value: 'a' }, { label: 'It has more particles', value: 'b', correct: true }, { label: 'Its particles move faster', value: 'c' }, { label: 'It\'s a bigger container', value: 'd' }], correctAnswer: 'b', explanation: 'More water = more particles = more total thermal energy, even at lower temperature.', outcomeCode: 'SCI.7.C.1.1', difficulty: 2 },
    { id: 'uc-l1-q5', questionText: 'Which is a source of chemical heat energy?', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'The Sun', value: 'a' }, { label: 'Burning wood', value: 'b', correct: true }, { label: 'Rubbing hands together', value: 'c' }, { label: 'A nuclear reactor', value: 'd' }], correctAnswer: 'b', explanation: 'Burning (combustion) releases stored chemical energy as heat.', outcomeCode: 'SCI.7.C.1.3', difficulty: 1 },
    { id: 'uc-l1-q6', questionText: 'Heat always flows from:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Cold to hot', value: 'a' }, { label: 'Hot to cold', value: 'b', correct: true }, { label: 'Equal to equal', value: 'c' }, { label: 'Big to small', value: 'd' }], correctAnswer: 'b', explanation: 'Thermal energy naturally moves from warmer to cooler objects.', outcomeCode: 'SCI.7.C.1.1', difficulty: 1 },
    { id: 'uc-l1-q7', questionText: 'Thermal energy is the:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Speed of one particle', value: 'a' }, { label: 'Total kinetic energy of ALL particles in a substance', value: 'b', correct: true }, { label: 'Temperature reading', value: 'c' }, { label: 'Weight of particles', value: 'd' }], correctAnswer: 'b', explanation: 'Thermal energy = total kinetic energy of all particles. Depends on both temperature AND amount of matter.', outcomeCode: 'SCI.7.C.1.1', difficulty: 2 },
    { id: 'uc-l1-q8', questionText: 'Which heat source powers most Alberta home furnaces?', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Solar energy', value: 'a' }, { label: 'Nuclear energy', value: 'b' }, { label: 'Natural gas (chemical)', value: 'c', correct: true }, { label: 'Geothermal energy', value: 'd' }], correctAnswer: 'c', explanation: 'Most Alberta homes use natural gas furnaces — a chemical energy source from combustion.', outcomeCode: 'SCI.7.C.1.3', difficulty: 1 },
  ];

  for (const q of questions) {
    await prisma.quizQuestion.create({ data: { id: q.id, lessonId: ID, questionText: q.questionText, questionType: q.questionType, options: q.options, correctAnswer: q.correctAnswer, explanation: q.explanation, outcomeCode: q.outcomeCode, difficulty: q.difficulty } });
  }
  console.log(`  ✅ ${questions.length} questions`);
}

// ╔═══════════════════════════════════════════════════════════╗
// ║  LESSON 2: Heat on the Move                               ║
// ╚═══════════════════════════════════════════════════════════╝

async function seedLesson2() {
  const ID = 'g7-sci-uc-l2';
  console.log('\n🔥 Seeding UC L2: Heat on the Move...');

  await prisma.lesson.update({
    where: { id: ID },
    data: {
      subjectMode: 'SCIENCE', estimatedMinutes: 45,
      learningGoal: 'Describe conduction, convection, and radiation as three methods of heat transfer, explain conductors and insulators, and give real-world examples.',
      successCriteria: 'I can sort examples into conduction/convection/radiation, predict which materials are conductors or insulators, and explain how convection currents work.',
      materials: 'Science notebook',
      reflectionPrompt: 'Look around the room. Can you spot examples of conduction, convection, or radiation happening right now?',
      masteryConfig: { passPercent: 80, maxRetries: 5, reteachEnabled: true, immediateCorrectiveFeedback: false },
    },
  });

  await prisma.lessonBlock.deleteMany({ where: { lessonId: ID } });
  await prisma.quizQuestion.deleteMany({ where: { lessonId: ID } });

  const blocks = [
    { id: 'uc-l2-learn-1', section: 'LEARN' as const, blockType: 'VOCABULARY' as const, order: 1, content: { terms: [
      { term: 'Conduction', definition: 'Heat transfer through direct contact between particles. Particles vibrate and pass energy to neighbours.', example: 'A metal spoon getting hot in hot soup.' },
      { term: 'Convection', definition: 'Heat transfer through the movement of fluids (liquids/gases). Hot fluid rises, cool fluid sinks.', example: 'Warm air rising from a radiator.' },
      { term: 'Radiation', definition: 'Heat transfer through electromagnetic waves. Doesn\'t need particles — can travel through empty space.', example: 'Feeling warmth from a campfire.' },
      { term: 'Conductor', definition: 'A material that transfers heat easily. Metals like copper and aluminum.', example: 'A copper-bottom pan.' },
      { term: 'Insulator', definition: 'A material that slows heat transfer. Wood, plastic, air, foam.', example: 'A foam coffee cup.' },
      { term: 'Convection Current', definition: 'Circular flow pattern when warm fluid rises and cool fluid sinks, transferring heat.', example: 'Hot water rising in a boiling pot.' },
    ] } },
    { id: 'uc-l2-learn-2', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 2, content: { html: '<h3>🔧 Conduction: Heat Through Touch</h3><p><strong>Conduction</strong> is heat transfer through direct contact. Fast-vibrating particles bump into slower neighbours, passing energy along.</p><ul><li>🍳 <strong>Example:</strong> Metal pan on stove — heat travels from burner to pan to food</li><li><strong>Best in:</strong> Solids (particles closely packed)</li><li><strong>Conductors:</strong> Metals (copper, aluminum, steel) transfer heat quickly</li><li><strong>Insulators:</strong> Wood, plastic, rubber, air — slow heat transfer</li></ul><p><strong>Key Idea:</strong> A metal spoon heats up in soup because metal particles are packed closely and transfer vibrations quickly. A wooden spoon stays cool because wood is an insulator.</p>' } },
    { id: 'uc-l2-learn-3', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 3, content: { html: '<h3>🌀 Convection: Heat Through Fluid Movement</h3><p><strong>Convection</strong> occurs in fluids (liquids and gases). Heated particles move faster and spread apart — warm fluid <strong>rises</strong>. Cooler, denser fluid <strong>sinks</strong> to replace it, creating <strong>convection currents</strong>.</p><ul><li>🌬️ <strong>Air:</strong> Radiators heat air nearby → warm air rises → cool air sinks → room warms evenly</li><li>🌊 <strong>Water:</strong> Boiling water — hot water at bottom rises, cool water sinks to be heated</li></ul><p><strong>Alberta Connection:</strong> During -40°C winters, homes use forced-air furnaces and baseboard heaters that create convection currents to warm rooms.</p>' } },
    { id: 'uc-l2-learn-4', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 4, content: { html: '<h3>☀️ Radiation: Heat Without Contact</h3><p><strong>Radiation</strong> transfers heat through electromagnetic waves. Unlike conduction and convection, radiation does NOT need particles — it can travel through the vacuum of space.</p><ul><li>☀️ <strong>The Sun:</strong> Solar radiation travels 150 million km through space</li><li>🔥 <strong>Campfire:</strong> You feel warmth without touching it — infrared radiation</li><li>🖤 <strong>Dark colours</strong> absorb more radiation; <strong>light colours</strong> reflect it</li></ul>' } },
    { id: 'uc-l2-learn-mc1', section: 'LEARN' as const, blockType: 'MICRO_CHECK' as const, order: 5, content: { question: 'Which type of heat transfer does NOT need particles?', options: [{ label: 'Conduction', value: 'a' }, { label: 'Convection', value: 'b' }, { label: 'Radiation', value: 'c', correct: true }, { label: 'All need particles', value: 'd' }], explanation: 'Radiation uses electromagnetic waves that can travel through empty space — no particles needed.' } },
    { id: 'uc-l2-learn-5', section: 'LEARN' as const, blockType: 'VIDEO' as const, order: 6, content: { url: 'https://www.youtube.com/embed/t1FfKrwEwj8', title: 'Heat Transfer: Conduction, Convection, Radiation', transcript: 'This video explains all three methods of heat transfer with examples.' } },
    { id: 'uc-l2-prac-1', section: 'PRACTICE' as const, blockType: 'MATCHING' as const, order: 1, content: { instruction: 'Classify each scenario as conduction, convection, or radiation:', pairs: [{ left: 'A metal spoon gets hot in soup', right: 'Conduction' }, { left: 'Warm air rises from a heater', right: 'Convection' }, { left: 'You feel warmth from a campfire', right: 'Radiation' }, { left: 'An ice cube melts in your hand', right: 'Conduction' }, { left: 'Boiling water circulates in a pot', right: 'Convection' }, { left: 'The Sun warms the Earth through space', right: 'Radiation' }] } },
    { id: 'uc-l2-prac-2', section: 'PRACTICE' as const, blockType: 'MATCHING' as const, order: 2, content: { instruction: 'Sort each material as a conductor or insulator:', pairs: [{ left: 'Copper wire', right: 'Conductor' }, { left: 'Wooden handle', right: 'Insulator' }, { left: 'Aluminum foil', right: 'Conductor' }, { left: 'Foam cup', right: 'Insulator' }, { left: 'Steel pot', right: 'Conductor' }, { left: 'Rubber glove', right: 'Insulator' }] } },
    { id: 'uc-l2-reflect-1', section: 'REFLECT' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 1, content: { prompt: 'An Alberta family wants to reduce their heating bill in winter. In 3-4 sentences, explain how heat escapes a house through conduction, convection, and radiation, and suggest one solution for each.', minLength: 80, rubricHint: 'Describes all 3 transfer types. Suggests solutions (insulation, sealing, reflective barriers). Uses 3+ vocabulary words.', teacherReviewRequired: false } },
  ];

  for (const b of blocks) {
    await prisma.lessonBlock.create({ data: { id: b.id, lessonId: ID, section: b.section, blockType: b.blockType, content: b.content, order: b.order } });
  }
  console.log(`  ✅ ${blocks.length} blocks`);

  const questions = [
    { id: 'uc-l2-q1', questionText: 'Conduction transfers heat by:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Moving fluid in a circle', value: 'a' }, { label: 'Direct contact between vibrating particles', value: 'b', correct: true }, { label: 'Electromagnetic waves', value: 'c' }, { label: 'Moving air currents', value: 'd' }], correctAnswer: 'b', explanation: 'In conduction, particles vibrate and pass kinetic energy to neighbouring particles through direct contact.', outcomeCode: 'SCI.7.C.2.1', difficulty: 1 },
    { id: 'uc-l2-q2', questionText: 'In convection, warm fluid:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Sinks to the bottom', value: 'a' }, { label: 'Rises because it becomes less dense', value: 'b', correct: true }, { label: 'Stays perfectly still', value: 'c' }, { label: 'Moves sideways only', value: 'd' }], correctAnswer: 'b', explanation: 'Heated particles spread apart, making the fluid less dense — it rises. Cooler fluid sinks to replace it.', outcomeCode: 'SCI.7.C.2.1', difficulty: 1 },
    { id: 'uc-l2-q3', questionText: 'Radiation is unique because it:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Only works in solids', value: 'a' }, { label: 'Can travel through empty space without particles', value: 'b', correct: true }, { label: 'Is the slowest form of heat transfer', value: 'c' }, { label: 'Requires direct contact', value: 'd' }], correctAnswer: 'b', explanation: 'Radiation uses electromagnetic waves that travel through the vacuum of space — no particles needed.', outcomeCode: 'SCI.7.C.2.1', difficulty: 1 },
    { id: 'uc-l2-q4', questionText: 'A metal spoon gets hot in soup because:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Convection currents in the spoon', value: 'a' }, { label: 'Metal is a good conductor — particles transfer vibrations quickly', value: 'b', correct: true }, { label: 'Radiation from the soup', value: 'c' }, { label: 'The spoon absorbs light', value: 'd' }], correctAnswer: 'b', explanation: 'Metal particles are packed closely and transfer heat quickly through conduction.', outcomeCode: 'SCI.7.C.2.2', difficulty: 1 },
    { id: 'uc-l2-q5', questionText: 'Which is the BEST insulator?', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Copper', value: 'a' }, { label: 'Steel', value: 'b' }, { label: 'Aluminum', value: 'c' }, { label: 'Foam (Styrofoam)', value: 'd', correct: true }], correctAnswer: 'd', explanation: 'Foam traps air (a poor conductor) in tiny pockets, making it an excellent insulator.', outcomeCode: 'SCI.7.C.2.2', difficulty: 1 },
    { id: 'uc-l2-q6', questionText: 'In Alberta homes, forced-air furnaces heat rooms using:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Conduction through walls', value: 'a' }, { label: 'Convection — heating air and circulating it', value: 'b', correct: true }, { label: 'Radiation from the furnace', value: 'c' }, { label: 'None of the above', value: 'd' }], correctAnswer: 'b', explanation: 'Furnaces heat air, which rises and circulates through ducts — a convection system.', outcomeCode: 'SCI.7.C.2.1', difficulty: 2 },
    { id: 'uc-l2-q7', questionText: 'A dark-coloured car feels hotter on a sunny day because:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Dark colours are better conductors', value: 'a' }, { label: 'Dark colours absorb more radiant energy', value: 'b', correct: true }, { label: 'Light colours are better insulators', value: 'c' }, { label: 'It has nothing to do with colour', value: 'd' }], correctAnswer: 'b', explanation: 'Dark surfaces absorb more radiation; light surfaces reflect it.', outcomeCode: 'SCI.7.C.2.1', difficulty: 2 },
    { id: 'uc-l2-q8', questionText: 'Wood handles on cooking pots are insulators because:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Wood is a metal', value: 'a' }, { label: 'Wood particles are loosely bonded and don\'t transfer heat quickly', value: 'b', correct: true }, { label: 'Wood absorbs all heat', value: 'c' }, { label: 'Wood makes the pot lighter', value: 'd' }], correctAnswer: 'b', explanation: 'Wood\'s loosely bonded particles don\'t transfer vibrations quickly, so it stays cool to touch.', outcomeCode: 'SCI.7.C.2.2', difficulty: 1 },
  ];

  for (const q of questions) {
    await prisma.quizQuestion.create({ data: { id: q.id, lessonId: ID, questionText: q.questionText, questionType: q.questionType, options: q.options, correctAnswer: q.correctAnswer, explanation: q.explanation, outcomeCode: q.outcomeCode, difficulty: q.difficulty } });
  }
  console.log(`  ✅ ${questions.length} questions`);
}

// ╔═══════════════════════════════════════════════════════════╗
// ║  LESSON 3: Conductors, Insulators & Thermal Materials     ║
// ╚═══════════════════════════════════════════════════════════╝

async function seedLesson3() {
  const ID = 'g7-sci-uc-l3';
  console.log('\n🧊 Seeding UC L3: Thermal Expansion & Measurement...');

  await prisma.lesson.update({
    where: { id: ID },
    data: {
      subjectMode: 'SCIENCE', estimatedMinutes: 45,
      learningGoal: 'Explain thermal expansion and contraction using the particle model, compare how solids/liquids/gases respond to temperature changes, and describe real-world applications.',
      successCriteria: 'I can explain expansion/contraction using the particle model, predict material behaviour when heated/cooled, and give 3 real-world examples of thermal expansion.',
      materials: 'Science notebook',
      reflectionPrompt: 'Look around your home or school. Can you find examples of thermal expansion in action? Doors, pipes, sidewalks, windows?',
      masteryConfig: { passPercent: 80, maxRetries: 5, reteachEnabled: true, immediateCorrectiveFeedback: false },
    },
  });

  await prisma.lessonBlock.deleteMany({ where: { lessonId: ID } });
  await prisma.quizQuestion.deleteMany({ where: { lessonId: ID } });

  const blocks = [
    { id: 'uc-l3-learn-1', section: 'LEARN' as const, blockType: 'VOCABULARY' as const, order: 1, content: { terms: [
      { term: 'Thermal Expansion', definition: 'Materials increase in volume when heated — particles move faster and spread apart.', example: 'A metal bridge getting longer in summer heat.' },
      { term: 'Contraction', definition: 'Materials decrease in volume when cooled — particles slow down and move closer.', example: 'A balloon shrinking in a freezer.' },
      { term: 'Expansion Joint', definition: 'Gap built into bridges and sidewalks to allow for expansion without cracking.', example: 'Metal plates with gaps on the Walterdale Bridge in Edmonton.' },
      { term: 'Bimetallic Strip', definition: 'Two metals bonded together that bend when heated because they expand at different rates.', example: 'The mechanism inside a thermostat or fire alarm.' },
    ] } },
    { id: 'uc-l3-learn-2', section: 'LEARN' as const, blockType: 'VIDEO' as const, order: 2, content: { url: 'https://www.youtube.com/embed/4fuHzC9aTik', title: 'Thermal Expansion', transcript: 'This video explains thermal expansion in solids, liquids, and gases.' } },
    { id: 'uc-l3-learn-3', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 3, content: { html: '<h3>🔬 How Thermal Expansion Works</h3><p>When you add thermal energy, particles vibrate faster and push apart → the material <strong>expands</strong>.</p><table><thead><tr><th>State</th><th>Expansion Amount</th><th>Why?</th></tr></thead><tbody><tr><td>Solid</td><td>Least</td><td>Particles tightly packed, strong bonds</td></tr><tr><td>Liquid</td><td>Moderate</td><td>Particles can slide apart more easily</td></tr><tr><td>Gas</td><td>Most</td><td>Particles already far apart, free to spread</td></tr></tbody></table>' } },
    { id: 'uc-l3-learn-4', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 4, content: { html: '<h3>🌉 Real-World Applications</h3><ul><li>🌉 <strong>Expansion Joints:</strong> Bridges have gaps so metal can expand in summer heat without buckling. Edmonton\'s Walterdale Bridge has these built in.</li><li>🌡️ <strong>Thermometers:</strong> Liquid expands as temperature rises, pushing up the tube.</li><li>🎈 <strong>Hot Air Balloons:</strong> Heating air makes it expand and become less dense → the balloon rises.</li><li>🔧 <strong>Bimetallic Strips:</strong> Two metals bonded together bend when heated (different expansion rates). Used in thermostats and fire alarms.</li><li>🛤️ <strong>Railway Rails:</strong> Small gaps between rails allow for expansion in summer heat.</li></ul>' } },
    { id: 'uc-l3-learn-mc1', section: 'LEARN' as const, blockType: 'MICRO_CHECK' as const, order: 5, content: { question: 'Why do gases expand more than solids when heated?', options: [{ label: 'Gases are heavier', value: 'a' }, { label: 'Gas particles are already far apart and free to spread even further', value: 'b', correct: true }, { label: 'Solids don\'t expand at all', value: 'c' }, { label: 'Gases absorb more light', value: 'd' }], explanation: 'Gas particles have weak forces between them and lots of space, so they spread out much more when heated.' } },
    { id: 'uc-l3-prac-1', section: 'PRACTICE' as const, blockType: 'MATCHING' as const, order: 1, content: { instruction: 'Match each application to how it uses thermal expansion:', pairs: [{ left: 'Expansion joints in bridges', right: 'Allow metal to expand without buckling' }, { left: 'Mercury in a thermometer', right: 'Liquid expands to show temperature' }, { left: 'Hot air balloon', right: 'Heated air expands and becomes less dense' }, { left: 'Bimetallic strip in thermostat', right: 'Two metals bend at different rates' }] } },
    { id: 'uc-l3-reflect-1', section: 'REFLECT' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 1, content: { prompt: 'Explain why telephone wires sag more in summer than winter. Use the particle model in your explanation.', minLength: 60, rubricHint: 'Explains that heat causes particles to vibrate faster and spread apart (expansion). Connects to wire length increasing. Uses vocabulary.', teacherReviewRequired: false } },
  ];

  for (const b of blocks) {
    await prisma.lessonBlock.create({ data: { id: b.id, lessonId: ID, section: b.section, blockType: b.blockType, content: b.content, order: b.order } });
  }
  console.log(`  ✅ ${blocks.length} blocks`);

  const questions = [
    { id: 'uc-l3-q1', questionText: 'Thermal expansion happens because:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Particles get bigger', value: 'a' }, { label: 'Particles move faster and spread apart when heated', value: 'b', correct: true }, { label: 'New particles are added', value: 'c' }, { label: 'Gravity pulls particles apart', value: 'd' }], correctAnswer: 'b', explanation: 'Heated particles gain kinetic energy, move faster, and push further apart.', outcomeCode: 'SCI.7.C.1.2', difficulty: 1 },
    { id: 'uc-l3-q2', questionText: 'Which state of matter expands the MOST when heated?', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Solid', value: 'a' }, { label: 'Liquid', value: 'b' }, { label: 'Gas', value: 'c', correct: true }, { label: 'They all expand equally', value: 'd' }], correctAnswer: 'c', explanation: 'Gas particles are far apart with weak forces — they spread out much more.', outcomeCode: 'SCI.7.C.1.2', difficulty: 1 },
    { id: 'uc-l3-q3', questionText: 'Bridges have expansion joints to:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Make them look modern', value: 'a' }, { label: 'Allow the bridge to expand in heat without cracking or buckling', value: 'b', correct: true }, { label: 'Let water drain', value: 'c' }, { label: 'Reduce weight', value: 'd' }], correctAnswer: 'b', explanation: 'Metal expands in summer heat — without joints, the bridge would buckle or crack.', outcomeCode: 'SCI.7.C.1.4', difficulty: 1 },
    { id: 'uc-l3-q4', questionText: 'A bimetallic strip bends when heated because:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Both metals expand equally', value: 'a' }, { label: 'The two metals expand at different rates', value: 'b', correct: true }, { label: 'One metal melts', value: 'c' }, { label: 'It absorbs light', value: 'd' }], correctAnswer: 'b', explanation: 'Different metals have different expansion rates — unequal expansion causes bending.', outcomeCode: 'SCI.7.C.1.4', difficulty: 2 },
    { id: 'uc-l3-q5', questionText: 'A balloon shrinks in a freezer because:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Air leaks out', value: 'a' }, { label: 'Gas particles lose energy, slow down, and take up less space', value: 'b', correct: true }, { label: 'The rubber gets stronger', value: 'c' }, { label: 'Gravity increases', value: 'd' }], correctAnswer: 'b', explanation: 'Cooling removes kinetic energy — particles move slower and closer together (contraction).', outcomeCode: 'SCI.7.C.1.2', difficulty: 1 },
    { id: 'uc-l3-q6', questionText: 'Thermometers work because:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'They measure air pressure', value: 'a' }, { label: 'Liquid inside expands as temperature rises', value: 'b', correct: true }, { label: 'They use electricity', value: 'c' }, { label: 'Glass changes colour', value: 'd' }], correctAnswer: 'b', explanation: 'The liquid in a thermometer expands when heated, rising up the narrow tube.', outcomeCode: 'SCI.7.C.1.4', difficulty: 1 },
    { id: 'uc-l3-q7', questionText: 'In Alberta, telephone wires sag more in summer because:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Wind pushes them down', value: 'a' }, { label: 'Metal wires expand in heat, becoming longer and sagging', value: 'b', correct: true }, { label: 'Poles shrink in summer', value: 'c' }, { label: 'Birds are heavier in summer', value: 'd' }], correctAnswer: 'b', explanation: 'Metal expands when heated — the wires get slightly longer and sag more between poles.', outcomeCode: 'SCI.7.C.1.2', difficulty: 2 },
    { id: 'uc-l3-q8', questionText: 'Railway rails have small gaps between them to:', questionType: 'MULTIPLE_CHOICE' as const, options: [{ label: 'Save money on steel', value: 'a' }, { label: 'Allow rails to expand in summer heat', value: 'b', correct: true }, { label: 'Make the train go faster', value: 'c' }, { label: 'Let rain drain away', value: 'd' }], correctAnswer: 'b', explanation: 'Without gaps, rails would buckle in hot weather due to thermal expansion.', outcomeCode: 'SCI.7.C.1.4', difficulty: 1 },
  ];

  for (const q of questions) {
    await prisma.quizQuestion.create({ data: { id: q.id, lessonId: ID, questionText: q.questionText, questionType: q.questionType, options: q.options, correctAnswer: q.correctAnswer, explanation: q.explanation, outcomeCode: q.outcomeCode, difficulty: q.difficulty } });
  }
  console.log(`  ✅ ${questions.length} questions`);
}

async function main() {
  console.log('🔥 ═══ SCIENCE UNIT C: L1-L3 ═══');
  await seedLesson1();
  await seedLesson2();
  await seedLesson3();
  console.log('\n✅ Unit C L1-L3 complete!');
}

main().catch(console.error).finally(() => { pool.end(); });
