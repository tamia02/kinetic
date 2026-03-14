require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function checkVoices() {
  const prisma = new PrismaClient();
  try {
    const voices = await prisma.voice.findMany();
    console.log(`Found ${voices.length} voices.`);
    if (voices.length > 0) {
      console.log('First 5 voices:', voices.slice(0, 5).map(v => ({ id: v.id, name: v.name, variant: v.variant })));
    }
  } catch (err) {
    console.error('Error checking voices:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkVoices();
