import { PrismaClient } from '@prisma/client';

export async function seedMath9(prisma: PrismaClient) {
  console.log('Seeding Math 9...');

  const math9 = await prisma.subject.upsert({
    where: { id: 'g9-math' },
    update: { active: true, icon: '📐', name: 'Mathematics' },
    create: {
      id: 'g9-math',
      gradeLevel: 9,
      name: 'Mathematics',
      icon: '📐',
      order: 3,
      active: true,
    },
  });

  // ─── UNIT 0: Foundations (prerequisite warm-up) ───
  const unit0 = await prisma.unit.upsert({
    where: { id: 'g9-math-u0' },
    update: { title: 'Foundations', description: 'Refresh your memory on previous years concepts and skills, including math facts, integers, and fractions.', icon: '🧱', order: 0 },
    create: {
      id: 'g9-math-u0',
      subjectId: math9.id,
      title: 'Foundations',
      description: 'Refresh your memory on previous years concepts and skills, including math facts, integers, and fractions.',
      icon: '🧱',
      order: 0,
    },
  });

  // Lesson 1 content generation for Unit 0
  const l1Content = [
    {
      id: 'math-9-u0-l1-b1',
      lessonId: 'g9-math-u0-l1',
      section: 'LEARN' as const,
      blockType: 'TEXT' as const,
      content: { html: '<h2>Welcome to Math 9!</h2><p>Before we dive into new Grade 9 concepts, we need to make sure our foundation is strong. Just like building a house, you cannot build a strong understanding of complex math without a solid foundation in the basics.</p>' },
      order: 1,
    },
    {
      id: 'math-9-u0-l1-b2',
      lessonId: 'g9-math-u0-l1',
      section: 'WARM_UP' as const,
      blockType: 'VOCABULARY' as const,
      content: {
        terms: [
          { term: '7 x 8', definition: '56' },
          { term: '9 x 6', definition: '54' },
          { term: '12 x 12', definition: '144' },
          { term: '64 / 8', definition: '8' },
          { term: '13 x 3', definition: '39' }
        ]
      },
      order: 2,
    },
    {
      id: 'math-9-u0-l1-b3',
      lessonId: 'g9-math-u0-l1',
      section: 'PRACTICE' as const,
      blockType: 'MICRO_CHECK' as const,
      content: {
        question: 'Solve: 5 + 3 x (8 - 2)',
        options: [
          { label: '48', value: 'a' },
          { label: '23', value: 'b', correct: true },
          { label: '32', value: 'c' },
          { label: '14', value: 'd' }
        ],
        explanation: 'Follow BEDMAS: First brackets (8-2=6). Then multiply (3x6=18). Then add (5+18=23).'
      },
      order: 3,
    }
  ];

  await prisma.lesson.upsert({
    where: { id: 'g9-math-u0-l1' },
    update: { title: 'Math Facts & Mental Math', subtitle: 'Building fluency with basic operations' },
    create: {
      id: 'g9-math-u0-l1',
      unitId: unit0.id,
      title: 'Math Facts & Mental Math',
      subtitle: 'Building fluency with basic operations',
      order: 1,
    },
  });

  for (const block of l1Content) {
    await prisma.lessonBlock.upsert({
      where: { id: block.id },
      update: { content: block.content, blockType: block.blockType, section: block.section, order: block.order },
      create: block,
    });
  }

  await prisma.lesson.upsert({
    where: { id: 'g9-math-u0-l2' },
    update: {},
    create: {
      id: 'g9-math-u0-l2',
      unitId: unit0.id,
      title: 'Working with Integers',
      subtitle: 'Adding, subtracting, multiplying, and dividing positive and negative numbers',
      order: 2,
    },
  });

  await prisma.lesson.upsert({
    where: { id: 'g9-math-u0-l3' },
    update: {},
    create: {
      id: 'g9-math-u0-l3',
      unitId: unit0.id,
      title: 'Mastering Fractions',
      subtitle: 'Operations with fractions and mixed numbers',
      order: 3,
    },
  });

  // ─── UNIT 1: Rational Numbers ───
  const unit1 = await prisma.unit.upsert({
    where: { id: 'g9-math-u1' },
    update: { title: 'Rational Numbers', description: 'Comparing, ordering, and performing operations on rational numbers in all forms.', icon: '🔢', order: 1 },
    create: {
      id: 'g9-math-u1',
      subjectId: math9.id,
      title: 'Rational Numbers',
      description: 'Comparing, ordering, and performing operations on rational numbers in all forms.',
      icon: '🔢',
      order: 1,
    },
  });

  await prisma.lesson.upsert({
    where: { id: 'g9-math-u1-l1' },
    update: { title: 'Comparing & Ordering Rational Numbers', subtitle: 'Fractions, decimals, and number lines' },
    create: { id: 'g9-math-u1-l1', unitId: unit1.id, title: 'Comparing & Ordering Rational Numbers', subtitle: 'Fractions, decimals, and number lines', order: 1 }
  });

  // ─── UNIT 2: Order of Operations ───
  const unit2 = await prisma.unit.upsert({
    where: { id: 'g9-math-u2' },
    update: { title: 'Order of Operations', description: 'Applying BEDMAS/PEMDAS with rational numbers, exponents, and multi-step problems.', icon: '📋', order: 2 },
    create: {
      id: 'g9-math-u2',
      subjectId: math9.id,
      title: 'Order of Operations',
      description: 'Applying BEDMAS/PEMDAS with rational numbers, exponents, and multi-step problems.',
      icon: '📋',
      order: 2,
    },
  });

  await prisma.lesson.upsert({
    where: { id: 'g9-math-u2-l1' },
    update: { title: 'BEDMAS with Rational Numbers', subtitle: 'Multi-step problems using order of operations' },
    create: { id: 'g9-math-u2-l1', unitId: unit2.id, title: 'BEDMAS with Rational Numbers', subtitle: 'Multi-step problems using order of operations', order: 1 }
  });

  // ─── UNIT 3: Linear Relations ───
  const unit3 = await prisma.unit.upsert({
    where: { id: 'g9-math-u3' },
    update: { title: 'Linear Relations', description: 'Graphing, analyzing, and interpreting linear relationships using tables, equations, and graphs.', icon: '📈', order: 3 },
    create: {
      id: 'g9-math-u3',
      subjectId: math9.id,
      title: 'Linear Relations',
      description: 'Graphing, analyzing, and interpreting linear relationships using tables, equations, and graphs.',
      icon: '📈',
      order: 3,
    },
  });

  await prisma.lesson.upsert({
    where: { id: 'g9-math-u3-l1' },
    update: { title: 'Graphing Linear Relations', subtitle: 'Tables of values, plotting points, and slope' },
    create: { id: 'g9-math-u3-l1', unitId: unit3.id, title: 'Graphing Linear Relations', subtitle: 'Tables of values, plotting points, and slope', order: 1 }
  });

  // ─── UNIT 4: Polynomials ───
  const unit4 = await prisma.unit.upsert({
    where: { id: 'g9-math-u4' },
    update: { title: 'Polynomials', description: 'Identifying, classifying, and performing operations on polynomial expressions.', icon: '✖️', order: 4 },
    create: {
      id: 'g9-math-u4',
      subjectId: math9.id,
      title: 'Polynomials',
      description: 'Identifying, classifying, and performing operations on polynomial expressions.',
      icon: '✖️',
      order: 4,
    },
  });

  await prisma.lesson.upsert({
    where: { id: 'g9-math-u4-l1' },
    update: { title: 'Understanding Polynomials', subtitle: 'Terms, degrees, and coefficients' },
    create: { id: 'g9-math-u4-l1', unitId: unit4.id, title: 'Understanding Polynomials', subtitle: 'Terms, degrees, and coefficients', order: 1 }
  });

  // ─── UNIT 5: Solving Equations ───
  const unit5 = await prisma.unit.upsert({
    where: { id: 'g9-math-u5' },
    update: { title: 'Solving Equations', description: 'Solving single-variable linear equations using inverse operations and verification.', icon: '⚖️', order: 5 },
    create: {
      id: 'g9-math-u5',
      subjectId: math9.id,
      title: 'Solving Equations',
      description: 'Solving single-variable linear equations using inverse operations and verification.',
      icon: '⚖️',
      order: 5,
    },
  });

  await prisma.lesson.upsert({
    where: { id: 'g9-math-u5-l1' },
    update: { title: 'One-Step & Two-Step Equations', subtitle: 'Using inverse operations to isolate the variable' },
    create: { id: 'g9-math-u5-l1', unitId: unit5.id, title: 'One-Step & Two-Step Equations', subtitle: 'Using inverse operations to isolate the variable', order: 1 }
  });

  // ─── UNIT 6: Inequalities ───
  const unit6 = await prisma.unit.upsert({
    where: { id: 'g9-math-u6' },
    update: { title: 'Inequalities', description: 'Solving and graphing single-variable linear inequalities on a number line.', icon: '↔️', order: 6 },
    create: {
      id: 'g9-math-u6',
      subjectId: math9.id,
      title: 'Inequalities',
      description: 'Solving and graphing single-variable linear inequalities on a number line.',
      icon: '↔️',
      order: 6,
    },
  });

  await prisma.lesson.upsert({
    where: { id: 'g9-math-u6-l1' },
    update: { title: 'Graphing Inequalities', subtitle: 'Number line representations and solution sets' },
    create: { id: 'g9-math-u6-l1', unitId: unit6.id, title: 'Graphing Inequalities', subtitle: 'Number line representations and solution sets', order: 1 }
  });

  // ─── UNIT 7: Exponents ───
  const unit7 = await prisma.unit.upsert({
    where: { id: 'g9-math-u7' },
    update: { title: 'Exponents', description: 'Powers, exponent laws, and operations with powers including negative exponents.', icon: '🔋', order: 7 },
    create: {
      id: 'g9-math-u7',
      subjectId: math9.id,
      title: 'Exponents',
      description: 'Powers, exponent laws, and operations with powers including negative exponents.',
      icon: '🔋',
      order: 7,
    },
  });

  await prisma.lesson.upsert({
    where: { id: 'g9-math-u7-l1' },
    update: { title: 'Powers and Exponent Laws', subtitle: 'Product, quotient, and power of a power rules' },
    create: { id: 'g9-math-u7-l1', unitId: unit7.id, title: 'Powers and Exponent Laws', subtitle: 'Product, quotient, and power of a power rules', order: 1 }
  });

  // ─── UNIT 8: 2D and 3D Geometry ───
  const unit8 = await prisma.unit.upsert({
    where: { id: 'g9-math-u8' },
    update: { title: '2D and 3D Geometry', description: 'Surface area and volume of 3D objects, composite shapes, and spatial reasoning.', icon: '📦', order: 8 },
    create: {
      id: 'g9-math-u8',
      subjectId: math9.id,
      title: '2D and 3D Geometry',
      description: 'Surface area and volume of 3D objects, composite shapes, and spatial reasoning.',
      icon: '📦',
      order: 8,
    },
  });

  await prisma.lesson.upsert({
    where: { id: 'g9-math-u8-l1' },
    update: { title: 'Surface Area & Volume', subtitle: 'Prisms, cylinders, and composite 3D shapes' },
    create: { id: 'g9-math-u8-l1', unitId: unit8.id, title: 'Surface Area & Volume', subtitle: 'Prisms, cylinders, and composite 3D shapes', order: 1 }
  });

  // ─── UNIT 9: Circle Geometry ───
  const unit9 = await prisma.unit.upsert({
    where: { id: 'g9-math-u9' },
    update: { title: 'Circle Geometry', description: 'Properties of circles including chords, central angles, inscribed angles, and tangent lines.', icon: '🟢', order: 9 },
    create: {
      id: 'g9-math-u9',
      subjectId: math9.id,
      title: 'Circle Geometry',
      description: 'Properties of circles including chords, central angles, inscribed angles, and tangent lines.',
      icon: '🟢',
      order: 9,
    },
  });

  await prisma.lesson.upsert({
    where: { id: 'g9-math-u9-l1' },
    update: { title: 'Circle Properties', subtitle: 'Chords, central angles, and inscribed angles' },
    create: { id: 'g9-math-u9-l1', unitId: unit9.id, title: 'Circle Properties', subtitle: 'Chords, central angles, and inscribed angles', order: 1 }
  });

  // ─── UNIT 10: Statistics ───
  const unit10 = await prisma.unit.upsert({
    where: { id: 'g9-math-u10' },
    update: { title: 'Statistics', description: 'Data collection methods, bias, sample vs. population, and interpreting statistical displays.', icon: '📊', order: 10 },
    create: {
      id: 'g9-math-u10',
      subjectId: math9.id,
      title: 'Statistics',
      description: 'Data collection methods, bias, sample vs. population, and interpreting statistical displays.',
      icon: '📊',
      order: 10,
    },
  });

  await prisma.lesson.upsert({
    where: { id: 'g9-math-u10-l1' },
    update: { title: 'Data Collection & Bias', subtitle: 'How data is gathered and interpreted' },
    create: { id: 'g9-math-u10-l1', unitId: unit10.id, title: 'Data Collection & Bias', subtitle: 'How data is gathered and interpreted', order: 1 }
  });

  console.log('✅ Math 9 Seeded — Unit 0 (Foundations) + 10 content units');
}
