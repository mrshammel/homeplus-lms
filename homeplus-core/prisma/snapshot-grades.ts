import { getStudentDashboardData } from '../src/lib/student-data';

// Note: This script mocks the Next.js cache and auth context minimally just to call getStudentDashboardData
// However, since getStudentDashboardData relies on getServerSession from NextAuth, running it from CLI might fail.
// A simpler way is to just call calculateGrades for all subjects.

import { prisma } from '../src/lib/db';
import { calculateGrades } from '../src/lib/grades';

async function main() {
  const demoStudent = await prisma.user.findFirst({
    where: { email: 'student@example.com' } // Assuming this is the demo student, or just grab the first student
  });

  if (!demoStudent) {
    console.log("No demo student found.");
    return;
  }

  console.log(`--- GRADE SNAPSHOT FOR ${demoStudent.name} ---`);
  
  // Calculate overall global grade
  const globalReport = await calculateGrades(demoStudent.id);
  console.log(`Overall Average: ${globalReport.overallGrade}%`);

  // Calculate per-subject grades
  const enrollments = await prisma.subjectEnrollment.findMany({
    where: { studentId: demoStudent.id },
    include: { subject: true }
  });

  for (const enr of enrollments) {
    const report = await calculateGrades(demoStudent.id, enr.subjectId);
    console.log(`[${enr.subject.name}] Average: ${report.overallGrade !== null ? report.overallGrade + '%' : 'N/A'}`);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
