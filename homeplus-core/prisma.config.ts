import { readFileSync } from 'fs';
import { defineConfig } from 'prisma/config';

// Manually parse .env.local — avoids dotenv module resolution issues
// when Prisma's config loader runs outside the project's node_modules context
try {
  const raw = readFileSync('.env.local', 'utf-8');
  for (const line of raw.split('\n')) {
    const match = line.match(/^([^#=\s][^=]*)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  }
} catch {
  // .env.local not present — rely on environment variables already set
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env['DATABASE_URL'],
  },
});
