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

const PASSAGES = [
  // === GRADE 1 (Lexile 100-200) ===
  {
    title: 'My Dog Max',
    text: 'I have a dog. His name is Max. Max is brown and white. He likes to run in the park. Max can catch a ball. He wags his tail when he is happy. I love my dog Max.',
    wordCount: 37,
    lexileLevel: 120,
    gradeLevel: 1,
    genre: 'fiction',
    keyVocabulary: ['catch', 'wags', 'tail', 'park'],
    comprehensionQuestions: [
      { question: 'What is the dog\'s name?', type: 'literal', expectedAnswer: 'The dog\'s name is Max.', encouragement: 'Look at the very first sentences again!' },
      { question: 'How can you tell Max is happy?', type: 'inference', expectedAnswer: 'He wags his tail when he is happy.', encouragement: 'What does Max do with his tail?' },
      { question: 'Do you have a pet? What do they like to do?', type: 'connection', expectedAnswer: 'Any personal connection about pets or animals.', encouragement: 'Think about any animal you know — what do they like?' },
    ],
  },
  {
    title: 'The Red Bike',
    text: 'Sam got a new bike. It is red. Sam rides it to school. He goes fast down the hill. He goes slow up the hill. Sam likes his red bike a lot.',
    wordCount: 33,
    lexileLevel: 140,
    gradeLevel: 1,
    genre: 'fiction',
    keyVocabulary: ['rides', 'fast', 'slow', 'hill'],
    comprehensionQuestions: [
      { question: 'What colour is Sam\'s bike?', type: 'literal', expectedAnswer: 'Sam\'s bike is red.', encouragement: 'Look at the second sentence!' },
      { question: 'Why does Sam go slow up the hill?', type: 'inference', expectedAnswer: 'Because going uphill is harder and takes more effort.', encouragement: 'Have you ever walked or ridden up a hill? What was it like?' },
      { question: 'Where does Sam ride his bike?', type: 'literal', expectedAnswer: 'Sam rides his bike to school.', encouragement: 'Read the third sentence again!' },
    ],
  },
  {
    title: 'Rain Day',
    text: 'It is raining. I can see the rain on the window. The sky is grey. I cannot go outside to play. I will read a book. I will draw a picture. Rain days can be fun too.',
    wordCount: 36,
    lexileLevel: 160,
    gradeLevel: 1,
    genre: 'fiction',
    keyVocabulary: ['raining', 'window', 'outside', 'picture'],
    comprehensionQuestions: [
      { question: 'What colour is the sky?', type: 'literal', expectedAnswer: 'The sky is grey.', encouragement: 'Look for the sentence about the sky!' },
      { question: 'What does the narrator do instead of going outside?', type: 'literal', expectedAnswer: 'They read a book and draw a picture.', encouragement: 'What two activities do they choose?' },
      { question: 'What do you like to do on rainy days?', type: 'connection', expectedAnswer: 'Any personal activity on rainy days.', encouragement: 'There\'s no wrong answer — what\'s your favourite rainy day thing?' },
    ],
  },

  // === GRADE 2 (Lexile 200-350) ===
  {
    title: 'The Lost Kitten',
    text: 'Maya heard a small sound coming from behind the bushes. She looked and found a tiny grey kitten. It was shaking and looked scared. Maya gently picked it up and wrapped it in her scarf. She carried it home and gave it warm milk. The kitten purred and fell asleep in her arms. Maya decided to name the kitten Misty.',
    wordCount: 58,
    lexileLevel: 250,
    gradeLevel: 2,
    genre: 'fiction',
    keyVocabulary: ['gently', 'wrapped', 'scarf', 'purred'],
    comprehensionQuestions: [
      { question: 'Where did Maya find the kitten?', type: 'literal', expectedAnswer: 'Behind the bushes.', encouragement: 'Read the first two sentences again!' },
      { question: 'How do you know the kitten felt safe with Maya?', type: 'inference', expectedAnswer: 'The kitten purred and fell asleep in her arms, which shows it felt safe.', encouragement: 'What does a cat do when it feels happy and safe?' },
      { question: 'What name did Maya choose? Why do you think she picked that name?', type: 'inference', expectedAnswer: 'Misty — possibly because the kitten was grey like mist.', encouragement: 'Think about what colour the kitten is — does the name remind you of anything?' },
      { question: 'Have you ever found or helped an animal? What happened?', type: 'connection', expectedAnswer: 'Any personal story about animals.', encouragement: 'Think about a time you saw an animal that needed help.' },
    ],
  },
  {
    title: 'Building a Snowman',
    text: 'The first snow of winter fell last night. Amir and his sister ran outside after breakfast. They rolled three big snowballs. The biggest one was for the bottom. The medium one went in the middle. The smallest one was the head. They used sticks for arms, rocks for eyes, and a carrot for the nose. Their snowman was the best on the whole street.',
    wordCount: 60,
    lexileLevel: 280,
    gradeLevel: 2,
    genre: 'fiction',
    keyVocabulary: ['medium', 'sticks', 'rolled', 'whole'],
    comprehensionQuestions: [
      { question: 'How many snowballs did they make?', type: 'literal', expectedAnswer: 'They made three snowballs.', encouragement: 'Count the snowballs mentioned in the story!' },
      { question: 'What materials did they use for the snowman\'s face?', type: 'literal', expectedAnswer: 'Rocks for eyes and a carrot for the nose.', encouragement: 'Look near the end of the passage for the details!' },
      { question: 'Why do you think the biggest snowball goes on the bottom?', type: 'inference', expectedAnswer: 'Because it needs to support the weight of the other snowballs and keep the snowman stable.', encouragement: 'What would happen if the smallest one was on the bottom?' },
    ],
  },
  {
    title: 'The Butterfly Garden',
    text: 'In spring, our class planted a garden. We put in flowers that butterflies love. We planted purple coneflowers and yellow sunflowers. After a few weeks, the flowers grew tall. Then the butterflies came! We saw orange monarchs and blue swallowtails. They floated from flower to flower, drinking the sweet nectar. Our teacher said we helped make a home for them.',
    wordCount: 58,
    lexileLevel: 320,
    gradeLevel: 2,
    genre: 'nonfiction',
    keyVocabulary: ['coneflowers', 'monarchs', 'swallowtails', 'nectar'],
    comprehensionQuestions: [
      { question: 'What kinds of flowers did the class plant?', type: 'literal', expectedAnswer: 'Purple coneflowers and yellow sunflowers.', encouragement: 'Look for the flower names — they\'re colourful!' },
      { question: 'What do the butterflies drink from the flowers?', type: 'vocabulary', expectedAnswer: 'Nectar — the sweet liquid inside flowers that butterflies drink.', encouragement: 'There\'s a special word for what flowers make that butterflies love!' },
      { question: 'Would you like to plant a butterfly garden? What flowers would you choose?', type: 'connection', expectedAnswer: 'Any personal response about gardens or nature.', encouragement: 'If you could grow any flower, what would you pick?' },
    ],
  },

  // === GRADE 3 (Lexile 350-550) ===
  {
    title: 'The Underground Library',
    text: 'Beneath the old town hall, there was a library that most people had forgotten about. Twelve-year-old Priya discovered it one rainy afternoon when she followed a narrow staircase behind a heavy wooden door. The shelves were dusty, but the books were still in perfect condition. She pulled out a thick blue book and opened it. The pages smelled like cinnamon and old paper. Priya sat on the stone floor and began to read. She read about explorers who sailed across unknown seas and scientists who discovered new stars. Hours passed without her noticing. When she finally looked up, she knew she would come back every day.',
    wordCount: 108,
    lexileLevel: 420,
    gradeLevel: 3,
    genre: 'fiction',
    keyVocabulary: ['discovered', 'condition', 'narrow', 'explorers'],
    comprehensionQuestions: [
      { question: 'Where was the hidden library located?', type: 'literal', expectedAnswer: 'Beneath the old town hall, behind a heavy wooden door down a narrow staircase.', encouragement: 'Look at the very beginning of the passage!' },
      { question: 'What tells you Priya really enjoyed reading in the library?', type: 'inference', expectedAnswer: 'Hours passed without her noticing, and she knew she would come back every day.', encouragement: 'What happened to time while she was reading?' },
      { question: 'What did the pages smell like?', type: 'literal', expectedAnswer: 'Cinnamon and old paper.', encouragement: 'The author describes a smell — find that sentence!' },
      { question: 'If you found a hidden room, what would you hope to find inside?', type: 'connection', expectedAnswer: 'Any creative personal response.', encouragement: 'Use your imagination! There are no wrong answers here.' },
    ],
  },
  {
    title: 'How Birds Fly South',
    text: 'Every autumn, millions of birds begin a long journey called migration. They fly south to warmer places where they can find food during winter. Some birds, like the Arctic tern, travel over 70,000 kilometres each year! Scientists believe birds use the sun, stars, and Earth\'s magnetic field to navigate. They can sense direction even on cloudy days. Geese fly in a V-shaped formation because it saves energy. The lead bird breaks the wind, and the others glide in their wake. When the leader gets tired, another bird takes the front position. It is teamwork at its finest.',
    wordCount: 96,
    lexileLevel: 480,
    gradeLevel: 3,
    genre: 'nonfiction',
    keyVocabulary: ['migration', 'navigate', 'formation', 'magnetic'],
    comprehensionQuestions: [
      { question: 'What is migration?', type: 'vocabulary', expectedAnswer: 'Migration is a long journey that birds take, flying south to warmer places for winter.', encouragement: 'The passage explains this word right at the beginning!' },
      { question: 'Why do geese fly in a V-shape?', type: 'literal', expectedAnswer: 'Because it saves energy — the lead bird breaks the wind and the others glide.', encouragement: 'Look for the part about the V-shaped formation!' },
      { question: 'How do birds know which direction to fly?', type: 'literal', expectedAnswer: 'They use the sun, stars, and Earth\'s magnetic field to navigate.', encouragement: 'Scientists have studied this — what three things help birds find their way?' },
      { question: 'The passage says bird migration is "teamwork at its finest." Do you agree? Why?', type: 'inference', expectedAnswer: 'Yes, because they take turns leading and help each other save energy.', encouragement: 'Think about how they share the hardest job.' },
    ],
  },
  {
    title: 'The Invention of Peanut Butter',
    text: 'Did you know that peanut butter has been around for hundreds of years? The Aztec people in Mexico were the first to grind roasted peanuts into a paste. In 1895, a doctor named John Harvey Kellogg created a version of peanut butter for patients who had trouble chewing regular food. He wanted to give them a healthy source of protein. Today, people around the world eat peanut butter in many different ways. In Canada and the United States, people spread it on bread with jam. In parts of Africa, it is used to make soups and stews. Peanut butter is one food that almost everyone can agree on!',
    wordCount: 105,
    lexileLevel: 510,
    gradeLevel: 3,
    genre: 'nonfiction',
    keyVocabulary: ['grind', 'paste', 'protein', 'version'],
    comprehensionQuestions: [
      { question: 'Who were the first people to make peanut paste?', type: 'literal', expectedAnswer: 'The Aztec people in Mexico.', encouragement: 'Look at the second sentence for this answer!' },
      { question: 'Why did Dr. Kellogg create his version of peanut butter?', type: 'literal', expectedAnswer: 'For patients who had trouble chewing regular food — to give them a healthy source of protein.', encouragement: 'Why would someone need food they don\'t have to chew?' },
      { question: 'How is peanut butter used differently around the world?', type: 'literal', expectedAnswer: 'In Canada/US it\'s spread on bread with jam. In parts of Africa, it\'s used in soups and stews.', encouragement: 'The passage mentions at least two different ways!' },
      { question: 'What\'s your favourite way to eat peanut butter?', type: 'connection', expectedAnswer: 'Any personal response.', encouragement: 'There\'s no wrong answer — what sounds delicious to you?' },
    ],
  },
  {
    title: 'The Northern Lights',
    text: 'On clear winter nights in northern Canada, something magical appears in the sky. Dancing curtains of green, purple, and pink light stretch across the darkness. These are the Northern Lights, also called the aurora borealis. They happen when tiny particles from the sun crash into gases in Earth\'s atmosphere. The collision creates beautiful glowing colours. Indigenous peoples in Canada have many stories about the lights. Some Inuit communities believe they are spirits of their ancestors playing in the sky. Scientists and storytellers agree on one thing: the Northern Lights are one of nature\'s most breathtaking shows.',
    wordCount: 96,
    lexileLevel: 540,
    gradeLevel: 3,
    genre: 'nonfiction',
    keyVocabulary: ['atmosphere', 'particles', 'collision', 'ancestors'],
    comprehensionQuestions: [
      { question: 'What colours are the Northern Lights?', type: 'literal', expectedAnswer: 'Green, purple, and pink.', encouragement: 'Look for the colourful description near the beginning!' },
      { question: 'What causes the Northern Lights according to science?', type: 'literal', expectedAnswer: 'Tiny particles from the sun crash into gases in Earth\'s atmosphere, causing glowing colours.', encouragement: 'The passage explains the science — look for words like particles and atmosphere!' },
      { question: 'What do some Inuit communities believe about the lights?', type: 'literal', expectedAnswer: 'They believe the lights are spirits of their ancestors playing in the sky.', encouragement: 'Look for the part about Indigenous peoples!' },
      { question: 'Would you rather learn about the Northern Lights through science or through stories? Why?', type: 'connection', expectedAnswer: 'Any thoughtful personal response.', encouragement: 'Both ways of understanding are valuable — which one interests you more?' },
    ],
  },
];

async function seedPassages() {
  console.log('🌱 Seeding reading passages...');

  // Clear existing passages
  await prisma.readingPassage.deleteMany({});
  console.log('  🗑️ Cleared existing passages');

  for (const p of PASSAGES) {
    const slug = p.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    await prisma.readingPassage.create({
      data: {
        id: slug,
        title: p.title,
        text: p.text,
        wordCount: p.wordCount,
        lexileLevel: p.lexileLevel,
        gradeLevel: p.gradeLevel,
        genre: p.genre,
        keyVocabulary: p.keyVocabulary,
        comprehensionQuestions: p.comprehensionQuestions,
      },
    });
    console.log(`  ✅ ${p.title} (Grade ${p.gradeLevel}, ${p.lexileLevel}L)`);
  }

  console.log(`\n📚 Seeded ${PASSAGES.length} passages across Grades 1-3 (${Math.min(...PASSAGES.map(p => p.lexileLevel))}L – ${Math.max(...PASSAGES.map(p => p.lexileLevel))}L)`);
}

seedPassages()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });

