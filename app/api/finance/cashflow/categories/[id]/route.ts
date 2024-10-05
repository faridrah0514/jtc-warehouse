import { openDB } from '@/helper/db';
import { NextResponse } from 'next/server';
import { ResultSetHeader } from 'mysql2';

// Update an existing category (PUT request)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const conn = await openDB();
    const { id } = params; // Extract `id` from URL params
    const data = await request.json();
    const { name, type, description } = data;

    // Update category based on ID
    await conn.query(
      'UPDATE cash_flow_category SET name = ?, type = ?, description = ? WHERE id = ?',
      [name, type, description, id]
    );
    conn.end();
    return NextResponse.json({ status: 200, message: 'Category updated successfully' });
  } catch (e: any) {
    console.error(e.message);
    return NextResponse.json({ status: 500, error: e.message });
  }
}

// Delete a category (DELETE request)

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
      const conn = await openDB();
      const { id } = params;
  
      const [result] = await conn.query<ResultSetHeader>('DELETE FROM cash_flow_category WHERE id = ?', [id]);
      conn.end();
  
      if (result.affectedRows === 0) {
        // If no rows were deleted, send an error message
        return NextResponse.json({ status: 404, error: 'Category not found' }, { status: 404 });
      }
  
      return NextResponse.json({ status: 200, message: 'Category deleted successfully' });
    } catch (e: any) {
      console.error(e.message);
      
      // Check for foreign key constraint error
      if (e.code === 'ER_ROW_IS_REFERENCED_2') {
        // Send a user-friendly error message
        return NextResponse.json({
          status: 400,
          error: 'This category is being used in cash flow and cannot be deleted.',
        }, { status: 400 });
      }
  
      // Send a generic server error for other cases
      return NextResponse.json({ status: 500, error: e.message }, { status: 500 });
    }
  }
