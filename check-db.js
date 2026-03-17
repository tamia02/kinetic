const { PrismaClient } = require("@prisma/client");

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log("Checking database columns for 'Voice' table...");
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Voice'
    `;
    console.log("Columns in Voice:", columns.map(c => c.column_name).join(", "));
    
    if (columns.find(c => c.column_name === 'provider')) {
      console.log("DATABASE IS READY: 'provider' column exists!");
    } else {
      console.log("DATABASE IS MISSING 'provider' column. Running migration...");
      await prisma.$executeRawUnsafe('ALTER TABLE "Voice" ADD COLUMN IF NOT EXISTS "provider" TEXT DEFAULT \'MODAL\'');
      await prisma.$executeRawUnsafe('ALTER TABLE "Generation" ADD COLUMN IF NOT EXISTS "provider" TEXT DEFAULT \'MODAL\'');
      await prisma.$executeRawUnsafe('ALTER TABLE "Generation" ADD COLUMN IF NOT EXISTS "model" TEXT');
      await prisma.$executeRawUnsafe('ALTER TABLE "Generation" ADD COLUMN IF NOT EXISTS "pace" DOUBLE PRECISION');
      await prisma.$executeRawUnsafe('ALTER TABLE "Generation" ADD COLUMN IF NOT EXISTS "language" TEXT');
      console.log("Database schema updated via executeRaw.");
    }
  } catch (e) {
    console.log("ERROR:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
