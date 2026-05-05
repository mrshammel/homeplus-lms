import { NextResponse } from 'next/response';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const results: string[] = [];

    // 1. Fix Science 7 - Unit 1 - Lesson 1 (Heat and Temperature) Warm-up
    await prisma.lesson.update({
      where: { id: 'g7-sci-ua-l1' },
      data: {
        warmUpConfig: {
          type: 'prediction',
          prompt: 'Look at the image below. What do you think would happen to this pond ecosystem if all the sunlight was blocked for a month?',
          imageUrl: '/images/pond-ecosystem.png',
          options: [
            { label: 'Nothing would change', value: 'a', correct: false },
            { label: 'Plants would die first, then animals', value: 'b', correct: true },
            { label: 'Only fish would be affected', value: 'c', correct: false },
            { label: 'The water would freeze', value: 'd', correct: false },
          ],
        },
      },
    });
    results.push('✅ Warm-up config updated with pond ecosystem image');

    // 2. Fix broken video URL in lesson block
    const videoBlock = await prisma.lessonBlock.findFirst({
      where: { lessonId: 'g7-sci-ua-l1', blockType: 'VIDEO' },
    });

    if (videoBlock) {
      await prisma.lessonBlock.update({
        where: { id: videoBlock.id },
        data: {
          content: {
            url: 'https://www.youtube.com/embed/SNF8b7KKJ2I',
            title: 'Ecosystems for Kids — Plants, Animals, & Their Environment',
            transcript: 'This video from Homeschool Pop introduces ecosystems, explaining biotic and abiotic factors with engaging visuals and real-world examples from forests, oceans, and deserts.',
            aiSummary: 'An ecosystem is a community of living things (biotic factors) interacting with non-living things (abiotic factors) in a specific environment. Biotic factors include plants, animals, fungi, and bacteria. Abiotic factors include sunlight, water, temperature, soil, and air. Every ecosystem — from a forest to a puddle — contains both. These factors are constantly interacting: plants need sunlight and water (abiotic) to grow, and animals (biotic) depend on plants for food. If one factor changes, it can affect the whole ecosystem. For example, a drought (abiotic change) reduces plant growth, which means less food for herbivores, which affects predators too.',
          },
        },
      });
      results.push('✅ Video URL updated to working Homeschool Pop video');
    } else {
      results.push('⚠️ No video block found for lesson g7-sci-ua-l1');
    }

    // 3. Fix Phonics icon and name
    await prisma.subject.upsert({
      where: { id: 'phonics' },
      update: {
        name: 'Phonics',
        description: 'Learn to read with our comprehensive Phonics program.',
        icon: '🔤',
        active: true
      },
      create: {
        id: 'phonics',
        name: 'Phonics',
        description: 'Learn to read with our comprehensive Phonics program.',
        icon: '🔤',
        active: true
      }
    });
    results.push('✅ Phonics subject icon and name updated');

    return NextResponse.json({ 
      success: true, 
      message: 'Database successfully synced!',
      details: results 
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
