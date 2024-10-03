import { openDB } from "@/helper/db";
import { NextResponse } from "next/server";

// Fetch cash flows based on type (incoming or outgoing)
export async function GET(request: Request, { params }: { params: { type: string } }): Promise<Response> {
  try {
    const conn = await openDB();
    const { type } = params;

    const [cashFlows] = await conn.query(
      'SELECT * FROM cash_flow WHERE category_id IN (SELECT id FROM cash_flow_category WHERE type = ?)',
      [type]
    );

    conn.end();
    return NextResponse.json({ status: 200, data: cashFlows });
  } catch (e: any) {
    console.error(e.sqlMessage);
    return NextResponse.json({ status: 500, error: e.sqlMessage });
  }
}

// Add a new cash flow record
export async function POST(request: Request, { params }: { params: { type: string } }): Promise<Response> {
    try {
      const conn = await openDB();
      const data = await request.json();
      const { type } = params;
  
      // Validate required fields
      if (!data.category_id || !data.description || !data.amount || !data.date) {
        return NextResponse.json({ status: 400, error: "Missing required fields" });
      }
  
      // Format the date to 'YYYY-MM-DD'
      const formattedDate = new Date(data.date).toISOString().split('T')[0];
  
      // Check if the provided category ID matches the type (incoming or outgoing)
      const [category]: any[] = await conn.query(
        'SELECT id FROM cash_flow_category WHERE id = ? AND type = ?',
        [data.category_id, type]
      );
  
      if (category.length === 0) {
        return NextResponse.json({ status: 400, error: "Invalid category ID for the specified type" });
      }
  
      await conn.query(
        'INSERT INTO cash_flow (category_id, description, amount, date) VALUES (?, ?, ?, ?)',
        [data.category_id, data.description, data.amount, formattedDate]
      );
  
      conn.end();
      return NextResponse.json({ status: 200, message: "Cash flow record added successfully" });
    } catch (e: any) {
      console.error(e.sqlMessage);
      return NextResponse.json({ status: 500, error: e.sqlMessage });
    }
  }
  

// Delete a cash flow record
export async function DELETE(request: Request): Promise<Response> {
  try {
    const conn = await openDB();
    const data = await request.json();

    // Validate required field
    if (!data.id) {
      return NextResponse.json({ status: 400, error: "ID is required" });
    }

    await conn.query('DELETE FROM cash_flow WHERE id = ?', [data.id]);
    conn.end();
    return NextResponse.json({ status: 200, message: "Cash flow record deleted successfully" });
  } catch (e: any) {
    console.error(e.sqlMessage);
    return NextResponse.json({ status: 500, error: e.sqlMessage });
  }
}

export async function PUT(request: Request, { params }: { params: { type: string } }): Promise<Response> {
    try {
      const conn = await openDB();
      const data = await request.json();
      const { type } = params;
        console.log("Data ---> ", data)
      // Validate required fields
      if (!data.category_id || !data.description || !data.amount || !data.date || !data.id) {
        return NextResponse.json({ status: 400, error: "Missing required fields" });
      }
  
      await conn.query(
        'UPDATE cash_flow SET category_id = ?, description = ?, amount = ?, date = ? WHERE id = ?',
        [data.category_id, data.description, data.amount, data.date, data.id]
      );
  
      conn.end();
      return NextResponse.json({ status: 200, message: "Cash flow record updated successfully" });
    } catch (e: any) {
      console.error(e.sqlMessage);
      return NextResponse.json({ status: 500, error: e.sqlMessage });
    }
  }
  