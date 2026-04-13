import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import OnboardingWizard from './OnboardingWizard';

export const metadata = {
  title: 'Welcome to Home Plus',
};

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/');
  }

  const user = session.user as any;

  // If they somehow land here but are already COMPLETED, send them to dashboard
  if (user.onboardingStatus === 'COMPLETED') {
    redirect('/student/dashboard');
  }

  // Pass down their saved step (defaulting to 1)
  const initialStep = user.onboardingStep || 1;

  return (
    <OnboardingWizard initialStep={initialStep} />
  );
}
