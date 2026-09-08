import { NextResponse } from 'next/server';
import { getStats } from '@/lib/stats';

export const dynamic = 'force-dynamic';

export async function GET() {
  const stats = getStats();
  return NextResponse.json({
    success: true,
    total: stats.total,
    today: stats.today,
  });
}
