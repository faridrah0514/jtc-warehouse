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
    const selectedDate = dayjs(date);
    const datePattern = period === 'monthly' ? `${date}-%` : `${date}-%-%`;

    // Calculate totals for the selected month or year
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

    // Calculate cash remaining before the selected month or year
    const startDate = period === 'monthly' 
      ? selectedDate.startOf('month') 
      : selectedDate.startOf('year');

    const [incomingBefore] = await conn.query<RowDataPacket[]>(
      `SELECT SUM(cash_flow.amount) as total 
       FROM cash_flow 
       LEFT JOIN cash_flow_category ON cash_flow.category_id = cash_flow_category.id 
       WHERE cash_flow.date < ? AND cash_flow_category.type = 'incoming'`,
      [startDate.format('YYYY-MM-DD')]
    );

    const [outgoingBefore] = await conn.query<RowDataPacket[]>(
      `SELECT SUM(cash_flow.amount) as total 
       FROM cash_flow 
       LEFT JOIN cash_flow_category ON cash_flow.category_id = cash_flow_category.id 
       WHERE cash_flow.date < ? AND cash_flow_category.type = 'outgoing'`,
      [startDate.format('YYYY-MM-DD')]
    );

    conn.end();

    const incomingTotal = incomingRows[0]?.total || 0;
    const outgoingTotal = outgoingRows[0]?.total || 0;
    const remainingBefore = (incomingBefore[0]?.total || 0) - (outgoingBefore[0]?.total || 0);
    const remainingAfter = remainingBefore + (Number(incomingTotal) - Number(outgoingTotal));

    const formattedResponse = {
      incomingTotal,
      outgoingTotal,
      remainingBefore,
      remainingAfter,
      period: period === 'monthly' ? selectedDate.format('MMMM YYYY') : selectedDate.format('YYYY'),
    };

    return NextResponse.json(formattedResponse, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
