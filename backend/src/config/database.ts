import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

declare global {
  var __prisma: PrismaClient | undefined;
}

// Prevent multiple instances of Prisma Client in development
const prisma = globalThis.__prisma || new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

if (process.env['NODE_ENV'] !== 'production') {
  globalThis.__prisma = prisma;
}

// Log database queries in development
if (process.env['NODE_ENV'] === 'development') {
  (prisma as any).$on('query', (e: any) => {
    logger.debug(`Query: ${e.query}`);
    logger.debug(`Params: ${e.params}`);
    logger.debug(`Duration: ${e.duration}ms`);
  });
}

// Log database errors
(prisma as any).$on('error', (e: any) => {
  logger.error('Database error:', e);
});

// Log database info
(prisma as any).$on('info', (e: any) => {
  logger.info('Database info:', e);
});

// Log database warnings
(prisma as any).$on('warn', (e: any) => {
  logger.warn('Database warning:', e);
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export { prisma };
