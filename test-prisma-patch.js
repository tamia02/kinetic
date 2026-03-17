const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_VRrc7yp8LDol@ep-mute-king-ad4zgiml-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&uselibpqcompat=true&channel_binding=require"
    }
  }
});

async function test() {
  try {
    console.log('Testing Prisma client with patched schema...');
    
    // We try to query voices with the 'provider' field in select.
    // This matches the failing TRPC call.
    const voices = await prisma.voice.findMany({
      take: 1,
      select: {
        id: true,
        name: true,
        provider: true
      }
    });

    console.log('Success! Voices fetched with provider field:', voices);
  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.message.includes('Unknown field')) {
      console.error('The field is still unknown to the client.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

test();
