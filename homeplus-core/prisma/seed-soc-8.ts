import { PrismaClient } from '@prisma/client';

export async function seedSocial8(prisma: PrismaClient) {
  console.log('Seeding Social Studies 8...');

  const social8 = await prisma.subject.upsert({
    where: { id: 'g8-social' },
    update: {},
    create: {
      id: 'g8-social',
      gradeLevel: 8,
      name: 'Social Studies',
      icon: '🌍',
      order: 4,
      active: true,
    },
  });

  // UNIT 1: Renaissance Europe
  const unit1 = await prisma.unit.upsert({
    where: { id: 'g8-soc-u1' },
    update: {},
    create: {
      id: 'g8-soc-u1',
      subjectId: social8.id,
      title: 'Origins of a Western Worldview: Renaissance Europe',
      description: 'Explore how the exchange of ideas and knowledge contributed to shaping the worldview of the Western world.',
      icon: '🎨',
      order: 1,
    },
  });

  const l1Content = [
    {
      id: 'soc-8-u1-l1-b1', lessonId: 'g8-soc-u1-l1', section: 'LEARN' as const, blockType: 'IMAGE' as const, order: 1,
      content: { url: '/artifacts/renaissance_market_1776880295378.png', caption: 'A vibrant market in a Renaissance city-state.' }
    },
    {
      id: 'soc-8-u1-l1-b2', lessonId: 'g8-soc-u1-l1', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 2,
      content: { html: '<h2>What was the Renaissance?</h2><p>The Renaissance (meaning "rebirth") was a period of cultural, artistic, political, and economic rebirth following the Middle Ages. It was a time of great curiosity, exploration, and new ways of thinking about the world and human potential.</p><p><em>Source: Our Worldviews, Chapter 1, Pages 14-15</em></p>' }
    },
    {
      id: 'soc-8-u1-l1-b3', lessonId: 'g8-soc-u1-l1', section: 'LEARN' as const, blockType: 'VIDEO' as const, order: 3,
      content: { videoId: 'Vufba_ZcoR0', title: 'The Renaissance: Was it a Thing?' }
    },
    {
      id: 'soc-8-u1-l1-b4', lessonId: 'g8-soc-u1-l1', section: 'CHECK' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 4,
      content: { prompt: 'Imagine you are a peasant during the Middle Ages. Suddenly, new ideas and trade begin flowing into your town. How might your worldview change?' }
    }
  ];

  await prisma.lesson.upsert({
    where: { id: 'g8-soc-u1-l1' },
    update: { title: 'The Dawn of the Renaissance', subtitle: 'What was the Renaissance and why did it happen?' },
    create: { id: 'g8-soc-u1-l1', unitId: unit1.id, title: 'The Dawn of the Renaissance', subtitle: 'What was the Renaissance and why did it happen?', order: 1 },
  });

  for (const block of l1Content) { await prisma.lessonBlock.upsert({ where: { id: block.id }, update: { content: block.content }, create: block }); }

  const l2Content = [
    {
      id: 'soc-8-u1-l2-b1', lessonId: 'g8-soc-u1-l2', section: 'LEARN' as const, blockType: 'IMAGE' as const, order: 1,
      content: { url: '/artifacts/silk_road_caravan_1776880307939.png', caption: 'A caravan of merchants crossing the vast Silk Road.' }
    },
    {
      id: 'soc-8-u1-l2-b2', lessonId: 'g8-soc-u1-l2', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 2,
      content: { html: '<h2>The Crossroads of Ideas</h2><p>Imagine you are a trader crossing the deserts of Asia. You are carrying not just silk and spices, but new ideas, mathematics, and science from the Islamic Empire. The Islamic Empire preserved ancient knowledge that would eventually spark the Renaissance in Europe.</p><p><em>Source: Our Worldviews, Chapter 1, Pages 16-18</em></p>' }
    },
    {
      id: 'soc-8-u1-l2-b3', lessonId: 'g8-soc-u1-l2', section: 'PRACTICE' as const, blockType: 'MATCHING' as const, order: 3,
      content: {
        pairs: [
          { left: 'Astrolabe', right: 'An instrument used for navigation' },
          { left: 'Crusade', right: 'A medieval Christian military expedition' },
          { left: 'Silk Road', right: 'A network of trading routes to China' }
        ]
      }
    }
  ];

  await prisma.lesson.upsert({
    where: { id: 'g8-soc-u1-l2' },
    update: { title: 'Crossroads of Ideas', subtitle: 'The Silk Road and Islamic Civilization' },
    create: { id: 'g8-soc-u1-l2', unitId: unit1.id, title: 'Crossroads of Ideas', subtitle: 'The Silk Road and Islamic Civilization', order: 2 },
  });
  for (const block of l2Content) { await prisma.lessonBlock.upsert({ where: { id: block.id }, update: { content: block.content }, create: block }); }

  const l3Content = [
    {
      id: 'soc-8-u1-l3-b1', lessonId: 'g8-soc-u1-l3', section: 'LEARN' as const, blockType: 'IMAGE' as const, order: 1,
      content: { url: '/artifacts/venice_port_1776880324449.png', caption: 'The bustling port of Venice brought immense wealth.' }
    },
    {
      id: 'soc-8-u1-l3-b2', lessonId: 'g8-soc-u1-l3', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 2,
      content: { html: '<h2>City-States and Trade</h2><p>Because of their location on the Mediterranean Sea, Italian city-states like Florence, Venice, and Genoa grew incredibly wealthy. This wealth funded artists, architects, and thinkers.</p><p><em>Source: Our Worldviews, Chapter 1, Pages 22-25</em></p>' }
    },
    {
      id: 'soc-8-u1-l3-b3', lessonId: 'g8-soc-u1-l3', section: 'CHECK' as const, blockType: 'DRAWING' as const, order: 3,
      content: { prompt: 'Draw what you think a wealthy merchant ship from Venice would look like arriving in port.' }
    }
  ];

  await prisma.lesson.upsert({
    where: { id: 'g8-soc-u1-l3' },
    update: { title: 'City-States and Trade', subtitle: 'The economic engine of the Renaissance' },
    create: { id: 'g8-soc-u1-l3', unitId: unit1.id, title: 'City-States and Trade', subtitle: 'The economic engine of the Renaissance', order: 3 },
  });
  for (const block of l3Content) { await prisma.lessonBlock.upsert({ where: { id: block.id }, update: { content: block.content }, create: block }); }

  const l4Content = [
    {
      id: 'soc-8-u1-l4-b1', lessonId: 'g8-soc-u1-l4', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 1,
      content: { html: '<h2>The Rise of Humanism</h2><p>A new way of thinking called <strong>humanism</strong> emerged during the Renaissance. Thinkers believed in the potential and value of human beings, shifting focus away from the strict religious views of the Middle Ages.</p><p><em>Source: Our Worldviews, Chapter 3</em></p>' }
    },
    {
      id: 'soc-8-u1-l4-b2', lessonId: 'g8-soc-u1-l4', section: 'PRACTICE' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 2,
      content: { prompt: 'Modern Connection: Do you think our society today is more like the Middle Ages (focused on strict rules and afterlife) or the Renaissance (focused on human potential and science)? Explain your choice.' }
    }
  ];

  await prisma.lesson.upsert({
    where: { id: 'g8-soc-u1-l4' },
    update: { title: 'The Rise of Humanism', subtitle: 'A new focus on human potential' },
    create: { id: 'g8-soc-u1-l4', unitId: unit1.id, title: 'The Rise of Humanism', subtitle: 'A new focus on human potential', order: 4 },
  });
  for (const block of l4Content) { await prisma.lessonBlock.upsert({ where: { id: block.id }, update: { content: block.content }, create: block }); }

  await prisma.lesson.upsert({
    where: { id: 'g8-soc-u1-l5' },
    update: { title: 'The Spread of Ideas', subtitle: 'How the Renaissance moved across Europe' },
    create: { id: 'g8-soc-u1-l5', unitId: unit1.id, title: 'The Spread of Ideas', subtitle: 'How the Renaissance moved across Europe', order: 5 },
  });

  // UNIT 2: The Spanish and the Aztecs
  const unit2 = await prisma.unit.upsert({
    where: { id: 'g8-soc-u2' },
    update: {},
    create: {
      id: 'g8-soc-u2',
      subjectId: social8.id,
      title: 'Worldviews in Conflict: The Spanish and the Aztecs',
      description: 'Examine how intercultural contact affects the worldviews of societies.',
      icon: '⚔️',
      order: 2,
    },
  });

  await prisma.lesson.upsert({ where: { id: 'g8-soc-u2-l1' }, update: {}, create: { id: 'g8-soc-u2-l1', unitId: unit2.id, title: 'The Aztec Empire', subtitle: 'Worldview of the Aztec civilization before contact', order: 1 } });
  await prisma.lesson.upsert({ where: { id: 'g8-soc-u2-l2' }, update: {}, create: { id: 'g8-soc-u2-l2', unitId: unit2.id, title: 'The Spanish Empire', subtitle: 'The expansionist worldview of Spain', order: 2 } });

  // UNIT 3: Japan
  const unit3 = await prisma.unit.upsert({
    where: { id: 'g8-soc-u3' },
    update: {},
    create: {
      id: 'g8-soc-u3',
      subjectId: social8.id,
      title: 'From Isolation to Adaptation: Japan',
      description: 'Explore the effects of cultural isolation and rapid adaptation in Japan.',
      icon: '🗾',
      order: 3,
    },
  });

  await prisma.lesson.upsert({ where: { id: 'g8-soc-u3-l1' }, update: {}, create: { id: 'g8-soc-u3-l1', unitId: unit3.id, title: 'Edo Period Isolation', subtitle: 'The causes and effects of cultural isolation', order: 1 } });
  await prisma.lesson.upsert({ where: { id: 'g8-soc-u3-l2' }, update: {}, create: { id: 'g8-soc-u3-l2', unitId: unit3.id, title: 'Meiji Restoration', subtitle: 'Rapid adaptation to a changing world', order: 2 } });

  console.log('✅ Social Studies 8 Seeded');
}
