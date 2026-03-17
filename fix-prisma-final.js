const fs = require('fs');

const inlineSchema = `generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

enum Provider {
  MODAL
  SARVAM
}

enum VoiceVariant {
  SYSTEM
  CUSTOM
}

enum VoiceCategory {
  AUDIOBOOK
  CONVERSATIONAL
  CUSTOMER_SERVICE
  GENERAL
  NARRATIVE
  CHARACTERS
  MEDITATION
  MOTIVATIONAL
  PODCAST
  ADVERTISING
  VOICEOVER
  CORPORATE
}

model Voice {
  id          String        @id @default(cuid())
  orgId       String?
  name        String
  description String?
  category    VoiceCategory @default(GENERAL)
  language    String        @default("en-US")
  variant     VoiceVariant
  provider    Provider      @default(MODAL)
  r2ObjectKey String?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  generations Generation[]

  @@index([variant])
  @@index([orgId])
}

model Generation {
  id                String   @id @default(cuid())
  orgId             String
  voiceId           String?
  text              String
  voiceName         String
  r2ObjectKey       String?
  temperature       Float
  topP              Float
  topK              Int
  repetitionPenalty Float
  provider          Provider @default(MODAL)
  model             String?  @default("sarvam-tts-v1")
  pace              Float?   @default(1.0)
  language          String?  @default("hi-IN-Swar")
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  voice             Voice?   @relation(fields: [voiceId], references: [id])
}
`;

const escapedSchema = JSON.stringify(inlineSchema).slice(1, -1);

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Fix inlineSchema
  const startMarker = '"inlineSchema": "';
  const startIdx = content.indexOf(startMarker);
  if (startIdx !== -1) {
    const endIdx = content.indexOf('",', startIdx + startMarker.length);
    if (endIdx !== -1) {
       content = content.substring(0, startIdx + startMarker.length) + escapedSchema + content.substring(endIdx);
    }
  }

  // 2. Ensure DMMF is correct (basic check)
  if (!content.includes('"name":"provider"')) {
     console.log(`WARNING: DMMF might still lead to issues in ${filePath}. Use patch-prisma.js v15 after this.`);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed inlineSchema in ${filePath}`);
}

fixFile('src/generated/prisma/index.js');
fixFile('src/generated/prisma/internal/class.ts');
