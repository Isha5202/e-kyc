// src/app/api/test-db/route.ts
import { NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET() {
  try {
    const usersResult = await db.query('SELECT id, email, role FROM users')
    const settingsResult = await db.query('SELECT client_id, client_secret FROM settings')

    return NextResponse.json({
      users: usersResult.rows,
      settings: settingsResult.rows,
    })
  } catch (error) {
    console.error('Database query error:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
