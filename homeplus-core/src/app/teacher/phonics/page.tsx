import React from 'react';
import { prisma } from '@/lib/db';
import styles from '../teacher.module.css';

export default async function PhonicsDashboardPage() {
  const allMastery = await prisma.studentMastery.findMany({
    include: {
      student: true,
      lesson: true
    },
    orderBy: { updatedAt: 'desc' }
  });

  const profilesWithAlerts = await prisma.phonicsProfile.findMany({
    where: {
      OR: [
        { placementMismatchSuspected: true },
        { placementUnderMatchSuspected: true },
        { comprehensionGapSuspected: true }
      ]
    },
    include: { student: true }
  });

  const studentsOnPlaceholders = await prisma.phonicsProfile.findMany({
    where: {
      currentLesson: {
        contentStatus: 'placeholder_seed'
      }
    },
    include: { student: true, currentLesson: true }
  });

  const alerts = allMastery.filter(m => m.status === 'struggling');
  const inProgress = allMastery.filter(m => m.status === 'in_progress');
  const mastered = allMastery.filter(m => m.status === 'mastered');

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Phonics Tutor Dashboard</h1>
          <p className={styles.subtitle}>At-a-Glance View</p>
        </div>
      </header>

      <main className={styles.main}>
        {/* Alerts Section */}
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#b91c1c' }}>
            🚨 Action Required: Mastery Stalls
          </h2>
          {alerts.length === 0 && profilesWithAlerts.length === 0 && studentsOnPlaceholders.length === 0 ? (
            <p style={{ color: '#64748b' }}>No students are currently flagged for mastery stalls or edge cases.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Placeholder Alerts */}
              {studentsOnPlaceholders.map(p => (
                <div key={p.id} style={{ background: '#fefce8', border: '1px solid #fde047', padding: 16, borderRadius: 8 }}>
                  <h3 style={{ margin: '0 0 8px', color: '#854d0e' }}>{p.student.name} - Waiting for Content</h3>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>
                    <strong>Stuck on Placeholder:</strong> {p.currentLesson?.title || 'Unknown Lesson'}
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#a16207' }}>
                    This student has reached a lesson that has not been fully authored yet.
                  </p>
                </div>
              ))}

              {/* Mastery Stalls */}
              {alerts.map(a => (
                <div key={a.id} style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: 16, borderRadius: 8 }}>
                  <h3 style={{ margin: '0 0 8px', color: '#7f1d1d' }}>{a.student.name}</h3>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>
                    <strong>Stalled on:</strong> {a.lesson.title} ({a.attempts} attempts)
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: '0.9rem' }}>
                    <strong>Last Decoding:</strong> {a.lastDecodingAccuracy ? `${(a.lastDecodingAccuracy * 100).toFixed(0)}%` : 'N/A'} | 
                    <strong> Last Encoding:</strong> {a.lastEncodingAccuracy ? `${(a.lastEncodingAccuracy * 100).toFixed(0)}%` : 'N/A'}
                  </p>
                  
                  {/* Teacher Override Form */}
                  <form action={`/api/teacher/phonics/override`} method="POST" style={{ marginTop: 12 }}>
                    <input type="hidden" name="masteryId" value={a.id} />
                    <button type="submit" style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>
                      Override & Clear Flag
                    </button>
                  </form>
                </div>
              ))}

              {/* Edge Case Alerts */}
              {profilesWithAlerts.map(p => (
                <div key={p.id} style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: 16, borderRadius: 8 }}>
                  <h3 style={{ margin: '0 0 8px', color: '#92400e' }}>{p.student.name} - Edge Case Suspected</h3>
                  <ul style={{ margin: 0, paddingLeft: 20, fontSize: '0.9rem', color: '#78350f' }}>
                    {p.placementMismatchSuspected && <li><strong>Over-placement:</strong> Failed first attempt of current placement.</li>}
                    {p.placementUnderMatchSuspected && <li><strong>Under-placement:</strong> Perfect score on first attempt for 3 consecutive lessons.</li>}
                    {p.comprehensionGapSuspected && <li><strong>Comprehension Lag:</strong> Strong phonics decoding but struggling on reading comprehension.</li>}
                  </ul>
                  
                  {/* Clear Flags Form */}
                  <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                    {p.placementMismatchSuspected && (
                      <form action={`/api/teacher/phonics/override`} method="POST">
                        <input type="hidden" name="profileId" value={p.id} />
                        <input type="hidden" name="flag" value="placementMismatchSuspected" />
                        <button type="submit" style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>
                          Clear Over-placement
                        </button>
                      </form>
                    )}
                    {p.placementUnderMatchSuspected && (
                      <form action={`/api/teacher/phonics/override`} method="POST">
                        <input type="hidden" name="profileId" value={p.id} />
                        <input type="hidden" name="flag" value="placementUnderMatchSuspected" />
                        <button type="submit" style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>
                          Clear Under-placement
                        </button>
                      </form>
                    )}
                    {p.comprehensionGapSuspected && (
                      <form action={`/api/teacher/phonics/override`} method="POST">
                        <input type="hidden" name="profileId" value={p.id} />
                        <input type="hidden" name="flag" value="comprehensionGapSuspected" />
                        <button type="submit" style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>
                          Clear Comprehension Lag
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Progress Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <section>
            <h3 style={{ color: '#0f172a' }}>In Progress ({inProgress.length})</h3>
            <ul style={{ padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {inProgress.slice(0, 5).map(m => (
                <li key={m.id} style={{ padding: 12, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6 }}>
                  <strong>{m.student.name}</strong> - {m.lesson.title} (Attempts: {m.attempts})
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 style={{ color: '#0f172a' }}>Recently Mastered ({mastered.length})</h3>
            <ul style={{ padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {mastered.slice(0, 5).map(m => (
                <li key={m.id} style={{ padding: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6 }}>
                  <strong>{m.student.name}</strong> - {m.lesson.title}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
