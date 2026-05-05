import { PrismaClient } from '@prisma/client';

/**
 * Seed Grade 8 Social Studies
 * Alberta Curriculum: Historical Worldviews Examined
 */
export async function seedSocialStudies8(prisma: PrismaClient) {
  console.log('🌍 Seeding Social Studies 8...');

  const ss8 = await prisma.subject.upsert({
    where: { id: 'g8-social' },
    update: { active: true, icon: '🌍', name: 'Social Studies' },
    create: {
      id: 'g8-social',
      gradeLevel: 8,
      name: 'Social Studies',
      icon: '🌍',
      order: 4,
      active: true,
    },
  });

  const units = [
    { id: 'g8-ss-u1', title: 'Understanding Worldviews', desc: 'Explore what shapes a worldview and how geography, religion, and culture influence societies.', icon: '🧭', order: 1 },
    { id: 'g8-ss-u2', title: 'Japan: Isolation & Adaptation', desc: 'Examine the Tokugawa Shogunate — how Japan chose isolation and what effects it had on society, culture, and trade.', icon: '🏯', order: 2 },
    { id: 'g8-ss-u3', title: 'Renaissance Europe', desc: 'Investigate the rebirth of learning in Europe — humanism, art, science, and the shift from medieval to modern thinking.', icon: '🎨', order: 3 },
    { id: 'g8-ss-u4', title: 'The Aztec Civilization', desc: 'Study the Aztec Empire — its achievements, beliefs, social structure, and the impact of Spanish contact.', icon: '🏛️', order: 4 },
    { id: 'g8-ss-u5', title: 'Spanish Contact & Conflict', desc: 'Analyze the consequences of European expansion and contact with Indigenous civilizations in the Americas.', icon: '⚔️', order: 5 },
  ];

  for (const u of units) {
    await prisma.unit.upsert({
      where: { id: u.id },
      update: { title: u.title, description: u.desc, icon: u.icon, order: u.order },
      create: { id: u.id, subjectId: ss8.id, title: u.title, description: u.desc, icon: u.icon, order: u.order },
    });

    const lessonId = `${u.id}-l1`;
    await prisma.lesson.upsert({
      where: { id: lessonId },
      update: {},
      create: { id: lessonId, unitId: u.id, title: `${u.title} — Lesson 1`, subtitle: `Introduction to ${u.title}`, order: 1 },
    });
  }

  console.log('✅ Social Studies 8 Seeded — 5 units');
}
