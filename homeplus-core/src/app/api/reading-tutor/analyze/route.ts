import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { analyzeTranscript, estimateLexile } from '@/lib/reading-tutor';
import type { VoiceProfileData } from '@/lib/reading-tutor';

/**
 * POST /api/reading-tutor/analyze
 * Analyzes a student's reading transcript against the original passage text.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    const body = await req.json();
    const { passageId, originalText, transcript, durationSeconds } = body;

    if (!originalText || !transcript) {
      return NextResponse.json({ error: 'Missing text or transcript' }, { status: 400 });
    }

    // Load voice profile if available
    let voiceProfile: VoiceProfileData | null = null;
    if (userId) {
      const profile = await prisma.voiceProfile.findUnique({
        where: { studentId: userId },
      });
      if (profile?.isCalibrated) {
        voiceProfile = {
          speechPatterns: profile.speechPatterns as VoiceProfileData['speechPatterns'],
          calibrationWords: profile.calibrationWords as VoiceProfileData['calibrationWords'],
          isCalibrated: true,
        };
      }
    }

    // Run analysis
    const analysis = analyzeTranscript(
      originalText,
      transcript,
      voiceProfile,
      durationSeconds || 60
    );

    // Save reading session if authenticated
    if (userId && passageId) {
      const passage = await prisma.readingPassage.findUnique({
        where: { id: passageId },
      });

      const lexile = passage
        ? estimateLexile(analysis.adjustedAccuracy, passage.lexileLevel, 0)
        : null;

      await prisma.readingSession.create({
        data: {
          studentId: userId,
          passageId,
          transcript,
          accuracyRate: analysis.adjustedAccuracy,
          wordsPerMinute: analysis.wordsPerMinute,
          miscues: analysis.miscues as unknown as Record<string, unknown>[],
          lexileEstimate: lexile,
          durationSeconds: durationSeconds || 60,
        },
      });
    }

    return NextResponse.json({
      analysis: {
        totalWords: analysis.totalWords,
        correctWords: analysis.correctWords,
        adjustedAccuracy: analysis.adjustedAccuracy,
        wordsPerMinute: analysis.wordsPerMinute,
        wordResults: analysis.wordResults,
        miscueCount: analysis.miscues.length,
        filteredMiscues: analysis.filteredMiscues,
      },
    });
  } catch (error) {
    console.error('[API /reading-tutor/analyze]', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
