import { config } from 'dotenv';
config({ path: '.env.local' });
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  const units = await prisma.unit.findMany({
    where: { subject: { name: { contains: 'Science' } } },
    orderBy: { order: 'asc' },
    select: { id: true, title: true, order: true },
  });
  for (const u of units) {
    console.log(`order=${u.order}  id=${u.id}  title=${u.title}`);
  }
}
main().catch(console.error).finally(() => pool.end());
