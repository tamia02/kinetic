# Resonance Deployment Guide

This document outlines the steps to deploy Resonance Orchestrator to production.

## Environment Variables

Ensure the following variables are set in your production environment (e.g., Vercel, Railway):

### Application
- `NEXT_PUBLIC_APP_URL`: The public URL of your app (e.g., `https://res.example.com`).
- `DATABASE_URL`: Your production PostgreSQL URL.

### Authentication (Clerk)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

### AI & Media
- `CHATTERBOX_API_URL`: Your Modal TTS endpoint.
- `CHATTERBOX_API_KEY`: Secret key for Modal access.
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`: Cloudflare R2 credentials.

### Phone & Automation
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `VAPI_SECRET`: (Optional) For high-security webhook verification.

## Hosting Steps

1. **GitHub**: Push your code to your private/public repository.
2. **Database**: Provision a PostgreSQL instance (Supabase, Neon, or Railway).
3. **Modal**: Run `modal deploy chatterbox_tts.py` to ensure your TTS engine is live.
4. **Vercel**:
   - Connect your GitHub repo.
   - Run `npx prisma generate` as part of the build command.
   - Set all environment variables.
5. **Twilio**: 
   - Set the Voice Webhook URL to `https://your-app.com/api/webhooks/twilio`.

## CI/CD
A basic GitHub action for Prisma check:

```yaml
name: Prisma Generate
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Prisma Generate
        run: npx prisma generate
```
