const fs = require('fs');

function repairFooter(filePath, footer) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find the last reliable marker before the corruption
  const marker = 'config.parameterizationSchema = {';
  const altMarker = 'config.parameterizationSchema = JSON.parse(';
  
  let startIdx = content.indexOf(marker);
  if (startIdx === -1) {
    startIdx = content.indexOf(altMarker);
  }
  
  if (startIdx !== -1) {
    // Find the end of this object/assignment
    // For simplicity, let's find the closing brace if marker, or closing paren if altMarker
    const char = (content.substring(startIdx, startIdx+40).includes('JSON.parse')) ? ')' : '}';
    const endIdx = content.indexOf(char, startIdx);
    
    if (endIdx !== -1) {
      console.log(`Truncating and repairing footer for ${filePath}`);
      const repaired = content.substring(0, endIdx + 1) + '\n\n' + footer;
      fs.writeFileSync(filePath, repaired, 'utf8');
    } else {
      console.log(`Could not find end of assignment in ${filePath}`);
    }
  } else {
    console.log(`Could not find marker in ${filePath}`);
  }
}

const jsFooter = `
const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)
`;

const tsFooter = `
export function getPrismaClientClass(): PrismaClientConstructor {
  return runtime.getPrismaClient(config) as unknown as PrismaClientConstructor
}
`;

repairFooter('src/generated/prisma/index.js', jsFooter);
repairFooter('src/generated/prisma/internal/class.ts', tsFooter);
