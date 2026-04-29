import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PhonicsLessonClient } from './phonics-lesson-client';

interface Props {
  params: Promise<{ lessonId: string }>;
}

export default async function PhonicsLessonPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/');

  const userId = (session.user as any).id as string;
  const { lessonId } = await params;

  // Fetch lesson with grapheme data
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      lessonGraphemes: {
        include: {
          grapheme: true,
        },
      },
      introducedWords: {
        include: {
          wordGraphemes: {
            include: { grapheme: true },
          },
        },
      },
      phonicsAssessment: true,
      unit: {
        include: { subject: { select: { name: true, active: true } } },
      },
    },
  });

  if (!lesson || lesson.subjectMode !== 'PHONICS') notFound();
  if (!lesson.unit.subject.active) notFound();

  // Get student's existing mastery for this lesson
  const mastery = await prisma.studentMastery.findUnique({
    where: { studentId_lessonId: { studentId: userId, lessonId } },
  });

  // Get all graphemes from previously mastered/in-progress lessons for review
  const studentMastery = await prisma.studentMastery.findMany({
    where: {
      studentId: userId,
      status: { in: ['mastered', 'in_progress', 'complete'] },
      lessonId: { not: lessonId }, // exclude current lesson
    },
    select: { lessonId: true },
  });
  const prevLessonIds = studentMastery.map(m => m.lessonId);

  const reviewGraphemeRecords = prevLessonIds.length > 0
    ? await prisma.lessonGrapheme.findMany({
        where: { lessonId: { in: prevLessonIds } },
        include: { grapheme: true },
        distinct: ['graphemeId'],
      })
    : [];

  // Decodable words = non-heart-words from this lesson
  const decodableWords = lesson.introducedWords
    .filter(w => !w.isHeartWord)
    .map(w => ({ word: w.word, isHeartWord: false }));

  const heartWords = lesson.introducedWords
    .filter(w => w.isHeartWord)
    .map(w => ({ word: w.word, isHeartWord: true }));

  // New grapheme for this lesson
  const newGrapheme = lesson.lessonGraphemes[0]?.grapheme ?? null;

  const lessonData = {
    id: lesson.id,
    title: lesson.title,
    targetSkill: lesson.targetSkill,
    keyword: lesson.keyword,
    description: lesson.description,
    decodablePassage: lesson.phonicsAssessment?.sentences
      ? (lesson.phonicsAssessment.sentences as string[])[0] ?? null
      : null,
    newGrapheme: newGrapheme ? {
      grapheme: newGrapheme.grapheme,
      phoneme: newGrapheme.phoneme,
      articulatoryGestureScript: newGrapheme.articulatoryGestureScript,
      secretStoryScript: newGrapheme.secretStoryScript,
    } : null,
    reviewGraphemes: reviewGraphemeRecords.map(lg => ({
      grapheme: lg.grapheme.grapheme,
      phoneme: lg.grapheme.phoneme,
      articulatoryGestureScript: lg.grapheme.articulatoryGestureScript,
      secretStoryScript: lg.grapheme.secretStoryScript,
    })),
    decodableWords,
    heartWords,
    previousMastery: mastery ? { lessonId: mastery.lessonId, status: mastery.status } : null,
  };

  return <PhonicsLessonClient lesson={lessonData} />;
}

export async function generateMetadata({ params }: Props) {
  const { lessonId } = await params;
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { title: true, targetSkill: true },
  });
  return {
    title: lesson ? `${lesson.title} — Phonics | Home Plus` : 'Phonics Lesson | Home Plus',
    description: lesson?.targetSkill ?? 'UFLI phonics lesson',
  };
}
