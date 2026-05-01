import { readFileSync, existsSync } from 'fs';
import path from 'path';

// Load .env.local without dotenv
try {
  const raw = readFileSync('.env.local', 'utf-8');
  for (const line of raw.split('\n')) {
    const match = line.match(/^([^#=\s][^=]*)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim()
        .replace(/^["']|["']$/g, '')
        .replace(/\\[nrt]/g, '');
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

const graphemeMetadata: Record<string, { articulatoryGestureScript: string | null, secretStoryScript: string | null, soundWallCategory: string }> = {
  'a': {
    articulatoryGestureScript: 'To make the short A /ă/ sound, open your mouth wide. Your voice is on. /ă/ — like "apple".',
    secretStoryScript: 'Superhero A is in his short and lazy disguise... he just sits around eating apples all day saying /ă/-/ă/-apple!',
    soundWallCategory: 'Short Vowels',
  },
  'm': {
    articulatoryGestureScript: 'Put your lips together and hum. All air comes out your nose. /mmm/ — like "mouse".',
    secretStoryScript: null,
    soundWallCategory: 'Nasals',
  },
  's': {
    articulatoryGestureScript: 'Put your tongue just behind your top front teeth and blow air. /ssss/ — like a hissing snake.',
    secretStoryScript: null,
    soundWallCategory: 'Fricatives',
  },
  't': {
    articulatoryGestureScript: 'Tap your tongue just behind your top front teeth. Keep your voice off. /t/ — like "tiger".',
    secretStoryScript: null,
    soundWallCategory: 'Stops',
  },
  'i': {
    articulatoryGestureScript: 'Smile slightly and say /ĭ/. Your voice is on. /ĭ/ — like "igloo".',
    secretStoryScript: 'Itsy-bitsy I always feels itchy — /ĭ/-/ĭ/-itch!',
    soundWallCategory: 'Short Vowels',
  },
  'n': {
    articulatoryGestureScript: 'Put the tip of your tongue behind your top front teeth and hum. /nnn/ — like "nose".',
    secretStoryScript: null,
    soundWallCategory: 'Nasals',
  },
  'p': {
    articulatoryGestureScript: 'Press your lips together and pop them open. Keep your voice off. /p/ — like "pop".',
    secretStoryScript: null,
    soundWallCategory: 'Stops',
  },
  'b': {
    articulatoryGestureScript: 'Press your lips together and pop them open. Turn your voice on. /b/ — like "ball".',
    secretStoryScript: null,
    soundWallCategory: 'Stops',
  },
  'c': {
    articulatoryGestureScript: 'Pull the back of your tongue down quickly. Keep your voice off. /k/ — like "cat".',
    secretStoryScript: null,
    soundWallCategory: 'Stops',
  },
  'f': {
    articulatoryGestureScript: 'Bite your bottom lip gently and blow air. Keep your voice off. /f/ — like "fish".',
    secretStoryScript: null,
    soundWallCategory: 'Fricatives',
  }
};

async function main() {
  console.log('🌱 Starting Phonics (UFLI) Seeding from JSON...');

  // Check for the full 128 lesson JSON, otherwise fall back to the 20 lesson template
  const fullPath = 'c:\\\\Users\\\\AmandaHammel\\\\Downloads\\\\ufli_lessons_full.json';
  const templatePath = 'c:\\\\Users\\\\AmandaHammel\\\\Downloads\\\\ufli_lessons_template.json';
  
  let targetPath = templatePath;
  if (existsSync(fullPath)) {
    console.log(`Found full 128 lesson file at ${fullPath}. Using this as the source of truth.`);
    targetPath = fullPath;
  } else {
    console.warn(`\n⚠️ WARNING: ufli_lessons_full.json not found. Falling back to the 20-lesson template at ${templatePath}.`);
    console.warn(`Seeding only 20 lessons is insufficient for real student use. Please provide the full 128-lesson file.\n`);
  }

  let rawData: string;
  try {
    rawData = readFileSync(targetPath, 'utf-8');
  } catch (e) {
    console.error(`Error reading JSON file at ${targetPath}:`, e);
    process.exit(1);
  }
  
  const template = JSON.parse(rawData);

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
      title: 'UFLI Foundations',
      description: 'Foundational phonics covering alphabet letter sounds, CVC blending, and advanced patterns.',
      order: 1,
    },
  });
  console.log('✅ Unit:', unit1.title);

  // ─── 3. Lessons ───
  let orderCounter = 1;
  for (const lessonJson of template.lessons) {
    const lId = lessonJson.lesson_id;
    console.log(`Processing ${lId} - ${lessonJson.title}...`);

    // Graphemes
    const graphemeIds: string[] = [];
    if (lessonJson.target_graphemes) {
      for (let i = 0; i < lessonJson.target_graphemes.length; i++) {
        const char = lessonJson.target_graphemes[i];
        const phoneme = (lessonJson.target_phonemes && lessonJson.target_phonemes.length > i) ? lessonJson.target_phonemes[i] : `/${char}/`;
        
        // Use explicitly approved metadata from early lessons, otherwise insert placeholder
        const meta = graphemeMetadata[char] || { 
          articulatoryGestureScript: `NEEDS_TEACHER_INPUT: articulatory gesture script not yet provided for ${phoneme}`, 
          secretStoryScript: `NEEDS_TEACHER_INPUT: secret story script not yet provided for ${phoneme}`, 
          soundWallCategory: 'Other' 
        };
        
        const gRecord = await prisma.grapheme.upsert({
          where: { grapheme: char },
          update: {
            phoneme,
            articulatoryGestureScript: meta.articulatoryGestureScript,
            secretStoryScript: meta.secretStoryScript,
            soundWallCategory: meta.soundWallCategory
          },
          create: {
            grapheme: char,
            phoneme,
            placementTags: ['beginning', 'middle', 'end'],
            articulatoryGestureScript: meta.articulatoryGestureScript,
            secretStoryScript: meta.secretStoryScript,
            soundWallCategory: meta.soundWallCategory
          }
        });
        graphemeIds.push(gRecord.id);
      }
    }

    const targetSkill = lessonJson.target_skill || '';
    let keyword = null;
    if (lessonJson.example_words?.decodable?.length > 0) {
      const cleanWord = lessonJson.example_words.decodable[0].split(' ')[0].replace(/[^a-z]/gi, '');
      if (cleanWord.length > 0) keyword = cleanWord;
    }

    const lesson = await prisma.lesson.upsert({
      where: { id: lId },
      update: {
        title: lessonJson.title,
        description: lessonJson.teacher_notes || '',
        category: lessonJson.category,
        targetSkill,
        keyword,
        contentStatus: 'active',
      },
      create: {
        id: lId,
        unitId: unit1.id,
        title: lessonJson.title,
        subtitle: targetSkill.slice(0, 50),
        description: lessonJson.teacher_notes || '',
        order: orderCounter++,
        subjectMode: SubjectMode.PHONICS,
        contentStatus: 'active',
        category: lessonJson.category,
        targetSkill,
        keyword,
      }
    });

    // Link graphemes
    for (const gid of graphemeIds) {
      await prisma.lessonGrapheme.upsert({
        where: {
          lessonId_graphemeId: {
            lessonId: lesson.id,
            graphemeId: gid
          }
        },
        update: {},
        create: {
          lessonId: lesson.id,
          graphemeId: gid,
        }
      });
    }

    // Words
    const allDecodable = [...(lessonJson.example_words?.decodable || []), ...(lessonJson.example_words?.encoding || [])];
    const uniqueDecodable = Array.from(new Set(allDecodable.map(w => w.split(' ')[0].replace(/[^a-z]/gi, '')))).filter(w => w.length > 0);
    
    for (const wordStr of uniqueDecodable) {
      await prisma.word.upsert({
        where: { word: wordStr.toLowerCase() },
        update: {},
        create: {
          word: wordStr.toLowerCase(),
          isHeartWord: false,
          introducedLessonId: lesson.id
        }
      });
    }

    const heartWords = Array.isArray(lessonJson.heart_words_introduced) 
      ? lessonJson.heart_words_introduced 
      : [
          ...(lessonJson.heart_words_introduced?.temporarily_irregular || []),
          ...(lessonJson.heart_words_introduced?.regular_hf || [])
        ];
    for (const hw of heartWords) {
      await prisma.word.upsert({
        where: { word: hw.toLowerCase() },
        update: { isHeartWord: true },
        create: {
          word: hw.toLowerCase(),
          isHeartWord: true,
          introducedLessonId: lesson.id
        }
      });
    }

    // Phonics Assessment
    if (lessonJson.decodable_sentences) {
      const sentences = lessonJson.decodable_sentences;
      const combinedPassage = sentences.join(' ');
      
      await prisma.phonicsAssessment.upsert({
        where: { lessonId: lesson.id },
        update: {
          sentences: sentences
        },
        create: {
          lessonId: lesson.id,
          sentences: sentences,
        }
      });
    }
  }

  if (template.heart_words_bank && template.heart_words_bank.words) {
    for (const hw of template.heart_words_bank.words) {
      await prisma.word.upsert({
        where: { word: hw.word.toLowerCase() },
        update: { isHeartWord: true },
        create: {
          word: hw.word.toLowerCase(),
          isHeartWord: true,
          introducedLessonId: hw.introduced_in_lesson
        }
      });
    }
  }

  console.log('✅ All phonics lessons seeded successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
