import { openDB } from "@/helper/db";
import { NextRequest, NextResponse } from 'next/server';
import dayjs from 'dayjs';

export async function GET(req: NextRequest) {
  try {
    const conn = openDB();
    // Extract the query parameters
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');
    const jenis_laporan = searchParams.get('jenis_laporan');

    if (!username || !jenis_laporan) {
      return NextResponse.json({ error: 'Missing required query parameters' }, { status: 400 });
    }

    const today = dayjs().format('YYYY-MM-DD'); // Get today's date in YYYY-MM-DD format
    const query = `
      SELECT * FROM user_actions
      WHERE username = ? AND action = ? AND jenis_laporan = ? AND DATE(tanggal) = ?
    `;
    const [result] = await conn.query(query, [username, 'laporan', jenis_laporan, today]);

    if (!Array.isArray(result) || result.length === 0) {
      return NextResponse.json({}, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Membuat Laporan sudah tidak diperbolehkan' }, { status: 403 });
    }

  } catch (error) {
    console.error('Error handling API request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const conn = openDB();
    const { username, reportType } = await req.json();

    if (!username || !reportType) {
      return NextResponse.json({ error: 'Missing required body parameters' }, { status: 400 });
    }

    const today = dayjs().format('YYYY-MM-DD'); // Get today's date in YYYY-MM-DD format
    const query = `
      INSERT INTO user_actions (username, action, jenis_laporan, tanggal)
      VALUES (?, ?, ?, ?)
    `;
    await conn.query(query, [username, 'laporan', reportType, today]);

    return NextResponse.json({ message: 'Report created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error handling API request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}