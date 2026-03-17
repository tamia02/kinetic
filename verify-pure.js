const path = require('path');
const indexPath = path.resolve('src/fixed-prisma/index.js');
const { PrismaClient } = require(indexPath);

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log("SUCCESS: SHADOW CLIENT LOADED!");
    // @ts-ignore
    const voiceFields = prisma._runtimeDataModel.models.Voice.fields;
    console.log("Voice fields:", voiceFields.map(f => f.name).join(", "));
    
    if (voiceFields.find(f => f.name === 'provider')) {
        console.log("DMMF VALIDATED: provider field exists.");
    }

    console.log("Attempting a real query with provider select...");
    const voices = await prisma.voice.findMany({
      take: 1,
      select: { id: true, name: true, provider: true }
    });
    console.log("QUERY SUCCESS! Provider:", voices[0]?.provider || "None (Existing record)");
  } catch (e) {
    console.log("ERROR:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
