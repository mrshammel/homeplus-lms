import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildCalibrationAnalysisPrompt } from '@/lib/reading-tutor-prompts';

const MODEL_NAME = 'gemini-2.0-flash';

/**
 * POST /api/reading-tutor/calibrate
 * Processes voice calibration data and saves the voice profile.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    const body = await req.json();

    const { freeResponse, repeatResults } = body;

    if (!repeatResults || repeatResults.length === 0) {
      return NextResponse.json({ error: 'No calibration data' }, { status: 400 });
    }

    // Analyze with AI
    let speechPatterns: { target: string; actual: string; examples: string[] }[] = [];

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        const prompt = buildCalibrationAnalysisPrompt(repeatResults, freeResponse || '');

        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 512,
            responseMimeType: 'application/json',
          },
        });

        const responseText = result.response.text();
        let parsed: Record<string, unknown>;
        try {
          parsed = JSON.parse(responseText);
        } catch {
          parsed = { speechPatterns: [] };
        }

        speechPatterns = (parsed.speechPatterns as typeof speechPatterns) || [];
      } catch (aiError) {
        console.error('[API /reading-tutor/calibrate] AI error:', aiError);
      }
    }

    // Save voice profile
    if (userId) {
      await prisma.voiceProfile.upsert({
        where: { studentId: userId },
        update: {
          isCalibrated: true,
          speechPatterns: JSON.parse(JSON.stringify(speechPatterns)),
          calibrationWords: JSON.parse(JSON.stringify(repeatResults)),
          sampleCount: repeatResults.length,
          calibratedAt: new Date(),
        },
        create: {
          studentId: userId,
          isCalibrated: true,
          speechPatterns: JSON.parse(JSON.stringify(speechPatterns)),
          calibrationWords: JSON.parse(JSON.stringify(repeatResults)),
          sampleCount: repeatResults.length,
          calibratedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      patternsFound: speechPatterns.length,
      patterns: speechPatterns,
    });
  } catch (error) {
    console.error('[API /reading-tutor/calibrate]', error);
    return NextResponse.json({ error: 'Calibration failed' }, { status: 500 });
  }
}
