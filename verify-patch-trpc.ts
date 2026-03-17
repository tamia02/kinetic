import { prisma } from "./src/lib/db";

async function main() {
  try {
    console.log("Inspecting Prisma Voice model fields...");
    // @ts-ignore
    const voiceFields = prisma._runtimeDataModel.models.Voice.fields;
    console.log("Voice fields:", voiceFields.map((f: any) => f.name).join(", "));
    
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
  } catch (error: any) {
    console.error("Error fetching voices:", error.message);
    // ...
  } finally {
    await prisma.$disconnect();
  }
}

main();
