import { readFileSync } from 'fs';

// Load .env.local without dotenv (avoids npx module resolution issues)
try {
  const raw = readFileSync('.env.local', 'utf-8');
  for (const line of raw.split('\n')) {
    const match = line.match(/^([^#=\s][^=]*)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  }
} catch { /* rely on env vars already set */ }

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, SubjectMode } from '@prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting Phonics (UFLI) Seeding...');

  // ─── 1. Subject ───
  const phonicsSubject = await prisma.subject.upsert({
    where: { id: 'subj_phonics_1' },
    update: { active: true },
    create: {
      id: 'subj_phonics_1',
      name: 'Phonics (Foundations)',
      gradeLevel: 1,
      icon: '🔤',
      order: 1,
      active: true,
    },
  });
  console.log('✅ Subject:', phonicsSubject.name);

  // ─── 2. Unit ───
  const unit1 = await prisma.unit.upsert({
    where: { id: 'unit_phonics_alphabet' },
    update: {},
    create: {
      id: 'unit_phonics_alphabet',
      subjectId: phonicsSubject.id,
      title: 'Alphabet — Cluster 1',
      description: 'Short vowel /ă/, and common consonants m, s, t, i, n, p, b, c, f. Students learn phoneme-grapheme correspondences and build CVC decoding skills.',
      order: 1,
    },
  });
  console.log('✅ Unit:', unit1.title);

  // ─── 3. Graphemes ───
  const graphemesData = [
    {
      id: 'g_a_short',
      grapheme: 'a',
      phoneme: '/ă/',
      placementTags: ['beginning', 'middle'],
      articulatoryGestureScript: 'To make the short A /ă/ sound, open your mouth wide. Your voice is on. /ă/ — like "apple".',
      secretStoryScript: 'Superhero A is in his short and lazy disguise... he just sits around eating apples all day saying /ă/-/ă/-apple!',
      soundWallCategory: 'Short Vowels',
    },
    {
      id: 'g_m',
      grapheme: 'm',
      phoneme: '/m/',
      placementTags: ['beginning', 'middle', 'end'],
      articulatoryGestureScript: 'Put your lips together and hum. All air comes out your nose. /mmm/ — like "mouse".',
      secretStoryScript: null,
      soundWallCategory: 'Nasals',
    },
    {
      id: 'g_s',
      grapheme: 's',
      phoneme: '/s/',
      placementTags: ['beginning', 'middle', 'end'],
      articulatoryGestureScript: 'Put your tongue just behind your top front teeth and blow air. /ssss/ — like a hissing snake.',
      secretStoryScript: null,
      soundWallCategory: 'Fricatives',
    },
    {
      id: 'g_t',
      grapheme: 't',
      phoneme: '/t/',
      placementTags: ['beginning', 'middle', 'end'],
      articulatoryGestureScript: 'Tap your tongue just behind your top front teeth. Keep your voice off. /t/ — like "tiger".',
      secretStoryScript: null,
      soundWallCategory: 'Stops',
    },
    {
      id: 'g_i_short',
      grapheme: 'i',
      phoneme: '/ĭ/',
      placementTags: ['beginning', 'middle'],
      articulatoryGestureScript: 'Smile slightly and say /ĭ/. Your voice is on. /ĭ/ — like "igloo".',
      secretStoryScript: 'Itsy-bitsy I always feels itchy — /ĭ/-/ĭ/-itch!',
      soundWallCategory: 'Short Vowels',
    },
    {
      id: 'g_n',
      grapheme: 'n',
      phoneme: '/n/',
      placementTags: ['beginning', 'middle', 'end'],
      articulatoryGestureScript: 'Put the tip of your tongue behind your top front teeth and hum. /nnn/ — like "nose".',
      secretStoryScript: null,
      soundWallCategory: 'Nasals',
    },
    {
      id: 'g_p',
      grapheme: 'p',
      phoneme: '/p/',
      placementTags: ['beginning', 'middle', 'end'],
      articulatoryGestureScript: 'Press your lips together and pop them open. Keep your voice off. /p/ — like "pop".',
      secretStoryScript: null,
      soundWallCategory: 'Stops',
    },
    {
      id: 'g_b',
      grapheme: 'b',
      phoneme: '/b/',
      placementTags: ['beginning', 'middle', 'end'],
      articulatoryGestureScript: 'Press your lips together and pop them open. Turn your voice on. /b/ — like "ball".',
      secretStoryScript: null,
      soundWallCategory: 'Stops',
    },
    {
      id: 'g_c',
      grapheme: 'c',
      phoneme: '/k/',
      placementTags: ['beginning', 'end'],
      articulatoryGestureScript: 'Pull the back of your tongue down quickly. Keep your voice off. /k/ — like "cat".',
      secretStoryScript: null,
      soundWallCategory: 'Stops',
    },
    {
      id: 'g_f',
      grapheme: 'f',
      phoneme: '/f/',
      placementTags: ['beginning', 'middle', 'end'],
      articulatoryGestureScript: 'Bite your bottom lip gently and blow air. Keep your voice off. /f/ — like "fish".',
      secretStoryScript: null,
      soundWallCategory: 'Fricatives',
    },
  ];

  for (const g of graphemesData) {
    await prisma.grapheme.upsert({
      where: { grapheme: g.grapheme },
      update: g,
      create: g,
    });
  }
  console.log(`✅ Graphemes: ${graphemesData.length} upserted`);

  // ─── 4. Lessons (10) ───
  const lessonsData = [
    {
      id: 'ufli-001',
      title: 'a /ă/',
      description: 'Introduce the short A sound and letter a. Students learn to segment and blend CVC words with /ă/.',
      category: 'Alphabet',
      targetSkill: 'Phoneme-Grapheme Correspondence: a /ă/',
      keyword: 'apple',
      graphemes: ['g_a_short'],
      heartWords: [{ word: 'the', source: 'Dolch' }],
      regularWords: [{ word: 'a', graphemes: ['g_a_short'] }],
      decodablePassage: 'I see a. I see the mat. The mat is tan.',
    },
    {
      id: 'ufli-002',
      title: 'm /m/',
      description: 'Introduce the /m/ sound. Students blend consonant + vowel and practice CVC words with a and m.',
      category: 'Alphabet',
      targetSkill: 'Phoneme-Grapheme Correspondence: m /m/',
      keyword: 'mouse',
      graphemes: ['g_m'],
      heartWords: [{ word: 'I', source: 'Dolch' }],
      regularWords: [
        { word: 'am', graphemes: ['g_a_short', 'g_m'] },
        { word: 'ma', graphemes: ['g_m', 'g_a_short'] },
      ],
      decodablePassage: 'I am. Ma is a mat. I am at the mat.',
    },
    {
      id: 'ufli-003',
      title: 's /s/',
      description: 'Introduce the /s/ sound. Students read and spell 3-phoneme words using a, m, and s.',
      category: 'Alphabet',
      targetSkill: 'Phoneme-Grapheme Correspondence: s /s/',
      keyword: 'sun',
      graphemes: ['g_s'],
      heartWords: [],
      regularWords: [
        { word: 'Sam', graphemes: ['g_s', 'g_a_short', 'g_m'] },
        { word: 'mas', graphemes: ['g_m', 'g_a_short', 'g_s'] },
      ],
      decodablePassage: 'Sam is. I am Sam. Sam sat.',
    },
    {
      id: 'ufli-004',
      title: 't /t/',
      description: 'Introduce the /t/ sound. Students decode CVC words and read decodable sentences.',
      category: 'Alphabet',
      targetSkill: 'Phoneme-Grapheme Correspondence: t /t/',
      keyword: 'tiger',
      graphemes: ['g_t'],
      heartWords: [{ word: 'and', source: 'Dolch' }],
      regularWords: [
        { word: 'at', graphemes: ['g_a_short', 'g_t'] },
        { word: 'sat', graphemes: ['g_s', 'g_a_short', 'g_t'] },
        { word: 'mat', graphemes: ['g_m', 'g_a_short', 'g_t'] },
        { word: 'tam', graphemes: ['g_t', 'g_a_short', 'g_m'] },
      ],
      decodablePassage: 'Sam sat at the mat. I sat and the mat sat.',
    },
    {
      id: 'ufli-005',
      title: 'i /ĭ/',
      description: 'Introduce the short I sound. Students blend vowel-initial words and practice new CVC patterns.',
      category: 'Alphabet',
      targetSkill: 'Phoneme-Grapheme Correspondence: i /ĭ/',
      keyword: 'igloo',
      graphemes: ['g_i_short'],
      heartWords: [{ word: 'is', source: 'Dolch' }],
      regularWords: [
        { word: 'it', graphemes: ['g_i_short', 'g_t'] },
        { word: 'sit', graphemes: ['g_s', 'g_i_short', 'g_t'] },
        { word: 'Tim', graphemes: ['g_t', 'g_i_short', 'g_m'] },
        { word: 'mit', graphemes: ['g_m', 'g_i_short', 'g_t'] },
      ],
      decodablePassage: 'Tim sat. It is Tim. Sam is at it.',
    },
    {
      id: 'ufli-006',
      title: 'n /n/',
      description: 'Introduce the /n/ sound. Students build more complex CVC words and practice encoding.',
      category: 'Alphabet',
      targetSkill: 'Phoneme-Grapheme Correspondence: n /n/',
      keyword: 'nose',
      graphemes: ['g_n'],
      heartWords: [{ word: 'in', source: 'Dolch' }],
      regularWords: [
        { word: 'nap', graphemes: ['g_n', 'g_a_short', 'g_p'] },
        { word: 'man', graphemes: ['g_m', 'g_a_short', 'g_n'] },
        { word: 'tin', graphemes: ['g_t', 'g_i_short', 'g_n'] },
        { word: 'tan', graphemes: ['g_t', 'g_a_short', 'g_n'] },
        { word: 'sin', graphemes: ['g_s', 'g_i_short', 'g_n'] },
      ],
      decodablePassage: 'Tim is in. Sam and Tim sit. Man sat in it.',
    },
    {
      id: 'ufli-007',
      title: 'p /p/',
      description: 'Introduce the /p/ sound. Students decode and encode new words with the /p/ phoneme.',
      category: 'Alphabet',
      targetSkill: 'Phoneme-Grapheme Correspondence: p /p/',
      keyword: 'pop',
      graphemes: ['g_p'],
      heartWords: [],
      regularWords: [
        { word: 'pan', graphemes: ['g_p', 'g_a_short', 'g_n'] },
        { word: 'pin', graphemes: ['g_p', 'g_i_short', 'g_n'] },
        { word: 'sip', graphemes: ['g_s', 'g_i_short', 'g_p'] },
        { word: 'tip', graphemes: ['g_t', 'g_i_short', 'g_p'] },
        { word: 'pit', graphemes: ['g_p', 'g_i_short', 'g_t'] },
      ],
      decodablePassage: 'Sam has a pan. Tim has a pin. Sit in the pit.',
    },
    {
      id: 'ufli-008',
      title: 'b /b/',
      description: 'Introduce the /b/ sound. Students contrast voiced /b/ with voiceless /p/ and decode CVC words.',
      category: 'Alphabet',
      targetSkill: 'Phoneme-Grapheme Correspondence: b /b/',
      keyword: 'ball',
      graphemes: ['g_b'],
      heartWords: [],
      regularWords: [
        { word: 'bat', graphemes: ['g_b', 'g_a_short', 'g_t'] },
        { word: 'bit', graphemes: ['g_b', 'g_i_short', 'g_t'] },
        { word: 'ban', graphemes: ['g_b', 'g_a_short', 'g_n'] },
        { word: 'bin', graphemes: ['g_b', 'g_i_short', 'g_n'] },
        { word: 'tab', graphemes: ['g_t', 'g_a_short', 'g_b'] },
      ],
      decodablePassage: 'Tim sat in a bin. The bat is tan. Sam hit the bat.',
    },
    {
      id: 'ufli-009',
      title: 'c /k/',
      description: 'Introduce the /k/ sound spelled with letter c. Students read and spell CVC words using c.',
      category: 'Alphabet',
      targetSkill: 'Phoneme-Grapheme Correspondence: c /k/',
      keyword: 'cat',
      graphemes: ['g_c'],
      heartWords: [{ word: 'can', source: null }],
      regularWords: [
        { word: 'cap', graphemes: ['g_c', 'g_a_short', 'g_p'] },
        { word: 'cat', graphemes: ['g_c', 'g_a_short', 'g_t'] },
        { word: 'cit', graphemes: ['g_c', 'g_i_short', 'g_t'] },
        { word: 'cab', graphemes: ['g_c', 'g_a_short', 'g_b'] },
        { word: 'nip', graphemes: ['g_n', 'g_i_short', 'g_p'] },
      ],
      decodablePassage: 'The cat sat in a cab. Sam can nab the cap. Tim can sit.',
    },
    {
      id: 'ufli-010',
      title: 'f /f/',
      description: 'Introduce the /f/ sound. Students decode and encode new CVC words using all graphemes from lessons 1-10.',
      category: 'Alphabet',
      targetSkill: 'Phoneme-Grapheme Correspondence: f /f/',
      keyword: 'fish',
      graphemes: ['g_f'],
      heartWords: [],
      regularWords: [
        { word: 'fan', graphemes: ['g_f', 'g_a_short', 'g_n'] },
        { word: 'fit', graphemes: ['g_f', 'g_i_short', 'g_t'] },
        { word: 'fin', graphemes: ['g_f', 'g_i_short', 'g_n'] },
        { word: 'fat', graphemes: ['g_f', 'g_a_short', 'g_t'] },
        { word: 'nif', graphemes: ['g_n', 'g_i_short', 'g_f'] },
      ],
      decodablePassage: 'The cat is fat. Tim has a fan. Sam can fit in the bin.',
    },
  ];

  let order = 1;
  for (const l of lessonsData) {
    // Create lesson
    await prisma.lesson.upsert({
      where: { id: l.id },
      update: {
        description: l.description,
        category: l.category,
        targetSkill: l.targetSkill,
        keyword: l.keyword,
        contentStatus: 'active',
      },
      create: {
        id: l.id,
        unitId: unit1.id,
        title: l.title,
        subtitle: l.targetSkill,
        description: l.description,
        order: order++,
        subjectMode: SubjectMode.PHONICS,
        category: l.category,
        targetSkill: l.targetSkill,
        keyword: l.keyword,
        masteryDecodingAccuracy: 0.9,
        masteryEncodingAccuracy: 0.85,
        masterySessionsRequired: 1,
        contentStatus: 'active',
      },
    });

    // Link graphemes to lesson (upsert junction)
    for (const gId of l.graphemes) {
      const grapheme = await prisma.grapheme.findUnique({ where: { id: gId }, select: { id: true } });
      if (!grapheme) continue;
      await prisma.lessonGrapheme.upsert({
        where: { lessonId_graphemeId: { lessonId: l.id, graphemeId: grapheme.id } },
        update: {},
        create: { lessonId: l.id, graphemeId: grapheme.id },
      });
    }

    // Seed heart words
    for (const hw of l.heartWords) {
      await prisma.word.upsert({
        where: { word: hw.word },
        update: {},
        create: {
          word: hw.word,
          isHeartWord: true,
          heartWordSource: hw.source,
          introducedLessonId: l.id,
        },
      });
    }

    // Seed regular (decodable) words
    for (const rw of l.regularWords) {
      const createdWord = await prisma.word.upsert({
        where: { word: rw.word.toLowerCase() },
        update: {},
        create: {
          word: rw.word.toLowerCase(),
          isHeartWord: false,
          introducedLessonId: l.id,
        },
      });

      for (const gId of rw.graphemes) {
        const grapheme = await prisma.grapheme.findUnique({ where: { id: gId }, select: { id: true } });
        if (!grapheme) continue;
        await prisma.wordGrapheme.upsert({
          where: { wordId_graphemeId: { wordId: createdWord.id, graphemeId: grapheme.id } },
          update: {},
          create: { wordId: createdWord.id, graphemeId: grapheme.id },
        });
      }
    }

    // Seed PhonicsAssessment
    await prisma.phonicsAssessment.upsert({
      where: { lessonId: l.id },
      update: {},
      create: {
        lessonId: l.id,
        regularWords: l.regularWords.map(w => w.word.toLowerCase()),
        irregularWords: l.heartWords.map(w => w.word),
        sentences: [l.decodablePassage],
        newConceptPoints: 10,
        totalPoints: 10,
      },
    });

    console.log(`  ✅ Lesson ${l.id}: ${l.title}`);
  }

  console.log('\n🎉 Phonics seeding completed!');
  console.log(`   ${graphemesData.length} graphemes`);
  console.log(`   ${lessonsData.length} lessons`);
  console.log(`   ${lessonsData.reduce((sum, l) => sum + l.regularWords.length, 0)} decodable words`);
  console.log(`   ${lessonsData.reduce((sum, l) => sum + l.heartWords.length, 0)} heart words`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
