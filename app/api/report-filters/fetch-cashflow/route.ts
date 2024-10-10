import { openDB } from "@/helper/db";
import { NextResponse } from "next/server";
import dayjs from "dayjs";

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
      WHERE cf.cabang_id IN (?)
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

    // Group the records by 'nama_perusahaan'
    const groupedData = cashFlowRecords.reduce((acc: any, record: any) => {
      const cabang = record.nama_perusahaan;

      // Format the date field to 'DD-MM-YYYY'
      record.date = dayjs(record.date).format('DD-MM-YYYY');

      if (!acc[cabang]) {
        acc[cabang] = {
          records: [],
          total_incoming: 0,
          total_outgoing: 0,
          total_amount: 0,
        };
      }

      // Add the record to the cabang's list
      acc[cabang].records.push(record);

      // Calculate totals for incoming and outgoing
      if (record.category_type === "incoming") {
        acc[cabang].total_incoming += parseFloat(record.amount);
      } else if (record.category_type === "outgoing") {
        acc[cabang].total_outgoing += parseFloat(record.amount);
      }

      // Update the total amount: incoming - outgoing
      acc[cabang].total_amount = acc[cabang].total_incoming - acc[cabang].total_outgoing;

      return acc;
    }, {});

    // Close connection
    conn.end();

    return NextResponse.json({
      status: 200,
      data: groupedData,
    });
  } catch (e: any) {
    console.error(e.sqlMessage);
    return NextResponse.json({ status: 500, error: e.sqlMessage });
  }
}
