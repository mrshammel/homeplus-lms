import re

file_path = r"c:\Users\Amanda\.gemini\antigravity\playground\prograde-trifid\homeplus-core\prisma\seed-unit-a-content.ts"

with open(file_path, "r", encoding="utf-8") as f:
    code = f.read()

# Instead of a complicated rewrite, we can just replace the specific text strings inside seedLesson2
# The simplest approach is to comment OUT the decomposer and food chain sections from seedLesson2,
# and then copy seedLesson2 entirely to seedLesson2b, but comment OUT the producer/consumer sections!

# Wait, a true replacement is cleaner. 
# Let's just substitute the whole function.

# Find where seedLesson2 begins and ends.
start_idx = code.find("async function seedLesson2()")
end_idx = code.find("async function seedLesson3()")

if start_idx == -1 or end_idx == -1:
    print("Could not find bounds of seedLesson2")
    exit(1)

# Let's write the new functions explicitly for safety.
new_code = """
// ╔═══════════════════════════════════════════════════════════╗
// ║  LESSON 2: Producers & Consumers                         ║
// ╚═══════════════════════════════════════════════════════════╝

async function seedLesson2() {
  const LESSON_ID = 'g7-sci-ua-l2';
  console.log('\\n📗 Seeding Lesson 2: Producers & Consumers...');

  await prisma.lesson.update({
    where: { id: LESSON_ID },
    data: {
      subjectMode: 'SCIENCE',
      estimatedMinutes: 30,
      learningGoal: 'Classify organisms as producers or consumers.',
      successCriteria: 'I can sort organisms by their role in an ecosystem based on how they get energy.',
      materials: 'Science notebook',
      reflectionPrompt: 'Think of 3 things you ate today. Which ones came from producers and which from consumers?',
      warmUpConfig: {
        type: 'retrieval',
        prompt: 'From last lesson: What is the difference between a biotic factor and an abiotic factor? Give one example of each.',
        options: [
          { label: 'Biotic = living (e.g. tree); Abiotic = non-living (e.g. sunlight)', value: 'a', correct: true },
          { label: 'Biotic = large; Abiotic = small', value: 'b', correct: false },
          { label: 'Biotic = found in water; Abiotic = found on land', value: 'c', correct: false },
          { label: 'They mean the same thing', value: 'd', correct: false },
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

  const learnBlocks = [
    {
      id: 'l2-learn-1',
      section: 'LEARN' as const,
      blockType: 'TEXT' as const,
      order: 1,
      content: {
        html: `
          <h2>🌱 Where Does Energy Come From?</h2>
          <p>All life needs <strong>energy</strong> to survive. But where does that energy actually come from?</p>
          <p>The answer: <strong>the sun</strong>. Almost all energy in an ecosystem starts with sunlight. But animals can't use sunlight directly — they need organisms that can convert it into food.</p>
          <p>Scientists group organisms by <em>how they get their energy</em>.</p>
        `,
      },
    },
    {
      id: 'l2-learn-2',
      section: 'LEARN' as const,
      blockType: 'TEXT' as const,
      order: 2,
      content: {
        html: `
          <h3>🌿 Producers</h3>
          <p><strong>Producers</strong> are organisms that make their own food using energy from the sun through a process called <strong>photosynthesis</strong>. They are the foundation of every food chain.</p>
          <p><strong>Examples:</strong> grasses, trees, algae, phytoplankton, moss</p>
        `,
      },
    },
    {
      id: 'l2-learn-2b',
      section: 'LEARN' as const,
      blockType: 'TEXT' as const,
      order: 3,
      content: {
        html: `
          <h3>🦌 Consumers</h3>
          <p><strong>Consumers</strong> cannot make their own food. They must eat other organisms to get energy.</p>
          <p>Consumers are classified by <em>what</em> they eat:</p>
          <ul>
            <li><strong>Primary consumers (herbivores)</strong> — eat producers (e.g. deer eating grass, a rabbit eating clover)</li>
            <li><strong>Secondary consumers</strong> — eat primary consumers (e.g. a fox eating a rabbit)</li>
            <li><strong>Tertiary consumers</strong> — eat secondary consumers (e.g. a hawk eating a fox)</li>
            <li><strong>Omnivores</strong> — eat both plants and animals (e.g. bears, humans)</li>
          </ul>
        `,
      },
    },
    {
      id: 'l2-learn-3',
      section: 'LEARN' as const,
      blockType: 'VOCABULARY' as const,
      order: 4,
      content: {
        terms: [
          { term: 'Producer', definition: 'An organism that makes its own food from sunlight (photosynthesis).', example: 'Grass, oak trees, algae in a pond.' },
          { term: 'Consumer', definition: 'An organism that gets energy by eating other organisms.', example: 'A deer (primary), a wolf (secondary).' },
          { term: 'Herbivore', definition: 'An animal that eats only plants (a primary consumer).', example: 'Rabbits, grasshoppers, caterpillars.' },
          { term: 'Photosynthesis', definition: 'The process plants use to convert sunlight, water, and CO₂ into food (glucose) and oxygen.', example: 'A leaf absorbing sunlight to produce sugar.' },
        ],
      },
    },
    {
      id: 'l2-learn-mc1',
      section: 'LEARN' as const,
      blockType: 'MICRO_CHECK' as const,
      order: 5,
      content: {
        question: 'If a rabbit eats grass, and a fox eats the rabbit, which organism is the primary consumer?',
        options: [
          { label: 'Grass', value: 'a' },
          { label: 'Rabbit', value: 'b', correct: true },
          { label: 'Fox', value: 'c' },
        ],
        explanation: 'The rabbit eats the producer (grass), making it the primary consumer.',
      },
    },
  ];

  const practiceBlocks = [
    {
      id: 'l2-practice-1',
      section: 'PRACTICE' as const,
      blockType: 'MATCHING' as const,
      order: 1,
      content: {
        instruction: 'Match each organism to its correct role based on what you learned:',
        pairs: [
          { left: 'Oak tree', right: 'Producer' },
          { left: 'Grasshopper', right: 'Primary consumer' },
          { left: 'Lion', right: 'Secondary consumer' },
          { left: 'Algae', right: 'Producer' },
          { left: 'Eagle', right: 'Tertiary consumer' },
          { left: 'Deer', right: 'Primary consumer' },
        ],
      },
    },
    {
      id: 'l2-practice-2',
      section: 'PRACTICE' as const,
      blockType: 'FILL_IN_BLANK' as const,
      order: 2,
      content: {
        prompt: 'Complete the sentences using what you learned:',
        blanks: [
          { id: 'b1', correctAnswer: 'producers', hint: 'Organisms that make their own food from sunlight are called _____.' },
          { id: 'b2', correctAnswer: 'consumers', hint: 'Organisms that must eat other organisms for energy are called _____.' },
          { id: 'b4', correctAnswer: 'photosynthesis', hint: 'The process producers use to convert sunlight into food is called _____.' },
        ],
      },
    },
  ];

  const reflectBlocks = [
    {
      id: 'l2-reflect-1',
      section: 'REFLECT' as const,
      blockType: 'CONSTRUCTED_RESPONSE' as const,
      order: 1,
      content: {
        prompt: 'Explain what would eventually happen to all the consumers in an ecosystem if all the producers disappeared overnight.',
        minLength: 30,
        rubricHint: 'Explains that consumers rely on producers for energy via photosynthesis. If producers disappear, primary consumers starve, leading to a collapse of other consumers.',
        teacherReviewRequired: false,
      },
    },
  ];

  const allBlocks = [...learnBlocks, ...practiceBlocks, ...reflectBlocks];
  for (const block of allBlocks) {
    await prisma.lessonBlock.create({
      data: { id: block.id, lessonId: LESSON_ID, section: block.section, blockType: block.blockType, content: block.content, order: block.order, },
    });
  }

  const questions = [
    {
      id: 'l2-q1',
      questionText: 'Which of the following organisms is a PRODUCER?',
      questionType: 'MULTIPLE_CHOICE' as const,
      options: [
        { label: 'Rabbit', value: 'a' },
        { label: 'Mushroom', value: 'b' },
        { label: 'Algae', value: 'c', correct: true },
        { label: 'Hawk', value: 'd' },
      ],
      correctAnswer: 'c',
      explanation: 'Algae makes its own food through photosynthesis. Rabbits and hawks are consumers, and mushrooms are decomposers.',
      outcomeCode: 'SCI.7.A.K.1',
      difficulty: 1,
    },
    {
      id: 'l2-q2',
      questionText: 'A bear eats salmon, berries, and insects. What type of consumer is a bear?',
      questionType: 'MULTIPLE_CHOICE' as const,
      options: [
        { label: 'Herbivore', value: 'a' },
        { label: 'Carnivore', value: 'b' },
        { label: 'Omnivore', value: 'c', correct: true },
        { label: 'Producer', value: 'd' },
      ],
      correctAnswer: 'c',
      explanation: 'Bears eat both plants and animals, making them omnivores.',
      outcomeCode: 'SCI.7.A.K.1',
      difficulty: 1,
    },
    {
      id: 'l2-q9',
      questionText: 'If a disease killed all the producers in an ecosystem, which organisms would be affected FIRST?',
      questionType: 'MULTIPLE_CHOICE' as const,
      options: [
        { label: 'Tertiary consumers', value: 'a' },
        { label: 'Primary consumers because they eat producers directly', value: 'b', correct: true },
        { label: 'It would not affect anything', value: 'c' },
        { label: 'No organisms would be affected', value: 'd' },
      ],
      correctAnswer: 'b',
      explanation: 'Primary consumers eat producers directly, so they lose their food source first.',
      outcomeCode: 'SCI.7.A.K.1',
      difficulty: 2,
    },
  ];

  for (const q of questions) {
    await prisma.quizQuestion.create({
      data: { id: q.id, lessonId: LESSON_ID, questionText: q.questionText, questionType: q.questionType, options: q.options, correctAnswer: q.correctAnswer, explanation: q.explanation, outcomeCode: q.outcomeCode, difficulty: q.difficulty, },
    });
  }
}

// ╔═══════════════════════════════════════════════════════════╗
// ║  LESSON 2b: Decomposers & Energy Flow                    ║
// ╚═══════════════════════════════════════════════════════════╝

async function seedLesson2b() {
  const LESSON_ID = 'g7-sci-ua-l2b';
  console.log('\\n📗 Seeding Lesson 2b: Decomposers & Energy Flow...');

  await prisma.lesson.update({
    where: { id: LESSON_ID },
    data: {
      subjectMode: 'SCIENCE',
      estimatedMinutes: 35,
      learningGoal: 'Explain the role of decomposers and trace energy through food chains.',
      successCriteria: 'I can draw a food chain showing how energy moves, and explain why decomposers are necessary for life.',
      materials: 'Science notebook, coloured pencils',
      reflectionPrompt: 'Imagine a world without decomposers. What would it look like?',
      warmUpConfig: {
        type: 'retrieval',
        prompt: 'From last lesson: Which of the following is a primary consumer?',
        options: [
          { label: 'Grass', value: 'a', correct: false },
          { label: 'A rabbit that eats grass', value: 'b', correct: true },
          { label: 'A fox that eats rabbits', value: 'c', correct: false },
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

  const learnBlocks = [
    {
      id: 'l2b-learn-2c',
      section: 'LEARN' as const,
      blockType: 'TEXT' as const,
      order: 1,
      content: {
        html: `
          <h3>🍂 Decomposers</h3>
          <p><strong>Decomposers</strong> break down dead organisms and waste, returning nutrients to the soil. Without them, dead material would pile up and nutrients would never be recycled.</p>
          <p><strong>Examples:</strong> mushrooms, bacteria, earthworms, mold</p>
          <p><strong>Key idea:</strong> Decomposers complete the cycle — they connect death back to new life by making nutrients available for producers to use again.</p>
        `,
      },
    },
    {
      id: 'l2b-learn-4',
      section: 'LEARN' as const,
      blockType: 'VIDEO' as const,
      order: 2,
      content: {
        url: 'https://www.youtube.com/embed/MuKs9o1s8h8',
        title: 'Food Chains & Food Webs — Crash Course Kids',
        transcript: 'This video explains how energy flows through food chains and food webs...',
        aiSummary: 'A food chain shows how energy moves from one organism to the next in a straight line...',
      },
    },
    {
      id: 'l2b-learn-5',
      section: 'LEARN' as const,
      blockType: 'TEXT' as const,
      order: 3,
      content: {
        html: `
          <h3>⛓️ Food Chains: Tracing Energy Flow</h3>
          <p>A <strong>food chain</strong> shows the path of energy from one organism to the next. Energy always flows in one direction — from producers to consumers.</p>
          <p>Here's an example from a grassland ecosystem:</p>
          <div style="background:#f0fdf4; padding:16px; border-radius:12px; text-align:center; font-size:1.1rem; margin:12px 0;">
            ☀️ Sun → 🌾 Grass → 🐇 Rabbit → 🦊 Fox → 🦅 Hawk
          </div>
          <p><strong>Important:</strong> At each step, some energy is used up (for movement, body heat, growth). That's why food chains rarely have more than 4–5 links — there isn't enough energy left to support more levels.</p>
        `,
      },
    },
  ];

  const practiceBlocks = [
    {
      id: 'l2b-practice-2',
      section: 'PRACTICE' as const,
      blockType: 'FILL_IN_BLANK' as const,
      order: 1,
      content: {
        prompt: 'Complete the sentences using what you learned:',
        blanks: [
          { id: 'b2', correctAnswer: 'decomposers', hint: 'Organisms that break down dead material and return nutrients to the soil are called _____.' },
          { id: 'b3', correctAnswer: 'food chain', hint: 'A _____ _____ shows the path of energy from one organism to the next.' },
        ],
      },
    },
    {
      id: 'l2b-practice-3',
      section: 'PRACTICE' as const,
      blockType: 'DRAWING' as const,
      order: 2,
      content: {
        instruction: 'Draw a food chain from a POND ecosystem. Include at least 4 organisms and label each one. Draw arrows showing the direction energy flows.',
      },
    },
    {
      id: 'l2b-practice-4',
      section: 'PRACTICE' as const,
      blockType: 'MULTIPLE_CHOICE' as const,
      order: 3,
      content: {
        question: 'In the Crash Course Kids video you just watched, the narrator explained why food chains rarely have more than 5 links. Which of the following BEST explains why?',
        options: [
          { label: 'There aren\\'t enough different species', value: 'a' },
          { label: 'Energy is lost at each level, so there isn\\'t enough to support more levels', value: 'b', correct: true },
          { label: 'Predators at the top eat too much', value: 'c' },
        ],
        explanation: 'At each level of a food chain, organisms use up energy for movement, body heat, and growth. Only about 10% of the energy passes to the next level.',
      },
    },
  ];

  const reflectBlocks = [
    {
      id: 'l2b-reflect-1',
      section: 'REFLECT' as const,
      blockType: 'CONSTRUCTED_RESPONSE' as const,
      order: 1,
      content: {
        prompt: 'Look at the food chain you drew during Guided Practice. Now imagine that ALL the decomposers in that ecosystem suddenly disappeared. Using the specific organisms from YOUR food chain, explain:\\n\\n1. What would happen to dead organisms?\\n2. How would producers eventually be affected?',
        minLength: 50,
        rubricHint: 'References their own food chain drawing. Uses vocabulary (producer, consumer, decomposer). Explains the ripple effect of removing decomposers.',
        teacherReviewRequired: false,
      },
    },
  ];

  const allBlocks = [...learnBlocks, ...practiceBlocks, ...reflectBlocks];
  for (const block of allBlocks) {
    await prisma.lessonBlock.create({
      data: { id: block.id, lessonId: LESSON_ID, section: block.section, blockType: block.blockType, content: block.content, order: block.order, },
    });
  }

  const questions = [
    {
      id: 'l2b-q3',
      questionText: 'Why are decomposers essential for an ecosystem to survive?',
      questionType: 'MULTIPLE_CHOICE' as const,
      options: [
        { label: 'They produce oxygen for animals', value: 'a' },
        { label: 'They break down dead organisms and return nutrients to the soil for producers', value: 'b', correct: true },
        { label: 'They provide food for all consumers', value: 'c' },
      ],
      correctAnswer: 'b',
      explanation: 'Decomposers break down dead material and release nutrients back into the soil for producers.',
      outcomeCode: 'SCI.7.A.K.1',
      difficulty: 2,
    },
    {
      id: 'l2b-q4',
      questionText: 'Energy flows through a food chain in one direction. At each level, what happens to the energy?',
      questionType: 'MULTIPLE_CHOICE' as const,
      options: [
        { label: 'It increases at each level', value: 'a' },
        { label: 'It stays exactly the same', value: 'b' },
        { label: 'Some energy is used up, so less is available at the next level', value: 'c', correct: true },
      ],
      correctAnswer: 'c',
      explanation: 'At each level, organisms use energy for movement, growth, and body heat.',
      outcomeCode: 'SCI.7.A.K.1',
      difficulty: 2,
    },
    {
      id: 'l2b-q7',
      questionText: 'In a food chain, an arrow (→) represents:',
      questionType: 'MULTIPLE_CHOICE' as const,
      options: [
        { label: 'The direction the animal moves', value: 'a' },
        { label: 'The direction energy flows from one organism to the next', value: 'b', correct: true },
        { label: 'Which organism is bigger', value: 'c' },
      ],
      correctAnswer: 'b',
      explanation: 'Arrows in food chains always point in the direction energy flows.',
      outcomeCode: 'SCI.7.A.K.1',
      difficulty: 1,
    },
  ];

  for (const q of questions) {
    await prisma.quizQuestion.create({
      data: { id: q.id, lessonId: LESSON_ID, questionText: q.questionText, questionType: q.questionType, options: q.options, correctAnswer: q.correctAnswer, explanation: q.explanation, outcomeCode: q.outcomeCode, difficulty: q.difficulty, },
    });
  }
}
"""

new_file_content = code[:start_idx] + new_code + "\n" + code[end_idx:]

# We also need to add await seedLesson2b() to main()
# Find 'await seedLesson2();'
main_idx = new_file_content.find("await seedLesson2();")
if main_idx != -1:
    new_file_content = new_file_content[:main_idx] + "await seedLesson2();\\n  await seedLesson2b();" + new_file_content[main_idx+20:]

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_file_content)

print("Successfully updated seed-unit-a-content.ts")
