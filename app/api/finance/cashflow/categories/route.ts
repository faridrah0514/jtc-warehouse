import { openDB } from "@/helper/db";
import { NextResponse } from "next/server";

// Function to generate the next ID for a category
async function generateCategoryId(type: string): Promise<string> {
  const conn = await openDB();
  // Find the latest ID for the specified type
  const [rows]: any[] = await conn.query(
    'SELECT id FROM cash_flow_category WHERE type = ? ORDER BY id DESC LIMIT 1',
    [type]
  );
  conn.end();

  // Generate a new ID based on the latest one found
  let prefix = type === 'incoming' ? 'CFI-' : 'CFO-';
  let newId = `${prefix}001`;

  if (rows.length > 0) {
    const latestId = rows[0].id; // e.g., CFI-001
    const numericPart = parseInt(latestId.split('-')[1], 10); // Extract numeric part
    newId = `${prefix}${String(numericPart + 1).padStart(3, '0')}`; // Increment and pad
  }

  return newId;
}

// Add a new cash flow category
export async function POST(request: Request): Promise<Response> {
  try {
    const conn = await openDB();
    const data = await request.json();

    // Validate the required fields
    if (!data.name || !data.type) {
      return NextResponse.json({ status: 400, error: "Name and Type are required" });
    }

    // Generate the new ID based on type
    const newId = await generateCategoryId(data.type);

    // Insert the new category into the database
    await conn.query(
      'INSERT INTO cash_flow_category (id, name, type, description) VALUES (?, ?, ?, ?)',
      [newId, data.name, data.type, data.description || null]
    );

    conn.end();
    return NextResponse.json({ status: 200, message: "Category added successfully", id: newId });
  } catch (e: any) {
    console.error(e.sqlMessage);
    return NextResponse.json({ status: 500, error: e.sqlMessage });
  }
}

// Fetch all cash flow categories
export async function GET(): Promise<Response> {
  try {
    const conn = await openDB();
    const [categories] = await conn.query('SELECT * FROM cash_flow_category');
    conn.end();

    return NextResponse.json({ status: 200, data: categories });
  } catch (e: any) {
    console.error(e.sqlMessage);
    return NextResponse.json({ status: 500, error: e.sqlMessage });
  }
}
