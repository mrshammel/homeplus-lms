import styles from './onboarding-review.module.css';
import teacherStyles from '../teacher.module.css';
import { getTeacherId } from '@/lib/teacher-auth';
import { getOnboardingReviews, type OnboardingStudentRow } from '@/lib/teacher-data';
import MarkReviewedButton from './MarkReviewedButton';

// ── Helper: parse the flat note text into labelled sections ─────────────────
// The onboarding API writes the note with headings like "=== ABOUT ME ===" etc.
function parseNoteSection(content: string, heading: string): string | null {
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`===\\s*${escapedHeading}\\s*===\\s*([\\s\\S]*?)(?===|$)`, 'i');
  const match = content.match(regex);
  return match ? match[1].trim() : null;
}

// ── Status badge styles ──────────────────────────────────────────────────────
function statusMeta(status: string, reviewed: boolean) {
  if (status === 'COMPLETED' && !reviewed)
    return { label: 'Needs Review', bg: '#fef3c7', color: '#b45309', icon: '📋' };
  if (status === 'COMPLETED' && reviewed)
    return { label: 'Reviewed', bg: '#d1fae5', color: '#047857', icon: '✅' };
  if (status === 'IN_PROGRESS')
    return { label: 'In Progress', bg: '#dbeafe', color: '#1d4ed8', icon: '⏳' };
  return { label: 'Not Started', bg: '#f1f5f9', color: '#64748b', icon: '•' };
}

export default async function OnboardingReviewPage() {
  const teacherId = await getTeacherId();
  const rows = await getOnboardingReviews(teacherId);

  const completed  = rows.filter(r => r.onboardingStatus === 'COMPLETED').length;
  const pending    = rows.filter(r => r.onboardingStatus === 'COMPLETED' && !r.noteReviewed).length;
  const inProgress = rows.filter(r => r.onboardingStatus === 'IN_PROGRESS').length;
  const notStarted = rows.filter(r => r.onboardingStatus === 'NOT_STARTED').length;

  return (
    <>
      {/* ── Summary Metric Cards ── */}
      <div className={teacherStyles.metricsGrid}>
        <MetricCard icon="📋" label="Needs Review" value={pending} bg="#fef3c7" />
        <MetricCard icon="✅" label="Reviewed"     value={completed - pending} bg="#d1fae5" />
        <MetricCard icon="⏳" label="In Progress"  value={inProgress} bg="#dbeafe" />
        <MetricCard icon="•"  label="Not Started"  value={notStarted} bg="#f1f5f9" />
        <MetricCard icon="👥" label="Total Students" value={rows.length} bg="#ede9fe" />
      </div>

      {/* ── Explanation banner ── */}
      <div className={styles.infoBanner}>
        <span className={styles.infoBannerIcon}>ℹ️</span>
        <div>
          <strong>About Onboarding Baselines</strong>
          <p>
            Each student completes a 4-part onboarding when they first sign in (About Me, Math Check, ELA Baseline, Reading Check).
            Their responses are collected here for your review. Mark each student as reviewed once you have read their baseline data.
            Writing samples in ELA are human-reviewed — no AI grading is applied.
          </p>
        </div>
      </div>

      {/* ── Student List ── */}
      {rows.length === 0 ? (
        <div className={teacherStyles.dashCard}>
          <div className={teacherStyles.emptyState}>
            <div className={teacherStyles.emptyIcon}>👦👧</div>
            <div className={teacherStyles.emptyTitle}>No students assigned yet</div>
            <div className={teacherStyles.emptyDesc}>
              Students will appear here once they are assigned to you and begin onboarding.
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.studentGrid}>
          {rows.map(row => {
            const sm = statusMeta(row.onboardingStatus, row.noteReviewed);
            const displayName = row.preferredName
              ? `${row.preferredName} (${row.studentName})`
              : row.studentName;

            // Parse note sections
            const aboutSection    = row.noteContent ? parseNoteSection(row.noteContent, 'ABOUT ME') : null;
            const mathSection     = row.noteContent ? parseNoteSection(row.noteContent, 'MATH CHECK') : null;
            const elaSection      = row.noteContent ? parseNoteSection(row.noteContent, 'ELA BASELINE') : null;
            const readingSection  = row.noteContent ? parseNoteSection(row.noteContent, 'READING CHECK') : null;

            return (
              <div
                key={row.studentId}
                className={`${styles.studentCard} ${row.onboardingStatus === 'COMPLETED' && !row.noteReviewed ? styles.studentCardPending : ''}`}
              >
                {/* Card Header */}
                <div className={styles.cardHeader}>
                  <div className={styles.cardAvatar}>
                    {row.studentName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className={styles.cardHeaderInfo}>
                    <div className={styles.cardName}>{displayName}</div>
                    <div className={styles.cardMeta}>
                      {row.gradeLevel ? `Grade ${row.gradeLevel}` : 'Student'}
                      {row.completedAt && (
                        <> · Submitted {new Date(row.completedAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}</>
                      )}
                    </div>
                  </div>
                  <div className={styles.cardHeaderRight}>
                    <span
                      className={styles.statusBadge}
                      style={{ background: sm.bg, color: sm.color }}
                    >
                      {sm.icon} {sm.label}
                    </span>
                    {row.noteId && !row.noteReviewed && (
                      <MarkReviewedButton noteId={row.noteId} initialReviewed={row.noteReviewed} />
                    )}
                    {row.noteId && row.noteReviewed && (
                      <MarkReviewedButton noteId={row.noteId} initialReviewed={true} />
                    )}
                  </div>
                </div>

                {/* Baseline Content — only when completed */}
                {row.onboardingStatus === 'COMPLETED' && row.noteContent && (
                  <div className={styles.sections}>

                    {/* About Me */}
                    {aboutSection && (
                      <div className={styles.section}>
                        <div className={styles.sectionLabel}>😊 About Me</div>
                        <pre className={styles.sectionText}>{aboutSection}</pre>
                      </div>
                    )}

                    {/* Math */}
                    {mathSection && (
                      <div className={styles.section}>
                        <div className={styles.sectionLabel}>🔢 Math Diagnostic (Gr 5–6)</div>
                        <pre className={styles.sectionText}>{mathSection}</pre>
                      </div>
                    )}

                    {/* ELA */}
                    {elaSection && (
                      <div className={styles.section}>
                        <div className={styles.sectionLabel}>✏️ ELA Baseline</div>
                        <pre className={styles.sectionText}>{elaSection}</pre>
                      </div>
                    )}

                    {/* Reading */}
                    {readingSection && (
                      <div className={styles.section}>
                        <div className={styles.sectionLabel}>📖 Reading Check</div>
                        <pre className={styles.sectionText}>{readingSection}</pre>
                      </div>
                    )}

                    {/* Raw fallback if section parsing finds nothing */}
                    {!aboutSection && !mathSection && !elaSection && !readingSection && (
                      <div className={styles.section}>
                        <div className={styles.sectionLabel}>📝 Baseline Note</div>
                        <pre className={styles.sectionText}>{row.noteContent}</pre>
                      </div>
                    )}
                  </div>
                )}

                {/* In-progress nudge */}
                {row.onboardingStatus === 'IN_PROGRESS' && (
                  <div className={styles.inProgressNote}>
                    ⏳ Student has started onboarding but hasn&apos;t finished all sections yet.
                  </div>
                )}

                {/* Not started nudge */}
                {row.onboardingStatus === 'NOT_STARTED' && (
                  <div className={styles.notStartedNote}>
                    Student has not yet started onboarding. They will be prompted when they next sign in.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function MetricCard({ icon, label, value, bg }: { icon: string; label: string; value: number; bg: string }) {
  return (
    <div className={teacherStyles.metricCard}>
      <div className={teacherStyles.metricIcon} style={{ background: bg }}>{icon}</div>
      <div className={teacherStyles.metricInfo}>
        <div className={teacherStyles.metricLabel}>{label}</div>
        <div className={teacherStyles.metricValue}>{value}</div>
      </div>
    </div>
  );
}
