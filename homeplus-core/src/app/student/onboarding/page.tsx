import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import OnboardingHub from './OnboardingWizard';

export const metadata = {
  title: 'Welcome to Home Plus',
};

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/');
  }

  const user = session.user as any;

  // If already completed, skip straight to courses
  if (user.onboardingStatus === 'COMPLETED') {
    redirect('/student');
  }

  return <OnboardingHub />;
}
