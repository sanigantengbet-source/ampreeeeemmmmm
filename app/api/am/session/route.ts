import { NextResponse } from 'next/server';
import { fetchSessionCookie } from '@/lib/am';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookie = await fetchSessionCookie();
    return NextResponse.json({
      ok: true,
      cookie,
      message: 'Session cookie berhasil dibuat',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message || 'Gagal mengambil session cookie',
      },
      { status: 500 }
    );
  }
}
