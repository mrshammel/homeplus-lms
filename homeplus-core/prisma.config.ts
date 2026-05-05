import { readFileSync } from 'fs';
import { join } from 'path';
import { defineConfig } from 'prisma/config';

// Manually parse .env.local — avoids dotenv module resolution issues
// when Prisma's config loader runs outside the project's node_modules context
try {
  const envPath = join(process.cwd(), '.env.local');
  const raw = readFileSync(envPath, 'utf-8');
  for (const line of raw.split(/\r?\n/)) {  // handle both LF and CRLF
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (match) {
      const key = match[1];
      // Strip quotes, then strip literal Vercel CLI escape sequences (\n, \r, \t)
      const val = match[2].trim()
        .replace(/^["']|["']$/g, '')
        .replace(/\\[nrt]/g, '');
      if (!process.env[key]) process.env[key] = val; // env var takes precedence
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
    url: process.env['DIRECT_URL'] || process.env['DATABASE_URL'],
  },
});

