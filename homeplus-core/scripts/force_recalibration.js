require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const result = await prisma.voiceProfile.updateMany({
    data: { 
      isCalibrated: false,
    },
  });
  console.log(`Reset calibration for ${result.count} students.`);
}

main()
  .catch(e => console.error(e))
  .finally(() => { pool.end(); prisma.$disconnect(); });
