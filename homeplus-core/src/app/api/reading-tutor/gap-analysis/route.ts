import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildGapAnalysisPrompt } from '@/lib/reading-tutor-prompts';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { miscueWords, gradeLevel } = await req.json();

    if (!miscueWords || miscueWords.length === 0) {
      return NextResponse.json({ hasGap: false });
    }

    // Call Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
    });

    const prompt = buildGapAnalysisPrompt(miscueWords, gradeLevel || 4);
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const data = JSON.parse(text);

    if (data.hasGap && data.conceptCode) {
      // Check if this exact gap is already pending for the student
      const existing = await prisma.phonicsGap.findFirst({
        where: {
          studentId: userId,
          conceptCode: data.conceptCode,
          status: 'PENDING'
        }
      });

      if (!existing) {
        // Save to DB
        await prisma.phonicsGap.create({
          data: {
            studentId: userId,
            conceptCode: data.conceptCode,
            conceptName: data.conceptName,
            status: 'PENDING',
          }
        });
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[API /gap-analysis] Error:', error);
    return NextResponse.json({ hasGap: false });
  }
}
