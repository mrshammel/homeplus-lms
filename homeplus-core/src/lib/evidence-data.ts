// ============================================
// Evidence of Learning Data Layer — Home Plus LMS
// ============================================
// Types and demo data for student evidence, artifacts, and mastery judgments.

export type MasteryLevel = 'NOT_YET_ASSESSED' | 'EMERGING' | 'APPROACHING' | 'MEETING' | 'EXCEEDING';
export type SubmissionType = 'QUIZ_RESPONSE' | 'SHORT_ANSWER' | 'PARAGRAPH_RESPONSE' | 'ESSAY' | 'REFLECTION' | 'UPLOADED_WORKSHEET' | 'IMAGE_ARTIFACT' | 'PROJECT_FILE' | 'PORTFOLIO_EVIDENCE';

export interface WrittenResponse {
  id: string;
  title: string;
  submissionType: SubmissionType;
  unitLesson: string;
  writtenResponse: string;      // Full text
  preview: string;              // Truncated preview
  score: number | null;
  maxScore: number | null;
  reviewed: boolean;
  teacherFeedback: string | null;
  submittedAt: Date;
}

export interface ArtifactSubmission {
  id: string;
  title: string;
  submissionType: SubmissionType;
  unitLesson: string;
  fileName: string;
  fileUrl: string;
  reviewed: boolean;
  submittedAt: Date;
}

export interface OutcomeMastery {
  outcomeId: string;
  outcomeCode: string;
  outcomeDescription: string;
  unitContext: string | null;
  masteryLevel: MasteryLevel;
  evidenceCount: number;
  latestEvidence: string | null;
  latestDate: Date | null;
  teacherNote: string | null;
}

// ---------- Style Helpers ----------

export function getMasteryStyle(level: MasteryLevel): { color: string; bg: string; label: string } {
  const styles: Record<MasteryLevel, { color: string; bg: string; label: string }> = {
    NOT_YET_ASSESSED: { color: '#6b7280', bg: '#f3f4f6', label: 'Not Yet Assessed' },
    EMERGING:         { color: '#dc2626', bg: '#fee2e2', label: 'Emerging' },
    APPROACHING:      { color: '#d97706', bg: '#fef3c7', label: 'Approaching' },
    MEETING:          { color: '#059669', bg: '#d1fae5', label: 'Meeting' },
    EXCEEDING:        { color: '#2563eb', bg: '#dbeafe', label: 'Exceeding' },
  };
  return styles[level];
}

export function getSubmissionTypeLabel(type: SubmissionType): string {
  const labels: Record<SubmissionType, string> = {
    QUIZ_RESPONSE: 'Quiz Response',
    SHORT_ANSWER: 'Short Answer',
    PARAGRAPH_RESPONSE: 'Paragraph',
    ESSAY: 'Essay',
    REFLECTION: 'Reflection',
    UPLOADED_WORKSHEET: 'Worksheet',
    IMAGE_ARTIFACT: 'Image',
    PROJECT_FILE: 'Project File',
    PORTFOLIO_EVIDENCE: 'Portfolio',
  };
  return labels[type];
}

// ---------- Demo data ----------

export function getDemoWrittenResponses(studentName: string): WrittenResponse[] {
  const responses: WrittenResponse[] = [
    {
      id: 'wr-1', title: 'Ecosystem Food Web Explanation',
      submissionType: 'PARAGRAPH_RESPONSE', unitLesson: 'Unit A · Lesson 1',
      writtenResponse: 'A food web shows how energy flows through an ecosystem. Unlike a food chain that shows a single path, a food web shows all the interconnected feeding relationships. Producers like plants are at the base because they make their own energy through photosynthesis. Primary consumers eat the producers, and secondary consumers eat the primary consumers. Decomposers break down dead matter and return nutrients to the soil, completing the cycle.',
      preview: 'A food web shows how energy flows through an ecosystem. Unlike a food chain that shows a single path...',
      score: 8, maxScore: 10, reviewed: true, teacherFeedback: 'Great explanation of energy flow! Consider adding an example.',
      submittedAt: new Date('2026-03-12'),
    },
    {
      id: 'wr-2', title: 'Heat Transfer Comparison',
      submissionType: 'ESSAY', unitLesson: 'Unit C · Lesson 1',
      writtenResponse: 'Conduction, convection, and radiation are the three methods of heat transfer. Conduction happens when heat moves through direct contact between particles, like when a metal spoon gets hot in soup. Convection occurs in fluids when warmer particles rise and cooler particles sink, creating a current. This is why the top floor of a building is usually warmer. Radiation transfers heat through electromagnetic waves without needing a medium. The sun warms the Earth through radiation across space.',
      preview: 'Conduction, convection, and radiation are the three methods of heat transfer. Conduction happens when...',
      score: null, maxScore: 15, reviewed: false, teacherFeedback: null,
      submittedAt: new Date('2026-03-14'),
    },
    {
      id: 'wr-3', title: 'Plant Adaptation Reflection',
      submissionType: 'REFLECTION', unitLesson: 'Unit B · Lesson 2',
      writtenResponse: 'I learned that plants have amazing ways to survive. Cacti store water in their stems and have spines instead of leaves to reduce water loss. I never realized that the shape of a leaf could help a plant survive in different environments.',
      preview: 'I learned that plants have amazing ways to survive. Cacti store water in their stems and have spines...',
      score: 9, maxScore: 10, reviewed: true, teacherFeedback: 'Wonderful reflection! You connected your learning to real examples.',
      submittedAt: new Date('2026-03-10'),
    },
    {
      id: 'wr-4', title: 'Predator-Prey Relationship',
      submissionType: 'SHORT_ANSWER', unitLesson: 'Unit A · Lesson 2',
      writtenResponse: 'When the prey population decreases, predators have less food and their population also decreases. Then the prey can recover because there are fewer predators.',
      preview: 'When the prey population decreases, predators have less food and their population also decreases...',
      score: 5, maxScore: 5, reviewed: true, teacherFeedback: null,
      submittedAt: new Date('2026-03-08'),
    },
  ];
  return responses;
}

export function getDemoArtifacts(studentName: string): ArtifactSubmission[] {
  return [
    { id: 'art-1', title: 'Ecosystem Diagram', submissionType: 'IMAGE_ARTIFACT', unitLesson: 'Unit A · Lesson 1', fileName: 'ecosystem_diagram.png', fileUrl: '#', reviewed: true, submittedAt: new Date('2026-03-11') },
    { id: 'art-2', title: 'Heat Experiment Worksheet', submissionType: 'UPLOADED_WORKSHEET', unitLesson: 'Unit C · Lesson 2', fileName: 'heat_experiment_worksheet.pdf', fileUrl: '#', reviewed: false, submittedAt: new Date('2026-03-13') },
    { id: 'art-3', title: 'Plant Growth Data Collection', submissionType: 'PROJECT_FILE', unitLesson: 'Unit B · Lesson 1', fileName: 'plant_growth_data.xlsx', fileUrl: '#', reviewed: true, submittedAt: new Date('2026-03-07') },
  ];
}

export function getDemoOutcomeMastery(studentName: string): OutcomeMastery[] {
  return [
    { outcomeId: 'o1', outcomeCode: 'SCI.7.A.1', outcomeDescription: 'Investigate and describe relationships between organisms in an ecosystem', unitContext: 'Unit A — Ecosystems', masteryLevel: 'MEETING', evidenceCount: 3, latestEvidence: 'Ecosystem Food Web Explanation', latestDate: new Date('2026-03-12'), teacherNote: 'Strong understanding demonstrated in written response' },
    { outcomeId: 'o2', outcomeCode: 'SCI.7.A.2', outcomeDescription: 'Identify examples of predator-prey and symbiotic relationships', unitContext: 'Unit A — Ecosystems', masteryLevel: 'APPROACHING', evidenceCount: 2, latestEvidence: 'Predator-Prey Relationship', latestDate: new Date('2026-03-08'), teacherNote: 'Needs more depth on symbiotic types' },
    { outcomeId: 'o3', outcomeCode: 'SCI.7.B.1', outcomeDescription: 'Describe the conditions and processes needed for plant growth', unitContext: 'Unit B — Plants', masteryLevel: 'MEETING', evidenceCount: 2, latestEvidence: 'Plant Growth Data Collection', latestDate: new Date('2026-03-07'), teacherNote: null },
    { outcomeId: 'o4', outcomeCode: 'SCI.7.B.2', outcomeDescription: 'Examine plant adaptations to different environments', unitContext: 'Unit B — Plants', masteryLevel: 'EXCEEDING', evidenceCount: 1, latestEvidence: 'Plant Adaptation Reflection', latestDate: new Date('2026-03-10'), teacherNote: 'Exceptional connections made' },
    { outcomeId: 'o5', outcomeCode: 'SCI.7.C.1', outcomeDescription: 'Describe heat as a form of energy and identify methods of heat transfer', unitContext: 'Unit C — Heat', masteryLevel: 'NOT_YET_ASSESSED', evidenceCount: 1, latestEvidence: 'Heat Transfer Comparison', latestDate: new Date('2026-03-14'), teacherNote: null },
    { outcomeId: 'o6', outcomeCode: 'SCI.7.D.1', outcomeDescription: 'Describe structures that are built to withstand loads and forces', unitContext: 'Unit D — Structures', masteryLevel: 'EMERGING', evidenceCount: 0, latestEvidence: null, latestDate: null, teacherNote: 'No evidence submitted yet' },
    { outcomeId: 'o7', outcomeCode: 'SCI.7.E.1', outcomeDescription: 'Investigate the structure of the Earth and its landforms', unitContext: 'Unit E — Earth', masteryLevel: 'NOT_YET_ASSESSED', evidenceCount: 0, latestEvidence: null, latestDate: null, teacherNote: null },
  ];
}
