const fs = require('fs');
const buffer = fs.readFileSync('prisma/schema.prisma');
console.log('Hex:', buffer.toString('hex').substring(0, 100));
console.log('UTF-8:', buffer.toString('utf8').substring(0, 100));
