import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { gapId } = await req.json();

    await prisma.phonicsGap.update({
      where: { id: gapId, studentId: userId },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API /mini-lesson/resolve]', error);
    return NextResponse.json({ error: 'Failed to resolve gap' }, { status: 500 });
  }
}
