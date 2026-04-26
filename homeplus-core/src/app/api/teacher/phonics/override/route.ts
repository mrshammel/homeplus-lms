import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const masteryId = formData.get('masteryId') as string;

    const profileId = formData.get('profileId') as string;
    const flag = formData.get('flag') as string;

    if (masteryId) {
      await prisma.studentMastery.update({
        where: { id: masteryId },
        data: {
          status: 'teacher_override',
          updatedAt: new Date()
        }
      });
    } else if (profileId && flag) {
      await prisma.phonicsProfile.update({
        where: { id: profileId },
        data: {
          [flag]: false,
          updatedAt: new Date()
        }
      });
    } else {
      return NextResponse.json({ error: 'masteryId or profileId+flag required' }, { status: 400 });
    }

    // We could use redirect from next/navigation, but sending a response is fine
    // Or return 302 redirect
    return new Response(null, {
      status: 302,
      headers: { Location: '/teacher/phonics' }
    });
  } catch (error) {
    console.error('Error overriding mastery:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
