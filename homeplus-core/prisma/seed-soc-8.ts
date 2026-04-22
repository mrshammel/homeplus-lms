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
      content: { url: '/artifacts/renaissance_market_1776885608449.png', caption: 'A vibrant market in a Renaissance city-state.' }
    },
    {
      id: 'soc-8-u1-l1-b2', lessonId: 'g8-soc-u1-l1', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 2,
      content: { html: '<h2>What was the Renaissance?</h2><p>The Renaissance (meaning "rebirth") was a period of cultural, artistic, political, and economic rebirth following the Middle Ages. It was a time of great curiosity, exploration, and new ways of thinking about the world and human potential.</p><p><strong>Digital Textbook:</strong> <a href="https://drive.google.com/file/d/1XafqjjOwYXY3iNu48KZ_cF4Oo5KKopkz/view?usp=drive_link" target="_blank" style="color: #2563eb; font-weight: bold; text-decoration: underline;">Open Our Worldviews, Chapter 1, Pages 14-15</a></p>' }
    },
    {
      id: 'soc-8-u1-l1-b2b', lessonId: 'g8-soc-u1-l1', section: 'PRACTICE' as const, blockType: 'MATCHING' as const, order: 3,
      content: {
        instruction: 'Match the terms to their definitions:',
        pairs: [
          { left: 'Renaissance', right: 'Rebirth of culture and art' },
          { left: 'Middle Ages', right: 'The period before the Renaissance' },
          { left: 'Worldview', right: 'A collection of beliefs about life and the universe' }
        ]
      }
    },
    {
      id: 'soc-8-u1-l1-b3', lessonId: 'g8-soc-u1-l1', section: 'LEARN' as const, blockType: 'VIDEO' as const, order: 4,
      content: { url: 'https://www.youtube.com/watch?v=Vufba_ZcoR0', title: 'The Renaissance: Was it a Thing?' }
    },
    {
      id: 'soc-8-u1-l1-b3b', lessonId: 'g8-soc-u1-l1', section: 'CHECK' as const, blockType: 'AI_SUMMARY' as const, order: 5,
      content: { summary: 'What you should know before you start the Mastery Check: You should understand what the Renaissance was (a rebirth), when it occurred (after the Middle Ages), and how it shifted the medieval worldview toward human potential.' }
    },
    {
      id: 'soc-8-u1-l1-b4', lessonId: 'g8-soc-u1-l1', section: 'CHECK' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 6,
      content: { 
        prompt: 'Imagine you are a peasant during the Middle Ages. Suddenly, new ideas and trade begin flowing into your town. How might your worldview change?',
        rubricHint: 'Mention how strict rules from the Middle Ages might be questioned, and how human potential and new discoveries might become more important to you.',
        minLength: 15
      }
    },
    {
      id: 'soc-8-u1-l1-b5', lessonId: 'g8-soc-u1-l1', section: 'CHECK' as const, blockType: 'DRAWING' as const, order: 7,
      content: { prompt: 'Draw an object or symbol that represents the idea of "rebirth" or "new ideas flowing in".' }
    }
  ];

  await prisma.lesson.upsert({
    where: { id: 'g8-soc-u1-l1' },
    update: { title: 'The Dawn of the Renaissance', subtitle: 'What was the Renaissance and why did it happen?', materials: 'Notebook, Pen, Digital Textbook' },
    create: { id: 'g8-soc-u1-l1', unitId: unit1.id, title: 'The Dawn of the Renaissance', subtitle: 'What was the Renaissance and why did it happen?', order: 1, materials: 'Notebook, Pen, Digital Textbook' },
  });

  for (const block of l1Content) { await prisma.lessonBlock.upsert({ where: { id: block.id }, update: { content: block.content, blockType: block.blockType, section: block.section, order: block.order }, create: block }); }

  const l2Content = [
    {
      id: 'soc-8-u1-l2-b1', lessonId: 'g8-soc-u1-l2', section: 'LEARN' as const, blockType: 'IMAGE' as const, order: 1,
      content: { url: '/artifacts/silk_road_caravan_1776885620897.png', caption: 'A caravan of merchants crossing the vast Silk Road.' }
    },
    {
      id: 'soc-8-u1-l2-b2', lessonId: 'g8-soc-u1-l2', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 2,
      content: { html: '<h2>The Crossroads of Ideas</h2><p>Imagine you are a trader crossing the deserts of Asia. You are carrying not just silk and spices, but new ideas, mathematics, and science from the Islamic Empire. The Islamic Empire preserved ancient knowledge that would eventually spark the Renaissance in Europe.</p><p><strong>Digital Textbook:</strong> <a href="https://drive.google.com/file/d/1XafqjjOwYXY3iNu48KZ_cF4Oo5KKopkz/view?usp=drive_link" target="_blank" style="color: #2563eb; font-weight: bold; text-decoration: underline;">Open Our Worldviews, Chapter 1, Pages 16-18</a></p>' }
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
  for (const block of l2Content) { await prisma.lessonBlock.upsert({ where: { id: block.id }, update: { content: block.content, blockType: block.blockType, section: block.section, order: block.order }, create: block }); }

  const l3Content = [
    {
      id: 'soc-8-u1-l3-b1', lessonId: 'g8-soc-u1-l3', section: 'LEARN' as const, blockType: 'IMAGE' as const, order: 1,
      content: { url: '/artifacts/venice_port_1776885632947.png', caption: 'The bustling port of Venice brought immense wealth.' }
    },
    {
      id: 'soc-8-u1-l3-b2', lessonId: 'g8-soc-u1-l3', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 2,
      content: { html: '<h2>City-States and Trade</h2><p>Because of their location on the Mediterranean Sea, Italian city-states like Florence, Venice, and Genoa grew incredibly wealthy. This wealth funded artists, architects, and thinkers.</p><p><strong>Digital Textbook:</strong> <a href="https://drive.google.com/file/d/1XafqjjOwYXY3iNu48KZ_cF4Oo5KKopkz/view?usp=drive_link" target="_blank" style="color: #2563eb; font-weight: bold; text-decoration: underline;">Open Our Worldviews, Chapter 1, Pages 22-25</a></p>' }
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
  for (const block of l3Content) { await prisma.lessonBlock.upsert({ where: { id: block.id }, update: { content: block.content, blockType: block.blockType, section: block.section, order: block.order }, create: block }); }

  const l4Content = [
    {
      id: 'soc-8-u1-l4-b1', lessonId: 'g8-soc-u1-l4', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 1,
      content: { html: '<h2>The Rise of Humanism</h2><p>A new way of thinking called <strong>humanism</strong> emerged during the Renaissance. Thinkers believed in the potential and value of human beings, shifting focus away from the strict religious views of the Middle Ages.</p><p><strong>Digital Textbook:</strong> <a href="https://drive.google.com/file/d/1t_JWPGiH4_FEz15e5OCUyp9TMxgsK6oF/view?usp=sharing" target="_blank" style="color: #2563eb; font-weight: bold; text-decoration: underline;">Open Our Worldviews, Chapter 3</a></p>' }
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
  for (const block of l4Content) { await prisma.lessonBlock.upsert({ where: { id: block.id }, update: { content: block.content, blockType: block.blockType, section: block.section, order: block.order }, create: block }); }

  const l5Content = [
    {
      id: 'soc-8-u1-l5-b1', lessonId: 'g8-soc-u1-l5', section: 'LEARN' as const, blockType: 'IMAGE' as const, order: 1,
      content: { url: '/artifacts/printing_press_renaissance_1776884390725.png', caption: 'The Gutenberg printing press revolutionized how information was shared.' }
    },
    {
      id: 'soc-8-u1-l5-b2', lessonId: 'g8-soc-u1-l5', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 2,
      content: { html: '<h2>The Spread of Ideas</h2><p>Before the Renaissance, books were copied by hand, making them incredibly expensive and rare. Johannes Gutenberg invented the mechanical printing press around 1440. This allowed humanist ideas, scientific discoveries, and new worldviews to spread rapidly across Europe, fundamentally changing society.</p><p><strong>Digital Textbook:</strong> <a href="https://drive.google.com/file/d/1NPjiws8EGsTbuhU3GrXWJh4tWTLN5fa8/view?usp=sharing" target="_blank" style="color: #2563eb; font-weight: bold; text-decoration: underline;">Open Our Worldviews, Chapter 2</a></p>' }
    },
    {
      id: 'soc-8-u1-l5-b3', lessonId: 'g8-soc-u1-l5', section: 'LEARN' as const, blockType: 'VIDEO' as const, order: 3,
      content: { url: 'https://www.youtube.com/watch?v=04pOSA4cGTE', title: 'The Printing Press and the Renaissance' }
    },
    {
      id: 'soc-8-u1-l5-b4', lessonId: 'g8-soc-u1-l5', section: 'CHECK' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 4,
      content: { prompt: 'How is the invention of the printing press similar to the invention of the internet in how it changed the world?' }
    }
  ];

  await prisma.lesson.upsert({
    where: { id: 'g8-soc-u1-l5' },
    update: { title: 'The Spread of Ideas', subtitle: 'How the Renaissance moved across Europe' },
    create: { id: 'g8-soc-u1-l5', unitId: unit1.id, title: 'The Spread of Ideas', subtitle: 'How the Renaissance moved across Europe', order: 5 },
  });
  for (const block of l5Content) { await prisma.lessonBlock.upsert({ where: { id: block.id }, update: { content: block.content, blockType: block.blockType, section: block.section, order: block.order }, create: block }); }

  // ── Warm-ups for existing U1 lessons (L2-L5) ──
  const u1Warmups = [
    { id: 'soc-8-u1-l2-wu', lessonId: 'g8-soc-u1-l2', section: 'WARM_UP' as const, blockType: 'MATCHING' as const, order: 0, content: { instruction: 'Quick recall from last lesson:', pairs: [{ left: 'Renaissance', right: 'Rebirth of culture and ideas' }, { left: 'Middle Ages', right: 'Period before the Renaissance' }] } },
    { id: 'soc-8-u1-l3-wu', lessonId: 'g8-soc-u1-l3', section: 'WARM_UP' as const, blockType: 'MICRO_CHECK' as const, order: 0, content: { question: 'Which civilization preserved ancient Greek and Roman knowledge that helped spark the Renaissance?', options: [{ label: 'The Roman Empire', value: 'a' }, { label: 'The Islamic Empire', value: 'b', correct: true }, { label: 'The British Empire', value: 'c' }, { label: 'The Mongol Empire', value: 'd' }], explanation: 'The Islamic Empire preserved and built upon ancient knowledge in math, science, and philosophy, which later reached Europe via trade routes.' } },
    { id: 'soc-8-u1-l4-wu', lessonId: 'g8-soc-u1-l4', section: 'WARM_UP' as const, blockType: 'MICRO_CHECK' as const, order: 0, content: { question: 'Why did Italian city-states like Florence and Venice become centres of the Renaissance?', options: [{ label: 'They had the largest armies', value: 'a' }, { label: 'They grew wealthy from trade', value: 'b', correct: true }, { label: 'They were the oldest cities', value: 'c' }, { label: 'They had the best farmland', value: 'd' }], explanation: 'Their strategic location on the Mediterranean Sea made them wealthy trading hubs. This wealth funded artists, architects, and thinkers.' } },
    { id: 'soc-8-u1-l5-wu', lessonId: 'g8-soc-u1-l5', section: 'WARM_UP' as const, blockType: 'MATCHING' as const, order: 0, content: { instruction: 'Match concepts from previous lessons:', pairs: [{ left: 'Humanism', right: 'Focus on human potential and value' }, { left: 'City-State', right: 'Independent city with its own government' }, { left: 'Silk Road', right: 'Trade route connecting East and West' }] } },
  ];
  for (const block of u1Warmups) { await prisma.lessonBlock.upsert({ where: { id: block.id }, update: { content: block.content, blockType: block.blockType, section: block.section, order: block.order }, create: block }); }

  // ── U1 L6: Art, Architecture, and Expression ──
  const l6Content = [
    { id: 'soc-8-u1-l6-wu', lessonId: 'g8-soc-u1-l6', section: 'WARM_UP' as const, blockType: 'MICRO_CHECK' as const, order: 0, content: { question: 'What was humanism?', options: [{ label: 'A religion that replaced Christianity', value: 'a' }, { label: 'A belief in human potential and value', value: 'b', correct: true }, { label: 'A type of government', value: 'c' }, { label: 'A method of farming', value: 'd' }], explanation: 'Humanism was a philosophy that emphasized human potential, reason, and individual achievement over strict medieval religious authority.' } },
    { id: 'soc-8-u1-l6-b1', lessonId: 'g8-soc-u1-l6', section: 'LEARN' as const, blockType: 'IMAGE' as const, order: 1, content: { url: '/artifacts/renaissance_art_studio.png', caption: 'A Renaissance artist at work in their studio, surrounded by sketches and sculptures.' } },
    { id: 'soc-8-u1-l6-b2', lessonId: 'g8-soc-u1-l6', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 2, content: { html: '<h2>Art, Architecture, and Expression</h2><p>The Renaissance produced some of the most famous artworks in history. Artists like <strong>Leonardo da Vinci</strong>, <strong>Michelangelo</strong>, and <strong>Raphael</strong> used new techniques like <strong>perspective</strong> and <strong>realism</strong> to create lifelike paintings and sculptures. Their work reflected humanist values — celebrating the beauty and potential of human beings.</p><p><strong>Digital Textbook:</strong> <a href="https://drive.google.com/file/d/1NPjiws8EGsTbuhU3GrXWJh4tWTLN5fa8/view?usp=sharing" target="_blank" style="color: #2563eb; font-weight: bold; text-decoration: underline;">Open Our Worldviews, Chapter 2</a></p>' } },
    { id: 'soc-8-u1-l6-b3', lessonId: 'g8-soc-u1-l6', section: 'PRACTICE' as const, blockType: 'MATCHING' as const, order: 3, content: { instruction: 'Match the artist to their famous work:', pairs: [{ left: 'Leonardo da Vinci', right: 'Mona Lisa' }, { left: 'Michelangelo', right: 'Sistine Chapel Ceiling' }, { left: 'Raphael', right: 'The School of Athens' }] } },
    { id: 'soc-8-u1-l6-b4', lessonId: 'g8-soc-u1-l6', section: 'CHECK' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 4, content: { prompt: 'How did Renaissance art reflect the new humanist worldview? Give a specific example of how art changed from the Middle Ages to the Renaissance.', rubricHint: 'Students should contrast flat, religious-focused medieval art with realistic, human-centered Renaissance art. Mentioning perspective, realism, or a specific artist earns full marks.', minLength: 20 } },
  ];
  await prisma.lesson.upsert({ where: { id: 'g8-soc-u1-l6' }, update: { title: 'Art, Architecture, and Expression', subtitle: 'How art reflected the new Renaissance worldview' }, create: { id: 'g8-soc-u1-l6', unitId: unit1.id, title: 'Art, Architecture, and Expression', subtitle: 'How art reflected the new Renaissance worldview', order: 6, materials: 'Notebook, Pen, Digital Textbook' } });
  for (const block of l6Content) { await prisma.lessonBlock.upsert({ where: { id: block.id }, update: { content: block.content, blockType: block.blockType, section: block.section, order: block.order }, create: block }); }

  // ── U1 L7: The Reformation and its Impact ──
  const l7Content = [
    { id: 'soc-8-u1-l7-wu', lessonId: 'g8-soc-u1-l7', section: 'WARM_UP' as const, blockType: 'MICRO_CHECK' as const, order: 0, content: { question: 'What invention allowed ideas to spread rapidly across Europe?', options: [{ label: 'The telescope', value: 'a' }, { label: 'The printing press', value: 'b', correct: true }, { label: 'The compass', value: 'c' }, { label: 'The steam engine', value: 'd' }], explanation: 'Gutenberg\'s printing press (c. 1440) made books affordable and allowed humanist ideas, scientific discoveries, and religious critiques to spread rapidly.' } },
    { id: 'soc-8-u1-l7-b1', lessonId: 'g8-soc-u1-l7', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 1, content: { html: '<h2>The Reformation and its Impact</h2><p>In 1517, a German monk named <strong>Martin Luther</strong> challenged the Catholic Church by posting his <strong>95 Theses</strong> — a list of criticisms about Church practices. Thanks to the printing press, his ideas spread like wildfire across Europe. This led to the <strong>Protestant Reformation</strong>, which split Christianity and changed the political landscape of Europe forever.</p><p><strong>Digital Textbook:</strong> <a href="https://drive.google.com/file/d/1t_JWPGiH4_FEz15e5OCUyp9TMxgsK6oF/view?usp=sharing" target="_blank" style="color: #2563eb; font-weight: bold; text-decoration: underline;">Open Our Worldviews, Chapter 3</a></p>' } },
    { id: 'soc-8-u1-l7-b2', lessonId: 'g8-soc-u1-l7', section: 'PRACTICE' as const, blockType: 'MATCHING' as const, order: 2, content: { instruction: 'Match the terms:', pairs: [{ left: 'Martin Luther', right: 'Challenged the Catholic Church with 95 Theses' }, { left: 'Protestant', right: 'Christians who broke away from the Catholic Church' }, { left: 'Reformation', right: 'Movement to reform religious practices' }] } },
    { id: 'soc-8-u1-l7-b3', lessonId: 'g8-soc-u1-l7', section: 'CHECK' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 3, content: { prompt: 'How did the printing press help Martin Luther spread his ideas? Could the Reformation have happened without it?', rubricHint: 'Students should connect the printing press to mass distribution of the 95 Theses. Strong responses will argue that without printing, Luther\'s ideas would have stayed local.', minLength: 20 } },
  ];
  await prisma.lesson.upsert({ where: { id: 'g8-soc-u1-l7' }, update: { title: 'The Reformation and its Impact', subtitle: 'How questioning authority changed Europe' }, create: { id: 'g8-soc-u1-l7', unitId: unit1.id, title: 'The Reformation and its Impact', subtitle: 'How questioning authority changed Europe', order: 7, materials: 'Notebook, Pen, Digital Textbook' } });
  for (const block of l7Content) { await prisma.lessonBlock.upsert({ where: { id: block.id }, update: { content: block.content, blockType: block.blockType, section: block.section, order: block.order }, create: block }); }

  // ── U1 L8: The Scientific Revolution ──
  const l8Content = [
    { id: 'soc-8-u1-l8-wu', lessonId: 'g8-soc-u1-l8', section: 'WARM_UP' as const, blockType: 'MATCHING' as const, order: 0, content: { instruction: 'Recall from previous lessons:', pairs: [{ left: 'Humanism', right: 'Belief in human potential and reason' }, { left: 'Martin Luther', right: 'Challenged the Catholic Church' }, { left: 'Printing Press', right: 'Spread ideas rapidly across Europe' }] } },
    { id: 'soc-8-u1-l8-b1', lessonId: 'g8-soc-u1-l8', section: 'LEARN' as const, blockType: 'IMAGE' as const, order: 1, content: { url: '/artifacts/scientific_revolution.png', caption: 'Galileo observing the heavens with his telescope, challenging centuries of accepted belief.' } },
    { id: 'soc-8-u1-l8-b2', lessonId: 'g8-soc-u1-l8', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 2, content: { html: '<h2>The Scientific Revolution</h2><p>Inspired by the humanist belief in reason and observation, thinkers like <strong>Copernicus</strong>, <strong>Galileo</strong>, and <strong>Newton</strong> began questioning traditional beliefs about the natural world. Copernicus proposed that the Earth orbited the Sun (not the other way around). Galileo used the telescope to prove it. These discoveries laid the foundation for modern science.</p><p><strong>Digital Textbook:</strong> <a href="https://drive.google.com/file/d/1t_JWPGiH4_FEz15e5OCUyp9TMxgsK6oF/view?usp=sharing" target="_blank" style="color: #2563eb; font-weight: bold; text-decoration: underline;">Open Our Worldviews, Chapter 3</a></p>' } },
    { id: 'soc-8-u1-l8-b3', lessonId: 'g8-soc-u1-l8', section: 'PRACTICE' as const, blockType: 'MATCHING' as const, order: 3, content: { instruction: 'Match the scientist to their contribution:', pairs: [{ left: 'Copernicus', right: 'Proposed the Sun was the centre of the solar system' }, { left: 'Galileo', right: 'Used a telescope to support Copernicus' }, { left: 'Newton', right: 'Discovered the laws of gravity and motion' }] } },
    { id: 'soc-8-u1-l8-b4', lessonId: 'g8-soc-u1-l8', section: 'CHECK' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 4, content: { prompt: 'Why was the Scientific Revolution considered dangerous by many people in power at the time? What does this tell us about how worldviews can be threatened by new ideas?', rubricHint: 'Students should explain that scientific discoveries challenged the Church\'s authority and traditional beliefs. Strong responses connect this to how established worldviews resist change.', minLength: 20 } },
  ];
  await prisma.lesson.upsert({ where: { id: 'g8-soc-u1-l8' }, update: { title: 'The Scientific Revolution', subtitle: 'When observation replaced tradition' }, create: { id: 'g8-soc-u1-l8', unitId: unit1.id, title: 'The Scientific Revolution', subtitle: 'When observation replaced tradition', order: 8, materials: 'Notebook, Pen, Digital Textbook' } });
  for (const block of l8Content) { await prisma.lessonBlock.upsert({ where: { id: block.id }, update: { content: block.content, blockType: block.blockType, section: block.section, order: block.order }, create: block }); }

  // ── U1 L9: Unit 1 Review and Reflection ──
  const l9Content = [
    { id: 'soc-8-u1-l9-wu', lessonId: 'g8-soc-u1-l9', section: 'WARM_UP' as const, blockType: 'MATCHING' as const, order: 0, content: { instruction: 'Cumulative review — match these key concepts from Unit 1:', pairs: [{ left: 'Renaissance', right: 'Rebirth of culture after the Middle Ages' }, { left: 'Gutenberg', right: 'Invented the printing press' }, { left: 'Galileo', right: 'Used a telescope to prove Copernicus right' }, { left: 'Reformation', right: 'Movement that split Christianity' }] } },
    { id: 'soc-8-u1-l9-b1', lessonId: 'g8-soc-u1-l9', section: 'LEARN' as const, blockType: 'AI_SUMMARY' as const, order: 1, content: { summary: 'Unit 1 Summary: You have learned how the Renaissance began through trade and the exchange of ideas, how wealthy city-states funded art and learning, how humanism shifted thinking toward human potential, how the printing press spread ideas rapidly, how art reflected new worldviews, how the Reformation challenged religious authority, and how the Scientific Revolution laid the foundation for modern science.' } },
    { id: 'soc-8-u1-l9-b2', lessonId: 'g8-soc-u1-l9', section: 'CHECK' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 2, content: { prompt: 'Looking back at the entire Renaissance unit: Which single development (trade, humanism, printing press, art, Reformation, or Scientific Revolution) do you think had the BIGGEST impact on shaping the Western worldview? Defend your choice with at least two reasons.', rubricHint: 'Students must pick ONE development, state it clearly, and provide two supporting reasons. Accept any well-defended choice. Strong answers will connect their choice to lasting impacts we still see today.', minLength: 30 } },
    { id: 'soc-8-u1-l9-b3', lessonId: 'g8-soc-u1-l9', section: 'CHECK' as const, blockType: 'DRAWING' as const, order: 3, content: { prompt: 'Create a timeline sketch showing the key events of the Renaissance in order. Include at least 5 events from the unit.' } },
  ];
  await prisma.lesson.upsert({ where: { id: 'g8-soc-u1-l9' }, update: { title: 'Unit 1 Review and Reflection', subtitle: 'Consolidating your understanding of the Renaissance' }, create: { id: 'g8-soc-u1-l9', unitId: unit1.id, title: 'Unit 1 Review and Reflection', subtitle: 'Consolidating your understanding of the Renaissance', order: 9, materials: 'Notebook, Pen' } });
  for (const block of l9Content) { await prisma.lessonBlock.upsert({ where: { id: block.id }, update: { content: block.content, blockType: block.blockType, section: block.section, order: block.order }, create: block }); }

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

  const u2l1Content = [
    {
      id: 'soc-8-u2-l1-b1', lessonId: 'g8-soc-u2-l1', section: 'LEARN' as const, blockType: 'IMAGE' as const, order: 1,
      content: { url: '/artifacts/tenochtitlan_aztec_city_1776884402123.png', caption: 'The magnificent Aztec capital of Tenochtitlan, built on a lake.' }
    },
    {
      id: 'soc-8-u2-l1-b2', lessonId: 'g8-soc-u2-l1', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 2,
      content: { html: '<h2>The Aztec Empire</h2><p>The Aztecs built a vast and powerful empire in central Mexico. Their worldview was deeply tied to their religion, believing that the gods required human sacrifice to keep the universe in balance. They were also brilliant engineers and fierce warriors.</p><p><strong>Digital Textbook:</strong> <a href="https://drive.google.com/file/d/1MCcgcwL3fHGvuxq8Oa8uNXuHWdfU_o9I/view?usp=drive_link" target="_blank" style="color: #2563eb; font-weight: bold; text-decoration: underline;">Open Our Worldviews, Chapter 7</a></p>' }
    },
    {
      id: 'soc-8-u2-l1-b3', lessonId: 'g8-soc-u2-l1', section: 'PRACTICE' as const, blockType: 'DRAWING' as const, order: 3,
      content: { prompt: 'Sketch out a diagram of an Aztec chinampa (floating garden) based on what you have learned.' }
    }
  ];

  await prisma.lesson.upsert({ where: { id: 'g8-soc-u2-l1' }, update: { title: 'The Aztec Empire', subtitle: 'Worldview of the Aztec civilization before contact' }, create: { id: 'g8-soc-u2-l1', unitId: unit2.id, title: 'The Aztec Empire', subtitle: 'Worldview of the Aztec civilization before contact', order: 1 } });
  for (const block of u2l1Content) { await prisma.lessonBlock.upsert({ where: { id: block.id }, update: { content: block.content, blockType: block.blockType, section: block.section, order: block.order }, create: block }); }

  const u2l2Content = [
    {
      id: 'soc-8-u2-l2-b1', lessonId: 'g8-soc-u2-l2', section: 'LEARN' as const, blockType: 'IMAGE' as const, order: 1,
      content: { url: '/artifacts/spanish_galleon_ship_1776884413408.png', caption: 'Spanish galleons sailed the oceans driven by the desire for Gold, Glory, and God.' }
    },
    {
      id: 'soc-8-u2-l2-b2', lessonId: 'g8-soc-u2-l2', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 2,
      content: { html: '<h2>The Spanish Empire</h2><p>Following the Reconquista, Spain emerged as a unified and powerful nation. Driven by a desire for wealth, national prestige, and the spread of Catholicism ("Gold, Glory, and God"), Spain embarked on a massive campaign of exploration and conquest across the ocean.</p><p><strong>Digital Textbook:</strong> <a href="https://drive.google.com/file/d/1ekTbAPnjYfc7ROEomB7ig-xlSxGdTuDa/view?usp=sharing" target="_blank" style="color: #2563eb; font-weight: bold; text-decoration: underline;">Open Our Worldviews, Chapter 8</a></p>' }
    },
    {
      id: 'soc-8-u2-l2-b3', lessonId: 'g8-soc-u2-l2', section: 'LEARN' as const, blockType: 'VIDEO' as const, order: 3,
      content: { url: 'https://www.youtube.com/watch?v=rjhIzemLdos', title: 'The Spanish Empire, Silver, & Runaway Inflation' }
    },
    {
      id: 'soc-8-u2-l2-b4', lessonId: 'g8-soc-u2-l2', section: 'CHECK' as const, blockType: 'MATCHING' as const, order: 4,
      content: {
        pairs: [
          { left: 'Gold', right: 'Economic motive for exploration' },
          { left: 'Glory', right: 'Political motive for national prestige' },
          { left: 'God', right: 'Religious motive to spread Catholicism' }
        ]
      }
    }
  ];

  await prisma.lesson.upsert({ where: { id: 'g8-soc-u2-l2' }, update: { title: 'The Spanish Empire', subtitle: 'The expansionist worldview of Spain' }, create: { id: 'g8-soc-u2-l2', unitId: unit2.id, title: 'The Spanish Empire', subtitle: 'The expansionist worldview of Spain', order: 2 } });
  for (const block of u2l2Content) { await prisma.lessonBlock.upsert({ where: { id: block.id }, update: { content: block.content, blockType: block.blockType, section: block.section, order: block.order }, create: block }); }

  // ── U2 warm-up for L2 ──
  const u2wu = [
    { id: 'soc-8-u2-l2-wu', lessonId: 'g8-soc-u2-l2', section: 'WARM_UP' as const, blockType: 'MICRO_CHECK' as const, order: 0, content: { question: 'What was the Aztec capital city called?', options: [{ label: 'Mexico City', value: 'a' }, { label: 'Tenochtitlan', value: 'b', correct: true }, { label: 'Cusco', value: 'c' }, { label: 'Machu Picchu', value: 'd' }], explanation: 'Tenochtitlan was the magnificent Aztec capital, built on an island in Lake Texcoco. It was one of the largest cities in the world at the time.' } },
  ];
  for (const b of u2wu) { await prisma.lessonBlock.upsert({ where: { id: b.id }, update: { content: b.content, blockType: b.blockType, section: b.section, order: b.order }, create: b }); }

  // ── U2 L3: Aztec Society and Daily Life ──
  const u2l3 = [
    { id: 'soc-8-u2-l3-wu', lessonId: 'g8-soc-u2-l3', section: 'WARM_UP' as const, blockType: 'MATCHING' as const, order: 0, content: { instruction: 'Recall from previous lessons:', pairs: [{ left: 'Tenochtitlan', right: 'Aztec capital on a lake' }, { left: 'Gold, Glory, God', right: 'Motives of Spanish exploration' }] } },
    { id: 'soc-8-u2-l3-b1', lessonId: 'g8-soc-u2-l3', section: 'LEARN' as const, blockType: 'IMAGE' as const, order: 1, content: { url: '/artifacts/aztec_daily_life.png', caption: 'Daily life in an Aztec marketplace — trading cacao, textiles, and pottery.' } },
    { id: 'soc-8-u2-l3-b2', lessonId: 'g8-soc-u2-l3', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 2, content: { html: '<h2>Aztec Society and Daily Life</h2><p>Aztec society was highly organized with a strict social hierarchy. Children attended schools called <strong>calmecac</strong> (for nobles) or <strong>telpochcalli</strong> (for commoners). The Aztecs used <strong>chinampas</strong> — floating gardens — to grow food. They used cacao beans as currency and had bustling marketplaces where thousands gathered daily.</p><p><strong>Digital Textbook:</strong> <a href="https://drive.google.com/file/d/1MCcgcwL3fHGvuxq8Oa8uNXuHWdfU_o9I/view?usp=drive_link" target="_blank" style="color: #2563eb; font-weight: bold; text-decoration: underline;">Open Our Worldviews, Chapter 7</a></p>' } },
    { id: 'soc-8-u2-l3-b3', lessonId: 'g8-soc-u2-l3', section: 'PRACTICE' as const, blockType: 'MATCHING' as const, order: 3, content: { instruction: 'Match:', pairs: [{ left: 'Chinampas', right: 'Floating gardens for farming' }, { left: 'Calmecac', right: 'School for noble children' }, { left: 'Cacao beans', right: 'Used as currency' }] } },
    { id: 'soc-8-u2-l3-b4', lessonId: 'g8-soc-u2-l3', section: 'CHECK' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 4, content: { prompt: 'Compare Aztec education to your own. What similarities and differences do you notice?', rubricHint: 'Students should note that Aztec children attended mandatory schools (like today) but were separated by class. Strong answers identify both similarities (mandatory, structured) and differences (class-based, military training).', minLength: 20 } },
  ];
  await prisma.lesson.upsert({ where: { id: 'g8-soc-u2-l3' }, update: { title: 'Aztec Society and Daily Life', subtitle: 'How the Aztecs lived, learned, and traded' }, create: { id: 'g8-soc-u2-l3', unitId: unit2.id, title: 'Aztec Society and Daily Life', subtitle: 'How the Aztecs lived, learned, and traded', order: 3, materials: 'Notebook, Pen, Digital Textbook' } });
  for (const b of u2l3) { await prisma.lessonBlock.upsert({ where: { id: b.id }, update: { content: b.content, blockType: b.blockType, section: b.section, order: b.order }, create: b }); }

  // ── U2 L4: Spanish Exploration and Conquistadors ──
  const u2l4 = [
    { id: 'soc-8-u2-l4-wu', lessonId: 'g8-soc-u2-l4', section: 'WARM_UP' as const, blockType: 'MICRO_CHECK' as const, order: 0, content: { question: 'What were chinampas?', options: [{ label: 'Aztec weapons', value: 'a' }, { label: 'Floating gardens for farming', value: 'b', correct: true }, { label: 'Religious temples', value: 'c' }, { label: 'Trading ships', value: 'd' }], explanation: 'Chinampas were ingenious floating gardens that the Aztecs built on Lake Texcoco to grow crops in the shallow lake bed.' } },
    { id: 'soc-8-u2-l4-b1', lessonId: 'g8-soc-u2-l4', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 1, content: { html: '<h2>Spanish Exploration and Conquistadors</h2><p>In 1519, <strong>Hernán Cortés</strong> landed on the coast of Mexico with about 600 soldiers. Despite being vastly outnumbered, Cortés had advantages: steel weapons, horses, guns, and alliances with Indigenous peoples who resented Aztec rule. The Spanish also unknowingly brought <strong>diseases</strong> like smallpox that devastated Indigenous populations.</p><p><strong>Digital Textbook:</strong> <a href="https://drive.google.com/file/d/1ekTbAPnjYfc7ROEomB7ig-xlSxGdTuDa/view?usp=sharing" target="_blank" style="color: #2563eb; font-weight: bold; text-decoration: underline;">Open Our Worldviews, Chapter 8</a></p>' } },
    { id: 'soc-8-u2-l4-b2', lessonId: 'g8-soc-u2-l4', section: 'PRACTICE' as const, blockType: 'MATCHING' as const, order: 2, content: { instruction: 'Match the Spanish advantages:', pairs: [{ left: 'Steel and guns', right: 'Military technology advantage' }, { left: 'Horses', right: 'Mobility and intimidation' }, { left: 'Smallpox', right: 'Disease that devastated Indigenous peoples' }, { left: 'Alliances', right: 'Help from groups opposing the Aztecs' }] } },
    { id: 'soc-8-u2-l4-b3', lessonId: 'g8-soc-u2-l4', section: 'CHECK' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 3, content: { prompt: 'Was the Spanish conquest of the Aztecs primarily due to military superiority, disease, or alliances with other Indigenous groups? Which factor do you think was most important and why?', rubricHint: 'Accept any factor if well-defended. Students should demonstrate understanding of all three factors. Strong answers will argue that the factors worked together.', minLength: 20 } },
  ];
  await prisma.lesson.upsert({ where: { id: 'g8-soc-u2-l4' }, update: { title: 'Spanish Exploration and Conquistadors', subtitle: 'Cortés and the factors behind the conquest' }, create: { id: 'g8-soc-u2-l4', unitId: unit2.id, title: 'Spanish Exploration and Conquistadors', subtitle: 'Cortés and the factors behind the conquest', order: 4, materials: 'Notebook, Pen, Digital Textbook' } });
  for (const b of u2l4) { await prisma.lessonBlock.upsert({ where: { id: b.id }, update: { content: b.content, blockType: b.blockType, section: b.section, order: b.order }, create: b }); }

  // ── U2 L5: The Clash of Worldviews ──
  const u2l5 = [
    { id: 'soc-8-u2-l5-wu', lessonId: 'g8-soc-u2-l5', section: 'WARM_UP' as const, blockType: 'MATCHING' as const, order: 0, content: { instruction: 'Recall from earlier lessons:', pairs: [{ left: 'Aztec worldview', right: 'Gods needed sacrifice to maintain balance' }, { left: 'Spanish worldview', right: 'Spread Catholicism, gain wealth and glory' }] } },
    { id: 'soc-8-u2-l5-b1', lessonId: 'g8-soc-u2-l5', section: 'LEARN' as const, blockType: 'IMAGE' as const, order: 1, content: { url: '/artifacts/clash_of_worldviews.png', caption: 'The meeting of two completely different civilizations with incompatible worldviews.' } },
    { id: 'soc-8-u2-l5-b2', lessonId: 'g8-soc-u2-l5', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 2, content: { html: '<h2>The Clash of Worldviews</h2><p>When the Spanish and Aztecs met, their worldviews were fundamentally incompatible. The Aztecs initially believed Cortés might be the god Quetzalcoatl returning. The Spanish saw the Aztec religious practices as barbaric and believed they had a duty to convert them. Neither side could fully understand the other, and this misunderstanding had devastating consequences.</p><p><strong>Digital Textbook:</strong> <a href="https://drive.google.com/file/d/1fLN5MYV6DF0oTbxPUqA-s9dtYsCrmjto/view?usp=sharing" target="_blank" style="color: #2563eb; font-weight: bold; text-decoration: underline;">Open Our Worldviews, Chapter 9</a></p>' } },
    { id: 'soc-8-u2-l5-b3', lessonId: 'g8-soc-u2-l5', section: 'CHECK' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 3, content: { prompt: 'Why were the Spanish and Aztec worldviews so difficult to reconcile? Could the outcome have been different if either side had tried harder to understand the other?', rubricHint: 'Students should identify specific worldview differences (religion, purpose of sacrifice, concept of gods). Strong answers show empathy for both perspectives while acknowledging the power imbalance.', minLength: 20 } },
  ];
  await prisma.lesson.upsert({ where: { id: 'g8-soc-u2-l5' }, update: { title: 'The Clash of Worldviews', subtitle: 'When two civilizations collide' }, create: { id: 'g8-soc-u2-l5', unitId: unit2.id, title: 'The Clash of Worldviews', subtitle: 'When two civilizations collide', order: 5, materials: 'Notebook, Pen, Digital Textbook' } });
  for (const b of u2l5) { await prisma.lessonBlock.upsert({ where: { id: b.id }, update: { content: b.content, blockType: b.blockType, section: b.section, order: b.order }, create: b }); }

  // ── U2 L6: The Fall of Tenochtitlan ──
  const u2l6 = [
    { id: 'soc-8-u2-l6-wu', lessonId: 'g8-soc-u2-l6', section: 'WARM_UP' as const, blockType: 'MICRO_CHECK' as const, order: 0, content: { question: 'What did the Aztecs initially believe about Cortés?', options: [{ label: 'He was a merchant', value: 'a' }, { label: 'He might be the returning god Quetzalcoatl', value: 'b', correct: true }, { label: 'He was an enemy warrior', value: 'c' }, { label: 'He was a spy', value: 'd' }], explanation: 'Some Aztecs initially believed Cortés might be the feathered serpent god Quetzalcoatl, whose return had been prophesied.' } },
    { id: 'soc-8-u2-l6-b1', lessonId: 'g8-soc-u2-l6', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 1, content: { html: '<h2>The Fall of Tenochtitlan</h2><p>In 1521, after a brutal 80-day siege, Tenochtitlan fell to the Spanish and their Indigenous allies. The city was destroyed and rebuilt as Mexico City. The Aztec emperor Montezuma had been killed, and the once-great empire was dismantled. The Spanish imposed their language, religion, and governance on the surviving population.</p><p><strong>Digital Textbook:</strong> <a href="https://drive.google.com/file/d/1fLN5MYV6DF0oTbxPUqA-s9dtYsCrmjto/view?usp=sharing" target="_blank" style="color: #2563eb; font-weight: bold; text-decoration: underline;">Open Our Worldviews, Chapter 9</a></p>' } },
    { id: 'soc-8-u2-l6-b2', lessonId: 'g8-soc-u2-l6', section: 'CHECK' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 2, content: { prompt: 'The Spanish destroyed Tenochtitlan and built Mexico City on top of it. What message does destroying a civilization\'s city and rebuilding on it send? What is lost when this happens?', rubricHint: 'Students should discuss cultural erasure, the loss of architectural and historical knowledge, and the symbolic power of building over another culture. Strong answers connect to modern examples of heritage preservation.', minLength: 20 } },
  ];
  await prisma.lesson.upsert({ where: { id: 'g8-soc-u2-l6' }, update: { title: 'The Fall of Tenochtitlan', subtitle: 'The end of the Aztec Empire' }, create: { id: 'g8-soc-u2-l6', unitId: unit2.id, title: 'The Fall of Tenochtitlan', subtitle: 'The end of the Aztec Empire', order: 6, materials: 'Notebook, Pen, Digital Textbook' } });
  for (const b of u2l6) { await prisma.lessonBlock.upsert({ where: { id: b.id }, update: { content: b.content, blockType: b.blockType, section: b.section, order: b.order }, create: b }); }

  // ── U2 L7: Legacy and Consequences ──
  const u2l7 = [
    { id: 'soc-8-u2-l7-wu', lessonId: 'g8-soc-u2-l7', section: 'WARM_UP' as const, blockType: 'MATCHING' as const, order: 0, content: { instruction: 'Recall from the unit:', pairs: [{ left: 'Cortés', right: 'Led the Spanish conquest of the Aztecs' }, { left: 'Tenochtitlan', right: 'Destroyed and rebuilt as Mexico City' }, { left: 'Smallpox', right: 'Disease that devastated Indigenous peoples' }] } },
    { id: 'soc-8-u2-l7-b1', lessonId: 'g8-soc-u2-l7', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 1, content: { html: '<h2>Legacy and Consequences</h2><p>The Spanish conquest had lasting consequences: the <strong>encomienda</strong> system forced Indigenous peoples into labour, Catholic missionaries replaced Indigenous religions, and European diseases killed millions. However, a new <strong>mestizo</strong> culture also emerged — blending Spanish and Indigenous traditions that continues in Mexico and Latin America today.</p><p><strong>Digital Textbook:</strong> <a href="https://drive.google.com/file/d/1fLN5MYV6DF0oTbxPUqA-s9dtYsCrmjto/view?usp=sharing" target="_blank" style="color: #2563eb; font-weight: bold; text-decoration: underline;">Open Our Worldviews, Chapter 9</a></p>' } },
    { id: 'soc-8-u2-l7-b2', lessonId: 'g8-soc-u2-l7', section: 'PRACTICE' as const, blockType: 'MATCHING' as const, order: 2, content: { instruction: 'Match the legacy:', pairs: [{ left: 'Encomienda', right: 'System of forced Indigenous labour' }, { left: 'Mestizo', right: 'Blended Spanish-Indigenous culture' }, { left: 'Missionaries', right: 'Replaced Indigenous religions with Catholicism' }] } },
    { id: 'soc-8-u2-l7-b3', lessonId: 'g8-soc-u2-l7', section: 'CHECK' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 3, content: { prompt: 'Some people argue the Spanish brought "civilization" to the Americas. Others argue they destroyed thriving civilizations. What evidence from this unit supports each side?', rubricHint: 'Students must present evidence for BOTH sides, then may state their own position. Balanced responses that acknowledge complexity earn full marks.', minLength: 25 } },
  ];
  await prisma.lesson.upsert({ where: { id: 'g8-soc-u2-l7' }, update: { title: 'Legacy and Consequences', subtitle: 'The lasting impact of conquest' }, create: { id: 'g8-soc-u2-l7', unitId: unit2.id, title: 'Legacy and Consequences', subtitle: 'The lasting impact of conquest', order: 7, materials: 'Notebook, Pen, Digital Textbook' } });
  for (const b of u2l7) { await prisma.lessonBlock.upsert({ where: { id: b.id }, update: { content: b.content, blockType: b.blockType, section: b.section, order: b.order }, create: b }); }

  // ── U2 L8: Understanding Worldviews Today ──
  const u2l8 = [
    { id: 'soc-8-u2-l8-wu', lessonId: 'g8-soc-u2-l8', section: 'WARM_UP' as const, blockType: 'MATCHING' as const, order: 0, content: { instruction: 'Cross-unit interleaving:', pairs: [{ left: 'Renaissance', right: 'Rebirth of Western ideas (Unit 1)' }, { left: 'Meiji Restoration', right: 'Japan\'s rapid modernization (Unit 2)' }, { left: 'Spanish Conquest', right: 'Destruction of Aztec civilization (Unit 3)' }] } },
    { id: 'soc-8-u2-l8-b1', lessonId: 'g8-soc-u2-l8', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 1, content: { html: '<h2>Understanding Worldviews Today</h2><p>Throughout this course, you have studied three case studies of worldview change: the Renaissance, Japan\'s isolation and modernization, and the Aztec-Spanish encounter. Each shows how <strong>worldviews can shift</strong> through trade, conflict, technology, and intercultural contact. Today, globalization means cultures interact constantly — and these same patterns continue.</p><p><strong>Digital Textbook:</strong> <a href="https://drive.google.com/file/d/1hIMGxWRXHjf-PbYNslS8TAJQifs_bSXA/view?usp=sharing" target="_blank" style="color: #2563eb; font-weight: bold; text-decoration: underline;">Open Our Worldviews, Chapter 10</a></p>' } },
    { id: 'soc-8-u2-l8-b2', lessonId: 'g8-soc-u2-l8', section: 'CHECK' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 2, content: { prompt: 'Choose ONE modern example where two cultures or worldviews are in contact or conflict today. Using what you learned from the Renaissance, Japan, and the Aztecs, what lessons from history could help resolve or understand this modern situation?', rubricHint: 'Students must pick a real modern example (globalization, immigration, technology disruption, etc.) and connect it to at least one historical case study from the course. Strong answers draw parallels between historical and modern worldview shifts.', minLength: 30 } },
  ];
  await prisma.lesson.upsert({ where: { id: 'g8-soc-u2-l8' }, update: { title: 'Understanding Worldviews Today', subtitle: 'Connecting history to the present' }, create: { id: 'g8-soc-u2-l8', unitId: unit2.id, title: 'Understanding Worldviews Today', subtitle: 'Connecting history to the present', order: 8, materials: 'Notebook, Pen, Digital Textbook' } });
  for (const b of u2l8) { await prisma.lessonBlock.upsert({ where: { id: b.id }, update: { content: b.content, blockType: b.blockType, section: b.section, order: b.order }, create: b }); }

  // ── U2 L9: Unit 3 Review and Reflection ──
  const u2l9 = [
    { id: 'soc-8-u2-l9-wu', lessonId: 'g8-soc-u2-l9', section: 'WARM_UP' as const, blockType: 'MATCHING' as const, order: 0, content: { instruction: 'Final cumulative review:', pairs: [{ left: 'Aztec Empire', right: 'Powerful civilization in central Mexico' }, { left: 'Cortés', right: 'Spanish conquistador' }, { left: 'Encomienda', right: 'Forced labour system' }, { left: 'Mestizo', right: 'Blended culture' }] } },
    { id: 'soc-8-u2-l9-b1', lessonId: 'g8-soc-u2-l9', section: 'LEARN' as const, blockType: 'AI_SUMMARY' as const, order: 1, content: { summary: 'Unit 3 Summary: You explored the Aztec Empire and its complex society, the Spanish motivations for exploration, the devastating clash of worldviews, the fall of Tenochtitlan, and the lasting legacy of conquest including the emergence of mestizo culture. You also connected these historical patterns to modern worldview interactions.' } },
    { id: 'soc-8-u2-l9-b2', lessonId: 'g8-soc-u2-l9', section: 'CHECK' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 2, content: { prompt: 'Final reflection: Of the three case studies you studied this year (Renaissance Europe, Japan, and the Aztec-Spanish encounter), which one taught you the most about how worldviews change? Explain what specific lesson or idea you will carry forward.', rubricHint: 'Students must reference a specific case study and articulate a personal takeaway. Accept any well-defended choice. This is a metacognitive reflection — value self-awareness and genuine insight over length.', minLength: 25 } },
    { id: 'soc-8-u2-l9-b3', lessonId: 'g8-soc-u2-l9', section: 'CHECK' as const, blockType: 'DRAWING' as const, order: 3, content: { prompt: 'Create a Venn diagram comparing ANY TWO of the three case studies (Renaissance, Japan, Aztec-Spanish). Show at least 3 similarities and 3 differences.' } },
  ];
  await prisma.lesson.upsert({ where: { id: 'g8-soc-u2-l9' }, update: { title: 'Unit 3 Review and Reflection', subtitle: 'Consolidating your understanding of intercultural contact' }, create: { id: 'g8-soc-u2-l9', unitId: unit2.id, title: 'Unit 3 Review and Reflection', subtitle: 'Consolidating your understanding of intercultural contact', order: 9, materials: 'Notebook, Pen' } });
  for (const b of u2l9) { await prisma.lessonBlock.upsert({ where: { id: b.id }, update: { content: b.content, blockType: b.blockType, section: b.section, order: b.order }, create: b }); }

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

  const u3l1Content = [
    {
      id: 'soc-8-u3-l1-b1', lessonId: 'g8-soc-u3-l1', section: 'LEARN' as const, blockType: 'IMAGE' as const, order: 1,
      content: { url: '/artifacts/edo_period_japan_1776884428262.png', caption: 'Life in a traditional Japanese town during the Edo period of isolation.' }
    },
    {
      id: 'soc-8-u3-l1-b2', lessonId: 'g8-soc-u3-l1', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 2,
      content: { html: '<h2>Edo Period Isolation</h2><p>For over 200 years, the Tokugawa shogunate enacted a policy of isolation called <strong>sakoku</strong>. To maintain peace and control, the government strictly limited foreign contact and maintained a rigid social hierarchy system.</p><p><strong>Digital Textbook:</strong> <a href="https://drive.google.com/file/d/1pMcuOmYHS5b8FZYMHX1-HE_kwTmKes-a/view?usp=sharing" target="_blank" style="color: #2563eb; font-weight: bold; text-decoration: underline;">Open Our Worldviews, Chapter 4</a></p>' }
    },
    {
      id: 'soc-8-u3-l1-b3', lessonId: 'g8-soc-u3-l1', section: 'CHECK' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 3,
      content: { prompt: 'What are the potential benefits and drawbacks of a country completely closing itself off from the rest of the world?' }
    }
  ];

  await prisma.lesson.upsert({ where: { id: 'g8-soc-u3-l1' }, update: { title: 'Edo Period Isolation', subtitle: 'The causes and effects of cultural isolation' }, create: { id: 'g8-soc-u3-l1', unitId: unit3.id, title: 'Edo Period Isolation', subtitle: 'The causes and effects of cultural isolation', order: 1 } });
  for (const block of u3l1Content) { await prisma.lessonBlock.upsert({ where: { id: block.id }, update: { content: block.content, blockType: block.blockType, section: block.section, order: block.order }, create: block }); }

  const u3l2Content = [
    {
      id: 'soc-8-u3-l2-b1', lessonId: 'g8-soc-u3-l2', section: 'LEARN' as const, blockType: 'IMAGE' as const, order: 1,
      content: { url: '/artifacts/meiji_restoration_japan_1776884440578.png', caption: 'The Meiji Restoration brought rapid industrialization and Western influence to Japan.' }
    },
    {
      id: 'soc-8-u3-l2-b2', lessonId: 'g8-soc-u3-l2', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 2,
      content: { html: '<h2>Meiji Restoration</h2><p>When American ships arrived demanding trade, Japan realized it was technologically behind the Western powers. Rather than be colonized, Japan rapidly modernized and industrialized its economy, military, and education system during the Meiji Restoration.</p><p><strong>Digital Textbook:</strong> <a href="https://drive.google.com/file/d/1ZDdyZkancyctL-dfV1L5uhhIBHDENfYz/view?usp=sharing" target="_blank" style="color: #2563eb; font-weight: bold; text-decoration: underline;">Open Our Worldviews, Chapter 6</a></p>' }
    },
    {
      id: 'soc-8-u3-l2-b3', lessonId: 'g8-soc-u3-l2', section: 'LEARN' as const, blockType: 'VIDEO' as const, order: 3,
      content: { url: 'https://www.youtube.com/watch?v=Nosq94oCl_M', title: 'Samurai, Daimyo, Matthew Perry, and Nationalism' }
    },
    {
      id: 'soc-8-u3-l2-b4', lessonId: 'g8-soc-u3-l2', section: 'CHECK' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 4,
      content: { prompt: 'Why did Japan decide to modernize so quickly, and what impact did it have on traditional Samurai culture?' }
    }
  ];

  await prisma.lesson.upsert({ where: { id: 'g8-soc-u3-l2' }, update: { title: 'Meiji Restoration', subtitle: 'Rapid adaptation to a changing world' }, create: { id: 'g8-soc-u3-l2', unitId: unit3.id, title: 'Meiji Restoration', subtitle: 'Rapid adaptation to a changing world', order: 2 } });
  for (const block of u3l2Content) { await prisma.lessonBlock.upsert({ where: { id: block.id }, update: { content: block.content, blockType: block.blockType, section: block.section, order: block.order }, create: block }); }

  // ── U3 warm-up for L2 ──
  const u3wu = [
    { id: 'soc-8-u3-l2-wu', lessonId: 'g8-soc-u3-l2', section: 'WARM_UP' as const, blockType: 'MICRO_CHECK' as const, order: 0, content: { question: 'What was sakoku?', options: [{ label: 'A type of Japanese sword', value: 'a' }, { label: 'Japan\'s policy of isolation', value: 'b', correct: true }, { label: 'A Japanese art form', value: 'c' }, { label: 'The Japanese emperor', value: 'd' }], explanation: 'Sakoku was the strict isolation policy enacted by the Tokugawa shogunate that lasted over 200 years.' } },
  ];
  for (const b of u3wu) { await prisma.lessonBlock.upsert({ where: { id: b.id }, update: { content: b.content, blockType: b.blockType, section: b.section, order: b.order }, create: b }); }

  // ── U3 L3: Art and Culture in Isolation ──
  const u3l3 = [
    { id: 'soc-8-u3-l3-wu', lessonId: 'g8-soc-u3-l3', section: 'WARM_UP' as const, blockType: 'MATCHING' as const, order: 0, content: { instruction: 'Recall from previous lessons:', pairs: [{ left: 'Sakoku', right: 'Japan\'s isolation policy' }, { left: 'Shogunate', right: 'Military government led by a shogun' }] } },
    { id: 'soc-8-u3-l3-b1', lessonId: 'g8-soc-u3-l3', section: 'LEARN' as const, blockType: 'IMAGE' as const, order: 1, content: { url: '/artifacts/japanese_edo_culture.png', caption: 'Kabuki theater, ukiyo-e prints, and tea ceremonies flourished during the Edo period.' } },
    { id: 'soc-8-u3-l3-b2', lessonId: 'g8-soc-u3-l3', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 2, content: { html: '<h2>Art and Culture in Isolation</h2><p>While cut off from the world, Japan developed a rich and unique culture. <strong>Kabuki theater</strong>, <strong>ukiyo-e</strong> woodblock prints, the <strong>tea ceremony</strong>, and <strong>haiku</strong> poetry all flourished during this time. Isolation allowed Japanese culture to develop without outside influence.</p><p><strong>Digital Textbook:</strong> <a href="https://drive.google.com/file/d/1pMcuOmYHS5b8FZYMHX1-HE_kwTmKes-a/view?usp=sharing" target="_blank" style="color: #2563eb; font-weight: bold; text-decoration: underline;">Open Our Worldviews, Chapter 4</a></p>' } },
    { id: 'soc-8-u3-l3-b3', lessonId: 'g8-soc-u3-l3', section: 'PRACTICE' as const, blockType: 'MATCHING' as const, order: 3, content: { instruction: 'Match the art form:', pairs: [{ left: 'Kabuki', right: 'Dramatic theater with elaborate costumes' }, { left: 'Ukiyo-e', right: 'Woodblock printing art' }, { left: 'Haiku', right: 'Short three-line poem' }] } },
    { id: 'soc-8-u3-l3-b4', lessonId: 'g8-soc-u3-l3', section: 'CHECK' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 4, content: { prompt: 'How did Japan\'s isolation help its unique culture develop? Can you think of a modern example where being "cut off" helped someone develop their own unique style?', rubricHint: 'Students should explain that without outside influence, Japanese artists created distinctly Japanese art forms. Modern examples could include artists who avoided social media trends.', minLength: 20 } },
  ];
  await prisma.lesson.upsert({ where: { id: 'g8-soc-u3-l3' }, update: { title: 'Art and Culture in Isolation', subtitle: 'How isolation shaped Japanese arts' }, create: { id: 'g8-soc-u3-l3', unitId: unit3.id, title: 'Art and Culture in Isolation', subtitle: 'How isolation shaped Japanese arts', order: 3, materials: 'Notebook, Pen, Digital Textbook' } });
  for (const b of u3l3) { await prisma.lessonBlock.upsert({ where: { id: b.id }, update: { content: b.content, blockType: b.blockType, section: b.section, order: b.order }, create: b }); }

  // ── U3 L4: The Arrival of the Black Ships ──
  const u3l4 = [
    { id: 'soc-8-u3-l4-wu', lessonId: 'g8-soc-u3-l4', section: 'WARM_UP' as const, blockType: 'MICRO_CHECK' as const, order: 0, content: { question: 'Which of these art forms developed during Japan\'s isolation?', options: [{ label: 'Oil painting', value: 'a' }, { label: 'Ukiyo-e woodblock prints', value: 'b', correct: true }, { label: 'Photography', value: 'c' }, { label: 'Mosaic tiles', value: 'd' }], explanation: 'Ukiyo-e woodblock prints were a uniquely Japanese art form that flourished during the Edo period of isolation.' } },
    { id: 'soc-8-u3-l4-b1', lessonId: 'g8-soc-u3-l4', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 1, content: { html: '<h2>The Arrival of the Black Ships</h2><p>In 1853, American Commodore <strong>Matthew Perry</strong> arrived in Japan with four warships — the Japanese called them "Black Ships." Perry demanded that Japan open its ports to trade. Faced with superior military technology, Japan had no choice but to agree, ending over 200 years of isolation.</p><p><strong>Digital Textbook:</strong> <a href="https://drive.google.com/file/d/12nG3ahSsmbjNG1T6i_kHxXLlsvrIz2Jn/view?usp=sharing" target="_blank" style="color: #2563eb; font-weight: bold; text-decoration: underline;">Open Our Worldviews, Chapter 5</a></p>' } },
    { id: 'soc-8-u3-l4-b2', lessonId: 'g8-soc-u3-l4', section: 'LEARN' as const, blockType: 'VIDEO' as const, order: 2, content: { url: 'https://www.youtube.com/watch?v=Nosq94oCl_M', title: 'Samurai, Daimyo, Matthew Perry, and Nationalism' } },
    { id: 'soc-8-u3-l4-b3', lessonId: 'g8-soc-u3-l4', section: 'CHECK' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 3, content: { prompt: 'Imagine you are a Japanese citizen in 1853 seeing the Black Ships for the first time. Write a short diary entry describing what you see and how you feel.', rubricHint: 'Students should express surprise, fear, or curiosity. Strong responses reference the technology gap and connect to the theme of worldview disruption.', minLength: 20 } },
  ];
  await prisma.lesson.upsert({ where: { id: 'g8-soc-u3-l4' }, update: { title: 'The Arrival of the Black Ships', subtitle: 'The end of Japanese isolation' }, create: { id: 'g8-soc-u3-l4', unitId: unit3.id, title: 'The Arrival of the Black Ships', subtitle: 'The end of Japanese isolation', order: 4, materials: 'Notebook, Pen, Digital Textbook' } });
  for (const b of u3l4) { await prisma.lessonBlock.upsert({ where: { id: b.id }, update: { content: b.content, blockType: b.blockType, section: b.section, order: b.order }, create: b }); }

  // ── U3 L5: Factors of Change in Meiji Japan ──
  const u3l5 = [
    { id: 'soc-8-u3-l5-wu', lessonId: 'g8-soc-u3-l5', section: 'WARM_UP' as const, blockType: 'MATCHING' as const, order: 0, content: { instruction: 'Recall:', pairs: [{ left: 'Sakoku', right: '200+ years of Japanese isolation' }, { left: 'Black Ships', right: 'American warships that forced Japan to open' }] } },
    { id: 'soc-8-u3-l5-b1', lessonId: 'g8-soc-u3-l5', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 1, content: { html: '<h2>Factors of Change</h2><p>After the Black Ships arrived, Japan faced both <strong>internal</strong> and <strong>external</strong> pressures to change. Internally, many Japanese were unhappy with the shogunate\'s inability to protect them. Externally, Western powers were colonizing much of Asia. Japan realized: <em>modernize or be colonized</em>.</p><p><strong>Digital Textbook:</strong> <a href="https://drive.google.com/file/d/12nG3ahSsmbjNG1T6i_kHxXLlsvrIz2Jn/view?usp=sharing" target="_blank" style="color: #2563eb; font-weight: bold; text-decoration: underline;">Open Our Worldviews, Chapter 5</a></p>' } },
    { id: 'soc-8-u3-l5-b2', lessonId: 'g8-soc-u3-l5', section: 'PRACTICE' as const, blockType: 'MATCHING' as const, order: 2, content: { instruction: 'Sort into Internal vs External:', pairs: [{ left: 'Dissatisfaction with the shogunate', right: 'Internal pressure' }, { left: 'Western colonization of Asia', right: 'External pressure' }, { left: 'Desire to preserve Japanese independence', right: 'Internal pressure' }] } },
    { id: 'soc-8-u3-l5-b3', lessonId: 'g8-soc-u3-l5', section: 'CHECK' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 3, content: { prompt: 'Do you think Japan had a real choice in modernizing, or was it forced upon them? Explain your reasoning.', rubricHint: 'Accept either position if well-defended. Students should reference both internal dissatisfaction and external colonial threats.', minLength: 20 } },
  ];
  await prisma.lesson.upsert({ where: { id: 'g8-soc-u3-l5' }, update: { title: 'Factors of Change in Meiji Japan', subtitle: 'Internal and external pressures' }, create: { id: 'g8-soc-u3-l5', unitId: unit3.id, title: 'Factors of Change in Meiji Japan', subtitle: 'Internal and external pressures', order: 5, materials: 'Notebook, Pen, Digital Textbook' } });
  for (const b of u3l5) { await prisma.lessonBlock.upsert({ where: { id: b.id }, update: { content: b.content, blockType: b.blockType, section: b.section, order: b.order }, create: b }); }

  // ── U3 L6: The Meiji Restoration (already L2 content, this is deeper dive) ──
  const u3l6 = [
    { id: 'soc-8-u3-l6-wu', lessonId: 'g8-soc-u3-l6', section: 'WARM_UP' as const, blockType: 'MICRO_CHECK' as const, order: 0, content: { question: 'What did Japan fear would happen if it did not modernize?', options: [{ label: 'They would run out of food', value: 'a' }, { label: 'They would be colonized by Western powers', value: 'b', correct: true }, { label: 'Their emperor would lose power', value: 'c' }, { label: 'Their art would be forgotten', value: 'd' }], explanation: 'Japan watched as Western powers colonized much of Asia and realized they needed to modernize their military and economy to avoid the same fate.' } },
    { id: 'soc-8-u3-l6-b1', lessonId: 'g8-soc-u3-l6', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 1, content: { html: '<h2>The Meiji Restoration</h2><p>In 1868, the shogunate was overthrown and power was restored to the Emperor Meiji. Japan sent delegations to study Western nations and rapidly adopted Western technology, education systems, military organization, and industrialization — all while trying to preserve Japanese culture and identity.</p><p><strong>Digital Textbook:</strong> <a href="https://drive.google.com/file/d/1ZDdyZkancyctL-dfV1L5uhhIBHDENfYz/view?usp=sharing" target="_blank" style="color: #2563eb; font-weight: bold; text-decoration: underline;">Open Our Worldviews, Chapter 6</a></p>' } },
    { id: 'soc-8-u3-l6-b2', lessonId: 'g8-soc-u3-l6', section: 'PRACTICE' as const, blockType: 'MATCHING' as const, order: 2, content: { instruction: 'Match what Japan adopted from the West:', pairs: [{ left: 'Railways and factories', right: 'Industrialization' }, { left: 'Public schools for all', right: 'Western education model' }, { left: 'Conscript army', right: 'Western military organization' }] } },
    { id: 'soc-8-u3-l6-b3', lessonId: 'g8-soc-u3-l6', section: 'CHECK' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 3, content: { prompt: 'Japan\'s motto during this era was "Western technology, Japanese spirit." What do you think this meant? Is it possible to adopt another culture\'s technology without losing your own identity?', rubricHint: 'Students should explain the tension between modernization and cultural preservation. Strong answers will use specific examples from the lesson.', minLength: 20 } },
  ];
  await prisma.lesson.upsert({ where: { id: 'g8-soc-u3-l6' }, update: { title: 'The Meiji Restoration', subtitle: 'Rapid transformation of a nation' }, create: { id: 'g8-soc-u3-l6', unitId: unit3.id, title: 'The Meiji Restoration', subtitle: 'Rapid transformation of a nation', order: 6, materials: 'Notebook, Pen, Digital Textbook' } });
  for (const b of u3l6) { await prisma.lessonBlock.upsert({ where: { id: b.id }, update: { content: b.content, blockType: b.blockType, section: b.section, order: b.order }, create: b }); }

  // ── U3 L7: Worldview Shift — Tradition vs. Modernization ──
  const u3l7 = [
    { id: 'soc-8-u3-l7-wu', lessonId: 'g8-soc-u3-l7', section: 'WARM_UP' as const, blockType: 'MATCHING' as const, order: 0, content: { instruction: 'Compare across the unit:', pairs: [{ left: 'Edo Japan', right: 'Isolated, traditional, peaceful' }, { left: 'Meiji Japan', right: 'Open, modernizing, industrializing' }] } },
    { id: 'soc-8-u3-l7-b1', lessonId: 'g8-soc-u3-l7', section: 'LEARN' as const, blockType: 'TEXT' as const, order: 1, content: { html: '<h2>Tradition vs. Modernization</h2><p>The rapid changes of the Meiji era created deep tensions in Japanese society. Samurai lost their status. Traditional craftsmen were replaced by factories. Some Japanese embraced Western ways completely, while others fought to preserve traditional values. This tension between <strong>tradition and modernization</strong> is a theme that continues in many societies today.</p><p><strong>Digital Textbook:</strong> <a href="https://drive.google.com/file/d/1ZDdyZkancyctL-dfV1L5uhhIBHDENfYz/view?usp=sharing" target="_blank" style="color: #2563eb; font-weight: bold; text-decoration: underline;">Open Our Worldviews, Chapter 6</a></p>' } },
    { id: 'soc-8-u3-l7-b2', lessonId: 'g8-soc-u3-l7', section: 'CHECK' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 2, content: { prompt: 'Compare Edo Japan and Meiji Japan. How did Japan\'s worldview change in just a few decades? Use specific examples from the unit to support your answer.', rubricHint: 'Students should contrast isolation/tradition with openness/modernization. Strong answers reference specific changes (samurai, factories, education) and discuss the worldview shift.', minLength: 25 } },
    { id: 'soc-8-u3-l7-b3', lessonId: 'g8-soc-u3-l7', section: 'CHECK' as const, blockType: 'DRAWING' as const, order: 3, content: { prompt: 'Draw a split image: one side showing Edo Japan (traditional) and the other showing Meiji Japan (modernized). Label at least 3 differences.' } },
  ];
  await prisma.lesson.upsert({ where: { id: 'g8-soc-u3-l7' }, update: { title: 'Worldview Shift — Tradition vs. Modernization', subtitle: 'The tension of rapid change' }, create: { id: 'g8-soc-u3-l7', unitId: unit3.id, title: 'Worldview Shift — Tradition vs. Modernization', subtitle: 'The tension of rapid change', order: 7, materials: 'Notebook, Pen, Digital Textbook' } });
  for (const b of u3l7) { await prisma.lessonBlock.upsert({ where: { id: b.id }, update: { content: b.content, blockType: b.blockType, section: b.section, order: b.order }, create: b }); }

  // ── U3 L8: Unit 2 Review and Reflection ──
  const u3l8 = [
    { id: 'soc-8-u3-l8-wu', lessonId: 'g8-soc-u3-l8', section: 'WARM_UP' as const, blockType: 'MATCHING' as const, order: 0, content: { instruction: 'Cumulative review — Japan unit:', pairs: [{ left: 'Sakoku', right: 'Isolation policy' }, { left: 'Black Ships', right: 'Perry\'s fleet that ended isolation' }, { left: 'Meiji', right: 'Emperor who restored imperial power' }, { left: 'Ukiyo-e', right: 'Japanese woodblock art' }] } },
    { id: 'soc-8-u3-l8-b1', lessonId: 'g8-soc-u3-l8', section: 'LEARN' as const, blockType: 'AI_SUMMARY' as const, order: 1, content: { summary: 'Unit 2 Summary: You learned how Japan chose isolation under the Tokugawa shogunate, how unique Japanese culture flourished during sakoku, how Perry\'s Black Ships forced Japan to open, how internal and external pressures led to the Meiji Restoration, and how Japan rapidly modernized while struggling to preserve its cultural identity.' } },
    { id: 'soc-8-u3-l8-b2', lessonId: 'g8-soc-u3-l8', section: 'CHECK' as const, blockType: 'CONSTRUCTED_RESPONSE' as const, order: 2, content: { prompt: 'Was Japan\'s rapid modernization during the Meiji era a success or a loss? Consider what was gained (independence, power, technology) and what was lost (samurai culture, traditional arts, social structures). Take a clear position and defend it.', rubricHint: 'Students must take a clear position and provide at least two supporting points. Accept either "success" or "loss" if well-defended. Strong answers acknowledge both sides before arguing their position.', minLength: 30 } },
  ];
  await prisma.lesson.upsert({ where: { id: 'g8-soc-u3-l8' }, update: { title: 'Unit 2 Review and Reflection', subtitle: 'Consolidating your understanding of Japan' }, create: { id: 'g8-soc-u3-l8', unitId: unit3.id, title: 'Unit 2 Review and Reflection', subtitle: 'Consolidating your understanding of Japan', order: 8, materials: 'Notebook, Pen' } });
  for (const b of u3l8) { await prisma.lessonBlock.upsert({ where: { id: b.id }, update: { content: b.content, blockType: b.blockType, section: b.section, order: b.order }, create: b }); }

  console.log('✅ Social Studies 8 Seeded');
}
