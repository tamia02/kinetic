require('dotenv').config();
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('./src/generated/prisma');

async function checkVoices() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });
  try {
    const voices = await prisma.voice.findMany();
    console.log(`Found ${voices.length} voices.`);
    if (voices.length > 0) {
      console.log('Voices:', voices.map(v => ({ id: v.id, name: v.name, r2: !!v.r2ObjectKey })));
    }
  } catch (err) {
    console.error('Error checking voices:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkVoices();
