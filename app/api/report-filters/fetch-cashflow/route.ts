import { openDB } from "@/helper/db";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { cabang_id, categories, period_start, period_end } = body;

    const conn = await openDB();

    // Build the query to fetch and calculate the totals
    let query = `
      SELECT 
        cf.id,
        cf.category_id,
        CONCAT(cf.category_id, ' - ', cfc.name) AS category, -- Concatenate category_id and name
        cf.description,
        TRUNCATE(cf.amount, 0) AS amount, -- Remove decimal places from amount
        cf.date,
        cf.created_at,
        cf.updated_at,
        cf.cabang_id,
        cfc.type AS category_type, -- Incoming or outgoing type from the category table
        cabang.nama_perusahaan -- Include 'nama_perusahaan' from 'cabang' table
      FROM cash_flow cf
      JOIN cash_flow_category cfc ON cf.category_id = cfc.id
      JOIN cabang ON cf.cabang_id = cabang.id -- Join 'cabang' table to get 'nama_perusahaan'
      WHERE cf.cabang_id = ?
      AND cf.category_id IN (?)
      AND cf.date >= ? 
      AND cf.date <= ?
    `;

    // Execute the query
    const [rows] = await conn.query(query, [
      cabang_id,
      categories,
      period_start,
      period_end,
    ]);

    const cashFlowRecords = Array.isArray(rows) ? rows : [];

    // Calculate the totals for incoming and outgoing separately
    const totalIncoming = cashFlowRecords
      .filter((record: any) => record.category_type === "incoming")
      .reduce((acc: number, record: any) => acc + parseFloat(record.amount), 0);

    const totalOutgoing = cashFlowRecords
      .filter((record: any) => record.category_type === "outgoing")
      .reduce((acc: number, record: any) => acc + parseFloat(record.amount), 0);

    // Calculate the final total: incoming - outgoing
    const totalAmount = totalIncoming - totalOutgoing;

    // Close connection
    conn.end();

    console.log("response", {
      status: 200,
      data: cashFlowRecords,
      total_incoming: totalIncoming,
      total_outgoing: totalOutgoing,
      total_amount: totalAmount,
    });

    return NextResponse.json({
      status: 200,
      data: cashFlowRecords,
      total_incoming: totalIncoming,
      total_outgoing: totalOutgoing,
      total_amount: totalAmount,
    });
  } catch (e: any) {
    console.error(e.sqlMessage);
    return NextResponse.json({ status: 500, error: e.sqlMessage });
  }
}
