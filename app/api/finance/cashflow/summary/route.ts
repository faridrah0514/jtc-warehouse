// /app/api/cash_flow/summary/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { openDB } from '@/helper/db';
import dayjs from 'dayjs';
import { RowDataPacket } from 'mysql2';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const period = searchParams.get('period');

  if (!date || !period) {
    return NextResponse.json({ message: 'Missing date or period' }, { status: 400 });
  }


  try {
    const conn = await openDB();
    const datePattern = period === 'monthly' ? `${date}-%` : `${date}-%-%`;

    const [incomingRows] = await conn.query<RowDataPacket[]>(
      `SELECT SUM(cash_flow.amount) as total 
       FROM cash_flow 
       LEFT JOIN cash_flow_category ON cash_flow.category_id = cash_flow_category.id 
       WHERE cash_flow.date LIKE ? AND cash_flow_category.type = 'incoming'`,
      [datePattern]
    );

    const [outgoingRows] = await conn.query<RowDataPacket[]>(
      `SELECT SUM(cash_flow.amount) as total 
       FROM cash_flow 
       LEFT JOIN cash_flow_category ON cash_flow.category_id = cash_flow_category.id 
       WHERE cash_flow.date LIKE ? AND cash_flow_category.type = 'outgoing'`,
      [datePattern]
    );

    conn.end();

    const incomingTotal = incomingRows[0]?.total || 0;
    const outgoingTotal = outgoingRows[0]?.total || 0;

    const formattedResponse = {
      incomingTotal,
      outgoingTotal,
      period: period === 'monthly' ? dayjs(date).format('MMMM YYYY') : dayjs(date).format('YYYY'),
    };

    return NextResponse.json(formattedResponse, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
