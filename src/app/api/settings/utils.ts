// src/app/settings/utils.ts
import { db } from '@/lib/db';
import { settings } from '@/lib/schema';

export async function getDeepvueCredentials() {
  const result = await db.select().from(settings).limit(1);

  if (!result || result.length === 0) {
    throw new Error('No Deepvue credentials found in settings table.');
  }

  const { client_id, client_secret } = result[0];
  return { client_id, client_secret };
}
