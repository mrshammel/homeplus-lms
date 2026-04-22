import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildMiniLessonGenerationPrompt } from '@/lib/reading-tutor-prompts';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { gapId } = await req.json();

    const gap = await prisma.phonicsGap.findUnique({
      where: { id: gapId },
      include: { student: true }
    });

    if (!gap) {
      return NextResponse.json({ error: 'Gap not found' }, { status: 404 });
    }

    const gradeLevel = gap.student.gradeLevel || 4;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json', temperature: 0.7 },
    });

    const prompt = buildMiniLessonGenerationPrompt(gap.conceptName, gradeLevel);
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const data = JSON.parse(text);

    return NextResponse.json({
      lesson: data,
      conceptName: gap.conceptName
    });
  } catch (error) {
    console.error('[API /mini-lesson/generate]', error);
    return NextResponse.json({ error: 'Failed to generate mini lesson' }, { status: 500 });
  }
}
