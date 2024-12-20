import { openDB } from "@/helper/db";
import { NextResponse } from "next/server";

// Retrieve all configurations or add a new one
export async function GET(request: Request): Promise<Response> {
  try {
    const conn = await openDB();

    // Retrieve the character set and collation from the database
    const [charsetResult]: any[] = await conn.query(
      `SHOW VARIABLES LIKE 'character_set_database';`
    );
    const [collationResult]: any[] = await conn.query(
      `SHOW VARIABLES LIKE 'collation_database';`
    );

    const charset = charsetResult?.[0]?.Value || "utf8mb4";
    const collation = collationResult?.[0]?.Value || "utf8mb4_unicode_ci";

    // Query to join `report_filters` with `cash_flow_category` and format the categories
    const [filters]: any[] = (await conn.query(
      `
      SELECT 
        rf.id, 
        rf.cabang_id, 
        rf.nama_cabang,
        rf.report_type,
        rf.cash_flow_type, 
        rf.period_type, 
        rf.period_date, 
        rf.created_at, 
        rf.updated_at,
        GROUP_CONCAT(CONCAT(cfc.id, ' - ', cfc.name) ORDER BY cfc.id SEPARATOR ', ') AS categories
      FROM report_filters rf
      LEFT JOIN cash_flow_category cfc 
        ON JSON_CONTAINS(rf.categories, JSON_QUOTE(cfc.id), '$')
      GROUP BY rf.id
      `
    )) as any[];

    conn.end();

    // Transform the `categories` field into an array of strings for each filter
    const transformedFilters = filters.map((filter: any) => {
      // Convert the `categories` string to an array of strings, if it exists
      const categoriesArray = filter.categories
        ? filter.categories
            .split(", ")
            .map((category: string) => category.trim())
        : [];

      const cabangIds = filter.cabang_id
        ? filter.cabang_id.split(",").map((id: string) => id.trim())
        : [];

      const namaCabangs = filter.nama_cabang
        ? filter.nama_cabang.split(",").map((name: string) => name.trim())
        : [];

      return {
        ...filter,
        cabang_id: cabangIds,
        nama_cabang: namaCabangs,
        categories: categoriesArray,
      };
    });
    return NextResponse.json({ status: 200, data: transformedFilters });
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
    if (
      !data.nama_cabang ||
      !data.report_type ||
      !data.cash_flow_type ||
      !data.categories ||
      !data.period_type ||
      !data.period_date
    ) {
      return NextResponse.json({
        status: 400,
        error: "All fields are required",
      });
    }

    // Insert the new filter configuration
    await conn.query(
      "INSERT INTO report_filters (nama_cabang, report_type, cash_flow_type, categories, period_type, period_date, cabang_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        data.nama_cabang,
        data.report_type,
        data.cash_flow_type,
        JSON.stringify(data.categories),
        data.period_type,
        data.period_date,
        data.cabang_id,
      ]
    );

    conn.end();
    return NextResponse.json({
      status: 200,
      message: "Configuration saved successfully",
    });
  } catch (e: any) {
    console.error(e.sqlMessage);
    return NextResponse.json({ status: 500, error: e.sqlMessage });
  }
}
