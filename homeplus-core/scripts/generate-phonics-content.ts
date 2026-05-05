import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';

// Load env vars
try {
  const raw = readFileSync('.env.local', 'utf-8');
  for (const line of raw.split('\n')) {
    const match = line.match(/^([^#=\s][^=]*)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let val = match[2].trim();
      val = val.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');
      if (!process.env[key]) process.env[key] = val;
    }
  }
} catch { /* ignore */ }

import { GoogleGenerativeAI, Schema, SchemaType } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("ERROR: GEMINI_API_KEY not found in .env.local");
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(apiKey);

// We'll dynamically determine the model
let model: any = null;

const FULL_JSON_PATH = 'c:\\\\Users\\\\AmandaHammel\\\\Downloads\\\\ufli_lessons_full.json';
const TEMPLATE_JSON_PATH = 'c:\\\\Users\\\\AmandaHammel\\\\Downloads\\\\lesson_content_template (1).json';
const LESSON_5_PATH = 'c:\\\\Users\\\\AmandaHammel\\\\Downloads\\\\lesson_005_content.json';
const OUTPUT_JSON_PATH = 'c:\\\\Users\\\\AmandaHammel\\\\Downloads\\\\ufli_lessons_content_complete.json';

async function generateLessonContent(lessonMeta: any, knownGraphemes: string[], knownHeartWords: string[]) {
  console.log(`Generating content for ${lessonMeta.lesson_id} (${lessonMeta.title})...`);

  const hasNewGrapheme = lessonMeta.target_graphemes && lessonMeta.target_graphemes.length > 0;

  // Define the expected JSON schema for the LLM output
  const schemaProps: any = {
    step_1_phoneme_awareness: {
      type: SchemaType.OBJECT,
      properties: {
        purpose: { type: SchemaType.STRING },
        instruction_to_student: { type: SchemaType.STRING },
        task_type: { type: SchemaType.STRING },
        items: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              spoken_word: { type: SchemaType.STRING },
              answer: { type: SchemaType.BOOLEAN },
              target_phoneme: { type: SchemaType.STRING }
            },
            required: ["spoken_word", "answer", "target_phoneme"]
          }
        }
      },
      required: ["purpose", "instruction_to_student", "task_type", "items"]
    }
  };
    
    if (hasNewGrapheme) {
      schemaProps.step_4_new_grapheme_introduction = {
        type: SchemaType.OBJECT,
        properties: {
          articulatory_gesture_script: { type: SchemaType.STRING },
          mnemonic_story_script: { type: SchemaType.STRING },
          i_do_script: { type: SchemaType.STRING },
          we_do_script: { type: SchemaType.STRING },
          you_do_prompt: { type: SchemaType.STRING },
          rule_card: { type: SchemaType.STRING }
        },
        required: ["articulatory_gesture_script", "mnemonic_story_script", "i_do_script", "we_do_script", "you_do_prompt", "rule_card"]
      };
    } else {
      schemaProps.step_4_blending_or_review = {
        type: SchemaType.OBJECT,
        properties: {
          i_do_script: { type: SchemaType.STRING },
          we_do_script: { type: SchemaType.STRING },
          you_do_prompt: { type: SchemaType.STRING },
          rule_card: { type: SchemaType.STRING }
        },
        required: ["i_do_script", "we_do_script", "you_do_prompt", "rule_card"]
      };
    }
    
    Object.assign(schemaProps, {
      step_5_word_work: {
        type: SchemaType.OBJECT,
        properties: {
          decoding_words: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          encoding_words: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
        },
        required: ["decoding_words", "encoding_words"]
      },
      step_6_heart_words: {
        type: SchemaType.OBJECT,
        properties: {
          teaching_scripts: {
            type: SchemaType.ARRAY,
            description: "Teaching scripts for any NEW heart words introduced in this lesson. Must match the number of new heart words.",
            items: { type: SchemaType.STRING }
          }
        },
        required: ["teaching_scripts"]
      },
      step_7_decodable_text: {
        type: SchemaType.OBJECT,
        properties: {
          passages: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                title: { type: SchemaType.STRING },
                text: { type: SchemaType.STRING },
                comprehension_questions: {
                  type: SchemaType.ARRAY,
                  items: {
                    type: SchemaType.OBJECT,
                    properties: {
                      question: { type: SchemaType.STRING },
                      options: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                      correct_index: { type: SchemaType.INTEGER }
                    },
                    required: ["question", "options", "correct_index"]
                  }
                }
              },
              required: ["title", "text", "comprehension_questions"]
            }
          }
        },
        required: ["passages"]
      },
      step_8_encoding: {
        type: SchemaType.OBJECT,
        properties: {
          dictation_sentences: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
        },
        required: ["dictation_sentences"]
      }
    });

    const requiredFields = ["step_1_phoneme_awareness", "step_5_word_work", "step_6_heart_words", "step_7_decodable_text", "step_8_encoding"];
    if (hasNewGrapheme) {
      requiredFields.push("step_4_new_grapheme_introduction");
    } else {
      requiredFields.push("step_4_blending_or_review");
    }

    const schema: Schema = {
      type: SchemaType.OBJECT,
      properties: schemaProps,
      required: requiredFields
    };

  const newHeartWords = [
    ...(lessonMeta.heart_words_introduced?.temporarily_irregular || []),
    ...(lessonMeta.heart_words_introduced?.regular_hf || [])
  ];

  const prompt = `
You are an expert reading curriculum designer for the HomePlus LMS.
Generate the missing instructional content for the phonics lesson detailed below.

LESSON DETAILS:
Title: ${lessonMeta.title}
Target Graphemes: ${JSON.stringify(lessonMeta.target_graphemes)}
Target Phonemes: ${JSON.stringify(lessonMeta.target_phonemes)}
New Heart Words: ${JSON.stringify(newHeartWords)}

CRITICAL DECODABILITY RULES:
The student has ONLY learned the following graphemes so far: ${JSON.stringify(knownGraphemes)}
The student has ONLY learned the following heart words so far: ${JSON.stringify(knownHeartWords)}

1. For "step_5_word_work" decoding/encoding words, you MUST ONLY use the known graphemes. NO UNKNOWN LETTERS OR DIGRAPHS.
2. For "step_7_decodable_text" passages, you MUST ONLY use words made of known graphemes OR known heart words. NOT A SINGLE EXCEPTION IS ALLOWED. If a word contains an untaught letter, the reading engine will block it.
3. Keep the content appropriate for Canadian English students (early primary).
4. Do not use the exact UFLI secret stories; generate original, fun mnemonic stories for step 4.

Return the content as structured JSON matching the provided schema.
`;

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.4
      }
    });

    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (e) {
    console.error(`Error generating content for ${lessonMeta.lesson_id}:`, e);
    return null;
  }
}

async function main() {
  // First, figure out which model to use
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json();
    const availableModels = data.models.map((m: any) => m.name.replace('models/', ''));
    
    let modelName = availableModels.find((m: string) => m === 'gemini-1.5-flash' || m === 'gemini-1.5-pro');
    if (!modelName) {
      console.log("Available models:", availableModels);
      modelName = availableModels.find((m: string) => m.includes('gemini')) || 'gemini-1.5-flash';
    }
    console.log(`Using model: ${modelName}`);
    model = genAI.getGenerativeModel({ model: modelName });
  } catch (e) {
    console.error("Failed to list models, defaulting to gemini-1.5-flash", e);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  if (!existsSync(FULL_JSON_PATH)) {
    console.error(`Missing ${FULL_JSON_PATH}`);
    return;
  }
  if (!existsSync(TEMPLATE_JSON_PATH)) {
    console.error(`Missing ${TEMPLATE_JSON_PATH}`);
    return;
  }

  const fullMeta = JSON.parse(readFileSync(FULL_JSON_PATH, 'utf-8'));
  const templateDoc = JSON.parse(readFileSync(TEMPLATE_JSON_PATH, 'utf-8'));

  let completedLessons = [...templateDoc.lessons];
  
  if (existsSync(LESSON_5_PATH)) {
    const lesson5Doc = JSON.parse(readFileSync(LESSON_5_PATH, 'utf-8'));
    if (lesson5Doc.lessons && lesson5Doc.lessons[0]) {
      // Check if it's already in completedLessons
      if (!completedLessons.find(l => l.lesson_id === lesson5Doc.lessons[0].lesson_id)) {
        completedLessons.push(lesson5Doc.lessons[0]);
      }
    }
  }
  
  // Build our known arrays from the completed lessons (Lessons 1 & 2)
  const knownGraphemes = new Set<string>();
  const knownHeartWords = new Set<string>();
  
  for (const l of fullMeta.lessons) {
    if (l.lesson_number <= completedLessons.length) {
      l.target_graphemes?.forEach((g: string) => knownGraphemes.add(g.toLowerCase()));
      const hws = [
        ...(l.heart_words_introduced?.temporarily_irregular || []),
        ...(l.heart_words_introduced?.regular_hf || [])
      ];
      hws.forEach((w: string) => knownHeartWords.add(w.toLowerCase()));
    }
  }

  // Generate content for the rest of the lessons
  for (const lessonMeta of fullMeta.lessons) {
    if (lessonMeta.lesson_number <= completedLessons.length) continue; // Already exists

    // Add this lesson's targets to the known list BEFORE generating
    // so the LLM can use the new grapheme/words in its passages
    lessonMeta.target_graphemes?.forEach((g: string) => knownGraphemes.add(g.toLowerCase()));
    const newHws = [
      ...(lessonMeta.heart_words_introduced?.temporarily_irregular || []),
      ...(lessonMeta.heart_words_introduced?.regular_hf || [])
    ];
    newHws.forEach((w: string) => knownHeartWords.add(w.toLowerCase()));

    const generated = await generateLessonContent(
      lessonMeta, 
      Array.from(knownGraphemes), 
      Array.from(knownHeartWords)
    );

    if (!generated) {
      console.error(`Stopping due to generation failure at lesson ${lessonMeta.lesson_number}`);
      break;
    }

    // Assemble the complete lesson object
    const finalLesson = {
      lesson_id: lessonMeta.lesson_id,
      lesson_number: lessonMeta.lesson_number,
      title: lessonMeta.title,
      content_status: "draft",
      age_band_variants: ["early_primary"],
      
      step_1_phoneme_awareness: {
        ...generated.step_1_phoneme_awareness,
        items: generated.step_1_phoneme_awareness.items.map((it: any) => ({
          ...it,
          audio_url: `PLACEHOLDER_AUDIO_${it.spoken_word}`,
          audio_status: "needed"
        }))
      },
      
      step_2_visual_drill: {
        purpose: "Cumulative review of previously taught graphemes.",
        graphemes_in_drill: Array.from(knownGraphemes).slice(-10), // Review up to 10 recent
        instruction_to_student: "Look at each letter. Say its sound out loud."
      },
      
      step_3_auditory_drill: {
        purpose: "Cumulative review.",
        items: Array.from(knownGraphemes).slice(-5).map(g => ({
          phoneme_cue: `the sound for ${g}`, 
          expected_grapheme: g
        })),
        instruction_to_student: "Listen to the clue. Pick the letter that makes that sound."
      },
      
      step_4_new_grapheme_introduction: hasNewGrapheme ? {
        target_grapheme: lessonMeta.target_graphemes?.[0] || "",
        target_phoneme: lessonMeta.target_phonemes?.[0] || "",
        key_word: lessonMeta.keyword || "",
        phoneme_audio: { url: "PLACEHOLDER", status: "needed" },
        articulation_video: { url: "PLACEHOLDER", status: "needed" },
        keyword_photo: { url: "PLACEHOLDER", status: "needed" },
        ...generated.step_4_new_grapheme_introduction,
        we_do_words: [],
        you_do_words: []
      } : undefined,
      
      step_4_blending_or_review: !hasNewGrapheme ? {
        purpose: "Review or blending instruction.",
        ...generated.step_4_blending_or_review,
        we_do_words: [],
        you_do_words: []
      } : undefined,

      step_5_word_work: {
        purpose: "Decode and encode words.",
        instruction_to_student: "Let's read and spell some words.",
        ...generated.step_5_word_work,
        elkonin_box_words: []
      },

      step_6_heart_words: {
        purpose: "Learn irregular high-frequency words.",
        words_introduced: newHws.map((w: string, i: number) => ({
          word: w,
          type: "irregular",
          teaching_script: generated.step_6_heart_words.teaching_scripts[i] || `We must learn the word '${w}' by heart.`
        })),
        review_words: Array.from(knownHeartWords).slice(-5), // Review recent
        instruction_to_student: "Some words don't follow the rules yet. We learn these by heart."
      },

      step_7_decodable_text: {
        purpose: "Connected reading using only mastered graphemes + pre-taught heart words.",
        passages: generated.step_7_decodable_text.passages.map((p: any) => ({
          passage_id: `passage_${lessonMeta.lesson_id}_1`,
          ...p,
          word_count: p.text.split(' ').length
        }))
      },

      step_8_encoding: {
        purpose: "Spelling from dictation.",
        dictation_words: generated.step_5_word_work.encoding_words,
        dictation_sentences: generated.step_8_encoding.dictation_sentences,
        instruction_to_student: "Listen and spell the words."
      },

      mastery_criteria: templateDoc.lessons[0].mastery_criteria
    };

    completedLessons.push(finalLesson);

    // Save progressively to avoid losing data
    templateDoc.lessons = completedLessons;
    writeFileSync(OUTPUT_JSON_PATH, JSON.stringify(templateDoc, null, 2));
    console.log(`Saved lesson ${lessonMeta.lesson_number} to ${OUTPUT_JSON_PATH}`);
    
    // Add a small delay to avoid hitting rate limits
    await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log('✅ Generation complete!');
}

main().catch(console.error);
