const fs = require('fs');
const content = `datasource db {
  provider = "postgresql"
  url      = "postgresql://neondb_owner:npg_VRrc7yp8LDol@ep-mute-king-ad4zgiml-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&uselibpqcompat=true&channel_binding=require"
}

generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}

model Voice {
  id          String        @id @default(cuid())
  orgId       String?
  name        String
  description String?
  category    VoiceCategory @default(GENERAL)
  language    String        @default("en-US")
  variant     VoiceVariant
  r2ObjectKey String?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  generations Generation[]
  assistants  Assistant[]
  provider    Provider      @default(MODAL)

  @@index([variant])
  @@index([orgId])
  @@index([provider])
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
  model             String?
  pace              Float?
  language          String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  voice             Voice?   @relation(fields: [voiceId], references: [id])
}

model Assistant {
  id              String   @id @default(cuid())
  orgId           String
  name            String
  prompt          String   @db.Text
  voiceId         String
  voice           Voice    @relation(fields: [voiceId], references: [id])
  firstMessage    String?
  transcriberId   String?  
  modelId         String?  
  tools           Tool[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  calls           Call[]

  @@index([orgId])
}

model Tool {
  id          String      @id @default(cuid())
  orgId       String
  name        String
  description String?
  type        ToolType
  config      Json        // URL, Method, headers, etc.
  assistants  Assistant[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([orgId])
}

enum ToolType {
  WEBHOOK
  GO_HIGH_LEVEL
  MAKE_COM
}

model Integration {
  id          String           @id @default(cuid())
  orgId       String
  name        String
  type        IntegrationType
  config      Json             // Stores Twilio SID/Token, n8n URL, etc.
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  @@index([orgId])
}

enum IntegrationType {
  TWILIO
  N8N
  GENERIC_WEBHOOK
}

model Call {
  id           String     @id @default(cuid())
  sid          String     @unique // Twilio Call SID
  orgId        String
  assistantId  String
  assistant    Assistant  @relation(fields: [assistantId], references: [id])
  from         String
  to           String
  status       String
  duration     Int?
  transcript   String?    @db.Text
  recordingUrl String?
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  @@index([orgId])
  @@index([assistantId])
}
`;

const header = '// header\n'.repeat(100);
const paddedContent = header + content;
fs.writeFileSync('prisma/schema.prisma', paddedContent, 'utf8');
console.log('Schema written with 100-line header padding');
