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
  const generatedPath = 'c:\\\\Users\\\\AmandaHammel\\\\Downloads\\\\ufli_lessons_content_complete.json';
  const templatePath = 'c:\\\\Users\\\\AmandaHammel\\\\Downloads\\\\lesson_content_template (1).json';
  
  let targetPath = templatePath;
  let sourceDoc = null;

  if (existsSync(generatedPath)) {
    console.log(`Found generated content file at ${generatedPath}. Using this as the source of truth for rich content.`);
    targetPath = generatedPath;
  } else if (existsSync(templatePath)) {
    console.log(`Found template content file at ${templatePath}. Using this as the fallback.`);
    targetPath = templatePath;
  }

  // We still need the structural full list for pacing
  const fullMetaPath = existsSync(fullPath) ? fullPath : targetPath;


  let rawData: string;
  try {
    rawData = readFileSync(targetPath, 'utf-8');
  } catch (e) {
    console.error(`Error reading JSON file at ${targetPath}:`, e);
    process.exit(1);
  }
  
  const template = JSON.parse(rawData);
  const fullMeta = JSON.parse(readFileSync(fullMetaPath, 'utf-8'));

  // ─── 1. Subject ───
  const phonicsSubject = await prisma.subject.upsert({
    where: { id: 'subj_phonics_1' },
    update: { active: true, icon: '🔤', name: 'Phonics (Foundations)' },
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

  // ─── 2. Units (Clusters) ───
  // Clean up any orphaned legacy units (e.g., 'Alphabet - Cluster 1' which was previously 'unit_phonics_1')
  try {
    await prisma.unit.deleteMany({
      where: {
        OR: [
          { id: 'unit_phonics_1' },
          { title: { contains: 'Cluster 1' } }
        ]
      }
    });
    console.log('✅ Cleaned up old/orphaned Phonics units');
  } catch (e) {
    console.log('No orphaned units to clean up or error cleaning up:', e);
  }

  const clusters = [
    { id: 'unit_phonics_01_34', title: '01-34 Alphabet', min: 1, max: 34, order: 1, icon: '🔤', desc: "Let's learn our ABCs! Discover the sounds that letters make and start building your very first words." },
    { id: 'unit_phonics_35_41', title: '35-41 Alphabet Review', min: 35, max: 41, order: 2, icon: '📚', desc: 'Time to practice! We will review the short vowel sounds and read some longer words together.' },
    { id: 'unit_phonics_42_53', title: '42-53 Digraphs', min: 42, max: 53, order: 3, icon: '🧩', desc: 'Meet the team-ups! Learn what happens when two letters join forces to make a brand new sound, like "sh" and "ch".' },
    { id: 'unit_phonics_54_62', title: '54-62 VCe', min: 54, max: 62, order: 4, icon: '🪄', desc: 'Discover the magic of Silent E! See how it jumps over a consonant to make the vowel say its name.' },
    { id: 'unit_phonics_63_68', title: '63-68 Reading Longer Words', min: 63, max: 68, order: 5, icon: '🚀', desc: 'Ready for a challenge? Learn how to break down bigger words into easy pieces and add endings like -ing and -ed.' },
    { id: 'unit_phonics_69_76', title: '69-76 Ending Spelling Patterns', min: 69, max: 76, order: 6, icon: '🏁', desc: 'Master the endings! Practice special spelling rules for the ends of words, like catch, badge, and little.' },
    { id: 'unit_phonics_77_83', title: '77-83 Bossy R', min: 77, max: 83, order: 7, icon: '🦁', desc: 'Watch out for Bossy R! Find out how the letter "r" changes the sound of the vowels that come before it.' },
    { id: 'unit_phonics_84_88', title: '84-88 Long Vowel Teams', min: 84, max: 88, order: 8, icon: '👯', desc: 'When two vowels go walking, the first one does the talking! Learn famous vowel teams like "ai", "ee", and "oa".' },
    { id: 'unit_phonics_89_94', title: '89-94 Other Vowel Teams', min: 89, max: 94, order: 9, icon: '🔍', desc: 'Explore more vowel teams that make special sounds together, like the "oo" in moon and the "aw" in saw.' },
    { id: 'unit_phonics_95_98', title: '95-98 Diphthongs and Silent Letters', min: 95, max: 98, order: 10, icon: '🤫', desc: 'Glide through sounds with sliding vowels like "oi" and "ou", and uncover letters that hide in silence!' },
    { id: 'unit_phonics_99_106', title: '99-106 Suffixes and Prefixes', min: 99, max: 106, order: 11, icon: '🧱', desc: 'Build bigger words by snapping on extra parts to the beginning (prefixes) and the end (suffixes).' },
    { id: 'unit_phonics_107_110', title: '107-110 Suffix Spelling Changes', min: 107, max: 110, order: 12, icon: '✨', desc: 'Learn the secret spelling rules for adding suffixes: when to double a letter, when to drop an e, and when to change y to i!' },
    { id: 'unit_phonics_111_118', title: '111-118 Unique Spellings', min: 111, max: 118, order: 13, icon: '🕵️', desc: 'Become a spelling detective! Uncover rare and unusual ways to spell the sounds you already know.' },
    { id: 'unit_phonics_119_128', title: '119-128 Advanced Word Parts', min: 119, max: 128, order: 14, icon: '🎓', desc: 'You are a reading master! Tackle the most advanced word parts like -tion, -ture, and -able.' }
  ];

  const unitMap = new Map();
  for (const cluster of clusters) {
    const unit = await prisma.unit.upsert({
      where: { id: cluster.id },
      update: { title: cluster.title, description: cluster.desc, icon: cluster.icon, order: cluster.order },
      create: {
        id: cluster.id,
        subjectId: phonicsSubject.id,
        title: cluster.title,
        description: cluster.desc,
        icon: cluster.icon,
        order: cluster.order,
      },
    });
    unitMap.set(cluster.id, unit.id);
  }
  console.log(`✅ Created ${clusters.length} Units (Clusters)`);

  // ─── 3. Lessons ───
  let orderCounter = 1;
  for (const lessonJson of fullMeta.lessons) {
    const lId = lessonJson.lesson_id;
    const lessonNum = parseInt(lId.split('-')[1], 10);
    console.log(`Processing ${lId} - ${lessonJson.title}...`);

    // See if we have rich generated content for this lesson
    const richContent = template.lessons?.find((l: any) => l.lesson_id === lId) || lessonJson;


    let activeUnitId = unitMap.get('unit_phonics_01_34');
    for (const cluster of clusters) {
      if (lessonNum >= cluster.min && lessonNum <= cluster.max) {
        activeUnitId = unitMap.get(cluster.id);
        break;
      }
    }

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
        unitId: activeUnitId,
      },
      create: {
        id: lId,
        unitId: activeUnitId,
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
    const allDecodable = [...(richContent.step_5_word_work?.decoding_words || []), ...(richContent.step_5_word_work?.encoding_words || [])];
    const uniqueDecodable = Array.from(new Set(allDecodable.map((w: string) => w.split(' ')[0].replace(/[^a-z]/gi, '')))).filter((w: string) => w.length > 0);
    
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

    const heartWordsIntroduced = richContent.step_6_heart_words?.words_introduced || [];
    for (const hw of heartWordsIntroduced) {
      // hw might be a string (from old json) or an object (from rich content)
      const hwString = typeof hw === 'string' ? hw : hw.word;
      if (!hwString) continue;

      const type = typeof hw === 'object' ? hw.type : null;
      const irregularPart = typeof hw === 'object' ? hw.irregular_part : null;
      const decodablePart = typeof hw === 'object' ? hw.decodable_part : null;
      const listOrigin = typeof hw === 'object' ? hw.list_origin : null;
      const teachingScript = typeof hw === 'object' ? hw.teaching_script : null;
      const becomesRegularAt = typeof hw === 'object' ? hw.becomes_regular_at_lesson : null;

      await prisma.word.upsert({
        where: { word: hwString.toLowerCase() },
        update: { 
          isHeartWord: true,
          heartWordType: type,
          irregularPart,
          decodablePart,
          listOrigin,
          teachingScript,
          becomesRegularAtLessonId: becomesRegularAt
        },
        create: {
          word: hwString.toLowerCase(),
          isHeartWord: true,
          heartWordType: type,
          irregularPart,
          decodablePart,
          listOrigin,
          teachingScript,
          becomesRegularAtLessonId: becomesRegularAt,
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

    // Interactive Heart Words Block
    if (lessonJson.step_6_heart_words) {
      const hwData = lessonJson.step_6_heart_words;
      if ((hwData.words_introduced && hwData.words_introduced.length > 0) || (hwData.review_words && hwData.review_words.length > 0)) {
        await prisma.lessonBlock.create({
          data: {
            lessonId: lesson.id,
            section: 'LEARN',
            blockType: 'HEART_WORDS',
            order: 60,
            content: {
              instruction: hwData.instruction_to_student || "Let's practice some Heart Words!",
              words_introduced: hwData.words_introduced || [],
              review_words: hwData.review_words || []
            }
          }
        });
      }
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
