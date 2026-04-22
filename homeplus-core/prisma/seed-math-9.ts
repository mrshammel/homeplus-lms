import { PrismaClient } from '@prisma/client';

export async function seedMath9(prisma: PrismaClient) {
  console.log('Seeding Math 9...');

  const math9 = await prisma.subject.upsert({
    where: { id: 'g9-math' },
    update: {},
    create: {
      id: 'g9-math',
      gradeLevel: 9,
      name: 'Mathematics',
      icon: '📐',
      order: 3,
      active: true,
    },
  });

  // UNIT 0: Foundations
  const unit0 = await prisma.unit.upsert({
    where: { id: 'g9-math-u0' },
    update: {},
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

  // UNIT 1: Number Sense
  const unit1 = await prisma.unit.upsert({
    where: { id: 'g9-math-u1' },
    update: {},
    create: {
      id: 'g9-math-u1',
      subjectId: math9.id,
      title: 'Number Sense',
      description: 'Powers, exponents, and rational numbers.',
      icon: '🔢',
      order: 1,
    },
  });

  await prisma.lesson.upsert({
    where: { id: 'g9-math-u1-l1' },
    update: {},
    create: { id: 'g9-math-u1-l1', unitId: unit1.id, title: 'Powers and Exponents', subtitle: 'Understanding bases and exponents', order: 1 }
  });

  await prisma.lesson.upsert({
    where: { id: 'g9-math-u1-l2' },
    update: {},
    create: { id: 'g9-math-u1-l2', unitId: unit1.id, title: 'Exponent Laws', subtitle: 'Multiplying and dividing powers', order: 2 }
  });

  // UNIT 2: Patterns & Relations
  const unit2 = await prisma.unit.upsert({
    where: { id: 'g9-math-u2' },
    update: {},
    create: {
      id: 'g9-math-u2',
      subjectId: math9.id,
      title: 'Patterns & Relations',
      description: 'Linear relations, equations, and inequalities.',
      icon: '📈',
      order: 2,
    },
  });

  await prisma.lesson.upsert({
    where: { id: 'g9-math-u2-l1' },
    update: {},
    create: { id: 'g9-math-u2-l1', unitId: unit2.id, title: 'Linear Relations', subtitle: 'Graphing and analyzing linear patterns', order: 1 }
  });

  // UNIT 3: Polynomials
  const unit3 = await prisma.unit.upsert({
    where: { id: 'g9-math-u3' },
    update: {},
    create: {
      id: 'g9-math-u3',
      subjectId: math9.id,
      title: 'Polynomials',
      description: 'Introduction to polynomial expressions and operations.',
      icon: '✖️',
      order: 3,
    },
  });

  await prisma.lesson.upsert({
    where: { id: 'g9-math-u3-l1' },
    update: {},
    create: { id: 'g9-math-u3-l1', unitId: unit3.id, title: 'Understanding Polynomials', subtitle: 'Terms, degrees, and coefficients', order: 1 }
  });

  // UNIT 4: Shape and Space
  const unit4 = await prisma.unit.upsert({
    where: { id: 'g9-math-u4' },
    update: {},
    create: {
      id: 'g9-math-u4',
      subjectId: math9.id,
      title: 'Shape and Space',
      description: 'Circle properties, surface area, and transformations.',
      icon: '🟢',
      order: 4,
    },
  });

  await prisma.lesson.upsert({
    where: { id: 'g9-math-u4-l1' },
    update: {},
    create: { id: 'g9-math-u4-l1', unitId: unit4.id, title: 'Circle Properties', subtitle: 'Chords, angles, and tangents', order: 1 }
  });

  // UNIT 5: Statistics and Probability
  const unit5 = await prisma.unit.upsert({
    where: { id: 'g9-math-u5' },
    update: {},
    create: {
      id: 'g9-math-u5',
      subjectId: math9.id,
      title: 'Statistics and Probability',
      description: 'Data collection, bias, and probability in society.',
      icon: '📊',
      order: 5,
    },
  });

  await prisma.lesson.upsert({
    where: { id: 'g9-math-u5-l1' },
    update: {},
    create: { id: 'g9-math-u5-l1', unitId: unit5.id, title: 'Data Collection & Bias', subtitle: 'How data is gathered and interpreted', order: 1 }
  });

  console.log('✅ Math 9 Seeded');
}
