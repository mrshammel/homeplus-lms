'use client';

import { useState, useEffect, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import styles from './student.module.css';

import { Home, Library, RefreshCw, BookOpen, BarChart2, CheckSquare, Award } from 'lucide-react';

// ---------- Nav Items ----------
const NAV_ITEMS = [
  { href: '/student/dashboard', icon: <Home size={18} />, label: 'Dashboard' },
  { href: '/student/courses', icon: <Library size={18} />, label: 'My Courses' },
  { href: '/student/review', icon: <RefreshCw size={18} />, label: 'Review' },
  { href: '/student/reading-tutor', icon: <BookOpen size={18} />, label: 'Reading Tutor' },
  { href: '/student/progress', icon: <BarChart2 size={18} />, label: 'Progress' },
  { href: '/student/assignments', icon: <CheckSquare size={18} />, label: 'Assignments' },
  { href: '/student/grades', icon: <Award size={18} />, label: 'Grades' },
];

// ---------- Layout Component ----------
export default function StudentLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  // Only redirect to onboarding if status is PENDING (never if SKIPPED or COMPLETED)
  if (status === 'authenticated' && session?.user) {
    const user = session.user as any;
    const isOnboardingPage = pathname.startsWith('/student/onboarding');
    const isPending = user.onboardingStatus !== 'COMPLETED' && user.onboardingStatus !== 'SKIPPED';

    if (!isPending) {
      // Session confirmed non-pending — safe to clear the bypass flag
      if (typeof window !== 'undefined') localStorage.removeItem('onboarding_skip_bypass');
    } else if (!isOnboardingPage) {
      // Check for bypass flag set synchronously before navigation (prevents race condition)
      const bypassRedirect = typeof window !== 'undefined' &&
        localStorage.getItem('onboarding_skip_bypass') === '1';
      if (!bypassRedirect) {
        router.replace('/student/onboarding');
      }
    }
  }

  // Due-date reminder for skipped onboarding
  const [skipDueDate, setSkipDueDate] = useState<string | null>(null);
  useEffect(() => {
    const stored = localStorage.getItem('onboarding_skipped_until');
    if (stored) {
      const date = new Date(stored);
      setSkipDueDate(date.toLocaleDateString('en-CA', { month: 'long', day: 'numeric' }));
    }
  }, []);

  const isOnboarding = pathname.startsWith('/student/onboarding');

  const userName = session?.user?.name || 'Student';
  const today = new Date().toLocaleDateString('en-CA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const currentNav = NAV_ITEMS.find((item) =>
    item.href === '/student/dashboard'
      ? pathname === '/student/dashboard'
      : pathname.startsWith(item.href)
  );
  const pageTitle = currentNav?.label || 'Dashboard';

  return (
    <div className={styles.dashLayout}>
      {/* Mobile overlay */}
      <div
        className={`${styles.overlay} ${sidebarOpen ? styles.overlayVisible : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar - Hide entirely if currently onboarding */}
      {!isOnboarding && (
        <nav className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <Image
            src="/images/hpln-logo.png"
            alt="Home Plus"
            width={140}
            height={44}
            className={styles.sidebarLogo}
          />
          <div className={styles.sidebarTitle}>Student Dashboard</div>
        </div>

        <div className={styles.navItems}>
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === '/student/dashboard'
              ? pathname === '/student/dashboard'
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className={styles.sidebarFooter}>
          <Link href="/" className={styles.backLink}>
            ← Back to Home Plus
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className={styles.signOutLink}
          >
            Sign Out
          </button>
        </div>
      </nav>
      )}

      {/* Main content */}
      <main className={`${styles.mainContent} ${isOnboarding ? styles.mainContentOnboarding : ''}`} style={isOnboarding ? { marginLeft: 0 } : {}}>
        <div className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button
              className={styles.menuBtn}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              ☰
            </button>
            <h1 className={styles.topbarTitle}>{pageTitle}</h1>
            <span className={styles.topbarDate}>{today}</span>
          </div>
          <div className={styles.topbarRight}>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              {userName}
            </span>
            <button
              className={styles.signOutBtn}
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className={styles.pageContent}>
          {skipDueDate && !pathname.startsWith('/student/onboarding') && (
            <div style={{
              background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px',
              padding: '10px 16px', marginBottom: '16px', display: 'flex',
              alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem'
            }}>
              <span>⚠️ <strong>Onboarding incomplete</strong> — your teacher needs this by <strong>{skipDueDate}</strong>.</span>
              <Link href="/student/onboarding" style={{ color: '#b45309', fontWeight: 600, marginLeft: '12px' }}>
                Complete now →
              </Link>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
