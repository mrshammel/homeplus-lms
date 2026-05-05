# Phase 3: UFLI Interactive Block Frames
## HomePlus Phonics Platform

This plan covers the replacement of the placeholder `PhonicsBlock` in `LessonBlockRenderer.tsx` with 8 differentiated, student-facing interactive frames — one per UFLI step.

---

## Context

### What Already Exists (Keep Unchanged)
- All 8 UFLI block types already route to `PhonicsBlock` (lines 1280–1431)
- Outcome code mapping (`WARMUP_STEP1` → `ENCODING_STEP8`) ✅
- Engine submission to `/api/lesson/${lessonId}/submit` ✅
- Error Correction Protocol state machine (AFFIRM → MODEL → ECHO → APPLY) ✅
- I Do / We Do / You Do / Check cycle indicator ✅

### What's Missing
The actual student-facing interactive UI per block type. All 8 currently render identical placeholder buttons ("Student Correct / Student Error") — teacher simulation, not student experience.

### Async Constraint
Since HomePlus is **asynchronous/at-home**, teacher script lines are displayed as student-readable cue text. Oral responses become typed or self-reported. The Error Correction Protocol fires when a student answers incorrectly and guides them through the correction cycle themselves.

---

## Proposed Changes

### [MODIFY] `src/components/lesson/LessonBlockRenderer.tsx`

Replace the monolithic `PhonicsBlock` function (lines 1280–1431) with a dispatcher that routes to 8 dedicated sub-components.

#### New Structure
```
PhonicsBlock (dispatcher) → routes by blockType to:
  ├── PhonicsStep1_PhonemeAwareness
  ├── PhonicsStep2_VisualDrill
  ├── PhonicsStep3_AuditoryDrill
  ├── PhonicsStep4_NewGrapheme
  ├── PhonicsStep5_WordWork
  ├── PhonicsStep6_HeartWords
  ├── PhonicsStep7_DecodableText
  └── PhonicsStep8_Encoding
```

All sub-components share:
- The existing `submitToEngine()` function
- The existing Error Correction Protocol flow
- A shared `PhonicsShell` wrapper (header, step indicator, completion badge)

---

## Per-Block Spec

### Step 1 — PHONEME_AWARENESS (Warm-up)
**Purpose:** Phoneme segmentation/blending/manipulation  
**Content shape:**
```json
{
  "instruction": "Listen to the word. Tap and say each sound.",
  "word": "ship",
  "phonemes": ["sh", "i", "p"],
  "taskType": "segment" | "blend" | "manipulate"
}
```
**Student UI:**
- Display the word (large, centered)
- For `segment`: Input boxes — one per phoneme slot — student types each sound, then checks
- For `blend`: Display phonemes separated, student types the full word
- For `manipulate`: Show instruction ("Change /sh/ to /ch/ — what's the new word?") + text input
- Self-check button → compare against `phonemes` or derived answer
- ✅ / ✗ feedback with correct answer shown on failure
- On correct: `submitToEngine(true)` → `onAnswer()`
- On incorrect: Error Correction Protocol activates

---

### Step 2 — VISUAL_DRILL (Flash Card)
**Purpose:** Grapheme → phoneme recall (student sees grapheme, self-reports whether they said the sound correctly)  
**Content shape:**
```json
{
  "instruction": "Look at each card. Say the sound out loud.",
  "cards": [
    { "grapheme": "sh", "phoneme": "/sh/", "exampleWord": "ship" },
    { "grapheme": "ch", "phoneme": "/ch/", "exampleWord": "chip" }
  ]
}
```
**Student UI:**
- One card at a time — large grapheme card (flip animation optional)
- After viewing: two self-report buttons: "✓ I said it" / "✗ I wasn't sure"
- "I said it" for all → `submitToEngine(true)`, complete
- Any "wasn't sure" → show the phoneme + example word as correction cue, then re-present that card
- Progress indicator (Card 2 of 5)

> [!NOTE]
> Self-report is necessary here since the audio production happens verbally. The honest self-report is pedagogically appropriate and consistent with UFLI design.

---

### Step 3 — AUDITORY_DRILL (Phoneme → Grapheme)
**Purpose:** Hear a sound description → identify the correct grapheme  
**Content shape:**
```json
{
  "instruction": "Read the clue. Pick the grapheme that makes that sound.",
  "questions": [
    {
      "cue": "The sound at the start of 'ship'",
      "phoneme": "/sh/",
      "options": ["sh", "ch", "th", "wh"],
      "correct": "sh"
    }
  ]
}
```
**Student UI:**
- Display the cue text (and phoneme if available)
- Multiple choice grapheme buttons (large, tap-friendly)
- Immediate feedback on selection (green/red flash)
- Wrong answer → Error Correction Protocol
- All correct → `submitToEngine(true)`
- Score tracked across all questions

---

### Step 4 — NEW_GRAPHEME_INTRODUCTION (Explicit Instruction)
**Purpose:** Teach a new grapheme-phoneme correspondence using I Do / We Do / You Do  
**Content shape:**
```json
{
  "grapheme": "igh",
  "phoneme": "/igh/",
  "keyWord": "light",
  "iDo": "This grapheme is 'igh'. It makes the /igh/ sound, like in 'light'.",
  "weDo": "Say the sound with me: /igh/. Now read these: light, night, fight.",
  "weDo_words": ["light", "night", "fight"],
  "youDo_prompt": "Your turn. Read each word:",
  "youDo_words": ["tight", "right", "bright"],
  "rule": "The letters 'igh' are a trigraph — they always say /igh/ together."
}
```
**Student UI:**
- **I Do phase:** Display grapheme large + phoneme + key word. Read-aloud cue text. "I'm ready → We Do" button.
- **We Do phase:** Words displayed one at a time with the grapheme highlighted. Student clicks "I read it ✓" for each. Progress through list.
- **You Do phase:** Words shown without highlighting. Student types each word they read (or self-reports). Check answers.
- **Rule card:** After completion, display the rule in a highlighted card.
- Complete → `submitToEngine(true)`

> [!IMPORTANT]
> This is the most pedagogically sensitive block. The I Do → We Do → You Do progression must be enforced sequentially — students cannot skip to You Do.

---

### Step 5 — WORD_WORK (Decoding + Encoding)
**Purpose:** Decode (read) a set of words AND encode (spell) a set of words  
**Content shape:**
```json
{
  "decoding_words": ["ship", "shop", "chip", "chop"],
  "encoding_words": ["ship", "chip"],
  "instruction": "Part A: Read each word. Part B: Spell each word."
}
```
**Student UI:**
- **Part A — Decoding:** Words displayed one at a time. Student self-reports "I read it correctly ✓" or "I struggled ✗". Struggling → show word broken into phoneme segments as a correction cue.
- **Part B — Encoding:** Word is said (displayed as text since async). Student types the spelling. Check → exact match required (case-insensitive).
- Both parts must be completed to submit.
- Score = encoding accuracy (decoding is self-reported).
- `submitToEngine()` with encoding accuracy score.

---

### Step 6 — HEART_WORDS (Sight Word Recognition)
**Purpose:** Memorize irregular sight words as whole units  
**Content shape:**
```json
{
  "instruction": "These words don't follow the rules. You need to know them by heart.",
  "words": ["said", "was", "the", "are"],
  "review_mode": false
}
```
**Student UI:**
- Flash card per word — word shown large
- Highlight the irregular portion in red (if `irregularPart` provided), decodable portion in green
- Student self-reports: "✓ I know this" / "Still learning"
- After all cards: Summary — known vs still learning
- "Still learning" words shown again for a second pass
- Complete after 2 passes → `submitToEngine(true)`

---

### Step 7 — DECODABLE_TEXT (Reading Passage)
**Purpose:** Apply mastered graphemes in a connected decodable text  
**Content shape:**
```json
{
  "title": "The Ship",
  "passage": "Sam saw a big ship. The ship had a flag...",
  "comprehension_questions": [
    {
      "question": "What did Sam see?",
      "options": ["A ship", "A dog", "A hat"],
      "correct": 0
    }
  ]
}
```
**Student UI:**
- Display passage with read-aloud button (uses existing TTS hook)
- After reading: comprehension questions (multiple choice, same as `MultipleChoiceBlock`)
- Must answer all questions to complete
- Score = % correct on comprehension questions
- `submitToEngine()` with comprehension score
- If content flagged as `contentStatus: 'placeholder_seed'` → show teacher alert banner instead

---

### Step 8 — ENCODING (Dictation/Spelling)
**Purpose:** Spell words and sentences from dictation  
**Content shape:**
```json
{
  "instruction": "Listen to each word. Type what you hear.",
  "words": ["ship", "chip", "shop"],
  "sentence": "The ship had a big flag.",
  "sentence_mode": false
}
```
**Student UI:**
- Word displayed as a cue text (e.g., "Word 1: ship" — since async, tutor can't speak)
- Student types the word into an input
- Submit → exact match check (case-insensitive, trim whitespace)
- Wrong → show correct spelling with phoneme breakdown as correction
- Score = words spelled correctly / total
- `submitToEngine()` with encoding accuracy score (this feeds mastery threshold)

> [!IMPORTANT]
> This is the **mastery gate** — the engine requires 85% encoding accuracy. The score from this block directly determines whether mastery is achieved for the lesson.

---

## Shared Infrastructure

### `PhonicsShell` wrapper component
All 8 sub-components wrap in a shared shell:
```tsx
<PhonicsShell blockType={blockType} isCompleted={isCompleted}>
  {/* block-specific content */}
</PhonicsShell>
```
Shell provides: amber left border, block icon + label, step indicator, completion badge.

### Error Correction Protocol
The existing AFFIRM → MODEL → ECHO → APPLY state machine is preserved. Each sub-component calls a shared `useErrorCorrection()` hook rather than duplicating state.

### `submitToEngine()` 
The existing function is unchanged — moved to a shared utility within the file.

---

## What Does NOT Change
- Routing in the main `switch` statement (lines 75–83) — unchanged
- The `BlockProps` interface — unchanged
- All non-phonics blocks — completely untouched
- The existing Error Correction Protocol logic — preserved, refactored into a hook
- Engine outcome codes — unchanged

---

## Verification Plan

After implementation, confirm:
1. Each of the 8 block types renders a distinct, appropriate UI (not identical buttons)
2. Step 4 enforces sequential I Do → We Do → You Do (cannot skip phases)
3. Step 7 rejects placeholder-seed content with teacher alert banner
4. Step 8 score is passed correctly to `submitToEngine()` for mastery gate
5. Error Correction Protocol fires on incorrect answer in Steps 1, 3, 4, 5, 8
6. All blocks call `onAnswer()` on completion
7. Build compiles with no TypeScript errors

---

## Open Questions for Your Review

> [!IMPORTANT]
> **Step 2 (Visual Drill) and Step 6 (Heart Words)** rely on student self-report since they involve oral production. Is this acceptable for the HomePlus async context, or should we add a typed confirmation (e.g., "type the sound you said")?

> [!IMPORTANT]
> **Step 5 (Word Work) — Decoding half:** Currently proposed as self-report. Should this be a type-and-check (student types what they read) or remain self-report to reduce friction?

> [!NOTE]
> **Step 7 (Decodable Text):** The passage content must be provided via the DB (`content.passage`). For now, placeholder-seed lessons will show the teacher alert banner. Should there be a fallback to a generated passage via the LLM fallback already built in Phase 2?
