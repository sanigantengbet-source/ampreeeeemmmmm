import { NextRequest, NextResponse } from 'next/server';
import { verifyMagicLink } from '@/lib/am';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = body.email;
    const rawLink = body.link || body.magicLink;
    const cookie = body.cookie;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { ok: false, success: false, error: 'Email wajib diisi', message: 'Email wajib diisi' },
        { status: 400 }
      );
    }

    if (!rawLink || typeof rawLink !== 'string' || rawLink.trim().length < 5) {
      return NextResponse.json(
        { ok: false, success: false, error: 'Magic link tidak valid', message: 'Magic link tidak valid' },
        { status: 400 }
      );
    }

    const result = await verifyMagicLink(email.trim(), rawLink.trim(), cookie?.trim());

    return NextResponse.json({
      ok: true,
      success: true,
      userData: result.userData,
      data: result.userData,
      raw: result.raw,
      message: result.userData.status === 'ACTIVE' 
        ? 'Verifikasi akun berhasil, Alight Motion Premium VIP aktif!' 
        : 'Verifikasi akun berhasil!',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        success: false,
        error: error.message || 'Gagal memverifikasi magic link',
        message: error.message || 'Gagal memverifikasi magic link',
      },
      { status: 500 }
    );
  }
}
