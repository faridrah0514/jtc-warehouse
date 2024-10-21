import { openDB } from "@/helper/db";
import { NextResponse } from "next/server";
import { projectRoot } from "@/app/projectRoot";
import { readdir } from "fs/promises";
import path from "path";
import { CashFlow } from "@/app/types/master";
import { RowDataPacket } from "mysql2/promise";
import { rmdir } from "fs/promises";

// Fetch cash flows based on type (incoming or outgoing)
export async function GET(request: Request, { params }: { params: { type: string } }): Promise<Response> {
  try {
    const conn = await openDB();
    const { type } = params;

    // Destructure query result to get both the rows (cashFlows) and metadata (fields)
    const [cashFlows]: [CashFlow[] & RowDataPacket[], any] = await conn.query(
      `SELECT cf.*, c.nama_perusahaan as nama_perusahaan
       FROM cash_flow cf 
       JOIN cabang c ON cf.cabang_id = c.id 
       WHERE cf.category_id IN (SELECT id FROM cash_flow_category WHERE type = ?)`,
      [type]
    );

    // Close the database connection
    conn.end();

    // Loop through each cashFlow and get the list of files in the folder_path
    for (const cashFlow of cashFlows) {
      if (cashFlow.folder_path) {
        const directoryPath = path.join(projectRoot, cashFlow.folder_path);

        try {
          // Read the list of files in the folder
          const files = await readdir(directoryPath);
          cashFlow.files = files; // Add the list of files to the cashFlow object
        } catch (e) {
          // Handle errors such as the folder not existing or permission issues
          console.error(`Error reading directory: ${directoryPath}`, e);
          cashFlow.files = []; // If there's an error, return an empty array for files
        }
      } else {
        cashFlow.files = []; // If no folder_path, return an empty array
      }
    }

    // Return the response with cashFlows and their respective files
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
  
      const result: any = await conn.query(
        'INSERT INTO cash_flow (category_id, cabang_id, description, amount, nama_toko, date) VALUES (?, ?, ?, ?, ?, ?)',
        [data.category_id, data.cabang_id, data.description, data.amount, data.nama_toko, formattedDate]
      );
      
      const insertedId = result[0].insertId; // Retrieve the inserted record's ID

      conn.end();
      return NextResponse.json({ status: 200, message: "Cash flow record added successfully", data: { id: insertedId } });
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

    // Delete the cash flow record from the database
    await conn.query('DELETE FROM cash_flow WHERE id = ?', [data.id]);

    // Define the directory path to be deleted
    const directoryPath = path.join(projectRoot, 'upload', 'cashflow', String(data.id));

    try {
      // Remove the directory and its contents
      await rmdir(directoryPath, { recursive: true });
    } catch (e) {
      console.error(`Error deleting directory: ${directoryPath}`, e);
    }

    conn.end();
    return NextResponse.json({ status: 200, message: "Cash flow record and associated folder deleted successfully" });
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
      // Validate required fields
      if (!data.category_id || !data.description || !data.amount || !data.date || !data.id) {
        return NextResponse.json({ status: 400, error: "Missing required fields" });
      }
  
      await conn.query(
        'UPDATE cash_flow SET category_id = ?, description = ?, amount = ?, date = ?, cabang_id = ?, nama_toko = ? WHERE id = ?',
        [data.category_id, data.description, data.amount, data.date, data.cabang_id, data.nama_toko, data.id]
      );
  
      conn.end();
      return NextResponse.json({ status: 200, message: "Cash flow record updated successfully", data: { id: data.id } });
    } catch (e: any) {
      console.error(e.sqlMessage);
      return NextResponse.json({ status: 500, error: e.sqlMessage });
    }
  }
  