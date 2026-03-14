import { prisma } from "./src/lib/db";

async function main() {
  const generations = await prisma.generation.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log(JSON.stringify(generations, null, 2));
}

main().catch(e => console.error(e));
