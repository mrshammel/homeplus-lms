import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildSessionSummaryPrompt } from '@/lib/reading-tutor-prompts';
import { estimateLexile } from '@/lib/reading-tutor';

const MODEL_NAME = 'gemini-2.0-flash';

/**
 * POST /api/reading-tutor/summary
 * Generates an AI session summary and saves the completed session.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    const body = await req.json();

    const {
      passageId,
      passageTitle,
      accuracyRate,
      wpm,
      comprehensionScore,
      miscues,
      durationSeconds,
    } = body;

    // Get previous session for growth comparison
    let prevAccuracy: number | null = null;
    let prevWpm: number | null = null;
    if (userId) {
      const prevSession = await prisma.readingSession.findFirst({
        where: { studentId: userId, completedAt: { not: null } },
        orderBy: { sessionDate: 'desc' },
      });
      if (prevSession) {
        prevAccuracy = prevSession.accuracyRate;
        prevWpm = prevSession.wordsPerMinute;
      }
    }

    // Generate AI summary
    let summary = 'Great job today! You showed up and that takes courage. See you tomorrow! ';
    let celebrationLevel: 'star' | 'sparkle' | 'confetti' = 'star';

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        const prompt = buildSessionSummaryPrompt(
          passageTitle || 'Reading Passage',
          accuracyRate ?? 0,
          wpm ?? 0,
          comprehensionScore ?? 0,
          miscues || [],
          prevAccuracy,
          prevWpm
        );

        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 512,
            responseMimeType: 'application/json',
          },
        });

        const responseText = result.response.text();
        let parsed: Record<string, unknown>;
        try {
          parsed = JSON.parse(responseText);
        } catch {
          parsed = {};
        }

        summary = String(parsed.summary || summary);
        celebrationLevel = (['confetti', 'sparkle', 'star'].includes(String(parsed.celebrationLevel))
          ? String(parsed.celebrationLevel)
          : 'star') as typeof celebrationLevel;
      } catch (aiError) {
        console.error('[API /reading-tutor/summary] AI error:', aiError);
      }
    }

    // Update the reading session with completion data
    if (userId && passageId) {
      const passage = await prisma.readingPassage.findUnique({
        where: { id: passageId },
      });

      const lexile = passage
        ? estimateLexile(accuracyRate ?? 0, passage.lexileLevel, comprehensionScore ?? 0)
        : null;

      // Find the most recent incomplete session for this passage
      const recentSession = await prisma.readingSession.findFirst({
        where: {
          studentId: userId,
          passageId,
          completedAt: null,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (recentSession) {
        await prisma.readingSession.update({
          where: { id: recentSession.id },
          data: {
            comprehensionScore: comprehensionScore ?? 0,
            lexileEstimate: lexile,
            aiTutorFeedback: summary,
            durationSeconds: durationSeconds ?? 0,
            completedAt: new Date(),
          },
        });
      }
    }

    return NextResponse.json({ summary, celebrationLevel });
  } catch (error) {
    console.error('[API /reading-tutor/summary]', error);
    return NextResponse.json({
      summary: 'Awesome work today! Every time you read, your brain gets stronger. See you tomorrow! ',
      celebrationLevel: 'star',
    });
  }
}
