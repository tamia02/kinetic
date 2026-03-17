const { prisma } = require("./src/lib/db");

async function main() {
  try {
    console.log("Inspecting Prisma Voice model fields...");
    // @ts-ignore
    const voiceFields = prisma._runtimeDataModel.models.Voice.fields;
    console.log("Voice fields:", voiceFields.map((f) => f.name).join(", "));
    
    console.log("Attempting to fetch voices with 'provider' field...");
    const voices = await prisma.voice.findMany({
      take: 1,
      select: {
        id: true,
        name: true,
        provider: true,
      },
    });
    console.log("Success! Fetched voice with provider:", voices[0]?.provider || "No provider found");
  } catch (error) {
    console.error("Error fetching voices:", error.message);
    if (error.message.includes('Unknown field')) {
       console.log("CRITICAL: FIELD NOT RECOGNIZED BY RUNTIME.");
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
