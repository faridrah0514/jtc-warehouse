import { openDB } from "@/helper/db";
import { NextResponse } from "next/server";

// Retrieve all configurations or add a new one
export async function GET(request: Request): Promise<Response> {
    try {
      const conn = await openDB();
      // Perform a join to retrieve the `nama_perusahaan` from `cabang`
      const [filters] = await conn.query(`
        SELECT 
          rf.id, 
          rf.cabang_id, 
          c.nama_perusahaan, 
          rf.cash_flow_type, 
          rf.categories, 
          rf.period_type, 
          rf.period_date, 
          rf.created_at, 
          rf.updated_at
        FROM report_filters rf
        JOIN cabang c ON rf.cabang_id = c.id
      `);
      conn.end();
  
      return NextResponse.json({ status: 200, data: filters });
    } catch (e: any) {
      console.error(e.sqlMessage);
      return NextResponse.json({ status: 500, error: e.sqlMessage });
    }
  }

export async function POST(request: Request): Promise<Response> {
  try {
    const conn = await openDB();
    const data = await request.json();

    // Validate required fields
    if (!data.cabang_id || !data.cash_flow_type || !data.categories || !data.period_type || !data.period_date) {
      return NextResponse.json({ status: 400, error: "All fields are required" });
    }

    // Insert the new filter configuration
    await conn.query(
      "INSERT INTO report_filters (cabang_id, cash_flow_type, categories, period_type, period_date) VALUES (?, ?, ?, ?, ?)",
      [data.cabang_id, data.cash_flow_type, JSON.stringify(data.categories), data.period_type, data.period_date]
    );

    conn.end();
    return NextResponse.json({ status: 200, message: "Configuration saved successfully" });
  } catch (e: any) {
    console.error(e.sqlMessage);
    return NextResponse.json({ status: 500, error: e.sqlMessage });
  }
}
