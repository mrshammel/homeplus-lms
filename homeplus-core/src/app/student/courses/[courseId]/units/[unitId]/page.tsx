// ============================================
// Student Unit Detail Page — Home Plus LMS
// ============================================
// Dynamic route: /student/courses/[courseId]/units/[unitId]
// Shows unit overview, learning framing, and all lessons
// with subject-aware gating (locked/available/mastered, etc.)

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getUnitDetail } from '@/lib/unit-detail-data';
import { getLessonStateUI } from '@/lib/lesson-progress';
import { subjectColorVars } from '@/lib/subject-colors';
import styles from '../../../../student.module.css';

interface Props {
  params: Promise<{ courseId: string; unitId: string }>;
}

export default async function UnitDetailPage({ params }: Props) {
  const { courseId, unitId } = await params;
  const unit = await getUnitDetail(courseId, unitId);

  if (!unit) {
    notFound();
  }

  const {
    courseName, courseIcon, gradeLevel, subjectMode,
    unitTitle, unitDescription, unitIcon, unitOrder,
    totalLessons, completedLessons, progressPercent, unitStatus,
    nextLessonId, nextLessonTitle,
    lessons, learningTargets, successCriteria, keyVocabulary,
  } = unit;

  const statusColor = unitStatus === 'completed' ? '#059669' : unitStatus === 'in-progress' ? '#2563eb' : '#94a3b8';
  const statusBg = unitStatus === 'completed' ? '#d1fae5' : unitStatus === 'in-progress' ? '#dbeafe' : '#f3f4f6';
  const statusLabel = unitStatus === 'completed' ? '✅ Complete' : unitStatus === 'in-progress' ? '📝 In Progress' : '⬜ Not Started';

  // Subject unlock rule explanation
  const unlockHint =
    subjectMode === 'SCIENCE' ? 'Science lessons require mastery (80%+) before the next lesson unlocks.'
    : subjectMode === 'MATH' ? 'Math lessons unlock after completing or mastering the previous lesson.'
    : 'Complete each lesson to unlock the next one.';

  return (
    <div style={subjectColorVars(courseName)}>
      {/* ===== A. UNIT HEADER ===== */}
      <section className={styles.welcomeSection} aria-label="Unit header">
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/student/courses" className={styles.breadcrumbLink}>All Courses</Link>
          <span className={styles.breadcrumbSep}>›</span>
          <Link href={`/student/courses/${courseId}`} className={styles.breadcrumbLink}>
            {courseIcon} {courseName}
          </Link>
          <span className={styles.breadcrumbSep}>›</span>
          <span className={styles.breadcrumbCurrent}>{unitIcon} Unit {unitOrder + 1}</span>
        </nav>

        <div className={styles.welcomeRow}>
          <div className={styles.continueIcon} style={{ fontSize: '1.5rem' }}>
            <span>{unitIcon || '📖'}</span>
          </div>
          <div style={{ flex: 1 }}>
            <h2 className={styles.welcomeTitle}>{unitTitle}</h2>
            <p className={styles.welcomeSubtext}>Grade {gradeLevel} · {courseName}</p>
          </div>
          <span className={styles.pacingBadge} style={{ background: statusBg, color: statusColor, alignSelf: 'flex-start' }}>
            {statusLabel}
          </span>
        </div>

        {unitDescription && (
          <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, marginTop: 10 }}>
            {unitDescription}
          </p>
        )}
      </section>

      {/* ===== B. UNIT PROGRESS SUMMARY ===== */}
      <section className={styles.statRow} aria-label="Unit progress summary" style={{ marginBottom: 20 }}>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: 'var(--subject-primary)' }}>{progressPercent}%</div>
          <div className={styles.statLabel}>Progress</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: '#475569' }}>{completedLessons}/{totalLessons}</div>
          <div className={styles.statLabel}>Lessons Done</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: statusColor }}>
            {unitStatus === 'completed' ? '✅' : unitStatus === 'in-progress' ? '📝' : '⬜'}
          </div>
          <div className={styles.statLabel}>
            {unitStatus === 'completed' ? 'Complete!' : unitStatus === 'in-progress' ? 'In Progress' : 'Not Started'}
          </div>
        </div>
      </section>

      {/* ===== C. CONTINUE LEARNING ===== */}
      {nextLessonTitle && nextLessonId && unitStatus !== 'completed' && (
        <section
          className={`${styles.dashCard} ${styles.dashCardFull}`}
          style={{ marginBottom: 20, borderLeft: '5px solid var(--subject-primary)' }}
          aria-label="Continue learning"
        >
          <div className={styles.continueCard}>
            <div className={styles.continueInfo}>
              <div className={styles.continueCourse}>Next Up</div>
              <div className={styles.continueLesson}>{nextLessonTitle}</div>
              <div className={styles.continueProgress}>
                <div className={styles.progressBar} style={{ width: 140, height: 8 }}>
                  <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
                </div>
                <span className={styles.progressPercent}>{completedLessons}/{totalLessons}</span>
              </div>
            </div>
            <Link
              href={`/student/courses/${courseId}/units/${unitId}/lessons/${nextLessonId}`}
              className={styles.continueBtn}
            >
              {completedLessons === 0 ? 'Start Lesson →' : 'Continue →'}
            </Link>
          </div>
        </section>
      )}

      {/* ===== D. LEARNING TARGETS ===== */}
      {learningTargets.length > 0 && (
        <section className={`${styles.dashCard} ${styles.dashCardFull}`} style={{ marginBottom: 20 }} aria-label="Learning targets">
          <h3 className={styles.cardTitle}>🎯 Learning Targets</h3>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 10 }}>
            By the end of this unit, you should be able to say:
          </p>
          <ul className={styles.targetList}>
            {learningTargets.map((t, i) => (
              <li key={i} className={styles.targetItem}>{t}</li>
            ))}
          </ul>
        </section>
      )}

      {/* ===== E. SUCCESS CRITERIA ===== */}
      {successCriteria.length > 0 && (
        <section className={`${styles.dashCard} ${styles.dashCardFull}`} style={{ marginBottom: 20 }} aria-label="Success criteria">
          <h3 className={styles.cardTitle}>✅ Success Criteria</h3>
          <ul className={styles.targetList}>
            {successCriteria.map((s, i) => (
              <li key={i} className={styles.criteriaItem}>{s}</li>
            ))}
          </ul>
        </section>
      )}

      {/* ===== F. KEY VOCABULARY ===== */}
      {keyVocabulary.length > 0 && (
        <section className={`${styles.dashCard} ${styles.dashCardFull}`} style={{ marginBottom: 20 }} aria-label="Key vocabulary">
          <h3 className={styles.cardTitle}>📖 Key Vocabulary</h3>
          <div className={styles.vocabGrid}>
            {keyVocabulary.map((v, i) => (
              <div key={i} className={styles.vocabCard}>
                <div className={styles.vocabTerm}>{v.term}</div>
                <div className={styles.vocabDef}>{v.definition}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== G. LESSONS LIST ===== */}
      <section aria-label="Unit lessons">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <h3 className={styles.sectionHeading} style={{ marginBottom: 0 }}>📚 Lessons</h3>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontStyle: 'italic' }}>{unlockHint}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {lessons.map((lesson, i) => {
            const ui = getLessonStateUI(lesson.displayState);
            const isLocked = lesson.displayState === 'LOCKED';
            const isNext = lesson.isNextLesson;

            const statusClass = lesson.displayState === 'MASTERED' || lesson.displayState === 'COMPLETED'
              ? styles.statusComplete
              : lesson.displayState === 'IN_PROGRESS' || lesson.displayState === 'AVAILABLE' ? styles.statusInProgress
              : lesson.displayState === 'NEEDS_RETEACH' ? styles.statusInProgress
              : styles.statusLocked;

            const CardContent = (
              <div className={`${styles.lessonCard} ${isLocked ? styles.lessonCardLocked : ''}`}>
                {/* Next lesson indicator */}
                {isNext && (
                  <div className={styles.nextBadge}>▶ NEXT</div>
                )}

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  {/* Lesson number badge */}
                  <div
                    style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: isLocked ? '#cbd5e1' : lesson.displayState === 'MASTERED' || lesson.displayState === 'COMPLETED' ? '#059669' : 'var(--subject-primary)',
                      color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
                    }}
                  >
                    {lesson.displayState === 'MASTERED' ? '⭐'
                      : lesson.displayState === 'COMPLETED' ? '✓'
                      : lesson.displayState === 'LOCKED' ? '🔒'
                      : i + 1}
                  </div>

                  {/* Lesson content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                      <h4 style={{
                        fontSize: '0.92rem', fontWeight: 700,
                        color: isLocked ? '#94a3b8' : lesson.displayState === 'MASTERED' || lesson.displayState === 'COMPLETED' ? '#059669' : '#1e293b',
                        margin: 0,
                      }}>
                        {lesson.title}
                      </h4>
                      <span className={`${styles.statusChip} ${statusClass}`}>
                        {ui.badge}
                      </span>
                    </div>

                    {lesson.subtitle && (
                      <p style={{ fontSize: '0.8rem', color: isLocked ? '#cbd5e1' : '#64748b', margin: '3px 0 0', lineHeight: 1.45 }}>
                        {lesson.subtitle}
                      </p>
                    )}

                    {/* Mastery score for completed/mastered lessons */}
                    {lesson.masteryScore != null && (lesson.displayState === 'MASTERED' || lesson.displayState === 'COMPLETED') && (
                      <p style={{
                        fontSize: '0.75rem', color: '#059669', fontWeight: 600, margin: '4px 0 0',
                      }}>
                        ⭐ Score: {Math.round(lesson.masteryScore)}%
                      </p>
                    )}

                    {/* Reteach explanation */}
                    {lesson.displayState === 'NEEDS_RETEACH' && (
                      <p style={{ fontSize: '0.78rem', color: '#d97706', fontWeight: 600, margin: '4px 0 0' }}>
                        ⚠️ Complete the review to continue.
                      </p>
                    )}

                    {/* Activity pills */}
                    {!isLocked && lesson.activities.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                        {lesson.activities.map((act) => {
                          const typeIcon = act.type === 'QUIZ' ? '📝' : act.type === 'ASSIGNMENT' ? '📄' : act.type === 'REFLECTION' ? '🪞' : '🔬';
                          return (
                            <span
                              key={act.id}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                fontSize: '0.72rem', padding: '3px 8px',
                                borderRadius: 6,
                                background: act.submitted ? '#d1fae5' : '#f8fafc',
                                color: act.submitted ? '#059669' : '#64748b',
                                border: `1px solid ${act.submitted ? '#86efac' : '#e2e8f0'}`,
                              }}
                            >
                              {typeIcon} {act.title}
                              {act.submitted && act.score != null && ` · ${act.score}/${act.maxScore}`}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* CTA */}
                    {!isLocked && ui.cta && (
                      <div style={{ marginTop: 10 }}>
                        <span
                          className={styles.lessonCta}
                          style={{
                            color: lesson.displayState === 'MASTERED' || lesson.displayState === 'COMPLETED' ? '#059669' : 'var(--subject-primary)',
                            borderColor: lesson.displayState === 'NEEDS_RETEACH' ? '#fbbf24'
                              : lesson.displayState === 'MASTERED' || lesson.displayState === 'COMPLETED' ? '#86efac'
                              : 'var(--subject-light)',
                          }}
                        >
                          {ui.cta}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );

            if (isLocked) {
              return <div key={lesson.id}>{CardContent}</div>;
            }

            return (
              <Link
                key={lesson.id}
                href={`/student/courses/${courseId}/units/${unitId}/lessons/${lesson.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                {CardContent}
              </Link>
            );
          })}
        </div>
      </section>

      {/* ===== H. UNIT COMPLETE BANNER ===== */}
      {unitStatus === 'completed' && (
        <section
          className={`${styles.dashCard} ${styles.dashCardFull}`}
          style={{ marginTop: 20, background: '#f0fdf4', borderLeft: '5px solid #059669', textAlign: 'center', padding: '24px 20px' }}
          aria-label="Unit complete"
        >
          <div style={{ fontSize: '2.2rem', marginBottom: 8 }}>🎉</div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#059669', margin: '0 0 4px' }}>
            Unit Complete! 🌟
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#475569' }}>
            You&apos;ve finished all lessons in {unitTitle}. Great work!
          </p>
          <Link
            href={`/student/courses/${courseId}`}
            className={styles.continueBtn}
            style={{ display: 'inline-block', marginTop: 12 }}
          >
            ← Back to Course
          </Link>
        </section>
      )}
    </div>
  );
}
