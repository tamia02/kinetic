const fs = require('fs');

function checkFile(path) {
  const buf = fs.readFileSync(path);
  console.log(`${path}:`);
  console.log(`  Size: ${buf.length}`);
  console.log(`  Hex (start): ${buf.toString('hex').substring(0, 20)}`);
  
  if (buf[0] === 0xff && buf[1] === 0xfe) {
    console.log(`  Encoding: UTF-16LE (BOM detected)`);
  } else if (buf[0] === 0xfe && buf[1] === 0xff) {
    console.log(`  Encoding: UTF-16BE (BOM detected)`);
  } else if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    console.log(`  Encoding: UTF-8 (BOM detected)`);
  } else {
    console.log(`  Encoding: Likely UTF-8 or ASCII (No BOM)`);
  }
}

checkFile('prisma/schema.prisma');
if (fs.existsSync('prisma_output.txt')) checkFile('prisma_output.txt');
