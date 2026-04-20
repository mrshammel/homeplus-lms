// ============================================
// Student Review Page - Home Plus LMS (Phase 4)
// ============================================
// Interactive review page with quiz-like flow.
// Server component fetches mastery summary,
// client component handles the interactive quiz.

import { getStudentDashboardData } from '@/lib/student-data';
import styles from '../student.module.css';
import ReviewClient from './ReviewClient';

export default async function ReviewPage() {
  const data = await getStudentDashboardData();
  const { masterySummary } = data;

  const totalTracked = masterySummary.masteredCount + masterySummary.developingCount + masterySummary.reviewDueCount + masterySummary.needsSupportCount;

  return (
    <>
      <section className={styles.welcomeSection}>
        <h2 className={styles.welcomeTitle}> Review</h2>
        <p className={styles.welcomeSubtext}>Strengthen your skills with spaced review practice</p>
      </section>

      {/* Review Stats */}
      <section className={styles.statRow} style={{ marginBottom: 24 }}>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: '#d97706' }}>{masterySummary.reviewDueCount}</div>
          <div className={styles.statLabel}>Skills to Review</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: '#dc2626' }}>{masterySummary.needsSupportCount}</div>
          <div className={styles.statLabel}>Need Support</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: '#059669' }}>{masterySummary.reviewCompletedToday}</div>
          <div className={styles.statLabel}>Done Today</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: '#059669' }}>
            {totalTracked > 0 ? `${Math.round((masterySummary.masteredCount / totalTracked) * 100)}%` : '-'}
          </div>
          <div className={styles.statLabel}>Mastery Rate</div>
        </div>
      </section>

      {/* Mastery Overview */}
      {totalTracked > 0 && (
        <section className={styles.masteryWidget} aria-label="Mastery overview" style={{ marginBottom: 24 }}>
          <h3 className={styles.masteryWidgetTitle}> Mastery Overview</h3>
          <div className={styles.masteryStateGrid}>
            <div className={styles.masteryStateItem} style={{ background: '#f0fdf4' }}>
              <div className={styles.masteryStateCount} style={{ color: '#059669' }}>{masterySummary.masteredCount}</div>
              <div className={styles.masteryStateLabel} style={{ color: '#047857' }}>Mastered</div>
            </div>
            <div className={styles.masteryStateItem} style={{ background: '#eff6ff' }}>
              <div className={styles.masteryStateCount} style={{ color: '#2563eb' }}>{masterySummary.developingCount}</div>
              <div className={styles.masteryStateLabel} style={{ color: '#1d4ed8' }}>Developing</div>
            </div>
            <div className={styles.masteryStateItem} style={{ background: '#fffbeb' }}>
              <div className={styles.masteryStateCount} style={{ color: '#d97706' }}>{masterySummary.reviewDueCount}</div>
              <div className={styles.masteryStateLabel} style={{ color: '#b45309' }}>Review Due</div>
            </div>
            <div className={styles.masteryStateItem} style={{ background: '#fef2f2' }}>
              <div className={styles.masteryStateCount} style={{ color: '#dc2626' }}>{masterySummary.needsSupportCount}</div>
              <div className={styles.masteryStateLabel} style={{ color: '#b91c1c' }}>Needs Support</div>
            </div>
          </div>
          <div className={styles.masteryHealthBar}>
            {(() => {
              const pct = (n: number) => totalTracked > 0 ? `${Math.round((n / totalTracked) * 100)}%` : '0%';
              return (
                <>
                  <div className={styles.masteryHealthSegment} style={{ width: pct(masterySummary.masteredCount), background: '#059669' }} />
                  <div className={styles.masteryHealthSegment} style={{ width: pct(masterySummary.developingCount), background: '#3b82f6' }} />
                  <div className={styles.masteryHealthSegment} style={{ width: pct(masterySummary.reviewDueCount), background: '#f59e0b' }} />
                  <div className={styles.masteryHealthSegment} style={{ width: pct(masterySummary.needsSupportCount), background: '#ef4444' }} />
                </>
              );
            })()}
          </div>
          <div className={styles.masteryHealthLabel}>
            <span>{masterySummary.masteredCount} of {masterySummary.totalSkills} skills mastered</span>
            <span>{Math.round((masterySummary.masteredCount / Math.max(masterySummary.totalSkills, 1)) * 100)}% mastery</span>
          </div>
        </section>
      )}

      {/* Interactive Review Session (Client Component) */}
      <ReviewClient
        initialReviewDue={masterySummary.reviewDueCount}
        initialWeakest={masterySummary.weakestSkills}
        initialStrongest={masterySummary.strongestSkills}
      />
    </>
  );
}
