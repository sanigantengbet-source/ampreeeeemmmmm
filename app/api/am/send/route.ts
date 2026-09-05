import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationLink } from '@/lib/am';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, cookie } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'Email wajib diisi' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { ok: false, error: 'Format email tidak valid' },
        { status: 400 }
      );
    }

    const result = await sendVerificationLink(email.trim(), cookie);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message || 'Gagal memproses permintaan kirim link',
      },
      { status: 500 }
    );
  }
}
