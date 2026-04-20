'use client';

import { useState, useEffect } from 'react';
import styles from './EnrollmentPanel.module.css';

interface Subject {
  id: string;
  name: string;
  icon: string;
  gradeLevel: number;
}

interface GradeGroup {
  grade: number;
  subjects: Subject[];
}

interface EnrolledCourse {
  subjectId: string;
  name: string;
  icon: string;
  gradeLevel: number;
  enrolledAt: string;
}

interface Props {
  studentId: string;
  studentName: string;
}

export default function EnrollmentPanel({ studentId, studentName }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null); // subjectId being saved
  const [error, setError] = useState<string | null>(null);
  const [enrolled, setEnrolled] = useState<EnrolledCourse[]>([]);
  const [available, setAvailable] = useState<GradeGroup[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  // Load enrollment data
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`/api/teacher/enrollments?studentId=${studentId}`);
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        setEnrolled(data.enrolled);
        setAvailable(data.available);
        setEnrolledIds(new Set(data.enrolledIds));
      } catch {
        setError('Could not load enrollment data.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [studentId]);

  async function toggleEnrollment(subject: Subject, isCurrentlyEnrolled: boolean) {
    if (saving) return;
    setSaving(subject.id);
    setError(null);

    try {
      if (isCurrentlyEnrolled) {
        // Guard: can't remove last
        if (enrolledIds.size <= 1) {
          setError(`${studentName} must be enrolled in at least one course.`);
          setSaving(null);
          return;
        }
        const res = await fetch('/api/teacher/enrollments', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId, subjectId: subject.id }),
        });
        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.error || 'Remove failed');
        }
        setEnrolledIds((prev) => { const next = new Set(prev); next.delete(subject.id); return next; });
        setEnrolled((prev) => prev.filter((e) => e.subjectId !== subject.id));
      } else {
        const res = await fetch('/api/teacher/enrollments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId, subjectId: subject.id }),
        });
        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.error || 'Enroll failed');
        }
        const { enrollment } = await res.json();
        setEnrolledIds((prev) => new Set([...prev, subject.id]));
        setEnrolled((prev) => [
          ...prev,
          {
            subjectId: subject.id,
            name: subject.name,
            icon: subject.icon,
            gradeLevel: subject.gradeLevel,
            enrolledAt: enrollment?.enrolledAt ?? new Date().toISOString(),
          },
        ]);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return <div className={styles.loading}>Loading enrollment data…</div>;
  }

  // Grades with enrolled subjects - for the current-courses summary
  const sortedEnrolled = [...enrolled].sort(
    (a, b) => a.gradeLevel - b.gradeLevel || a.name.localeCompare(b.name)
  );

  // Visible grade groups in the checklist
  const studentGrade = enrolled[0]?.gradeLevel ?? available[0]?.grade ?? 7;
  const visibleGroups = showAll
    ? available
    : available.filter((g) => g.grade === studentGrade || enrolledIds.size > 0
        ? Math.abs(g.grade - studentGrade) <= 1  // ±1 grade by default
        : true);
  const hasHiddenGrades = available.length > visibleGroups.length;

  return (
    <div className={styles.panel}>
      {/* Current enrollments summary */}
      <div className={styles.currentSummary}>
        {sortedEnrolled.length === 0 ? (
          <span className={styles.noEnrollments}>No courses assigned yet - check boxes below to enroll.</span>
        ) : (
          <div className={styles.chips}>
            {sortedEnrolled.map((e) => (
              <span key={e.subjectId} className={styles.chip}>
                {e.icon} Gr {e.gradeLevel} {e.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className={styles.errorBanner}>⚠️ {error}</div>
      )}

      {/* Checklist grouped by grade */}
      <div className={styles.checklist}>
        {visibleGroups.map((group) => (
          <div key={group.grade} className={styles.gradeGroup}>
            <div className={styles.gradeGroupLabel}>Grade {group.grade}</div>
            {group.subjects.map((subject) => {
              const checked = enrolledIds.has(subject.id);
              const isSaving = saving === subject.id;
              const isLast = checked && enrolledIds.size === 1;

              return (
                <label
                  key={subject.id}
                  className={`${styles.subjectRow} ${checked ? styles.subjectChecked : ''} ${isSaving ? styles.subjectSaving : ''}`}
                  title={isLast ? 'Cannot remove - student must have at least one course' : ''}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={isSaving || (isLast && checked)}
                    onChange={() => toggleEnrollment(subject, checked)}
                    className={styles.checkbox}
                  />
                  <span className={styles.subjectIcon}>{subject.icon}</span>
                  <span className={styles.subjectName}>{subject.name}</span>
                  {isSaving && <span className={styles.savingSpinner}>⏳</span>}
                  {checked && !isSaving && <span className={styles.enrolledTick}>✓</span>}
                </label>
              );
            })}
          </div>
        ))}
      </div>

      {/* Show all grades toggle */}
      {hasHiddenGrades && (
        <button
          className={styles.showAllBtn}
          onClick={() => setShowAll((v) => !v)}
        >
          {showAll ? '↑ Show fewer grades' : `↓ Show all ${available.length} grades`}
        </button>
      )}
    </div>
  );
}
