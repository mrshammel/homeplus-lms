import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { calculateGrades } from '@/lib/grades';
import Link from 'next/link';
import { ChevronLeft, GraduationCap, LayoutGrid } from 'lucide-react';
import AssessmentRowClient from './AssessmentRowClient';

export default async function SubjectGradePage({ params }: { params: Promise<{ subjectId: string }> }) {
  const resolvedParams = await params;
  const subjectId = resolvedParams.subjectId;

  // 1. Authenticate
  const session = await getServerSession(authOptions);
  let userId = (session?.user as any)?.id as string | undefined;

  if (!userId) {
    // For demo purposes if not logged in
    const demoUser = await prisma.user.findFirst({ where: { role: 'STUDENT' } });
    if (!demoUser) redirect('/student/grades');
    userId = demoUser.id;
  }

  // 2. Access Control: Verify enrollment
  const enrollment = await prisma.subjectEnrollment.findUnique({
    where: { studentId_subjectId: { studentId: userId, subjectId } },
    include: { subject: true }
  });

  if (!enrollment) {
    // Also check if it's the demo-mode fallback where we don't have explicit SubjectEnrollments
    // Many demo setups just give the student access to all active subjects for their grade.
    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) redirect('/student/grades');
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.gradeLevel !== subject.gradeLevel) {
       redirect('/student/grades');
    }
  }

  const subject = enrollment ? enrollment.subject : await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject) redirect('/student/grades');

  // 3. Fetch Grades and Category Weightings
  const gradeReport = await calculateGrades(userId, subjectId);
  const categories = gradeReport.categories;

  // 4. Fetch Submissions
  const submissions = await prisma.submission.findMany({
    where: {
      studentId: userId,
      activity: {
        lesson: {
          unit: {
            subjectId
          }
        }
      }
    },
    include: {
      activity: {
        select: {
          id: true,
          title: true,
          type: true,
          points: true
        }
      }
    },
    orderBy: { submittedAt: 'desc' }
  });

  // Calculate some stats
  const gradedSubmissions = submissions.filter(s => s.score != null);
  const totalSubmissions = submissions.length;

  return (
    <div style={{ padding: '32px 36px 48px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'var(--font-family)' }}>
      
      {/* SECTION 1: Page Header */}
      <Link href="/student/grades" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#5c6478', textDecoration: 'none', marginBottom: '24px', fontWeight: 600 }}>
        <ChevronLeft size={16} /> Back to Grades
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', background: 'var(--card-bg)', padding: '24px 32px', borderRadius: '16px', border: '1px solid var(--card-border)', boxShadow: 'var(--card-shadow)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--subject-bg, #f0f9ff)', fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {subject.icon || '📚'}
          </div>
          <div>
            <h1 style={{ margin: '0 0 4px', fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              {subject.name}
            </h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Detailed Grade Breakdown</p>
          </div>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
            Current Grade
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: gradeReport.overallGrade != null && gradeReport.overallGrade >= 75 ? '#059669' : gradeReport.overallGrade != null ? '#d97706' : '#64748b', lineHeight: 1 }}>
            {gradeReport.overallGrade != null ? `${gradeReport.overallGrade}%` : 'N/A'}
          </div>
        </div>
      </div>

      {/* SECTION 2 & 3: Category Weighting Key & Metric Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginBottom: '32px' }}>
        
        {/* Weighting Key */}
        <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LayoutGrid size={20} color="var(--accent-blue)" /> Category Weights
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {categories.sort((a, b) => b.weight - a.weight).map((cat, i) => {
              const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];
              const color = colors[i % colors.length];
              return (
                <div key={cat.type}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {cat.label}
                      {cat.description && <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)', marginTop: '2px' }}>{cat.description}</span>}
                    </span>
                    <span style={{ color: 'var(--text-primary)' }}>{Math.round(cat.weight * 100)}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#e8ecf1', borderRadius: '4px', overflow: 'hidden', marginTop: '6px' }}>
                    <div style={{ width: `${Math.round(cat.weight * 100)}%`, height: '100%', background: color, borderRadius: '4px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Metric Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {categories.map((cat) => (
            <div key={cat.type} style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '16px', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                {cat.label} Average
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: cat.average != null && cat.average >= 75 ? '#059669' : cat.average != null ? '#d97706' : '#1a2137', lineHeight: 1 }}>
                  {cat.average != null ? `${cat.average}%` : '-'}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {cat.count} items
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* SECTION 4: Assessment Breakdown List */}
      <div>
        <h3 style={{ margin: '0 0 20px', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GraduationCap size={22} color="var(--accent-blue)" /> Assessment History
        </h3>

        {submissions.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', background: 'var(--card-bg)', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500 }}>No assessments completed yet.</p>
          </div>
        ) : (
          <div>
            {submissions.map((sub) => {
              // Find the category config for this submission's type
              const category = categories.find(c => c.type === sub.activity.type);
              const categoryName = category?.label || sub.activity.type.toString();
              return (
                <AssessmentRowClient key={sub.id} submission={sub} categoryName={categoryName} />
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
