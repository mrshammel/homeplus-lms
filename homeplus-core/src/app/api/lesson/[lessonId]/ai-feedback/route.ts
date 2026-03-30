// ============================================
// AI Feedback API — Home Plus LMS
// ============================================
// POST: Grade a constructed response using Gemini API (or calibrated
// rubric fallback). Uses shared rubric framework for consistent,
// subject-aware, grade-appropriate feedback.
//
// Payload: { prompt, rubricHint, studentResponse, minLength?,
//            teacherReviewRequired?, subjectMode?, gradeLevel? }
// Returns: { score, feedback, strengths, improvements, nextStep,
//            criteriaScores, disclaimer }

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  DISCLAIMER,
  buildAIPrompt,
  resolveRubricType,
  scoreFallback,
  getScoringBand,
  type RubricTaskType,
} from '@/lib/rubrics';
import type { SubjectMode } from '@/lib/lesson-types';

interface RouteParams {
  params: Promise<{ lessonId: string }>;
}

interface FeedbackRequest {
  prompt: string;
  rubricHint?: string;
  studentResponse: string;
  minLength?: number;
  minExpectedWords?: number;
  teacherReviewRequired?: boolean;
  subjectMode?: SubjectMode;
  gradeLevel?: number;
}

interface FeedbackResponse {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  nextStep: string;
  criteriaScores: Record<string, number>;
  disclaimer: string;
  flagForTeacher: boolean;
  relevanceScore: number;
}

// ─── Gemini API feedback (calibrated) ───
async function getGeminiFeedback(
  prompt: string,
  rubricHint: string,
  studentResponse: string,
  subject: SubjectMode,
  gradeLevel: number,
  rubricType: RubricTaskType,
  teacherReviewRequired: boolean,
  minExpectedWords?: number,
): Promise<FeedbackResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('No Gemini API key');

  const systemPrompt = buildAIPrompt({
    subject,
    gradeLevel,
    rubricType,
    rubricHint,
    teacherReviewRequired,
  });

  const userPrompt = `PROMPT THE STUDENT WAS ASKED:\n${prompt}\n\n${minExpectedWords ? `EXPECTED MINIMUM RESPONSE LENGTH: approximately ${minExpectedWords} words for this prompt.\n\n` : ''}STUDENT'S RESPONSE:\n${studentResponse}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: systemPrompt + '\n\n' + userPrompt }] },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 600,
          responseMimeType: 'application/json',
        },
      }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    console.error('[AI Feedback] Gemini API error:', err);
    throw new Error('Gemini API error');
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty Gemini response');

  const parsed = JSON.parse(text);
  return {
    score: Math.max(0, Math.min(100, Number(parsed.score) || 50)),
    feedback: parsed.feedback || 'Good effort! Keep working on this.',
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 3) : ['You attempted the response'],
    improvements: Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 3) : ['Add more detail to strengthen your answer'],
    nextStep: parsed.nextStep || 'Review your answer and add one more specific detail.',
    criteriaScores: parsed.criteriaScores || {},
    disclaimer: DISCLAIMER,
    flagForTeacher: !!parsed.flagForTeacher,
    relevanceScore: Math.max(0, Math.min(100, Number(parsed.relevanceScore) || 50)),
  };
}

// ─── Calibrated rubric fallback ───
function getRubricFallback(
  prompt: string,
  rubricHint: string,
  studentResponse: string,
  subject: SubjectMode,
  rubricType: RubricTaskType,
  minLength: number,
): FeedbackResponse {
  const result = scoreFallback({
    studentResponse,
    prompt,
    rubricHint,
    subject,
    rubricType,
    minLength,
  });

  return {
    ...result,
    disclaimer: DISCLAIMER,
  };
}

// ─── Main handler ───
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { lessonId } = await params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body: FeedbackRequest = await req.json();
  const {
    prompt,
    rubricHint,
    studentResponse,
    minLength,
    minExpectedWords,
    teacherReviewRequired,
    subjectMode,
    gradeLevel,
  } = body;

  if (!studentResponse?.trim()) {
    return NextResponse.json({ error: 'No response provided' }, { status: 400 });
  }

  // Resolve assessment parameters
  const subject: SubjectMode = subjectMode || 'GENERAL';
  const grade = gradeLevel || 7;
  const rubricType = resolveRubricType(teacherReviewRequired, minLength);

  let result: FeedbackResponse;
  try {
    if (process.env.GEMINI_API_KEY) {
      result = await getGeminiFeedback(
        prompt,
        rubricHint || '',
        studentResponse,
        subject,
        grade,
        rubricType,
        !!teacherReviewRequired,
        minExpectedWords,
      );
    } else {
      result = getRubricFallback(
        prompt,
        rubricHint || '',
        studentResponse,
        subject,
        rubricType,
        minExpectedWords || minLength || 40,
      );
    }
  } catch (e) {
    console.error('[AI Feedback] Error, falling back to rubric:', e);
    result = getRubricFallback(
      prompt,
      rubricHint || '',
      studentResponse,
      subject,
      rubricType,
      minExpectedWords || minLength || 40,
    );
  }

  return NextResponse.json(result);
}
