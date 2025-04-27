// src/app/api/branches/route.ts
import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Query the branches table
    const result = await client.query('SELECT * FROM branches WHERE is_active = $1', [true]);

    // Send the response with the fetched data
    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error('Error fetching branches:', error);
    return NextResponse.json(
      { message: 'Failed to fetch branches' },
      { status: 500 }
    );
  }
}
// Handle POST request to add a new branch
export async function POST(request: NextRequest) {
    try {
      // Parse incoming request body
      const { 
        branch_code, 
        branch_name, 
        address_line1, 
        postal_code, 
        contact_number, 
        email, 
        ifsc_code, 
        is_active = true // Default to true if not provided
      } = await request.json();
  
      // Check if required fields are provided
      if (!branch_code || !branch_name || !address_line1) {
        return NextResponse.json(
          { message: 'Missing required fields: branch_code, branch_name, address_line1' },
          { status: 400 }
        );
      }
  
      // Insert new branch into the database
      const result = await client.query(
        `INSERT INTO branches 
          (branch_code, branch_name, address_line1, postal_code, contact_number, email, ifsc_code, is_active) 
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8) 
        RETURNING *`,
        [
          branch_code, 
          branch_name, 
          address_line1, 
          postal_code ?? null, 
          contact_number ?? null, 
          email ?? null, 
          ifsc_code ?? null, 
          is_active
        ]
      );
  
      // Return the newly created branch data
      return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error) {
      console.error('Error adding new branch:', error);
      return NextResponse.json(
        { message: 'Failed to add new branch' },
        { status: 500 }
      );
    }
  }