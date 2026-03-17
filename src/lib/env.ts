import { z } from "zod";
import { createEnv } from "@t3-oss/env-nextjs";

export const env = createEnv({
  server: {
    POLAR_ACCESS_TOKEN: z.string().min(1),
    POLAR_SERVER: z.enum(["sandbox", "production"]).default("sandbox"),
    POLAR_PRODUCT_ID: z.string().min(1),
    POLAR_METER_VOICE_CREATION: z.string().min(1),
    POLAR_METER_TTS_GENERATION: z.string().min(1),
    POLAR_METER_TTS_PROPERTY: z.string().min(1),
    DATABASE_URL: z.string().min(1),
    APP_URL: z.string().min(1),
    R2_ACCOUNT_ID: z.string().min(1),
    R2_ACCESS_KEY_ID: z.string().min(1),
    R2_SECRET_ACCESS_KEY: z.string().min(1),
    R2_BUCKET_NAME: z.string().min(1),
    CHATTERBOX_API_URL: z.url(),
    CHATTERBOX_API_KEY: z.string().min(1),
    SARVAM_API_KEY: z.string().optional(),
    VAPI_SECRET: z.string().optional(),
    TWILIO_ACCOUNT_SID: z.string().optional(),
    TWILIO_AUTH_TOKEN: z.string().optional(),
    BYPASS_SUBSCRIPTION_CHECK: z.coerce.boolean().default(false),
    ADMIN_USER_ID: z.string().optional(),
  },
  experimental__runtimeEnv: {},
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
