import { config } from 'dotenv';
config({ path: '.env.local' });

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, SubjectMode, LessonSection, BlockType } from '@prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting Phonics (UFLI) Seeding...');

  // 1. Create or ensure PHONICS subject exists
  const phonicsSubject = await prisma.subject.upsert({
    where: { id: 'subj_phonics_1' },
    update: {},
    create: {
      id: 'subj_phonics_1',
      name: 'Phonics (Foundations)',
      gradeLevel: 1,
      icon: '🔤',
      order: 1,
      active: true,
    },
  });

  // 2. Create Unit 1: Alphabet (Lessons 1-34)
  const unit1 = await prisma.unit.upsert({
    where: { id: 'unit_phonics_alphabet' },
    update: {},
    create: {
      id: 'unit_phonics_alphabet',
      subjectId: phonicsSubject.id,
      title: 'Alphabet',
      description: 'Foundational alphabet concepts, short vowels, and consonants.',
      order: 1,
    },
  });

  // 3. Create Graphemes
  const graphemesData = [
    {
      id: 'g_a_short',
      grapheme: 'a',
      phoneme: '/ă/',
      placementTags: ['beginning', 'middle'],
      articulatoryGestureScript: 'To make the short A /ă/ sound, open your mouth wide like this...(model). Be sure your voice is on. Like all vowels, /ă/ is a continuous sound that can be stretched out. Watch me /ă/. You try /ă/.',
      secretStoryScript: 'Superhero A is in his short and lazy disguise... he just sits around eating apples all day saying AA-AA-Apple!',
      soundWallCategory: 'Vowel Valley',
    },
    {
      id: 'g_m',
      grapheme: 'm',
      phoneme: '/m/',
      placementTags: ['beginning', 'middle', 'end'],
      articulatoryGestureScript: 'To make the /m/ sound put your lips together and hum like this...(model). All of the air should come out of your nose. Watch me /mmm/. You try /mmm/.',
      secretStoryScript: null,
      soundWallCategory: 'Nose',
    },
    {
      id: 'g_s',
      grapheme: 's',
      phoneme: '/s/',
      placementTags: ['beginning', 'middle', 'end'],
      articulatoryGestureScript: 'To make the /s/ sound, put your tongue right behind your top, front teeth and blow air out... hissssing sssnake!',
      secretStoryScript: null,
      soundWallCategory: 'Fricative',
    },
    {
      id: 'g_t',
      grapheme: 't',
      phoneme: '/t/',
      placementTags: ['beginning', 'middle', 'end'],
      articulatoryGestureScript: 'To make the /t/ sound, tap your tongue right behind your top, front teeth. Keep your voice off. Watch me /t/. You try /t/.',
      secretStoryScript: null,
      soundWallCategory: 'Stop',
    },
  ];

  for (const g of graphemesData) {
    await prisma.grapheme.upsert({
      where: { grapheme: g.grapheme },
      update: g,
      create: g,
    });
  }

  // 4. Create Lessons 1-4
  const lessonsData = [
    {
      id: 'ufli-001',
      lessonNumber: '1',
      title: 'a /ă/',
      description: 'Learn the short A sound and recognize the letter A.',
      category: 'Alphabet',
      targetSkill: 'Phoneme-Grapheme Correspondence: a /ă/',
      keyword: 'apple',
      graphemes: ['g_a_short']
    },
    {
      id: 'ufli-002',
      lessonNumber: '2',
      title: 'm /m/',
      description: 'Learn the M sound and practice blending with A.',
      category: 'Alphabet',
      targetSkill: 'Phoneme-Grapheme Correspondence: m /m/',
      keyword: 'mouse',
      graphemes: ['g_m']
    },
    {
      id: 'ufli-003',
      lessonNumber: '3',
      title: 's /s/',
      description: 'Learn the S sound and practice blending CVC words.',
      category: 'Alphabet',
      targetSkill: 'Phoneme-Grapheme Correspondence: s /s/',
      keyword: 'sun',
      graphemes: ['g_s']
    },
    {
      id: 'ufli-004',
      lessonNumber: '4',
      title: 't /t/',
      description: 'Learn the T sound and continue reading CVC words.',
      category: 'Alphabet',
      targetSkill: 'Phoneme-Grapheme Correspondence: t /t/',
      keyword: 'tiger',
      graphemes: ['g_t']
    }
  ];

  let order = 1;
  for (const l of lessonsData) {
    const createdLesson = await prisma.lesson.upsert({
      where: { id: l.id },
      update: {},
      create: {
        id: l.id,
        unitId: unit1.id,
        title: l.title,
        description: l.description,
        order: order++,
        subjectMode: SubjectMode.PHONICS,
        category: l.category,
        targetSkill: l.targetSkill,
        keyword: l.keyword,
        masteryDecodingAccuracy: 0.9,
        masteryEncodingAccuracy: 0.9,
        masterySessionsRequired: 2,
        contentStatus: 'placeholder_seed',
        lessonGraphemes: {
          create: l.graphemes.map(gId => ({
            grapheme: { connect: { id: gId } }
          }))
        }
      },
    });
  }

  // 5. Seed Words
  const wordsData = [
    { word: 'the', isHeartWord: true, heartWordSource: 'Dolch', introLesson: 'ufli-001', graphemes: [] },
    { word: 'a', isHeartWord: false, heartWordSource: null, introLesson: 'ufli-001', graphemes: ['g_a_short'] },
    { word: 'am', isHeartWord: false, heartWordSource: null, introLesson: 'ufli-002', graphemes: ['g_a_short', 'g_m'] },
    { word: 'I', isHeartWord: true, heartWordSource: 'Dolch', introLesson: 'ufli-003', graphemes: [] },
    { word: 'at', isHeartWord: false, heartWordSource: null, introLesson: 'ufli-004', graphemes: ['g_a_short', 'g_t'] },
    { word: 'sat', isHeartWord: false, heartWordSource: null, introLesson: 'ufli-004', graphemes: ['g_s', 'g_a_short', 'g_t'] },
    { word: 'mat', isHeartWord: false, heartWordSource: null, introLesson: 'ufli-004', graphemes: ['g_m', 'g_a_short', 'g_t'] },
    { word: 'and', isHeartWord: true, heartWordSource: 'Dolch', introLesson: 'ufli-004', graphemes: [] },
  ];

  for (const w of wordsData) {
    const createdWord = await prisma.word.upsert({
      where: { word: w.word },
      update: {},
      create: {
        word: w.word,
        isHeartWord: w.isHeartWord,
        heartWordSource: w.heartWordSource,
        introducedLessonId: w.introLesson,
        wordGraphemes: {
          create: w.graphemes.map(gId => ({
            grapheme: { connect: { id: gId } }
          }))
        }
      }
    });
  }

  // 6. Spelling Assessments
  const assessmentsData = [
    {
      lessonId: 'ufli-001',
      regularWords: ['a'],
      irregularWords: ['the'],
      sentences: [],
      newConceptPoints: 0, // Practice only
      totalPoints: 0
    },
    {
      lessonId: 'ufli-002',
      regularWords: ['a', 'm'],
      irregularWords: [],
      sentences: [],
      newConceptPoints: 0,
      totalPoints: 0
    },
    {
      lessonId: 'ufli-003',
      regularWords: ['m', 's'],
      irregularWords: ['I'],
      sentences: [],
      newConceptPoints: 0,
      totalPoints: 0
    },
    {
      lessonId: 'ufli-004',
      regularWords: ['s', 't'],
      irregularWords: [],
      sentences: [],
      newConceptPoints: 0,
      totalPoints: 0
    }
  ];

  for (const a of assessmentsData) {
    await prisma.phonicsAssessment.upsert({
      where: { lessonId: a.lessonId },
      update: a,
      create: a,
    });
  }

  console.log('✅ Phonics seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during phonics seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
