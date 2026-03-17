const fs = require('fs');
const path = require('path');

const prismaDir = 'src/generated/prisma';

function reconstructFromEdge(targetRelPath) {
  const edgePath = path.join(prismaDir, 'edge.js');
  const targetPath = path.join(prismaDir, targetRelPath);
  
  let content = fs.readFileSync(edgePath, 'utf8');
  
  // 1. Change runtime
  content = content.replace('./runtime/wasm-compiler-edge.js', './runtime/client.js');

  // 2. Patch the DMMF (escaped quotes in the string literal)
  content = content.replace(/(\\"Voice\\":\{\\"fields\\":\[)/, '$1{\\"name\\":\\"provider\\",\\"kind\\":\\"enum\\",\\"type\\":\\"Provider\\"},');
  content = content.replace(/(\\"Generation\\":\{\\"fields\\":\[)/, '$1{\\"name\\":\\"provider\\",\\"kind\\":\\"enum\\",\\"type\\":\\"Provider\\"},{\\"name\\":\\"model\\",\\"kind\\":\\"scalar\\",\\"type\\":\\"String\\"},{\\"name\\":\\"pace\\",\\"kind\\":\\"scalar\\",\\"type\\":\\"Float\\"},{\\"name\\":\\"language\\",\\"kind\\":\\"scalar\\",\\"type\\":\\"String\\"},');
  content = content.replace(/\\"enums\\":\{\}/, '\\"enums\\":{\\"Provider\\":{\\"values\\":[{\\"name\\":\\"MODAL\\",\\"dbName\\":null},{\\"name\\":\\"SARVAM\\",\\"dbName\\":null}]}}');
  
  // 3. Patch Scalar Enums
  content = content.replace(/r2ObjectKey: 'r2ObjectKey',/g, "r2ObjectKey: 'r2ObjectKey',\n  provider: 'provider',");
  content = content.replace(/repetitionPenalty: 'repetitionPenalty'/g, "repetitionPenalty: 'repetitionPenalty',\n  provider: 'provider',\n  model: 'model',\n  pace: 'pace',\n  language: 'language'");

  // 4. Add Provider enum definition
  const voiceVariantStr = "exports.VoiceVariant = exports.$Enums.VoiceVariant = {";
  const providerEnumStr = "exports.Provider = exports.$Enums.Provider = {\n  MODAL: 'MODAL',\n  SARVAM: 'SARVAM'\n};\n\n";
  if (!content.includes('exports.Provider =')) {
    content = content.replace(voiceVariantStr, providerEnumStr + voiceVariantStr);
  }

  // 5. Fix strings array
  content = content.replace(/\\"divide\\"\s*\]/, '\\"divide\\",\\"provider\\",\\"model\\",\\"pace\\",\\"language\\"]');

  // 6. Fix inlineSchema
  const fixedInlineSchema = `generator client {\n  provider = "prisma-client-js"\n  output   = "../src/generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nenum Provider {\n  MODAL\n  SARVAM\n}\n\nmodel Voice {\n  id String @id @default(cuid())\n  orgId String?\n  name String\n  description String?\n  category VoiceCategory @default(GENERAL)\n  language String @default("en-US")\n  variant VoiceVariant\n  provider Provider @default(MODAL)\n  r2ObjectKey String?\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  generations Generation[]\n  @@index([variant])\n  @@index([orgId])\n}\n\nmodel Generation {\n  id String @id @default(cuid())\n  orgId String\n  voiceId String?\n  voice Voice? @relation(fields: [voiceId], references: [id])\n  text String\n  voiceName String\n  r2ObjectKey String?\n  temperature Float\n  topP Float\n  topK Int\n  repetitionPenalty Float\n  provider Provider @default(MODAL)\n  model String? @default("sarvam-tts-v1")\n  pace Float? @default(1.0)\n  language String? @default("hi-IN-Swar")\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n`;
  const escapedSchema = JSON.stringify(fixedInlineSchema).slice(1, -1);
  content = content.replace(/"inlineSchema":\s*".*?"/, `"inlineSchema": "${escapedSchema}"`);

  fs.writeFileSync(targetPath, content, 'utf8');
  console.log(`Successfully reconstructed ${targetPath} with escaped field injections.`);
}

reconstructFromEdge('index.js');
