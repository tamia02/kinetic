const { execSync } = require('child_process');
require('dotenv').config();

const command = process.argv.slice(2).join(' ');
console.log(`Running: ${command}`);

try {
  execSync(command, { stdio: 'inherit', env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL } });
} catch (e) {
  process.exit(1);
}
