import { NextRequest, NextResponse } from 'next/server';
import { verifyMagicLink } from '@/lib/am';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, link, cookie } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'Email wajib diisi' },
        { status: 400 }
      );
    }

    if (!link || typeof link !== 'string' || link.trim().length < 10) {
      return NextResponse.json(
        { ok: false, error: 'Magic link tidak valid atau terlalu pendek' },
        { status: 400 }
      );
    }

    if (!cookie || typeof cookie !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'Session cookie wajib disertakan' },
        { status: 400 }
      );
    }

    const result = await verifyMagicLink(email.trim(), link.trim(), cookie.trim());

    return NextResponse.json({
      ok: true,
      success: true,
      userData: result.userData,
      raw: result.raw,
      message: 'Verifikasi akun berhasil!',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        success: false,
        error: error.message || 'Gagal memverifikasi magic link',
      },
      { status: 500 }
    );
  }
}
