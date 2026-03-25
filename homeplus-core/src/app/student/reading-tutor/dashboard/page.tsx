'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../reading-tutor.module.css';

// ---------- Types ----------
interface DashboardData {
  totalSessions: number;
  avgAccuracy: number;
  avgWpm: number;
  currentLexile: number;
  streak: number;
  recentWords: { word: string; count: number; status: 'struggle' | 'improving' | 'mastered' }[];
  sessions: {
    id: string;
    date: string;
    passageTitle: string;
    accuracy: number;
    wpm: number;
    comprehension: number;
    lexile: number;
  }[];
  accuracyTrend: number[];
}

export default function ReadingDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch('/api/reading-tutor/dashboard');
        if (res.ok) {
          const d = await res.json();
          setData(d);
        }
      } catch {
        // Defaults
      }
      setLoading(false);
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className={styles.tutorRoot}>
        <div className={styles.card}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📊</div>
            <h3>Loading your dashboard...</h3>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.totalSessions === 0) {
    return (
      <div className={styles.tutorRoot}>
        <div className={styles.card}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📊</div>
            <h3>Your Reading Dashboard</h3>
            <p>
              Complete your first reading session and your progress will show up here!
              Every session helps Mrs. Hammel understand how you&apos;re growing as a reader.
            </p>
            <Link href="/student/reading-tutor/session" className={styles.btnPrimary}>
              ▶ Start Your First Session
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tutorRoot}>
      {/* Header */}
      <div className={styles.heroCard}>
        <div className={styles.heroAvatar}>📊</div>
        <div className={styles.heroContent}>
          <h2>My Reading Dashboard</h2>
          <p>Here&apos;s how you&apos;re doing — every session counts! Remember, mistakes just mean your brain is growing. 🧠</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🔥</div>
          <div className={styles.statValue}>{data.streak}</div>
          <div className={styles.statLabel}>Day Streak</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🎯</div>
          <div className={styles.statValue}>{Math.round(data.avgAccuracy)}%</div>
          <div className={styles.statLabel}>Avg Accuracy</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>⚡</div>
          <div className={styles.statValue}>{Math.round(data.avgWpm)}</div>
          <div className={styles.statLabel}>Avg WPM</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📚</div>
          <div className={styles.statValue}>{data.currentLexile}L</div>
          <div className={styles.statLabel}>Reading Level</div>
        </div>
      </div>

      <div className={styles.dashGrid}>
        {/* Left Column — Progress */}
        <div>
          {/* Accuracy Trend */}
          <div className={styles.card}>
            <h3>📈 My Accuracy Over Time</h3>
            {data.accuracyTrend.length > 1 ? (
              <div style={{ display: 'flex', alignItems: 'end', height: '120px', gap: '4px', padding: '8px 0' }}>
                {data.accuracyTrend.map((val, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: `${val}%`,
                      background: val >= 90 ? '#34d399' : val >= 80 ? '#a78bfa' : '#fbbf24',
                      borderRadius: '4px 4px 0 0',
                      minWidth: '8px',
                      transition: 'height 0.3s',
                    }}
                    title={`${val}%`}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.chartPlaceholder}>
                Keep reading to see your progress chart grow! 📊
              </div>
            )}
          </div>

          {/* Session History */}
          <div className={styles.card}>
            <h3>📅 Session History</h3>
            <div className={styles.sessionList}>
              {data.sessions.map((s) => (
                <div key={s.id} className={styles.sessionItem}>
                  <span className={styles.sessionDate}>{s.date}</span>
                  <span className={styles.sessionTitle}>{s.passageTitle}</span>
                  <div className={styles.sessionScore}>
                    <span className={`${styles.sessionBadge} ${s.accuracy >= 90 ? styles.badgeGreen : styles.badgeYellow}`}>
                      {Math.round(s.accuracy)}%
                    </span>
                    <span className={`${styles.sessionBadge} ${styles.badgePurple}`}>
                      {s.wpm} wpm
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column — Words & Focus */}
        <div>
          {/* Words I'm Working On */}
          <div className={styles.card}>
            <h3>📝 Words I&apos;m Working On</h3>
            {data.recentWords.length > 0 ? (
              <div className={styles.wordList}>
                {data.recentWords.map((w, i) => (
                  <span
                    key={i}
                    className={`${styles.wordTag} ${
                      w.status === 'struggle'
                        ? styles.wordTagStruggle
                        : w.status === 'improving'
                          ? styles.wordTagImproving
                          : styles.wordTagMastered
                    }`}
                  >
                    {w.word}
                    {w.count > 1 && ` (×${w.count})`}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                No tricky words yet — you&apos;re doing great! 🌟
              </p>
            )}
          </div>

          {/* Total Sessions */}
          <div className={styles.card}>
            <h3>🏆 Reading Journey</h3>
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: '#7c5ce0' }}>
                {data.totalSessions}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Total Sessions Completed
              </div>
              <div style={{ marginTop: '12px', fontSize: '0.9rem', color: '#475569' }}>
                {data.totalSessions < 5
                  ? '🌱 Just getting started — keep going!'
                  : data.totalSessions < 15
                    ? '🌿 You\'re building a great habit!'
                    : data.totalSessions < 30
                      ? '🌳 Look at you grow! Mrs. Hammel is proud!'
                      : '🏆 Reading champion! You are amazing!'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action */}
      <div style={{ textAlign: 'center', marginTop: '8px' }}>
        <Link href="/student/reading-tutor/session" className={styles.btnPrimary}>
          ▶ Start Today&apos;s Session
        </Link>
      </div>
    </div>
  );
}
