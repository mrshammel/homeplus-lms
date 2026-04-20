import { prisma } from './src/lib/db';

async function run() {
  try {
    // 1. Find Ava Chen
    const ava = await prisma.user.findFirst({
      where: {
        role: 'STUDENT',
        name: { contains: 'Ava Chen' }
      }
    });

    if (!ava) {
      console.log('Error: Could not find student Ava Chen');
      return;
    }
    console.log(`Found Ava Chen: ${ava.id}`);

    // 2. Find all active subjects
    const subjects = await prisma.subject.findMany({
      where: { active: true }
    });
    console.log(`Found ${subjects.length} active subjects.`);

    // 3. Find existing enrollments
    const existingEnrollments = await prisma.subjectEnrollment.findMany({
      where: { studentId: ava.id }
    });
    const existingSubjectIds = new Set(existingEnrollments.map((e: any) => e.subjectId));
    console.log(`Ava is currently enrolled in ${existingSubjectIds.size} subjects.`);

    // 4. Enroll in missing subjects
    let addedCount = 0;
    for (const subject of subjects) {
      if (!existingSubjectIds.has(subject.id)) {
        await prisma.subjectEnrollment.create({
          data: {
            studentId: ava.id,
            subjectId: subject.id,
            enrolledBy: 'System'
          }
        });
        console.log(`Enrolled Ava in: Grade ${subject.gradeLevel} ${subject.name}`);
        addedCount++;
      }
    }

    console.log(`✅ Success! Added ${addedCount} new enrollments for Ava.`);
  } catch (err) {
    console.error('Error during execution:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
