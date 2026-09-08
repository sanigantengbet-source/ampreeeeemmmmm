import { NextRequest, NextResponse } from 'next/server';
import { link } from '@/lib/auth';
import { friendlyFirebaseError } from '@/lib/errors';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email } = body;

    if (!email || typeof email !== 'string' || !email.includes('@') || !email.includes('.')) {
      return NextResponse.json(
        { success: false, message: 'Email tidak valid.' },
        { status: 400 }
      );
    }

    const em = email.trim().toLowerCase();
    const r = await link(em);

    if (!r.ok) {
      return NextResponse.json(
        {
          success: false,
          message: friendlyFirebaseError(r.why),
          code: r.why,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      email: em,
      message: `Link dikirim ke ${em}. Cek inbox atau folder spam email Anda.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Gagal mengirim link verifikasi.',
      },
      { status: 500 }
    );
  }
}
