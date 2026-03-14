import { prisma } from "./src/lib/db";

async function main() {
  const voices = await prisma.voice.findMany({
    take: 5
  });
  console.log(JSON.stringify(voices, null, 2));
}

main().catch(e => console.error(e));
