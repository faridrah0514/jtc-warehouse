import { openDB } from "@/helper/db";
import { NextRequest, NextResponse } from 'next/server';
import dayjs from 'dayjs';

export async function GET(req: NextRequest) {
  try {
    const conn = openDB();
    // Extract the query parameters
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');
    const print_id = searchParams.get('print_id');

    if (!username || !print_id) {
      return NextResponse.json({ error: 'Missing required query parameters' }, { status: 400 });
    }

    const today = dayjs().format('YYYY-MM-DD'); // Get today's date in YYYY-MM-DD format
    const query = `
      SELECT * FROM user_actions
      WHERE username = ? AND action = ? AND print_id = ? AND DATE(tanggal) = ?
    `;
    const [result] = await conn.query(query, [username, 'print', print_id, today]);

    if (!Array.isArray(result) || result.length === 0) {
      return NextResponse.json({}, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Print laporan sudah tidak diperbolehkan' }, { status: 403 });
    }

  } catch (error) {
    console.error('Error handling API request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const conn = openDB();
    const { username, print_id } = await req.json();

    if (!username || !print_id) {
      return NextResponse.json({ error: 'Missing required body parameters' }, { status: 400 });
    }

    const today = dayjs().format('YYYY-MM-DD'); // Get today's date in YYYY-MM-DD format
    const query = `
      INSERT INTO user_actions (username, action, print_id, tanggal)
      VALUES (?, ?, ?, ?)
    `;
    await conn.query(query, [username, 'print', print_id, today]);

    return NextResponse.json({ message: 'Report created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error handling API request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}