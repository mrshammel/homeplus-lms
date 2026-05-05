import { NextResponse } from 'next/server';
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
      where: { id: 'subj_phonics_1' },
      update: {
        name: 'Phonics (Foundations)',
        icon: '🔤',
        active: true
      },
      create: {
        id: 'subj_phonics_1',
        name: 'Phonics (Foundations)',
        gradeLevel: 1,
        icon: '🔤',
        order: 1,
        active: true
      }
    });
    results.push('✅ Phonics subject icon and name updated');

    // 4. Restructure Grade 9 Math — 10 content units + Foundations
    const math9 = await prisma.subject.upsert({
      where: { id: 'g9-math' },
      update: { active: true, icon: '📐', name: 'Mathematics' },
      create: { id: 'g9-math', gradeLevel: 9, name: 'Mathematics', icon: '📐', order: 3, active: true },
    });

    const mathUnits = [
      { id: 'g9-math-u1', title: 'Rational Numbers', desc: 'Comparing, ordering, and performing operations on rational numbers in all forms.', icon: '🔢', order: 1 },
      { id: 'g9-math-u2', title: 'Order of Operations', desc: 'Applying BEDMAS/PEMDAS with rational numbers, exponents, and multi-step problems.', icon: '📋', order: 2 },
      { id: 'g9-math-u3', title: 'Linear Relations', desc: 'Graphing, analyzing, and interpreting linear relationships using tables, equations, and graphs.', icon: '📈', order: 3 },
      { id: 'g9-math-u4', title: 'Polynomials', desc: 'Identifying, classifying, and performing operations on polynomial expressions.', icon: '✖️', order: 4 },
      { id: 'g9-math-u5', title: 'Solving Equations', desc: 'Solving single-variable linear equations using inverse operations and verification.', icon: '⚖️', order: 5 },
      { id: 'g9-math-u6', title: 'Inequalities', desc: 'Solving and graphing single-variable linear inequalities on a number line.', icon: '↔️', order: 6 },
      { id: 'g9-math-u7', title: 'Exponents', desc: 'Powers, exponent laws, and operations with powers including negative exponents.', icon: '🔋', order: 7 },
      { id: 'g9-math-u8', title: '2D and 3D Geometry', desc: 'Surface area and volume of 3D objects, composite shapes, and spatial reasoning.', icon: '📦', order: 8 },
      { id: 'g9-math-u9', title: 'Circle Geometry', desc: 'Properties of circles including chords, central angles, inscribed angles, and tangent lines.', icon: '🟢', order: 9 },
      { id: 'g9-math-u10', title: 'Statistics', desc: 'Data collection methods, bias, sample vs. population, and interpreting statistical displays.', icon: '📊', order: 10 },
    ];

    for (const u of mathUnits) {
      await prisma.unit.upsert({
        where: { id: u.id },
        update: { title: u.title, description: u.desc, icon: u.icon, order: u.order },
        create: { id: u.id, subjectId: math9.id, title: u.title, description: u.desc, icon: u.icon, order: u.order },
      });

      // Create one placeholder lesson per unit
      const lessonId = `${u.id}-l1`;
      await prisma.lesson.upsert({
        where: { id: lessonId },
        update: {},
        create: { id: lessonId, unitId: u.id, title: `${u.title} — Lesson 1`, subtitle: `Introduction to ${u.title}`, order: 1 },
      });
    }
    results.push('✅ Grade 9 Math restructured: 10 content units + Foundations');

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
