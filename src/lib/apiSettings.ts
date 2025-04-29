// src/lib/apiSettings.ts
import { db } from './db';
import { eq } from 'drizzle-orm';
import { system_settings } from './schema';

export const fetchApiText = async (): Promise<string> => {
  const [setting] = await db
    .select()
    .from(system_settings)
    .where(eq(system_settings.setting_key, 'api_integration_text'))
    .limit(1);

  return setting?.setting_value || 'integrated with deepvue.tech API.';
};

export const updateApiText = async (text: string): Promise<void> => {
  const existing = await db
    .select()
    .from(system_settings)
    .where(eq(system_settings.setting_key, 'api_integration_text'))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(system_settings)
      .set({ setting_value: text })
      .where(eq(system_settings.setting_key, 'api_integration_text'));
  } else {
    await db.insert(system_settings).values({
      setting_key: 'api_integration_text',
      setting_value: text,
    });
  }
};