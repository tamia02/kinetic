const fs = require('fs');
const path = require('path');

function restoreOriginal(filePath, footer) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find the last reliable start of the export section
  const searchStr = filePath.endsWith('.js') ? 'getPrismaClient(config)' : 'runtime.getPrismaClient(config)';
  const lastGoodIdx = content.indexOf(searchStr);
  
  if (lastGoodIdx !== -1) {
    const endOfLineIdx = content.indexOf('\n', lastGoodIdx);
    const cleanContent = content.substring(0, endOfLineIdx) + '\n' + footer;
    fs.writeFileSync(filePath, cleanContent, 'utf8');
    console.log(`Successfully restored ${filePath}`);
  } else {
    console.log(`Could not find search string in ${filePath}`);
  }
}

const jsFooter = `
exports.getPrismaClientClass = () => {
  return getPrismaClient(config)
}
Object.assign(exports, Prisma)
`;

const tsFooter = `
export function getPrismaClientClass(): PrismaClientConstructor {
  return runtime.getPrismaClient(config) as unknown as PrismaClientConstructor
}
`;

restoreOriginal('src/generated/prisma/index.js', jsFooter);
restoreOriginal('src/generated/prisma/internal/class.ts', tsFooter);
