import { config } from 'dotenv';
config({ path: '.env.local' });

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// Use the pg adapter to match the app's db.ts configuration
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...\n');

  // ╔═══════════════════════════════════════════╗
  // ║ 1. TEACHER                                ║
  // ╚═══════════════════════════════════════════╝

  const teacher = await prisma.user.upsert({
    where: { id: 'teacher-1' },
    update: {},
    create: {
      id: 'teacher-1',
      name: 'Mrs. Shammel',
      email: 'shammel@hpln.ca',
      role: 'TEACHER',
      gradeLevel: 7,
    },
  });
  console.log(`✅ Teacher: ${teacher.name}`);

  // ╔═══════════════════════════════════════════╗
  // ║ 2. STUDENTS (assigned to teacher)          ║
  // ╚═══════════════════════════════════════════╝

  const studentData = [
    { id: 'student-1', name: 'Ava Chen', email: 'ava.chen@student.hpln.ca', enrolledAt: new Date('2025-09-03') },
    { id: 'student-2', name: 'Liam Patel', email: 'liam.patel@student.hpln.ca', enrolledAt: new Date('2025-09-03') },
    { id: 'student-3', name: 'Emma Rodriguez', email: 'emma.rodriguez@student.hpln.ca', enrolledAt: new Date('2025-09-05') },
    { id: 'student-4', name: 'Noah Thompson', email: 'noah.thompson@student.hpln.ca', enrolledAt: new Date('2025-09-03') },
    { id: 'student-5', name: 'Sophia Kim', email: 'sophia.kim@student.hpln.ca', enrolledAt: new Date('2025-09-08') },
    { id: 'student-6', name: 'Jackson Lee', email: 'jackson.lee@student.hpln.ca', enrolledAt: new Date('2025-09-03') },
    { id: 'student-7', name: 'Olivia Nguyen', email: 'olivia.nguyen@student.hpln.ca', enrolledAt: new Date('2025-09-10') },
    { id: 'student-8', name: 'Ethan Williams', email: 'ethan.williams@student.hpln.ca', enrolledAt: new Date('2025-09-03') },
  ];

  for (const s of studentData) {
    await prisma.user.upsert({
      where: { id: s.id },
      update: {},
      create: {
        id: s.id,
        name: s.name,
        email: s.email,
        role: 'STUDENT',
        gradeLevel: 7,
        enrolledAt: s.enrolledAt,
        assignedTeacherId: teacher.id,
      },
    });
    console.log(`✅ Student: ${s.name}`);
  }

  // ╔═══════════════════════════════════════════╗
  // ║ 3. CURRICULUM — Subjects, Units, Lessons   ║
  // ╚═══════════════════════════════════════════╝

  const science = await prisma.subject.upsert({
    where: { id: 'g7-science' },
    update: {},
    create: {
      id: 'g7-science',
      gradeLevel: 7,
      name: 'Science',
      icon: '🔬',
      order: 1,
      active: true,
    },
  });
  console.log(`\n✅ Subject: ${science.name} (Grade ${science.gradeLevel})`);

  // --- Unit A: Ecosystems ---
  const unitA = await prisma.unit.upsert({
    where: { id: 'g7-sci-unit-a' },
    update: {},
    create: {
      id: 'g7-sci-unit-a',
      subjectId: science.id,
      title: 'Interactions & Ecosystems',
      description: 'Explore how living things interact with each other and their environment.',
      icon: '🌿',
      order: 1,
    },
  });

  const lesson1 = await prisma.lesson.upsert({
    where: { id: 'g7-sci-ua-l1' },
    update: { title: 'What Is an Ecosystem?', subtitle: 'Identify biotic and abiotic components and explain how they interact.' },
    create: {
      id: 'g7-sci-ua-l1',
      unitId: unitA.id,
      title: 'What Is an Ecosystem?',
      subtitle: 'Identify biotic and abiotic components and explain how they interact.',
      order: 1,
    },
  });

  const lesson2 = await prisma.lesson.upsert({
    where: { id: 'g7-sci-ua-l2' },
    update: { title: 'Producers, Consumers, & Decomposers', subtitle: 'Classify organisms by their role and trace energy through food chains.' },
    create: {
      id: 'g7-sci-ua-l2',
      unitId: unitA.id,
      title: 'Producers, Consumers, & Decomposers',
      subtitle: 'Classify organisms by their role and trace energy through food chains.',
      order: 2,
    },
  });

  const lesson2a = await prisma.lesson.upsert({
    where: { id: 'g7-sci-ua-l3' },
    update: { title: 'Food Webs: When One Thing Changes', subtitle: 'Construct food webs and predict cascade effects when populations change.' },
    create: {
      id: 'g7-sci-ua-l3',
      unitId: unitA.id,
      title: 'Food Webs: When One Thing Changes',
      subtitle: 'Construct food webs and predict cascade effects when populations change.',
      order: 3,
    },
  });

  const lesson2b = await prisma.lesson.upsert({
    where: { id: 'g7-sci-ua-l4' },
    update: { title: 'Cycles: Water and Carbon', subtitle: 'Trace how water and carbon cycle through ecosystems and how human activity disrupts them.' },
    create: {
      id: 'g7-sci-ua-l4',
      unitId: unitA.id,
      title: 'Cycles: Water and Carbon',
      subtitle: 'Trace how water and carbon cycle through ecosystems and how human activity disrupts them.',
      order: 4,
    },
  });

  const lesson5 = await prisma.lesson.upsert({
    where: { id: 'g7-sci-ua-l5' },
    update: { title: 'Monitoring My Backyard', subtitle: 'Design and conduct a mini field study of a local ecosystem.' },
    create: {
      id: 'g7-sci-ua-l5',
      unitId: unitA.id,
      title: 'Monitoring My Backyard',
      subtitle: 'Design and conduct a mini field study of a local ecosystem.',
      order: 5,
    },
  });

  const lesson6 = await prisma.lesson.upsert({
    where: { id: 'g7-sci-ua-l6' },
    update: { title: 'Succession: How Ecosystems Recover', subtitle: 'Describe the stages of ecological succession and identify signs in Alberta ecosystems.' },
    create: {
      id: 'g7-sci-ua-l6',
      unitId: unitA.id,
      title: 'Succession: How Ecosystems Recover',
      subtitle: 'Describe the stages of ecological succession and identify signs in Alberta ecosystems.',
      order: 6,
    },
  });

  const lesson7 = await prisma.lesson.upsert({
    where: { id: 'g7-sci-ua-l7' },
    update: { title: 'Human Impacts: Intended & Unintended', subtitle: 'Analyze environmental issues from multiple perspectives and write an evidence-based position.' },
    create: {
      id: 'g7-sci-ua-l7',
      unitId: unitA.id,
      title: 'Human Impacts: Intended & Unintended',
      subtitle: 'Analyze environmental issues from multiple perspectives and write an evidence-based position.',
      order: 7,
    },
  });

  const lesson8 = await prisma.lesson.upsert({
    where: { id: 'g7-sci-ua-l8' },
    update: { title: 'Synthesis: Ecosystem Action Plan', subtitle: 'Apply everything you have learned to design a conservation action plan for an Alberta ecosystem.' },
    create: {
      id: 'g7-sci-ua-l8',
      unitId: unitA.id,
      title: 'Synthesis: Ecosystem Action Plan',
      subtitle: 'Apply everything you have learned to design a conservation action plan for an Alberta ecosystem.',
      order: 8,
    },
  });

  // --- Unit B: Plants for Food & Fibre (7 lessons) ---
  const unitB = await prisma.unit.upsert({
    where: { id: 'g7-sci-unit-b' },
    update: {},
    create: {
      id: 'g7-sci-unit-b',
      subjectId: science.id,
      title: 'Plants for Food & Fibre',
      description: 'Investigate how plants grow and how humans use them.',
      icon: '🌱',
      order: 2,
    },
  });

  const ubLessons = [
    { id: 'g7-sci-ub-l1', title: 'Plant Survival', subtitle: 'Needs, structures & roles of plants in ecosystems', order: 1 },
    { id: 'g7-sci-ub-l2', title: 'Growth & Reproduction', subtitle: 'Germination, pollination, seed dispersal & growth factors', order: 2 },
    { id: 'g7-sci-ub-l3', title: 'Classification & Adaptations', subtitle: 'Vascular vs. non-vascular, flowering vs. non-flowering, Alberta plant ID', order: 3 },
    { id: 'g7-sci-ub-l4', title: 'Growing Conditions', subtitle: 'Soil, light, water, temperature, greenhouses & hydroponics', order: 4 },
    { id: 'g7-sci-ub-l5', title: 'Agriculture & Pest Control', subtitle: 'Chemical vs. biological, monocultures, organic farming', order: 5 },
    { id: 'g7-sci-ub-l6', title: 'Plants, People & Sustainability', subtitle: 'Selective breeding, Indigenous knowledge, forestry & food security', order: 6 },
    { id: 'g7-sci-ub-l7', title: 'Performance Task', subtitle: 'Design a sustainable school garden plan', order: 7 },
  ];
  for (const l of ubLessons) {
    await prisma.lesson.upsert({ where: { id: l.id }, update: {}, create: { id: l.id, unitId: unitB.id, title: l.title, subtitle: l.subtitle, order: l.order } });
  }

  // --- Unit C: Heat & Temperature (6 lessons) ---
  const unitC = await prisma.unit.upsert({
    where: { id: 'g7-sci-unit-c' },
    update: {},
    create: {
      id: 'g7-sci-unit-c',
      subjectId: science.id,
      title: 'Heat & Temperature',
      description: 'Understand heat transfer, conductors, and insulators.',
      icon: '🔥',
      order: 3,
    },
  });

  const ucLessons = [
    { id: 'g7-sci-uc-l1', title: 'Hot & Cold: The Particle Model', subtitle: 'Distinguish heat from temperature using the particle model of matter', order: 1 },
    { id: 'g7-sci-uc-l2', title: 'Heat on the Move', subtitle: 'Conduction, convection & radiation — how heat travels', order: 2 },
    { id: 'g7-sci-uc-l3', title: 'Conductors, Insulators & Thermal Materials', subtitle: 'Compare materials that transfer or block heat', order: 3 },
    { id: 'g7-sci-uc-l4', title: 'Heating & Cooling Technology', subtitle: 'Thermometers, thermostats, furnaces & home heating', order: 4 },
    { id: 'g7-sci-uc-l5', title: 'Energy Sources & Climate', subtitle: 'Compare energy sources and their environmental impacts', order: 5 },
    { id: 'g7-sci-uc-l6', title: 'Performance Task', subtitle: 'Design an energy-efficient shelter', order: 6 },
  ];
  for (const l of ucLessons) {
    await prisma.lesson.upsert({ where: { id: l.id }, update: {}, create: { id: l.id, unitId: unitC.id, title: l.title, subtitle: l.subtitle, order: l.order } });
  }

  // --- Unit D: Structures & Forces (8 lessons) ---
  const unitD = await prisma.unit.upsert({
    where: { id: 'g7-sci-unit-d' },
    update: {},
    create: {
      id: 'g7-sci-unit-d',
      subjectId: science.id,
      title: 'Structures & Forces',
      description: 'Explore structural types, forces, and engineering design.',
      icon: '🏗️',
      order: 4,
    },
  });

  const udLessons = [
    { id: 'g7-sci-ud-l1', title: 'Types of Structures', subtitle: 'Frame, shell, and combination structures in nature and design', order: 1 },
    { id: 'g7-sci-ud-l2', title: 'Forces on Structures', subtitle: 'Internal and external forces — tension, compression, shearing', order: 2 },
    { id: 'g7-sci-ud-l3', title: 'Stability & Centre of Gravity', subtitle: 'How mass distribution and foundations affect stability', order: 3 },
    { id: 'g7-sci-ud-l4', title: 'Material Properties', subtitle: 'Strength, flexibility, and choosing the right material', order: 4 },
    { id: 'g7-sci-ud-l5', title: 'Joints & Connections', subtitle: 'Fixed vs. flexible joints, fastening methods', order: 5 },
    { id: 'g7-sci-ud-l6', title: 'Natural & Cultural Structures', subtitle: 'Structures in nature and across cultures', order: 6 },
    { id: 'g7-sci-ud-l7', title: 'Strengthening & Safety', subtitle: 'Corrugation, lamination, and environmental factors', order: 7 },
    { id: 'g7-sci-ud-l8', title: 'Performance Task', subtitle: 'Structural design & analysis report', order: 8 },
  ];
  for (const l of udLessons) {
    await prisma.lesson.upsert({ where: { id: l.id }, update: {}, create: { id: l.id, unitId: unitD.id, title: l.title, subtitle: l.subtitle, order: l.order } });
  }

  // --- Unit E: Planet Earth (7 lessons) ---
  const unitE = await prisma.unit.upsert({
    where: { id: 'g7-sci-unit-e' },
    update: {},
    create: {
      id: 'g7-sci-unit-e',
      subjectId: science.id,
      title: 'Planet Earth',
      description: 'Explore Earth layers, rocks, plate tectonics, and fossils.',
      icon: '🌍',
      order: 5,
    },
  });

  const ueLessons = [
    { id: 'g7-sci-ue-l1', title: 'Earth Inside Out', subtitle: 'Layers of the Earth — crust, mantle, core', order: 1 },
    { id: 'g7-sci-ue-l2', title: 'Rocks & Minerals', subtitle: 'Identifying and classifying igneous, sedimentary, and metamorphic rocks', order: 2 },
    { id: 'g7-sci-ue-l3', title: 'Weathering, Erosion & Soil', subtitle: 'How rocks break down and form soil', order: 3 },
    { id: 'g7-sci-ue-l4', title: 'Plate Tectonics', subtitle: 'Moving plates, earthquakes, and volcanoes', order: 4 },
    { id: 'g7-sci-ue-l5', title: 'Mountain Building', subtitle: 'Fold and fault mountains, the Canadian Rockies', order: 5 },
    { id: 'g7-sci-ue-l6', title: 'Fossils & Geological Time', subtitle: 'How fossils form, the fossil record, and deep time', order: 6 },
    { id: 'g7-sci-ue-l7', title: 'Performance Task', subtitle: 'Geological cross-section interpretation', order: 7 },
  ];
  for (const l of ueLessons) {
    await prisma.lesson.upsert({ where: { id: l.id }, update: {}, create: { id: l.id, unitId: unitE.id, title: l.title, subtitle: l.subtitle, order: l.order } });
  }

  console.log(`✅ Units: ${unitA.title}, ${unitB.title}, ${unitC.title}, ${unitD.title}, ${unitE.title}`);
  console.log(`✅ Lessons: ${8 + ubLessons.length + ucLessons.length + udLessons.length + ueLessons.length} total`);

  // ╔═══════════════════════════════════════════╗
  // ║ 3b. CURRICULUM — Grade 6 ELA              ║
  // ╚═══════════════════════════════════════════╝

  const ela6 = await prisma.subject.upsert({
    where: { id: 'g6-ela' },
    update: {},
    create: {
      id: 'g6-ela',
      gradeLevel: 6,
      name: 'English Language Arts',
      icon: '📖',
      order: 2,
      active: true,
    },
  });
  console.log(`\n✅ Subject: ${ela6.name} (Grade ${ela6.gradeLevel})`);

  // --- Unit 1: Identity, Belonging, and Voice ---
  const elaU1 = await prisma.unit.upsert({
    where: { id: 'g6-ela-u1' },
    update: {},
    create: {
      id: 'g6-ela-u1',
      subjectId: ela6.id,
      title: 'Identity, Belonging, and Voice',
      description: 'Explore how experiences, relationships, and culture shape who we are. Read stories, build vocabulary, draft a personal narrative, and share your voice.',
      icon: '🪞',
      order: 0,
    },
  });

  const elaLessonData = [
    { id: 'g6-ela-u1-l1', title: 'Who Am I?', subtitle: 'Explore identity-themed texts using reading strategies.', order: 1 },
    { id: 'g6-ela-u1-l2', title: 'Words That Shape Us', subtitle: 'Explore how vocabulary carries cultural and personal meaning.', order: 2 },
    { id: 'g6-ela-u1-l3', title: 'Theme & Message', subtitle: 'Learn the difference between theme and topic. Identify deeper messages in identity texts.', order: 3 },
    { id: 'g6-ela-u1-l4', title: 'Narrative Structure', subtitle: 'Learn the parts of a narrative and how authors structure stories.', order: 4 },
    { id: 'g6-ela-u1-l5', title: 'Drafting My Narrative', subtitle: 'Plan and write the first draft of your personal identity narrative.', order: 5 },
    { id: 'g6-ela-u1-l6', title: 'Revision & Voice', subtitle: 'Strengthen your writing with show-don\'t-tell, power words, and sentence variety.', order: 6 },
    { id: 'g6-ela-u1-l7', title: 'Discussion Circle', subtitle: 'Share your narrative, practice active listening, and reflect on the unit.', order: 7 },
  ];

  for (const l of elaLessonData) {
    await prisma.lesson.upsert({
      where: { id: l.id },
      update: {
        title: l.title,
        subtitle: l.subtitle,
        order: l.order,
        subjectMode: 'ELA',
        externalUrl: null,
      },
      create: {
        id: l.id,
        unitId: elaU1.id,
        title: l.title,
        subtitle: l.subtitle,
        order: l.order,
        subjectMode: 'ELA',
        externalUrl: null,
      },
    });
  }
  console.log(`✅ ELA Unit: ${elaU1.title} (7 lessons)`);

  // --- Unit 2: Story Power ---
  const elaU2 = await prisma.unit.upsert({
    where: { id: 'g6-ela-u2' },
    update: {},
    create: {
      id: 'g6-ela-u2',
      subjectId: ela6.id,
      title: 'Story Power',
      description: 'Study fiction as both a reader and writer. Analyze mentor texts for narrative craft, then create your own original short story.',
      icon: '📕',
      order: 1,
    },
  });

  const elaU2LessonData = [
    { id: 'g6-ela-u2-l1', title: 'What Makes a Great Story?', subtitle: 'Analyze fiction to identify protagonist, antagonist, conflict, and plot elements.', order: 1 },
    { id: 'g6-ela-u2-l2', title: 'Story Structures', subtitle: 'Explore subplot, flashback, flash-forward, and story-within-a-story.', order: 2 },
    { id: 'g6-ela-u2-l3', title: 'Exploring Sub-Genres', subtitle: 'Compare fantasy, sci-fi, historical fiction, mystery, and comedy.', order: 3 },
    { id: 'g6-ela-u2-l4', title: 'The Writer\'s Toolbox', subtitle: 'Sensory detail, dialogue, figurative language, and show-don\'t-tell.', order: 4 },
    { id: 'g6-ela-u2-l5', title: 'Building My Story', subtitle: 'Plan and draft a multi-paragraph short story using a story map.', order: 5 },
    { id: 'g6-ela-u2-l6', title: 'Crafting Conflict & Character', subtitle: 'Create compelling conflict and develop round characters with motivation.', order: 6 },
    { id: 'g6-ela-u2-l7', title: 'Editing Lab', subtitle: 'Capitalization, colon usage, clause identification, and sentence variety.', order: 7 },
    { id: 'g6-ela-u2-l8', title: 'Story Showcase', subtitle: 'Final revision, peer feedback, publish and share.', order: 8 },
  ];

  for (const l of elaU2LessonData) {
    await prisma.lesson.upsert({
      where: { id: l.id },
      update: { title: l.title, subtitle: l.subtitle, order: l.order, subjectMode: 'ELA', externalUrl: null },
      create: { id: l.id, unitId: elaU2.id, title: l.title, subtitle: l.subtitle, order: l.order, subjectMode: 'ELA', externalUrl: null },
    });
  }
  console.log(`✅ ELA Unit: ${elaU2.title} (8 lessons)`);

  // --- Unit 3: Truth, Evidence, and Information ---
  const elaU3 = await prisma.unit.upsert({
    where: { id: 'g6-ela-u3' },
    update: {},
    create: {
      id: 'g6-ela-u3',
      subjectId: ela6.id,
      title: 'Truth, Evidence, and Information',
      description: 'Identify main ideas, evaluate source reliability, and write evidence-based research responses. Build media literacy and nonfiction reading skills.',
      icon: '🔎',
      order: 2,
    },
  });

  const elaU3LessonData = [
    { id: 'g6-ela-u3-l1', title: 'Reading Non-Fiction', subtitle: 'Non-fiction text features, structures, and main idea identification.', order: 1 },
    { id: 'g6-ela-u3-l2', title: 'Word Roots & Origins', subtitle: 'Greek/Latin roots, prefixes, suffixes, and morphology.', order: 2 },
    { id: 'g6-ela-u3-l3', title: 'Academic Vocabulary', subtitle: 'Tier 2/3 words across subjects and precise communication.', order: 3 },
    { id: 'g6-ela-u3-l4', title: 'Fact vs Opinion', subtitle: 'Evaluating claims, identifying bias, and checking reliability.', order: 4 },
    { id: 'g6-ela-u3-l5', title: 'Research Skills', subtitle: 'Narrowing questions, finding multiple sources, and note-taking.', order: 5 },
    { id: 'g6-ela-u3-l6', title: 'Evidence-Based Writing', subtitle: 'Writing paragraphs supported by evidence from sources.', order: 6 },
    { id: 'g6-ela-u3-l7', title: 'Spelling Lab', subtitle: 'Spelling patterns, bases, affixes, and derivations.', order: 7 },
    { id: 'g6-ela-u3-l8', title: 'Research Report', subtitle: 'Draft, revise, and publish an evidence-based research report.', order: 8 },
  ];

  for (const l of elaU3LessonData) {
    await prisma.lesson.upsert({
      where: { id: l.id },
      update: { title: l.title, subtitle: l.subtitle, order: l.order, subjectMode: 'ELA', externalUrl: null },
      create: { id: l.id, unitId: elaU3.id, title: l.title, subtitle: l.subtitle, order: l.order, subjectMode: 'ELA', externalUrl: null },
    });
  }
  console.log(`✅ ELA Unit: ${elaU3.title} (8 lessons)`);

  // --- Unit 4: Perspectives and Justice ---
  const elaU4 = await prisma.unit.upsert({
    where: { id: 'g6-ela-u4' },
    update: {},
    create: {
      id: 'g6-ela-u4',
      subjectId: ela6.id,
      title: 'Perspectives and Justice',
      description: 'Compare viewpoints, discuss ideas, and write persuasive responses about school community, fairness, belonging, and local responsibility.',
      icon: '⚖️',
      order: 3,
    },
  });

  const elaU4LessonData = [
    { id: 'g6-ela-u4-l1', title: 'Walking in Others\' Shoes', subtitle: 'Perspective-taking through fiction and empathy development.', order: 1 },
    { id: 'g6-ela-u4-l2', title: 'Whose Voice Is Missing?', subtitle: 'Bias, representation, and audience influence in texts.', order: 2 },
    { id: 'g6-ela-u4-l3', title: 'Building Arguments', subtitle: 'Claims, evidence, reasoning, and persuasive structure.', order: 3 },
    { id: 'g6-ela-u4-l4', title: 'Effective Communication', subtitle: 'Verbal, non-verbal, and paraverbal communication cues.', order: 4 },
    { id: 'g6-ela-u4-l5', title: 'The Art of Persuasion', subtitle: 'Analyzing persuasive texts, speeches, and rhetorical strategies.', order: 5 },
    { id: 'g6-ela-u4-l6', title: 'Presentation Planning', subtitle: 'Structure, audience awareness, and delivery preparation.', order: 6 },
    { id: 'g6-ela-u4-l7', title: 'Collaborative Discussion', subtitle: 'Dialogue protocols, active listening, and constructive feedback.', order: 7 },
    { id: 'g6-ela-u4-l8', title: 'Perspectives Showcase', subtitle: 'Present argument, receive peer feedback, and reflect.', order: 8 },
  ];

  for (const l of elaU4LessonData) {
    await prisma.lesson.upsert({
      where: { id: l.id },
      update: { title: l.title, subtitle: l.subtitle, order: l.order, subjectMode: 'ELA', externalUrl: null },
      create: { id: l.id, unitId: elaU4.id, title: l.title, subtitle: l.subtitle, order: l.order, subjectMode: 'ELA', externalUrl: null },
    });
  }
  console.log(`✅ ELA Unit: ${elaU4.title} (8 lessons)`);

  // --- Unit 5: Wonder, Discovery, and Imagination ---
  const elaU5 = await prisma.unit.upsert({
    where: { id: 'g6-ela-u5' },
    update: {},
    create: {
      id: 'g6-ela-u5',
      subjectId: ela6.id,
      title: 'Wonder, Discovery, and Imagination',
      description: 'Connect informational reading, poetry, and imaginative thinking. Explore figurative language, original expression, and the joy of language itself.',
      icon: '🌿',
      order: 4,
    },
  });

  const elaU5LessonData = [
    { id: 'g6-ela-u5-l1', title: 'The Power of Poetry', subtitle: 'Poetic structures, rhythm, rhyme, and free verse.', order: 1 },
    { id: 'g6-ela-u5-l2', title: 'Figurative Language Deep Dive', subtitle: 'Extended metaphor, symbolism, imagery, and sound devices.', order: 2 },
    { id: 'g6-ela-u5-l3', title: 'Drama & Performance', subtitle: 'Reading and viewing dramatic works including comedy and tragedy.', order: 3 },
    { id: 'g6-ela-u5-l4', title: 'Land as Text', subtitle: 'FNMI land literacy — how structures of land carry meaning.', order: 4 },
    { id: 'g6-ela-u5-l5', title: 'Speaking With Power', subtitle: 'Rhetoric, persuasion, and elements of public speaking.', order: 5 },
    { id: 'g6-ela-u5-l6', title: 'Writing Poetry', subtitle: 'Crafting original poems with voice, imagery, and structure.', order: 6 },
    { id: 'g6-ela-u5-l7', title: 'Creative Performance', subtitle: 'Dramatic reading, spoken word preparation, and rehearsal.', order: 7 },
    { id: 'g6-ela-u5-l8', title: 'Wonder Showcase', subtitle: 'Perform original work and reflect on creative growth.', order: 8 },
  ];

  for (const l of elaU5LessonData) {
    await prisma.lesson.upsert({
      where: { id: l.id },
      update: { title: l.title, subtitle: l.subtitle, order: l.order, subjectMode: 'ELA', externalUrl: null },
      create: { id: l.id, unitId: elaU5.id, title: l.title, subtitle: l.subtitle, order: l.order, subjectMode: 'ELA', externalUrl: null },
    });
  }
  console.log(`✅ ELA Unit: ${elaU5.title} (8 lessons)`);

  // --- Unit 6: Publish and Reflect ---
  const elaU6 = await prisma.unit.upsert({
    where: { id: 'g6-ela-u6' },
    update: {},
    create: {
      id: 'g6-ela-u6',
      subjectId: ela6.id,
      title: 'Publish and Reflect',
      description: 'Analyze revision choices, select and polish your strongest work, build a portfolio, and present your learning journey with confidence.',
      icon: '🎓',
      order: 5,
    },
  });

  const elaU6LessonData = [
    { id: 'g6-ela-u6-l1', title: 'Looking Back', subtitle: 'Review growth across all units, identify strengths and areas for improvement.', order: 1 },
    { id: 'g6-ela-u6-l2', title: 'Portfolio Selection', subtitle: 'Choose, justify, and organize portfolio pieces from Units 1–5.', order: 2 },
    { id: 'g6-ela-u6-l3', title: 'Revision Masterclass', subtitle: 'Deep revision of 2 selected pieces for clarity, voice, and impact.', order: 3 },
    { id: 'g6-ela-u6-l4', title: 'Publishing Lab', subtitle: 'Add text features, graphics, captions, and final formatting.', order: 4 },
    { id: 'g6-ela-u6-l5', title: 'Learning Story', subtitle: 'Present your growth narrative to an audience with confidence.', order: 5 },
    { id: 'g6-ela-u6-l6', title: 'Celebration & Next Steps', subtitle: 'Final reflection, goal-setting for Grade 7, and celebration.', order: 6 },
  ];

  for (const l of elaU6LessonData) {
    await prisma.lesson.upsert({
      where: { id: l.id },
      update: { title: l.title, subtitle: l.subtitle, order: l.order, subjectMode: 'ELA', externalUrl: null },
      create: { id: l.id, unitId: elaU6.id, title: l.title, subtitle: l.subtitle, order: l.order, subjectMode: 'ELA', externalUrl: null },
    });
  }
  console.log(`✅ ELA Unit: ${elaU6.title} (6 lessons)`);

  // ╔═══════════════════════════════════════════╗
  // ║ 4. ACTIVITIES                               ║
  // ╚═══════════════════════════════════════════╝

  const quiz1 = await prisma.activity.upsert({
    where: { id: 'g7-sci-ua-l1-quiz' },
    update: {},
    create: {
      id: 'g7-sci-ua-l1-quiz',
      lessonId: lesson1.id,
      type: 'QUIZ',
      title: 'Ecosystem Basics Quiz',
      points: 10,
      order: 1,
      content: {
        questions: [
          { question: 'What are the two main components of an ecosystem?', options: ['Living and non-living things', 'Water and air', 'Plants and animals', 'Sun and soil'], answer: 0 },
          { question: 'Which of these is an abiotic factor?', options: ['Tree', 'Sunlight', 'Deer', 'Bacteria'], answer: 1 },
        ],
      },
    },
  });

  const assignment1 = await prisma.activity.upsert({
    where: { id: 'g7-sci-ua-l2-assign' },
    update: {},
    create: {
      id: 'g7-sci-ua-l2-assign',
      lessonId: lesson2.id,
      type: 'ASSIGNMENT',
      title: 'Food Web Drawing',
      points: 20,
      order: 1,
      content: {
        prompt: 'Draw a food web that includes at least 5 organisms.',
        rubric: [
          { criterion: 'Includes 5+ organisms', maxPoints: 5 },
          { criterion: 'Correctly labeled roles', maxPoints: 5 },
          { criterion: 'Arrows show energy flow', maxPoints: 5 },
          { criterion: 'Neat and clear', maxPoints: 5 },
        ],
      },
    },
  });

  const reflection1 = await prisma.activity.upsert({
    where: { id: 'g7-sci-ub-l1-reflect' },
    update: {},
    create: {
      id: 'g7-sci-ub-l1-reflect',
      lessonId: 'g7-sci-ub-l1',
      type: 'REFLECTION',
      title: 'Plant Growth Reflection',
      points: 10,
      order: 1,
      content: { prompt: 'Reflect on what you learned about factors affecting plant growth.' },
    },
  });

  const labReport = await prisma.activity.upsert({
    where: { id: 'g7-sci-uc-l1-lab' },
    update: {},
    create: {
      id: 'g7-sci-uc-l1-lab',
      lessonId: 'g7-sci-uc-l1',
      type: 'ASSIGNMENT',
      title: 'Heat Transfer Lab',
      points: 20,
      order: 1,
      content: { prompt: 'Test 5 materials and record how they conduct heat.' },
    },
  });

  console.log(`✅ Activities: 4 total (quiz, assignment, reflection, lab)`);

  // ╔═══════════════════════════════════════════╗
  // ║ 5. LEARNING OUTCOMES                       ║
  // ╚═══════════════════════════════════════════╝

  const outcomes = [
    { id: 'o-sci7-a1', code: 'SCI.7.A.1', description: 'Investigate and describe relationships between organisms in an ecosystem', subjectArea: 'Science', gradeLevel: 7, unitContext: 'Unit A — Ecosystems' },
    { id: 'o-sci7-a2', code: 'SCI.7.A.2', description: 'Identify examples of predator-prey and symbiotic relationships', subjectArea: 'Science', gradeLevel: 7, unitContext: 'Unit A — Ecosystems' },
    { id: 'o-sci7-b1', code: 'SCI.7.B.1', description: 'Describe the conditions and processes needed for plant growth', subjectArea: 'Science', gradeLevel: 7, unitContext: 'Unit B — Plants' },
    { id: 'o-sci7-b2', code: 'SCI.7.B.2', description: 'Examine plant adaptations to different environments', subjectArea: 'Science', gradeLevel: 7, unitContext: 'Unit B — Plants' },
    { id: 'o-sci7-c1', code: 'SCI.7.C.1', description: 'Describe heat as a form of energy and identify methods of heat transfer', subjectArea: 'Science', gradeLevel: 7, unitContext: 'Unit C — Heat' },
  ];

  for (const o of outcomes) {
    await prisma.learningOutcome.upsert({
      where: { id: o.id },
      update: {},
      create: o,
    });
  }
  console.log(`✅ Learning Outcomes: ${outcomes.length}`);

  // ╔═══════════════════════════════════════════╗
  // ║ 6. PACING TARGETS                          ║
  // ╚═══════════════════════════════════════════╝

  for (const [unitId, week] of [['g7-sci-unit-a', 4], ['g7-sci-unit-b', 12], ['g7-sci-unit-c', 20]] as const) {
    await prisma.pacingTarget.upsert({
      where: { unitId },
      update: {},
      create: {
        unitId,
        expectedWeek: week,
      },
    });
  }
  console.log(`✅ Pacing Targets: 3`);

  // ╔═══════════════════════════════════════════╗
  // ║ 7. STUDENT PROGRESS                        ║
  // ╚═══════════════════════════════════════════╝

  const progressData = [
    // Ava — strong, ahead
    { studentId: 'student-1', lessonId: lesson1.id, status: 'COMPLETE' as const, completedAt: new Date('2025-09-20') },
    { studentId: 'student-1', lessonId: lesson2.id, status: 'COMPLETE' as const, completedAt: new Date('2025-09-28') },
    { studentId: 'student-1', lessonId: 'g7-sci-ub-l1', status: 'IN_PROGRESS' as const },
    // Liam — on pace
    { studentId: 'student-2', lessonId: lesson1.id, status: 'COMPLETE' as const, completedAt: new Date('2025-09-22') },
    { studentId: 'student-2', lessonId: lesson2.id, status: 'IN_PROGRESS' as const },
    // Emma — slightly behind
    { studentId: 'student-3', lessonId: lesson1.id, status: 'COMPLETE' as const, completedAt: new Date('2025-10-01') },
    // Noah — significantly behind
    { studentId: 'student-4', lessonId: lesson1.id, status: 'IN_PROGRESS' as const },
    // Sophia — ahead
    { studentId: 'student-5', lessonId: lesson1.id, status: 'COMPLETE' as const, completedAt: new Date('2025-09-18') },
    { studentId: 'student-5', lessonId: lesson2.id, status: 'COMPLETE' as const, completedAt: new Date('2025-09-25') },
    { studentId: 'student-5', lessonId: 'g7-sci-ub-l1', status: 'COMPLETE' as const, completedAt: new Date('2025-10-05') },
    { studentId: 'student-5', lessonId: 'g7-sci-uc-l1', status: 'IN_PROGRESS' as const },
    // Jackson — on pace
    { studentId: 'student-6', lessonId: lesson1.id, status: 'COMPLETE' as const, completedAt: new Date('2025-09-21') },
    { studentId: 'student-6', lessonId: lesson2.id, status: 'COMPLETE' as const, completedAt: new Date('2025-10-01') },
    { studentId: 'student-6', lessonId: 'g7-sci-ub-l1', status: 'IN_PROGRESS' as const },
  ];

  for (const p of progressData) {
    const key = { studentId: p.studentId, lessonId: p.lessonId };
    await prisma.studentProgress.upsert({
      where: { studentId_lessonId: key },
      update: {},
      create: { ...p },
    });
  }
  console.log(`✅ Student Progress: ${progressData.length} records`);

  // ╔═══════════════════════════════════════════╗
  // ║ 8. SUBMISSIONS (the key review data)       ║
  // ╚═══════════════════════════════════════════╝

  const submissionData = [
    // Ava — ecosystem quiz (reviewed)
    {
      id: 'sub-1',
      studentId: 'student-1',
      activityId: quiz1.id,
      submissionType: 'QUIZ_RESPONSE' as const,
      score: 9,
      maxScore: 10,
      reviewed: true,
      reviewedAt: new Date('2026-03-14T14:00:00'),
      reviewedBy: teacher.id,
      teacherFeedback: 'Excellent understanding of ecosystem relationships. One point missed on decomposer classification.',
      submittedAt: new Date('2026-03-14T10:30:00'),
    },
    // Sophia — heat transfer lab (NEEDS REVIEW — paragraph response)
    {
      id: 'sub-2',
      studentId: 'student-5',
      activityId: labReport.id,
      submissionType: 'PARAGRAPH_RESPONSE' as const,
      writtenResponse: 'In our experiment, we tested five materials to see which ones conducted heat the fastest. We placed each material on a hot plate set to 60°C and measured the temperature at the opposite end every 30 seconds for 5 minutes.\n\nResults:\n- Aluminum: reached 52°C fastest (by 2 minutes)\n- Steel: reached 48°C by 3 minutes\n- Glass: reached 38°C by 5 minutes\n- Wood: only reached 28°C\n- Styrofoam: stayed at 22°C\n\nThis shows that metals are good conductors because the particles are close together and transfer kinetic energy quickly through collisions. Non-metals like wood and styrofoam are insulators because their particles are more spread out and don\'t transfer energy as efficiently.\n\nOne thing I found interesting is that aluminum conducted heat faster than steel, even though they are both metals. I think this is because aluminum has lower density and its electrons move more freely.',
      score: null,
      maxScore: 20,
      reviewed: false,
      submittedAt: new Date('2026-03-14T09:15:00'),
    },
    // Jackson — plant growth reflection (NEEDS REVIEW)
    {
      id: 'sub-3',
      studentId: 'student-6',
      activityId: reflection1.id,
      submissionType: 'REFLECTION' as const,
      writtenResponse: 'Before this unit, I thought plants only needed water and sunlight to grow. Now I understand that they also need carbon dioxide, minerals from the soil, and the right temperature.\n\nThe experiment we did where we grew plants in different light conditions was really cool. The plant in complete darkness turned yellow and grew really tall and thin (etiolated), while the one in full light was shorter but had much greener and thicker leaves. This taught me that light doesn\'t just give energy — it actually changes how the plant develops.\n\nI want to learn more about how plants in the arctic survive with so little light for part of the year.',
      score: null,
      maxScore: 10,
      reviewed: false,
      submittedAt: new Date('2026-03-13T14:00:00'),
    },
    // Liam — food web drawing (reviewed)
    {
      id: 'sub-4',
      studentId: 'student-2',
      activityId: assignment1.id,
      submissionType: 'IMAGE_ARTIFACT' as const,
      fileUrl: '#',
      fileName: 'food_web_diagram.png',
      score: 17,
      maxScore: 20,
      reviewed: true,
      reviewedAt: new Date('2026-03-12T15:00:00'),
      reviewedBy: teacher.id,
      teacherFeedback: 'Great diagram showing multiple interconnected chains. Consider adding decomposers to complete the cycle.',
      submittedAt: new Date('2026-03-12T11:45:00'),
    },
    // Emma — producers & consumers quiz (reviewed)
    {
      id: 'sub-5',
      studentId: 'student-3',
      activityId: quiz1.id,
      submissionType: 'QUIZ_RESPONSE' as const,
      score: 8,
      maxScore: 10,
      reviewed: true,
      reviewedAt: new Date('2026-03-11T16:00:00'),
      reviewedBy: teacher.id,
      teacherFeedback: 'Solid understanding. Missed the tertiary consumer question — review the food chain levels.',
      submittedAt: new Date('2026-03-11T13:20:00'),
    },
    // Ava — food web drawing (NEEDS REVIEW — artifact)
    {
      id: 'sub-6',
      studentId: 'student-1',
      activityId: assignment1.id,
      submissionType: 'IMAGE_ARTIFACT' as const,
      fileUrl: '#',
      fileName: 'ava_food_web_v2.png',
      score: null,
      maxScore: 20,
      reviewed: false,
      submittedAt: new Date('2026-03-15T08:30:00'),
    },
    // Ethan — ecosystem quiz (NEEDS REVIEW)
    {
      id: 'sub-7',
      studentId: 'student-8',
      activityId: quiz1.id,
      submissionType: 'QUIZ_RESPONSE' as const,
      score: 6,
      maxScore: 10,
      reviewed: false,
      submittedAt: new Date('2026-03-15T10:00:00'),
    },
  ];

  for (const s of submissionData) {
    await prisma.submission.upsert({
      where: { id: s.id },
      update: {},
      create: {
        id: s.id,
        studentId: s.studentId,
        activityId: s.activityId,
        submissionType: s.submissionType,
        writtenResponse: (s as Record<string, unknown>).writtenResponse as string || null,
        fileUrl: (s as Record<string, unknown>).fileUrl as string || null,
        fileName: (s as Record<string, unknown>).fileName as string || null,
        score: s.score,
        maxScore: s.maxScore,
        reviewed: s.reviewed,
        reviewedAt: (s as Record<string, unknown>).reviewedAt as Date || null,
        reviewedBy: (s as Record<string, unknown>).reviewedBy as string || null,
        teacherFeedback: (s as Record<string, unknown>).teacherFeedback as string || null,
        submittedAt: s.submittedAt,
      },
    });
  }
  console.log(`✅ Submissions: ${submissionData.length} (4 need review, 3 reviewed)`);

  // ╔═══════════════════════════════════════════╗
  // ║ 9. MASTERY JUDGMENTS (existing ones only)  ║
  // ╚═══════════════════════════════════════════╝

  const masteryData = [
    { id: 'mj-1', studentId: 'student-1', outcomeId: 'o-sci7-a1', teacherId: teacher.id, masteryLevel: 'MEETING' as const, teacherNote: 'Strong understanding shown in quiz and class discussion.' },
    { id: 'mj-2', studentId: 'student-2', outcomeId: 'o-sci7-a1', teacherId: teacher.id, masteryLevel: 'APPROACHING' as const, teacherNote: 'Getting there — food web shows some confusion on secondary consumers.' },
    { id: 'mj-3', studentId: 'student-3', outcomeId: 'o-sci7-a1', teacherId: teacher.id, masteryLevel: 'MEETING' as const },
  ];

  for (const m of masteryData) {
    await prisma.masteryJudgment.upsert({
      where: { id: m.id },
      update: {},
      create: m,
    });
  }
  console.log(`✅ Mastery Judgments: ${masteryData.length}`);

  // ╔═══════════════════════════════════════════╗
  // ║ 10. TEACHER NOTES (a few existing)         ║
  // ╚═══════════════════════════════════════════╝

  const noteData = [
    { id: 'note-1', studentId: 'student-4', teacherId: teacher.id, tag: 'Support Concern', content: 'Noah has been absent frequently. Need to check in with home about engagement.' },
    { id: 'note-2', studentId: 'student-1', teacherId: teacher.id, tag: 'Observation', content: 'Ava is consistently helping peers during group work. Consider peer tutor role.' },
  ];

  for (const n of noteData) {
    await prisma.teacherNote.upsert({
      where: { id: n.id },
      update: {},
      create: n,
    });
  }
  console.log(`✅ Teacher Notes: ${noteData.length}`);

  console.log('\n🎉 Seed complete!');
  console.log('   1 teacher, 8 students, 1 subject, 3 units, 4 lessons');
  console.log('   4 activities, 5 outcomes, 7 submissions (4 need review)');
  console.log('   3 mastery judgments, 2 teacher notes');
  console.log('\n   Set NEXT_PUBLIC_DEMO_MODE=false in .env.local to use real data.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    pool.end();
  });
