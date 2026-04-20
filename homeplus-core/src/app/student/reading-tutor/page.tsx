'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './reading-tutor.module.css';

// ---------- Types ----------
interface SessionSummary {
  id: string;
  date: string;
  passageTitle: string;
  accuracy: number;
  wpm: number;
  comprehension: number;
}

// ---------- Component ----------
export default function ReadingTutorHome() {
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [stats, setStats] = useState({
    streak: 0,
    avgAccuracy: 0,
    sessionsCount: 0,
    lexileLevel: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/reading-tutor/status');
        if (res.ok) {
          const data = await res.json();
          setIsCalibrated(data.isCalibrated);
          setSessions(data.recentSessions || []);
          setStats(data.stats || stats);
        }
      } catch {
        // Use defaults on error
      }
      setLoading(false);
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className={styles.tutorRoot}>
        <div className={styles.heroCard}>
          <div className={styles.heroAvatar}></div>
          <div className={styles.heroContent}>
            <h2>Loading your Reading Tutor...</h2>
            <p>Getting things ready for you!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tutorRoot}>
      {/* Hero Card */}
      <div className={styles.heroCard}>
        <div className={styles.heroAvatar}></div>
        <div className={styles.heroContent}>
          <h2>Hi there! I&apos;m Mrs. Hammel&apos;s Reading Buddy </h2>
          <p>
            {isCalibrated
              ? "Ready for today's reading session? You got this! "
              : "Before we start reading together, let's help me learn your voice. It only takes a couple of minutes!"}
          </p>
          {isCalibrated ? (
            <Link href="/student/reading-tutor/session" className={styles.heroBtn}>
              ▶ Start Today&apos;s Reading
            </Link>
          ) : (
            <Link href="/student/reading-tutor/calibrate" className={styles.heroBtn}>
               Set Up My Voice
            </Link>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      {stats.sessionsCount > 0 && (
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}></div>
            <div className={styles.statValue}>{stats.streak}</div>
            <div className={styles.statLabel}>Day Streak</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}></div>
            <div className={styles.statValue}>{Math.round(stats.avgAccuracy)}%</div>
            <div className={styles.statLabel}>Avg Accuracy</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>Books:</div>
            <div className={styles.statValue}>{stats.sessionsCount}</div>
            <div className={styles.statLabel}>Sessions</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>Chart:</div>
            <div className={styles.statValue}>{stats.lexileLevel}L</div>
            <div className={styles.statLabel}>Reading Level</div>
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      <div className={styles.card}>
        <h3> Recent Sessions</h3>
        {sessions.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}></div>
            <h3>No sessions yet!</h3>
            <p>
              {isCalibrated
                ? "Start your first reading session and your history will show up here."
                : "Set up your voice profile first, then start your daily reading!"}
            </p>
            {isCalibrated ? (
              <Link href="/student/reading-tutor/session" className={styles.btnPrimary}>
                Start Reading ->
              </Link>
            ) : (
              <Link href="/student/reading-tutor/calibrate" className={styles.btnPrimary}>
                Set Up My Voice ->
              </Link>
            )}
          </div>
        ) : (
          <div className={styles.sessionList}>
            {sessions.map((s) => (
              <div key={s.id} className={styles.sessionItem}>
                <span className={styles.sessionDate}>{s.date}</span>
                <span className={styles.sessionTitle}>{s.passageTitle}</span>
                <div className={styles.sessionScore}>
                  <span className={`${styles.sessionBadge} ${s.accuracy >= 90 ? styles.badgeGreen : styles.badgeYellow}`}>
                    {Math.round(s.accuracy)}% acc
                  </span>
                  <span className={`${styles.sessionBadge} ${styles.badgePurple}`}>
                    {s.wpm} wpm
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {isCalibrated && (
          <>
            <Link href="/student/reading-tutor/dashboard" className={styles.btnSecondary}>
              Chart: My Reading Dashboard
            </Link>
            <Link href="/student/reading-tutor/calibrate" className={styles.btnSecondary}>
               Redo Voice Setup
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
