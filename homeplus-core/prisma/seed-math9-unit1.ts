import { PrismaClient } from '@prisma/client';

/**
 * Seed Grade 9 Math - Unit 1: Rational Numbers
 * 5 lessons based on teacher curriculum files
 */
export async function seedMath9Unit1(prisma: PrismaClient) {
  console.log('🔢 Seeding Math 9 — Unit 1: Rational Numbers...');

  const unitId = 'g9-math-u1';

  // Ensure unit exists
  await prisma.unit.upsert({
    where: { id: unitId },
    update: {},
    create: { id: unitId, subjectId: 'g9-math', title: 'Rational Numbers', description: 'Comparing, ordering, and performing operations on rational numbers in all forms.', icon: '🔢', order: 1 },
  });

  // ─── LESSON 1: Introduction to Rational Numbers ───
  const lesson1 = await prisma.lesson.upsert({
    where: { id: 'g9-math-u1-l1' },
    update: { title: 'Introduction to Rational Numbers', subtitle: 'What are rational numbers and where do they fit?', order: 1 },
    create: { id: 'g9-math-u1-l1', unitId, title: 'Introduction to Rational Numbers', subtitle: 'What are rational numbers and where do they fit?', order: 1 },
  });

  const l1Blocks = [
    {
      id: 'g9m-u1l1-b1', lessonId: lesson1.id, section: 'LEARN' as const, blockType: 'TEXT' as const, order: 1,
      content: { html: '<h2>🔢 What is a Rational Number?</h2><p>A <strong>rational number</strong> is any number that can be written as a fraction <strong>a/b</strong>, where <em>a</em> and <em>b</em> are integers and <em>b ≠ 0</em>.</p><p>This includes:</p><ul><li><strong>Integers:</strong> −3, 0, 5 (because 5 = 5/1)</li><li><strong>Fractions:</strong> ¾, −⅖</li><li><strong>Terminating decimals:</strong> 0.75, −2.5</li><li><strong>Repeating decimals:</strong> 0.333... = ⅓</li></ul><p>Numbers that are NOT rational are called <strong>irrational</strong> — like π or √2, because they cannot be written as a simple fraction.</p>' },
    },
    {
      id: 'g9m-u1l1-b2', lessonId: lesson1.id, section: 'LEARN' as const, blockType: 'TEXT' as const, order: 2,
      content: { html: '<h2>📏 The Number Line</h2><p>All rational numbers can be placed on a number line. This helps us <strong>compare</strong> and <strong>order</strong> them.</p><ul><li>Numbers to the <strong>right</strong> are always <strong>greater</strong>.</li><li>Numbers to the <strong>left</strong> are always <strong>less</strong>.</li><li>Negative numbers are always less than positive numbers.</li></ul><p><strong>Example:</strong> Place −2.5, ¾, −⅓, and 1.2 on a number line.</p><p>Converting to decimals: −2.5, 0.75, −0.33..., 1.2</p><p>Order from least to greatest: <strong>−2.5 &lt; −⅓ &lt; ¾ &lt; 1.2</strong></p>' },
    },
    {
      id: 'g9m-u1l1-b3', lessonId: lesson1.id, section: 'LEARN' as const, blockType: 'VOCABULARY' as const, order: 3,
      content: {
        terms: [
          { term: 'Rational Number', definition: 'Any number that can be expressed as a fraction a/b where a and b are integers and b ≠ 0.', example: '¾, −5, 0.6, 0.333...' },
          { term: 'Irrational Number', definition: 'A number that CANNOT be expressed as a simple fraction. Its decimal goes on forever without repeating.', example: 'π = 3.14159..., √2 = 1.41421...' },
          { term: 'Integer', definition: 'A whole number (positive, negative, or zero) with no fractional part.', example: '...−3, −2, −1, 0, 1, 2, 3...' },
          { term: 'Terminating Decimal', definition: 'A decimal that ends (has a finite number of digits after the decimal point).', example: '0.5, 0.75, 3.125' },
          { term: 'Repeating Decimal', definition: 'A decimal with one or more digits that repeat forever in a pattern.', example: '0.333... = ⅓, 0.1666... = ⅙' },
        ]
      },
    },
    {
      id: 'g9m-u1l1-b4', lessonId: lesson1.id, section: 'PRACTICE' as const, blockType: 'MULTIPLE_CHOICE' as const, order: 4,
      content: {
        question: 'Which of the following is NOT a rational number?',
        options: [
          { label: '−7', value: 'a' },
          { label: '0.125', value: 'b' },
          { label: '√5', value: 'c', correct: true },
          { label: '⅔', value: 'd' },
        ],
        explanation: '√5 ≈ 2.2360679... — it is a non-terminating, non-repeating decimal, so it cannot be written as a fraction. It is irrational.',
      },
    },
    {
      id: 'g9m-u1l1-b5', lessonId: lesson1.id, section: 'PRACTICE' as const, blockType: 'MATCHING' as const, order: 5,
      content: {
        instruction: 'Match each number to its type:',
        pairs: [
          { left: '0.75', right: 'Terminating Decimal' },
          { left: '0.333...', right: 'Repeating Decimal' },
          { left: '−4', right: 'Integer' },
          { left: 'π', right: 'Irrational Number' },
        ],
      },
    },
    {
      id: 'g9m-u1l1-b6', lessonId: lesson1.id, section: 'PRACTICE' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 6,
      content: {
        prompt: 'In your own words, explain why the number 0.5 is rational but the number √3 is irrational. Use the definition of a rational number in your explanation.',
        rubricHint: 'Reference the a/b definition. Show that 0.5 = ½. Explain why √3 cannot be expressed as a fraction.',
        minLength: 30,
      },
    },
  ];

  for (const b of l1Blocks) {
    await prisma.lessonBlock.upsert({ where: { id: b.id }, update: { content: b.content, order: b.order }, create: b });
  }

  // ─── LESSON 2: Conversion Review ───
  const lesson2 = await prisma.lesson.upsert({
    where: { id: 'g9-math-u1-l2' },
    update: { title: 'Conversion Review', subtitle: 'Converting between fractions, decimals, and percents', order: 2 },
    create: { id: 'g9-math-u1-l2', unitId, title: 'Conversion Review', subtitle: 'Converting between fractions, decimals, and percents', order: 2 },
  });

  const l2Blocks = [
    {
      id: 'g9m-u1l2-b1', lessonId: lesson2.id, section: 'LEARN' as const, blockType: 'TEXT' as const, order: 1,
      content: { html: '<h2>🔄 Converting Between Forms</h2><p>Rational numbers can appear as fractions, decimals, or percents. Being able to convert between them is an essential Grade 9 skill.</p><h3>Fraction → Decimal</h3><p>Divide the numerator by the denominator.</p><p><strong>Example:</strong> ⅜ = 3 ÷ 8 = 0.375</p><h3>Decimal → Fraction</h3><p>Place the decimal over the appropriate power of 10 and simplify.</p><p><strong>Example:</strong> 0.6 = 6/10 = ⅗</p><h3>Decimal → Percent</h3><p>Multiply by 100 (move decimal point 2 places right).</p><p><strong>Example:</strong> 0.375 = 37.5%</p><h3>Percent → Decimal</h3><p>Divide by 100 (move decimal point 2 places left).</p><p><strong>Example:</strong> 45% = 0.45</p>' },
    },
    {
      id: 'g9m-u1l2-b2', lessonId: lesson2.id, section: 'PRACTICE' as const, blockType: 'FILL_IN_BLANK' as const, order: 2,
      content: {
        prompt: 'Convert each number to the form indicated:',
        blanks: [
          { id: 'b1', hint: '¾ as a decimal', correctAnswer: '0.75' },
          { id: 'b2', hint: '0.4 as a fraction (simplified)', correctAnswer: '2/5' },
          { id: 'b3', hint: '0.125 as a percent', correctAnswer: '12.5%' },
          { id: 'b4', hint: '60% as a fraction (simplified)', correctAnswer: '3/5' },
        ],
      },
    },
    {
      id: 'g9m-u1l2-b3', lessonId: lesson2.id, section: 'PRACTICE' as const, blockType: 'MULTIPLE_CHOICE' as const, order: 3,
      content: {
        question: 'Which fraction is equivalent to the repeating decimal 0.666...?',
        options: [
          { label: '⅗', value: 'a' },
          { label: '⅔', value: 'b', correct: true },
          { label: '⅚', value: 'c' },
          { label: '¾', value: 'd' },
        ],
        explanation: '0.666... = ⅔. You can verify: 2 ÷ 3 = 0.6666...',
      },
    },
  ];

  for (const b of l2Blocks) {
    await prisma.lessonBlock.upsert({ where: { id: b.id }, update: { content: b.content, order: b.order }, create: b });
  }

  // ─── LESSON 3: Integer & Decimal Operations ───
  const lesson3 = await prisma.lesson.upsert({
    where: { id: 'g9-math-u1-l3' },
    update: { title: 'Integer & Decimal Operations', subtitle: 'Adding, subtracting, multiplying, and dividing integers and decimals', order: 3 },
    create: { id: 'g9-math-u1-l3', unitId, title: 'Integer & Decimal Operations', subtitle: 'Adding, subtracting, multiplying, and dividing integers and decimals', order: 3 },
  });

  const l3Blocks = [
    {
      id: 'g9m-u1l3-b1', lessonId: lesson3.id, section: 'LEARN' as const, blockType: 'TEXT' as const, order: 1,
      content: { html: '<h2>➕➖ Operations with Integers & Decimals</h2><h3>Sign Rules for Multiplication & Division</h3><ul><li><strong>Positive × Positive = Positive</strong> → (+3)(+4) = +12</li><li><strong>Negative × Negative = Positive</strong> → (−3)(−4) = +12</li><li><strong>Positive × Negative = Negative</strong> → (+3)(−4) = −12</li><li><strong>Negative × Positive = Negative</strong> → (−3)(+4) = −12</li></ul><h3>Adding Integers</h3><p><strong>Same signs:</strong> Add the absolute values, keep the sign.</p><p><strong>Different signs:</strong> Subtract the smaller absolute value from the larger; keep the sign of the number with the larger absolute value.</p><h3>Subtracting Integers</h3><p>Change subtraction to <strong>adding the opposite</strong>.</p><p><strong>Example:</strong> 5 − (−3) = 5 + 3 = 8</p>' },
    },
    {
      id: 'g9m-u1l3-b2', lessonId: lesson3.id, section: 'LEARN' as const, blockType: 'WORKED_EXAMPLE' as const, order: 2,
      content: {
        title: 'Solving: (−4.2) + (−3.8) − 2.5',
        steps: [
          { instruction: 'Add the first two numbers (same sign)', detail: '(−4.2) + (−3.8) = −8.0' },
          { instruction: 'Subtract 2.5 → add the opposite', detail: '−8.0 − 2.5 = −8.0 + (−2.5) = −10.5' },
          { instruction: 'Final answer', detail: '−10.5' },
        ],
      },
    },
    {
      id: 'g9m-u1l3-b3', lessonId: lesson3.id, section: 'PRACTICE' as const, blockType: 'FILL_IN_BLANK' as const, order: 3,
      content: {
        prompt: 'Solve each problem:',
        blanks: [
          { id: 'b1', hint: '(−7) + 12', correctAnswer: '5' },
          { id: 'b2', hint: '(−3)(−9)', correctAnswer: '27' },
          { id: 'b3', hint: '(−2.4) × 5', correctAnswer: '-12' },
          { id: 'b4', hint: '15 − (−8)', correctAnswer: '23' },
          { id: 'b5', hint: '(−36) ÷ (−4)', correctAnswer: '9' },
        ],
      },
    },
    {
      id: 'g9m-u1l3-b4', lessonId: lesson3.id, section: 'PRACTICE' as const, blockType: 'MICRO_CHECK' as const, order: 4,
      content: {
        question: 'What is (−5.2) × (−3) + 1.4?',
        options: [
          { label: '14.2', value: 'a' },
          { label: '17.0', value: 'b', correct: true },
          { label: '−14.2', value: 'c' },
          { label: '−17.0', value: 'd' },
        ],
        explanation: '(−5.2)(−3) = 15.6 (negative × negative = positive). Then 15.6 + 1.4 = 17.0',
      },
    },
  ];

  for (const b of l3Blocks) {
    await prisma.lessonBlock.upsert({ where: { id: b.id }, update: { content: b.content, order: b.order }, create: b });
  }

  // ─── LESSON 4: Fraction Operations ───
  const lesson4 = await prisma.lesson.upsert({
    where: { id: 'g9-math-u1-l4' },
    update: { title: 'Add, Subtract, Multiply & Divide Fractions', subtitle: 'All four operations with positive and negative fractions', order: 4 },
    create: { id: 'g9-math-u1-l4', unitId, title: 'Add, Subtract, Multiply & Divide Fractions', subtitle: 'All four operations with positive and negative fractions', order: 4 },
  });

  const l4Blocks = [
    {
      id: 'g9m-u1l4-b1', lessonId: lesson4.id, section: 'LEARN' as const, blockType: 'TEXT' as const, order: 1,
      content: { html: '<h2>➗ Fraction Operations Review</h2><h3>Adding & Subtracting Fractions</h3><ol><li>Find a <strong>common denominator</strong>.</li><li>Convert each fraction.</li><li>Add or subtract the <strong>numerators</strong>.</li><li>Keep the denominator.</li><li>Simplify if possible.</li></ol><p><strong>Example:</strong> ⅔ + ¼ → 8/12 + 3/12 = 11/12</p><h3>Multiplying Fractions</h3><p>Multiply numerator × numerator and denominator × denominator. Simplify.</p><p><strong>Example:</strong> ⅔ × ¾ = 6/12 = ½</p><h3>Dividing Fractions</h3><p><strong>Keep, Change, Flip (KCF):</strong> Keep the first fraction, change ÷ to ×, flip the second fraction.</p><p><strong>Example:</strong> ⅔ ÷ ¼ = ⅔ × 4/1 = 8/3 = 2⅔</p>' },
    },
    {
      id: 'g9m-u1l4-b2', lessonId: lesson4.id, section: 'PRACTICE' as const, blockType: 'FILL_IN_BLANK' as const, order: 2,
      content: {
        prompt: 'Solve each fraction problem (simplify your answer):',
        blanks: [
          { id: 'b1', hint: '½ + ⅓', correctAnswer: '5/6' },
          { id: 'b2', hint: '¾ − ⅖', correctAnswer: '7/20' },
          { id: 'b3', hint: '⅔ × ⅜', correctAnswer: '1/4' },
          { id: 'b4', hint: '⅗ ÷ ¼', correctAnswer: '12/5' },
        ],
      },
    },
    {
      id: 'g9m-u1l4-b3', lessonId: lesson4.id, section: 'PRACTICE' as const, blockType: 'MULTIPLE_CHOICE' as const, order: 3,
      content: {
        question: 'What is (−⅔) × (⁹⁄₄)?',
        options: [
          { label: '−³⁄₂', value: 'a', correct: true },
          { label: '³⁄₂', value: 'b' },
          { label: '−⁶⁄₁₂', value: 'c' },
          { label: '²⁷⁄₈', value: 'd' },
        ],
        explanation: '(−2/3) × (9/4) = −18/12 = −3/2. Negative × Positive = Negative.',
      },
    },
  ];

  for (const b of l4Blocks) {
    await prisma.lessonBlock.upsert({ where: { id: b.id }, update: { content: b.content, order: b.order }, create: b });
  }

  // ─── LESSON 5: Rational Numbers Word Problems ───
  const lesson5 = await prisma.lesson.upsert({
    where: { id: 'g9-math-u1-l5' },
    update: { title: 'Rational Numbers Word Problems', subtitle: 'Applying rational number skills to real-world situations', order: 5 },
    create: { id: 'g9-math-u1-l5', unitId, title: 'Rational Numbers Word Problems', subtitle: 'Applying rational number skills to real-world situations', order: 5 },
  });

  const l5Blocks = [
    {
      id: 'g9m-u1l5-b1', lessonId: lesson5.id, section: 'LEARN' as const, blockType: 'TEXT' as const, order: 1,
      content: { html: '<h2>🌎 Rational Numbers in the Real World</h2><p>Now it is time to apply everything you have learned about rational numbers to solve real-world problems.</p><h3>Problem-Solving Strategy</h3><ol><li><strong>Read</strong> the problem carefully — what is being asked?</li><li><strong>Identify</strong> the numbers and operation(s) needed.</li><li><strong>Set up</strong> the expression or equation.</li><li><strong>Solve</strong> using proper rational number operations.</li><li><strong>Check</strong> — does your answer make sense?</li></ol>' },
    },
    {
      id: 'g9m-u1l5-b2', lessonId: lesson5.id, section: 'LEARN' as const, blockType: 'WORKED_EXAMPLE' as const, order: 2,
      content: {
        title: 'Temperature Change Problem',
        steps: [
          { instruction: 'Read the problem', detail: 'At 6 AM the temperature was −12.5°C. By noon it rose 8.3°C, then dropped 4.7°C by evening. What was the evening temperature?' },
          { instruction: 'Set up the expression', detail: '−12.5 + 8.3 − 4.7' },
          { instruction: 'Solve step by step', detail: '−12.5 + 8.3 = −4.2, then −4.2 − 4.7 = −8.9' },
          { instruction: 'Answer with units', detail: 'The evening temperature was −8.9°C.' },
        ],
      },
    },
    {
      id: 'g9m-u1l5-b3', lessonId: lesson5.id, section: 'PRACTICE' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 3,
      content: {
        prompt: 'A scuba diver is at −18.5 metres below sea level. She ascends ⅔ of the way to the surface. What is her new depth? Show all your work and explain each step.',
        rubricHint: 'Calculate ⅔ of 18.5 (the distance to ascend). Add that to −18.5 to find the new position. Include proper units.',
        minLength: 40,
      },
    },
    {
      id: 'g9m-u1l5-b4', lessonId: lesson5.id, section: 'PRACTICE' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 4,
      content: {
        prompt: 'Create your OWN word problem that requires at least two different operations with rational numbers (e.g., addition and multiplication). Then solve it, showing all your work.',
        rubricHint: 'Problem should involve at least 2 operations, use at least one negative number or fraction, and include a complete solution with steps.',
        minLength: 60,
      },
    },
  ];

  for (const b of l5Blocks) {
    await prisma.lessonBlock.upsert({ where: { id: b.id }, update: { content: b.content, order: b.order }, create: b });
  }

  console.log('✅ Math 9 Unit 1 seeded — 5 lessons with full content blocks');
}
