'use client';

// ============================================
// Onboarding Hub - Home Plus LMS
// ============================================
// Hub model: student sees 4 section cards.
// They can complete each section in any order.
// When all 4 are marked done, the "Enter Platform" button unlocks.
// Sections:
//   1. About Me      - nickname, interests, fun facts
//   2. Math Check    - Gr 5 & 6 diagnostic (Alberta outcomes)
//   3. ELA           - writing sample + conventions + story elements
//   4. Reading       - passage comprehension check
//
// All responses autosave to /api/onboarding/progress.
// Completion writes a teacher-facing baseline note.

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styles from './onboarding.module.css';

// ─── Types ─────────────────────────────────────────────────────────────────

type SectionId = 'about' | 'math' | 'ela' | 'reading';

interface SectionState {
  done: boolean;
  data: Record<string, string>;
}

// ─── Alberta Gr 5/6 Math Diagnostic ────────────────────────────────────────
// Aligned to Alberta Program of Studies for Grades 5-6

const MATH_QUESTIONS = [
  // Grade 5 - Number
  {
    id: 'm1', grade: 5, strand: 'Number',
    text: 'What is 3/4 + 1/4?',
    options: ['4/8', '1', '2/4', '4/4'],
    correct: '1',
  },
  {
    id: 'm2', grade: 5, strand: 'Number',
    text: 'What is 48 ÷ 6?',
    options: ['6', '7', '8', '9'],
    correct: '8',
  },
  {
    id: 'm3', grade: 5, strand: 'Patterns & Relations',
    text: 'In the pattern 2, 5, 8, 11, … what comes next?',
    options: ['12', '13', '14', '15'],
    correct: '14',
  },
  {
    id: 'm4', grade: 6, strand: 'Number',
    text: 'What is 25% of 80?',
    options: ['10', '15', '20', '25'],
    correct: '20',
  },
  {
    id: 'm5', grade: 6, strand: 'Number',
    text: 'Which fraction is equivalent to 0.5?',
    options: ['1/4', '1/3', '1/2', '2/3'],
    correct: '1/2',
  },
  {
    id: 'm6', grade: 6, strand: 'Measurement',
    text: 'A rectangle is 8 cm long and 5 cm wide. What is its area?',
    options: ['13 cm²', '26 cm²', '40 cm²', '45 cm²'],
    correct: '40 cm²',
  },
  {
    id: 'm7', grade: 6, strand: 'Patterns & Relations',
    text: 'If n = 4, what is the value of 3n + 2?',
    options: ['9', '12', '14', '18'],
    correct: '14',
  },
  {
    id: 'm8', grade: 6, strand: 'Statistics & Probability',
    text: 'A bag has 3 red and 7 blue marbles. What is the probability of picking red?',
    options: ['3/7', '3/10', '7/10', '1/3'],
    correct: '3/10',
  },
];

// ─── Reading Passage ────────────────────────────────────────────────────────

const READING_PASSAGE = `The Arctic fox is one of nature's most remarkable survivors. Its thick, white winter coat acts as camouflage in the snow and provides insulation against temperatures as cold as -50°C. In summer, the coat changes to brown or grey, blending in with the tundra. Arctic foxes are omnivores - they eat small animals like lemmings and voles, berries, insects, and even scraps left by polar bears.

Unlike many animals, Arctic foxes do not hibernate. They remain active all winter, sometimes travelling hundreds of kilometres across sea ice in search of food. Their small, rounded ears reduce heat loss, and their heavily furred paws act like snowshoes.

Despite surviving the harshest conditions on Earth, Arctic foxes face new challenges. Climate change is warming the Arctic faster than almost anywhere else on the planet. As temperatures rise, the red fox - a larger, more aggressive relative - is moving north into the Arctic fox's habitat. The two species compete for the same food, and the red fox usually wins.`;

const READING_QUESTIONS = [
  {
    id: 'r1',
    text: 'What is the MAIN idea of this passage?',
    options: [
      'Arctic foxes have white fur in winter.',
      'The Arctic fox is a skilled survivor facing new threats.',
      'Red foxes are more aggressive than Arctic foxes.',
      'Climate change only affects animals in cold places.',
    ],
    correct: 'The Arctic fox is a skilled survivor facing new threats.',
  },
  {
    id: 'r2',
    text: 'According to the passage, why does the Arctic fox\'s coat change colour in summer?',
    options: [
      'To stay warm during cold nights.',
      'To blend in with the tundra environment.',
      'To attract a mate.',
      'To scare away predators.',
    ],
    correct: 'To blend in with the tundra environment.',
  },
  {
    id: 'r3',
    text: 'What does the word "omnivore" mean based on how it is used in the passage?',
    options: [
      'An animal that only eats plants.',
      'An animal that only eats other animals.',
      'An animal that eats both plants and animals.',
      'An animal that does not eat during winter.',
    ],
    correct: 'An animal that eats both plants and animals.',
  },
  {
    id: 'r4',
    text: 'According to the passage, which of these is a NEW challenge for Arctic foxes?',
    options: [
      'Surviving temperatures of -50°C.',
      'Finding enough food in winter.',
      'Competition from red foxes moving north.',
      'Travelling across sea ice.',
    ],
    correct: 'Competition from red foxes moving north.',
  },
];

// ─── About Me Questions ─────────────────────────────────────────────────────

const ABOUT_QUESTIONS = [
  { id: 'nickname', label: 'What do you like to be called?', placeholder: 'e.g. Liv, Matt, Ava', type: 'text' },
  { id: 'favourite_activity', label: 'What is your favourite activity or hobby outside of school?', placeholder: 'e.g. soccer, drawing, gaming, riding horses', type: 'text' },
  { id: 'favourite_subject', label: 'What subject do you like most?', type: 'choice', options: ['Math', 'Science', 'English', 'Social Studies', 'PE / Sports', 'Art', 'I\'m not sure yet'] },
  { id: 'learning_goal', label: 'What is ONE thing you hope to get better at this year?', placeholder: 'Write anything - big or small!', type: 'text' },
  { id: 'fun_fact', label: 'Share one fun fact about yourself.', placeholder: 'e.g. I have three cats, I like to bake, I can juggle', type: 'text' },
];

// ─── Sub-component: Section Card (hub view) ─────────────────────────────────

function SectionCard({
  icon, title, desc, done, locked, onClick,
}: {
  icon: string; title: string; desc: string;
  done: boolean; locked: boolean; onClick: () => void;
}) {
  return (
    <button
      className={`${styles.sectionCard} ${done ? styles.sectionCardDone : ''} ${locked ? styles.sectionCardLocked : ''}`}
      onClick={locked ? undefined : onClick}
      disabled={locked}
      aria-label={`${title} - ${done ? 'Completed' : 'Start'}`}
    >
      <div className={styles.sectionCardIcon}>{icon}</div>
      <div className={styles.sectionCardBody}>
        <div className={styles.sectionCardTitle}>{title}</div>
        <div className={styles.sectionCardDesc}>{desc}</div>
      </div>
      <div className={styles.sectionCardStatus}>
        {done ? <span className={styles.doneChip}>✓ Done</span> : <span className={styles.startChip}>{locked ? '' : 'Start ->'}</span>}
      </div>
    </button>
  );
}

// ─── Sub-component: Section Shell (back + content) ──────────────────────────

function SectionShell({ title, icon, progress, total, onBack, children }: {
  title: string; icon: string; progress: number; total: number;
  onBack: () => void; children: React.ReactNode;
}) {
  return (
    <div className={styles.sectionShell}>
      <div className={styles.sectionShellHeader}>
        <button className={styles.backBtn} onClick={onBack}>← Back</button>
        <div className={styles.sectionShellTitle}><span>{icon}</span> {title}</div>
        <div className={styles.sectionShellProgress}>{progress}/{total} done</div>
      </div>
      <div className={styles.sectionProgressBar}>
        <div className={styles.sectionProgressFill} style={{ width: `${total > 0 ? (progress / total) * 100 : 0}%` }} />
      </div>
      <div className={styles.sectionContent}>{children}</div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function OnboardingHub() {
  const router = useRouter();
  const { update } = useSession();
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);
  const [sections, setSections] = useState<Record<SectionId, SectionState>>({
    about:   { done: false, data: {} },
    math:    { done: false, data: {} },
    ela:     { done: false, data: {} },
    reading: { done: false, data: {} },
  });
  const [finishing, setFinishing] = useState(false);

  const allDone = Object.values(sections).every(s => s.done);

  // ─ Autosave helper ─
  const saveSection = useCallback(async (id: SectionId, data: Record<string, string>, done: boolean) => {
    setSections(prev => ({
      ...prev,
      [id]: { done, data },
    }));
    try {
      await fetch('/api/onboarding/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: Object.values({ about: 1, math: 2, ela: 3, reading: 4 })[['about','math','ela','reading'].indexOf(id)],
          status: 'IN_PROGRESS',
          sectionId: id,
          sectionData: data,
          sectionDone: done,
        }),
      });
    } catch { /* non-blocking */ }
  }, []);

  // ─ Finish all sections ─
  const handleFinish = async () => {
    setFinishing(true);
    try {
      await fetch('/api/onboarding/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 4,
          status: 'COMPLETED',
          allSections: sections,
        }),
      });
      // Clear any skip flag, force session refresh before navigating
      localStorage.removeItem('onboarding_skipped_until');
      await update();  // refreshes the JWT so onboardingStatus = COMPLETED
      window.location.href = '/student/dashboard';
    } catch {
      setFinishing(false);
    }
  };

  // ─ Skip for now ─
  const handleSkip = async () => {
    try {
      await fetch('/api/onboarding/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 0, status: 'SKIPPED' }),
      });
      // Store due date: 7 days from now
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);
      localStorage.setItem('onboarding_skipped_until', dueDate.toISOString());
      await update();
      window.location.href = '/student/dashboard';
    } catch { /* non-blocking */ }
  };

  // ─── Hub View ───────────────────────────────────────────────────────────
  if (!activeSection) {
    const doneSections = Object.values(sections).filter(s => s.done).length;
    return (
      <div className={styles.hubContainer}>
        <div className={styles.hubCard}>
          <div className={styles.hubIntro}>
            <div className={styles.hubWelcome}>Welcome to Home Plus! </div>
            <h1 className={styles.hubTitle}>Let&apos;s get you set up</h1>
            <p className={styles.hubSubtitle}>
              Complete all four sections below so your teacher can get to know you and where you&apos;re starting from.
              You can do them in any order and come back to this page anytime.
            </p>
            <div className={styles.hubOverallProgress}>
              <div className={styles.hubOverallBar}>
                <div className={styles.hubOverallFill} style={{ width: `${(doneSections / 4) * 100}%` }} />
              </div>
              <span className={styles.hubOverallText}>{doneSections} of 4 sections complete</span>
            </div>
          </div>

          <div className={styles.sectionGrid}>
            <SectionCard
              icon="" title="About Me" done={sections.about.done} locked={false}
              desc="Tell us your nickname and a few things you love."
              onClick={() => setActiveSection('about')}
            />
            <SectionCard
              icon="" title="Math Check" done={sections.math.done} locked={false}
              desc="Quick questions from Grade 5 & 6 Alberta math."
              onClick={() => setActiveSection('math')}
            />
            <SectionCard
              icon="✏️" title="ELA Baseline" done={sections.ela.done} locked={false}
              desc="Writing sample, story elements, and conventions."
              onClick={() => setActiveSection('ela')}
            />
            <SectionCard
              icon="" title="Reading Check" done={sections.reading.done} locked={false}
              desc="Read a short passage and answer comprehension questions."
              onClick={() => setActiveSection('reading')}
            />
          </div>

          {allDone ? (
            <div className={styles.finishArea}>
              <p className={styles.finishNote}>✅ All sections complete - you&apos;re ready to go!</p>
              <button
                className={styles.btnFinish}
                onClick={handleFinish}
                disabled={finishing}
              >
                {finishing ? 'Setting up your account…' : 'Enter Home Plus ->'}
              </button>
            </div>
          ) : (
            <div className={styles.finishArea}>
              <p className={styles.notDoneYet}>
                Complete all 4 sections above to unlock your courses.
              </p>
              <button
                className={styles.btnSkip}
                onClick={handleSkip}
                type="button"
              >
                Skip for now — I&apos;ll finish by{' '}
                {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA', {
                  month: 'long', day: 'numeric'
                })}
              </button>
            </div>
          )}

        </div>
      </div>
    );
  }

  // ─── About Me Section ────────────────────────────────────────────────────
  if (activeSection === 'about') {
    return (
      <AboutSection
        initial={sections.about.data}
        onComplete={(data) => {
          saveSection('about', data, true);
          setActiveSection(null);
        }}
        onBack={() => setActiveSection(null)}
      />
    );
  }

  // ─── Math Section ────────────────────────────────────────────────────────
  if (activeSection === 'math') {
    return (
      <MathSection
        initial={sections.math.data}
        onComplete={(data) => {
          saveSection('math', data, true);
          setActiveSection(null);
        }}
        onBack={() => setActiveSection(null)}
      />
    );
  }

  // ─── ELA Section ─────────────────────────────────────────────────────────
  if (activeSection === 'ela') {
    return (
      <ELASection
        initial={sections.ela.data}
        onComplete={(data) => {
          saveSection('ela', data, true);
          setActiveSection(null);
        }}
        onBack={() => setActiveSection(null)}
      />
    );
  }

  // ─── Reading Section ─────────────────────────────────────────────────────
  if (activeSection === 'reading') {
    return (
      <ReadingSection
        initial={sections.reading.data}
        onComplete={(data) => {
          saveSection('reading', data, true);
          setActiveSection(null);
        }}
        onBack={() => setActiveSection(null)}
      />
    );
  }

  return null;
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION: About Me
// ════════════════════════════════════════════════════════════════════════════

function AboutSection({ initial, onComplete, onBack }: {
  initial: Record<string, string>;
  onComplete: (data: Record<string, string>) => void;
  onBack: () => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>(initial);

  const answered = ABOUT_QUESTIONS.filter(q => (answers[q.id] || '').trim().length > 0).length;
  const allAnswered = answered === ABOUT_QUESTIONS.length;

  const set = (id: string, val: string) => setAnswers(prev => ({ ...prev, [id]: val }));

  return (
    <SectionShell title="About Me" icon="" progress={answered} total={ABOUT_QUESTIONS.length} onBack={onBack}>
      <div className={styles.questionList}>
        {ABOUT_QUESTIONS.map((q, i) => (
          <div key={q.id} className={styles.questionBlock}>
            <label className={styles.questionLabel}>
              <span className={styles.questionNum}>{i + 1}</span>
              {q.label}
            </label>
            {q.type === 'text' ? (
              <input
                className={styles.textInput}
                value={answers[q.id] || ''}
                onChange={e => set(q.id, e.target.value)}
                placeholder={q.placeholder}
              />
            ) : (
              <div className={styles.choiceGrid}>
                {q.options!.map(opt => (
                  <button
                    key={opt}
                    className={`${styles.choiceBtn} ${answers[q.id] === opt ? styles.choiceBtnSelected : ''}`}
                    onClick={() => set(q.id, opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className={styles.sectionFooter}>
        <button className={styles.backBtn} onClick={onBack}>← Back to Hub</button>
        <button
          className={styles.btnPrimary}
          disabled={!allAnswered}
          onClick={() => onComplete(answers)}
        >
          Save & Return &rarr;
        </button>
      </div>
    </SectionShell>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION: Math Check
// ════════════════════════════════════════════════════════════════════════════

function MathSection({ initial, onComplete, onBack }: {
  initial: Record<string, string>;
  onComplete: (data: Record<string, string>) => void;
  onBack: () => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>(initial);
  const answered = Object.keys(answers).filter(k => answers[k]).length;
  const allAnswered = answered === MATH_QUESTIONS.length;

  return (
    <SectionShell title="Math Check" icon="" progress={answered} total={MATH_QUESTIONS.length} onBack={onBack}>
      <p className={styles.sectionIntro}>
        These questions come from Grade 5 and 6 Alberta math. There are no trick questions - just do your best!
        Your teacher reviews these results, not a computer grade.
      </p>
      <div className={styles.questionList}>
        {MATH_QUESTIONS.map((q, i) => (
          <div key={q.id} className={styles.questionBlock}>
            <div className={styles.questionMeta}>
              <span className={styles.questionNum}>{i + 1}</span>
              <span className={styles.strandBadge}>Gr {q.grade} • {q.strand}</span>
            </div>
            <div className={styles.questionLabel}>{q.text}</div>
            <div className={styles.mcGrid}>
              {q.options.map(opt => (
                <button
                  key={opt}
                  className={`${styles.mcBtn} ${answers[q.id] === opt ? styles.mcBtnSelected : ''}`}
                  onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className={styles.sectionFooter}>
        <button className={styles.backBtn} onClick={onBack}>← Back to Hub</button>
        <button className={styles.btnPrimary} disabled={!allAnswered} onClick={() => onComplete(answers)}>
          Save & Return &rarr;
        </button>
      </div>
    </SectionShell>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION: ELA Baseline
// ════════════════════════════════════════════════════════════════════════════

// ── Writing / conventions tasks (textarea) ──────────────────────────────────

const ELA_WRITING_TASKS = [
  {
    id: 'writing_sample',
    title: 'Writing Sample',
    instruction: 'Write a paragraph about a time you felt proud of something you did. Try to include a beginning, middle, and end.',
    hint: "Aim for at least 5 sentences. Don't worry about being perfect - just write!",
    minWords: 40,
  },
  {
    id: 'story_elements',
    title: 'Story Elements',
    instruction: 'Think of a book, movie, or story you know. In 2\u20133 sentences, identify the PROTAGONIST (main character) and the CONFLICT (main problem) in that story.',
    hint: "Example: \"In Charlotte's Web, the protagonist is Wilbur the pig. The conflict is that Wilbur is going to be sold and killed, and Charlotte tries to save him.\"",
    minWords: 15,
  },
  {
    id: 'conventions',
    title: 'Language Conventions',
    instruction: 'Rewrite this sentence correctly, fixing any spelling, capitalization, or punctuation errors:\n\n"their going to the store on saterday but they dont have alot of mony"',
    hint: 'Look for: spelling mistakes, missing apostrophes, and capitalization.',
    minWords: 8,
  },
];

// ── Figurative Language (MC) ─────────────────────────────────────────────────

const FIGURATIVE_LANGUAGE_QUESTIONS = [
  {
    id: 'fig1',
    strand: 'Figurative Language',
    text: 'Read this sentence: "The wind howled through the trees like a wolf in the night." What type of figurative language is used?',
    options: ['Metaphor', 'Simile', 'Personification', 'Hyperbole'],
  },
  {
    id: 'fig2',
    strand: 'Figurative Language',
    text: 'Read this sentence: "The old car coughed and sputtered to life." What type of figurative language is this?',
    options: ['Simile', 'Alliteration', 'Personification', 'Metaphor'],
  },
  {
    id: 'fig3',
    strand: 'Figurative Language',
    text: '"I\'ve told you a million times to clean your room!" What type of figurative language is used?',
    options: ['Onomatopoeia', 'Hyperbole', 'Simile', 'Alliteration'],
  },
  {
    id: 'fig4',
    strand: 'Figurative Language',
    text: '"Life is a roller coaster \u2014 full of highs and lows." What type of figurative language is used?',
    options: ['Simile', 'Alliteration', 'Personification', 'Metaphor'],
  },
  {
    id: 'fig5',
    strand: 'Figurative Language',
    text: '"Sally sells seashells by the seashore." What device is used in this sentence?',
    options: ['Onomatopoeia', 'Hyperbole', 'Alliteration', 'Metaphor'],
  },
];

// ── Prefix & Suffix (MC - choose the correct meaning) ───────────────────────

const PREFIX_SUFFIX_QUESTIONS = [
  {
    id: 'pref1',
    strand: 'Prefix / Suffix',
    prompt: 'The prefix "un-" means NOT. What does the word UNHAPPY mean?',
    options: ['Very happy', 'Not happy', 'Somewhat happy', 'Was happy before'],
  },
  {
    id: 'pref2',
    strand: 'Prefix / Suffix',
    prompt: 'The prefix "re-" means AGAIN. What does REWRITE mean?',
    options: ['Write beautifully', 'Write before', 'Write again', 'Not write'],
  },
  {
    id: 'pref3',
    strand: 'Prefix / Suffix',
    prompt: 'The suffix "-ful" means FULL OF. What does HOPEFUL mean?',
    options: ['Without hope', 'Full of hope', 'Against hope', 'Too much hope'],
  },
  {
    id: 'pref4',
    strand: 'Prefix / Suffix',
    prompt: 'The prefix "mis-" means WRONG or INCORRECTLY. Which word means "to spell incorrectly"?',
    options: ['Misspell', 'Unspell', 'Respell', 'Despell'],
  },
  {
    id: 'pref5',
    strand: 'Prefix / Suffix',
    prompt: 'The suffix "-less" means WITHOUT. What does CARELESS mean?',
    options: ['Full of care', 'Without care', 'Too careful', 'More careful'],
  },
];

// ── Total item count & completion helper ─────────────────────────────────────

const TOTAL_ELA_ITEMS =
  ELA_WRITING_TASKS.length +
  FIGURATIVE_LANGUAGE_QUESTIONS.length +
  PREFIX_SUFFIX_QUESTIONS.length;

function countELACompleted(answers: Record<string, string>): number {
  const writing = ELA_WRITING_TASKS.filter(
    s => (answers[s.id] || '').trim().split(/\s+/).filter(Boolean).length >= s.minWords,
  ).length;
  const fig = FIGURATIVE_LANGUAGE_QUESTIONS.filter(q => answers[q.id]).length;
  const pre = PREFIX_SUFFIX_QUESTIONS.filter(q => answers[q.id]).length;
  return writing + fig + pre;
}

// ── ELA Section Component ────────────────────────────────────────────────────

function ELASection({ initial, onComplete, onBack }: {
  initial: Record<string, string>;
  onComplete: (data: Record<string, string>) => void;
  onBack: () => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>(initial);
  const answered = countELACompleted(answers);
  const allAnswered = answered === TOTAL_ELA_ITEMS;

  const set = (id: string, val: string) => setAnswers(prev => ({ ...prev, [id]: val }));

  let itemIdx = 0;

  return (
    <SectionShell title="ELA Baseline" icon="✏️" progress={answered} total={TOTAL_ELA_ITEMS} onBack={onBack}>
      <p className={styles.sectionIntro}>
        Three parts: writing tasks, figurative language, and word parts (prefixes &amp; suffixes).
        Your teacher reviews the writing - just do your best on everything!
      </p>

      {/* ── Part 1: Writing Tasks ── */}
      <div className={styles.partHeading}>Part 1 - Writing Tasks</div>
      <div className={styles.questionList}>
        {ELA_WRITING_TASKS.map((step) => {
          itemIdx++;
          const wordCount = (answers[step.id] || '').trim().split(/\s+/).filter(Boolean).length;
          const met = wordCount >= step.minWords;
          return (
            <div key={step.id} className={styles.questionBlock}>
              <div className={styles.questionMeta}>
                <span className={styles.questionNum}>{itemIdx}</span>
                <span className={styles.strandBadge}>{step.title}</span>
              </div>
              <div className={styles.questionLabel} style={{ whiteSpace: 'pre-line' }}>{step.instruction}</div>
              <p className={styles.questionHint}> {step.hint}</p>
              <textarea
                className={styles.textArea}
                value={answers[step.id] || ''}
                onChange={e => set(step.id, e.target.value)}
                placeholder="Write your response here..."
                rows={5}
                spellCheck={false}
              />
              <div className={styles.wordCount} style={{ color: met ? '#059669' : '#94a3b8' }}>
                {wordCount} words{!met && ` - aim for ${step.minWords}+ words`}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Part 2: Figurative Language ── */}
      <div className={styles.partHeading}>Part 2 - Figurative Language</div>
      <div className={styles.questionList}>
        {FIGURATIVE_LANGUAGE_QUESTIONS.map((q) => {
          itemIdx++;
          return (
            <div key={q.id} className={styles.questionBlock}>
              <div className={styles.questionMeta}>
                <span className={styles.questionNum}>{itemIdx}</span>
                <span className={styles.strandBadge}>{q.strand}</span>
              </div>
              <div className={styles.questionLabel}>{q.text}</div>
              <div className={styles.mcGrid}>
                {q.options.map(opt => (
                  <button
                    key={opt}
                    className={`${styles.mcBtn} ${answers[q.id] === opt ? styles.mcBtnSelected : ''}`}
                    onClick={() => set(q.id, opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Part 3: Prefix / Suffix ── */}
      <div className={styles.partHeading}>Part 3 - Word Parts: Prefixes &amp; Suffixes</div>
      <div className={styles.questionList}>
        {PREFIX_SUFFIX_QUESTIONS.map((q) => {
          itemIdx++;
          return (
            <div key={q.id} className={styles.questionBlock}>
              <div className={styles.questionMeta}>
                <span className={styles.questionNum}>{itemIdx}</span>
                <span className={styles.strandBadge}>{q.strand}</span>
              </div>
              <div className={styles.questionLabel}>{q.prompt}</div>
              <div className={styles.mcGrid} style={{ gridTemplateColumns: '1fr 1fr' }}>
                {q.options.map(opt => (
                  <button
                    key={opt}
                    className={`${styles.mcBtn} ${answers[q.id] === opt ? styles.mcBtnSelected : ''}`}
                    onClick={() => set(q.id, opt)}
                    style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.sectionFooter}>
        <button className={styles.backBtn} onClick={onBack}>← Back to Hub</button>
        <button className={styles.btnPrimary} disabled={!allAnswered} onClick={() => onComplete(answers)}>
          Save &amp; Return &rarr;
        </button>
      </div>
    </SectionShell>
  );
}



// ════════════════════════════════════════════════════════════════════════════
// SECTION: Reading Check
// ════════════════════════════════════════════════════════════════════════════

function ReadingSection({ initial, onComplete, onBack }: {
  initial: Record<string, string>;
  onComplete: (data: Record<string, string>) => void;
  onBack: () => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>(initial);
  const [showPassage, setShowPassage] = useState(true);
  const answered = READING_QUESTIONS.filter(q => answers[q.id]).length;
  const allAnswered = answered === READING_QUESTIONS.length;

  return (
    <SectionShell title="Reading Check" icon="" progress={answered} total={READING_QUESTIONS.length} onBack={onBack}>
      <p className={styles.sectionIntro}>
        Read the passage below, then answer the questions. You can hide/show the passage while you answer.
      </p>

      <div className={styles.passageCard}>
        <div className={styles.passageHeader}>
          <strong>The Arctic Fox</strong>
          <button className={styles.togglePassage} onClick={() => setShowPassage(p => !p)}>
            {showPassage ? 'Hide passage ▲' : 'Show passage ▼'}
          </button>
        </div>
        {showPassage && (
          <div className={styles.passageText}>{READING_PASSAGE}</div>
        )}
      </div>

      <div className={styles.questionList}>
        {READING_QUESTIONS.map((q, i) => (
          <div key={q.id} className={styles.questionBlock}>
            <div className={styles.questionMeta}>
              <span className={styles.questionNum}>{i + 1}</span>
              <span className={styles.strandBadge}>Comprehension</span>
            </div>
            <div className={styles.questionLabel}>{q.text}</div>
            <div className={styles.mcGrid} style={{ gridTemplateColumns: '1fr' }}>
              {q.options.map(opt => (
                <button
                  key={opt}
                  className={`${styles.mcBtn} ${answers[q.id] === opt ? styles.mcBtnSelected : ''}`}
                  onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                  style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.sectionFooter}>
        <button className={styles.backBtn} onClick={onBack}>← Back to Hub</button>
        <button className={styles.btnPrimary} disabled={!allAnswered} onClick={() => onComplete(answers)}>
          Save & Return &rarr;
        </button>
      </div>
    </SectionShell>
  );
}
