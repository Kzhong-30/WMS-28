import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  dbReady: Promise<boolean> | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

async function checkAndPush(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1 FROM "User" LIMIT 1`
    return true
  } catch (e: any) {
    if (e?.code === 'P2021' || String(e?.message).includes('no such table')) {
      try {
        const { execSync } = require('child_process')
        console.log('[prisma] auto push...')
        execSync('npx prisma db push', { cwd: process.cwd(), stdio: 'ignore', timeout: 60000 })
        return true
      } catch {
        return false
      }
    }
    return false
  }
}

export async function ensureDbReady(): Promise<boolean> {
  if (globalForPrisma.dbReady) return globalForPrisma.dbReady
  const p = checkAndPush()
  globalForPrisma.dbReady = p
  return p
}

if (process.env.NODE_ENV !== 'production') {
  void ensureDbReady()
}
