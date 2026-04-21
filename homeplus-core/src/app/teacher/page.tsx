import Link from 'next/link';
import { CheckCircle, AlertTriangle, ArrowUpCircle, AlertCircle, BarChart2, Award, Clock, ClipboardList, Star } from 'lucide-react';
import styles from './teacher.module.css';
import { getStudentsWithPacing, getOverviewMetrics, getUnitProgress, getClassMasteryOverview } from '@/lib/teacher-data';
import { getAcademicPacingStyle, getEngagementStyle, formatDaysSinceActive } from '@/lib/pacing';
import { getTeacherId } from '@/lib/teacher-auth';
import { resolveContext, buildContextQuery } from '@/lib/teacher-context';

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function TeacherOverview({ searchParams }: PageProps) {
  const params = await searchParams;
  const teacherId = await getTeacherId();
  const ctx = await resolveContext(params, teacherId);
  const q = buildContextQuery(ctx);

  const students = await getStudentsWithPacing(teacherId, ctx);
  const metrics = await getOverviewMetrics(students, teacherId, ctx);
  const unitProgress = await getUnitProgress(students, teacherId, ctx);
  const classMastery = await getClassMasteryOverview(students, teacherId, ctx);

  // Needs attention: significantly behind OR stalled
  const needsAttention = students
    .filter((s) => s.pacing.academicStatus === 'SIGNIFICANTLY_BEHIND' || s.pacing.engagementStatus === 'STALLED')
    .slice(0, 5);

  // Celebrate: ahead, on pace with high scores, or complete
  const celebrate = students
    .filter((s) =>
      s.pacing.academicStatus === 'AHEAD' ||
      (s.pacing.academicStatus === 'ON_PACE' && s.avgScore !== null && s.avgScore >= 85) ||
      s.pacing.academicStatus === 'COMPLETE'
    )
    .slice(0, 4);

  return (
    <>
      {/* Summary Metric Cards */}
      <div className={styles.metricsGrid}>
        <MetricCard icon={<CheckCircle size={20} color="#059669" />} label="On Pace" value={metrics.onPace} bg="#d1fae5" />
        <MetricCard icon={<AlertTriangle size={20} color="#d97706" />} label="Behind Pace" value={metrics.behind} bg="#fef3c7" />
        <MetricCard icon={<ArrowUpCircle size={20} color="#2563eb" />} label="Ahead" value={metrics.ahead} bg="#dbeafe" />
        <MetricCard icon={<AlertCircle size={20} color="#dc2626" />} label="Needs Attention" value={metrics.needsAttention} bg="#fee2e2" />
        <MetricCard icon={<BarChart2 size={20} color="#7c3aed" />} label="Avg Progress" value={`${Math.round(metrics.avgProgress)}%`} bg="#ede9fe" />
        <MetricCard icon={<Award size={20} color="#059669" />} label="Avg Mastery" value={`${classMastery.avgMasteryPercent}%`} bg="#d1fae5" />
        <MetricCard icon={<Clock size={20} color="#d97706" />} label="Review Due" value={classMastery.studentsWithReviewDue} bg="#fef3c7" />
        <MetricCard icon={<ClipboardList size={20} color="#ec4899" />} label="Pending Reviews" value={metrics.pendingReviews} bg="#fce7f3" />
      </div>

      {/* Split: Attention + Celebrate/Unit Progress */}
      <div className={styles.splitLayout}>
        {/* Needs Attention */}
        <div className={styles.dashCard}>
          <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><AlertCircle size={20} /> Needs Attention</h3>
          {needsAttention.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}></div>
              <div className={styles.emptyTitle}>All students on track!</div>
              <div className={styles.emptyDesc}>No students need immediate attention today.</div>
            </div>
          ) : (
            needsAttention.map((s) => {
              const aStyle = getAcademicPacingStyle(s.pacing.academicStatus);
              const eStyle = getEngagementStyle(s.pacing.engagementStatus);
              const reasons: string[] = [];
              if (s.pacing.academicStatus === 'SIGNIFICANTLY_BEHIND')
                reasons.push(`${Math.abs(s.pacing.daysBehindOrAhead)} days behind pace`);
              if (s.pacing.engagementStatus === 'STALLED')
                reasons.push(formatDaysSinceActive(s.pacing.daysSinceActive));

              return (
                <Link key={s.id} href={`/teacher/students/${s.id}${q}`} className={styles.attentionItem} style={{ textDecoration: 'none' }}>
                  <div className={styles.attentionAvatar}>
                    {s.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className={styles.attentionInfo}>
                    <div className={styles.attentionName}>{s.name}</div>
                    <div className={styles.attentionReason}>
                      Grade {s.gradeLevel} - {s.currentUnit || '-'} - {reasons.join(' - ')}
                    </div>
                  </div>
                  <div className={styles.badgeStack}>
                    <span className={styles.pacingBadge} style={{ background: aStyle.bg, color: aStyle.color }}>
                      {aStyle.icon} {s.pacing.academicLabel}
                    </span>
                    {s.pacing.engagementStatus === 'STALLED' && (
                      <span className={styles.pacingBadge} style={{ background: eStyle.bg, color: eStyle.color }}>
                        {eStyle.icon} Stalled
                      </span>
                    )}
                  </div>
                </Link>
              );
            })
          )}
        </div>

        <div>
          {/* Students to Celebrate */}
          <div className={styles.dashCard} style={{ marginBottom: 24 }}>
            <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Star size={20} /> Students to Celebrate</h3>
            {celebrate.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}></div>
                <div className={styles.emptyDesc}>Celebrations will appear as students progress.</div>
              </div>
            ) : (
              celebrate.map((s) => {
                let reason = '';
                if (s.pacing.academicStatus === 'COMPLETE') reason = 'Completed all lessons!';
                else if (s.pacing.academicStatus === 'AHEAD') reason = `${s.pacing.daysBehindOrAhead} days ahead of pace`;
                else if (s.avgScore && s.avgScore >= 85) reason = `Strong performance - ${Math.round(s.avgScore)}% avg`;
                return (
                  <Link key={s.id} href={`/teacher/students/${s.id}${q}`} className={styles.celebrateItem} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <span className={styles.celebrateEmoji}>
                      {s.pacing.academicStatus === 'COMPLETE' ? '' : s.pacing.academicStatus === 'AHEAD' ? '' : 'Tip:'}
                    </span>
                    <div className={styles.celebrateInfo}>
                      <div className={styles.celebrateName}>{s.name}</div>
                      <div className={styles.celebrateReason}>{reason}</div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          {/* Unit Progress */}
          <div className={styles.dashCard}>
            <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><BarChart2 size={20} /> {ctx.subjectName} Progress by Unit</h3>
            {unitProgress.map((u) => (
              <div key={u.unitId} className={styles.unitProgressItem}>
                <div className={styles.unitProgressHeader}>
                  <span className={styles.unitProgressTitle}>{u.unitIcon} {u.unitTitle}</span>
                  <span className={styles.unitProgressPct}>{Math.round(u.avgCompletion)}%</span>
                </div>
                <div className={styles.progressBarWrap}>
                  <div
                    className={styles.progressBarFill}
                    style={{
                      width: `${Math.min(100, u.avgCompletion)}%`,
                      background: u.avgCompletion >= 70 ? '#059669' : u.avgCompletion >= 40 ? '#d97706' : '#dc2626',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mastery Alerts */}
      {classMastery.studentsWithSupport > 0 && (
        <div className={styles.dashCard} style={{ marginTop: 24 }}>
          <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Award size={20} /> Mastery Alerts</h3>
          {classMastery.studentSummaries
            .filter((s) => s.needsSupportCount > 0)
            .sort((a, b) => b.needsSupportCount - a.needsSupportCount)
            .map((s) => (
              <Link key={s.studentId} href={`/teacher/students/${s.studentId}${q}`} style={{ textDecoration: 'none' }}>
                <div className={styles.attentionItem}>
                  <div className={styles.attentionAvatar}>
                    {s.studentName.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className={styles.attentionInfo}>
                    <div className={styles.attentionName}>{s.studentName}</div>
                    <div className={styles.attentionReason}>
                      {s.needsSupportCount} skill{s.needsSupportCount !== 1 ? 's' : ''} need support -
                      {s.masteryPercent}% mastery
                    </div>
                  </div>
                  <div className={styles.badgeStack}>
                    <span className={styles.pacingBadge} style={{ background: '#fee2e2', color: '#dc2626' }}>
                       {s.needsSupportCount} Support
                    </span>
                    {s.reviewDueCount > 0 && (
                      <span className={styles.pacingBadge} style={{ background: '#fef3c7', color: '#d97706' }}>
                         {s.reviewDueCount} Review
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
        </div>
      )}
    </>
  );
}

function MetricCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: string | number; bg: string }) {
  return (
    <div className={styles.metricCard}>
      <div className={styles.metricIcon} style={{ background: bg }}>{icon}</div>
      <div className={styles.metricInfo}>
        <div className={styles.metricLabel}>{label}</div>
        <div className={styles.metricValue}>{value}</div>
      </div>
    </div>
  );
}
