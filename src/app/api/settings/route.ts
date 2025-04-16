import { db } from '@/lib/db';
import { settings } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { client_id, client_secret } = await req.json();

    if (!client_id || !client_secret) {
      return NextResponse.json({ error: 'Both client_id and client_secret are required' }, { status: 400 });
    }

    // Check if a record already exists
    const existing = await db.select().from(settings).limit(1);

    if (existing.length > 0) {
      // Update existing record
      await db
        .update(settings)
        .set({ client_id, client_secret })
        .where(eq(settings.id, existing[0].id));
    } else {
      // Insert new credentials
      await db.insert(settings).values({ client_id, client_secret });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
export async function GET() {
    try {
      const result = await db.select().from(settings).limit(1);
      if (result.length === 0) {
        return NextResponse.json({ error: 'No credentials found' }, { status: 404 });
      }
  
      const { client_id, client_secret } = result[0];
      return NextResponse.json({ client_id, client_secret });
    } catch (error) {
      console.error('Error fetching credentials:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
  