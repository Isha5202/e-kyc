// src/app/api/admin/settings/api-text/route.ts
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { system_settings } from '@/lib/schema';

export async function GET() {
  if (!db) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 500 }
    );
  }

  try {
    const [setting] = await db
      .select()
      .from(system_settings)
      .where(eq(system_settings.setting_key, 'api_integration_text'))
      .limit(1);
    
    return NextResponse.json({ 
      text: setting?.setting_value || 'integrated with deepvue.tech API.' 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch API text' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
    if (!db) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }
  
    try {
      const { text } = await req.json();
      
      if (!text || typeof text !== 'string') {
        return NextResponse.json(
          { error: 'Invalid text provided' },
          { status: 400 }
        );
      }
  
      // Check if setting exists
      const [existingSetting] = await db
        .select()
        .from(system_settings)
        .where(eq(system_settings.setting_key, 'api_integration_text'))
        .limit(1);
  
      if (existingSetting) {
        // Update existing setting
        await db
          .update(system_settings)
          .set({ setting_value: text })
          .where(eq(system_settings.setting_key, 'api_integration_text'));
      } else {
        // Create new setting
        await db.insert(system_settings).values({
          setting_key: 'api_integration_text',
          setting_value: text,
        });
      }
  
      return NextResponse.json({ 
        success: true,
        message: 'Settings saved successfully'
      });
    } catch (error) {
      console.error('Error saving API text:', error);
      return NextResponse.json(
        { error: 'Failed to save API text' },
        { status: 500 }
      );
    }
  }