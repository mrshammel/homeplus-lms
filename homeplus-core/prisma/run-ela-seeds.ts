import { execSync } from 'child_process';
import path from 'path';

const prismaDir = __dirname;

function run(scriptName: string, label: string): void {
  const scriptPath = path.join(prismaDir, scriptName);
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`▶  ${label}`);
  console.log(`   ${scriptName}`);
  console.log('═'.repeat(60));

  try {
    execSync(`npx tsx "${scriptPath}"`, {
      stdio: 'inherit',
      cwd: path.join(prismaDir, '..'), // homeplus-core root
    });
    console.log(`✅ Done: ${label}`);
  } catch (err) {
    console.error(`\n❌ FAILED: ${label}`);
    console.error(`   Script: ${scriptName}`);
    throw err;
  }
}

async function main() {
  console.log('\n🌱 Grade 6 ELA — Full Seed Orchestrator');
  console.log('='.repeat(60));
  console.log('Seeding full Grade 6 ELA curriculum into database.\n');

  const start = Date.now();

  run('seed-ela-u1-l1-l2.ts', 'Unit 1: L1-L2');
  run('seed-ela-u1-l3-l5.ts', 'Unit 1: L3-L5');
  run('seed-ela-u1-l6-l7.ts', 'Unit 1: L6-L7');
  
  run('seed-ela-u2-l1-l4.ts', 'Unit 2: L1-L4');
  run('seed-ela-u2-l5-l8.ts', 'Unit 2: L5-L8');
  
  run('seed-ela-u3-l1-l4.ts', 'Unit 3: L1-L4');
  run('seed-ela-u3-l5-l8.ts', 'Unit 3: L5-L8');
  
  run('seed-ela-u4-l1-l4.ts', 'Unit 4: L1-L4');
  run('seed-ela-u4-l5-l8.ts', 'Unit 4: L5-L8');
  
  run('seed-ela-u5-l1-l4.ts', 'Unit 5: L1-L4');
  run('seed-ela-u5-l5-l8.ts', 'Unit 5: L5-L8');
  
  run('seed-ela-u6-l1-l4.ts', 'Unit 6: L1-L4');
  run('seed-ela-u6-l5-l6.ts', 'Unit 6: L5-L6');

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`🎉 COMPLETE — Grade 6 ELA fully seeded in ${elapsed}s`);
  console.log('═'.repeat(60));
}

main().catch((err) => {
  console.error('\n❌ Orchestrator failed:', err.message || err);
  process.exit(1);
});
