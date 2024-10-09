import { openDB } from "@/helper/db";
import { NextResponse } from "next/server";

// Handle updating and deleting configurations
export async function PUT(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const conn = await openDB();
    const data = await request.json();
    const { id } = params;

    // Update the existing filter configuration
    await conn.query(
      "UPDATE report_filters SET cabang_id=?, cash_flow_type=?, categories=?, period_type=?, period_date=? WHERE id=?",
      [data.cabang_id, data.cash_flow_type, JSON.stringify(data.categories), data.period_type, data.period_date, id]
    );

    conn.end();
    return NextResponse.json({ status: 200, message: "Configuration updated successfully" });
  } catch (e: any) {
    console.error(e.sqlMessage);
    return NextResponse.json({ status: 500, error: e.sqlMessage });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const conn = await openDB();
    const { id } = params;

    // Delete the existing filter configuration
    await conn.query("DELETE FROM report_filters WHERE id=?", [id]);

    conn.end();
    return NextResponse.json({ status: 200, message: "Configuration deleted successfully" });
  } catch (e: any) {
    console.error(e.sqlMessage);
    return NextResponse.json({ status: 500, error: e.sqlMessage });
  }
}
