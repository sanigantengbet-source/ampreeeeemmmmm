import { NextRequest, NextResponse } from 'next/server';
import { auth, pro } from '@/lib/auth';
import { friendlyFirebaseError } from '@/lib/errors';
import { getStats, incrementStats } from '@/lib/stats';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = body.email;
    const rawLink = body.magicLink || body.link;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Email wajib diisi.' },
        { status: 400 }
      );
    }

    if (!rawLink || typeof rawLink !== 'string' || !rawLink.trim()) {
      return NextResponse.json(
        { success: false, message: 'Link dari email wajib diisi.' },
        { status: 400 }
      );
    }

    const em = email.trim().toLowerCase();
    const v = await auth(em, rawLink.trim());

    if (!v.ok) {
      return NextResponse.json(
        {
          success: false,
          message: friendlyFirebaseError(v.why),
          code: v.why,
        },
        { status: 400 }
      );
    }

    const uid = v.uid || v.user?.localId || '-';
    const premium = await pro(v.id || '');
    const stats = premium.ok ? incrementStats() : getStats();

    const now = new Date();
    const until = new Date();
    until.setFullYear(until.getFullYear() + 1);

    const formattedData = {
      stats: stats,
      uid: uid,
      id: uid,
      email: v.user?.email || em,
      emailVerified: v.user?.emailVerified ?? true,
      displayName: v.user?.displayName || null,
      photoUrl: v.user?.photoUrl || null,
      createdAt: v.user?.createdAt ? new Date(Number(v.user.createdAt)).toISOString() : null,
      lastLoginAt: v.user?.lastLoginAt
        ? new Date(Number(v.user.lastLoginAt)).toISOString()
        : now.toISOString(),
      isNewUser: Boolean(v.baru),
      status: premium.ok ? 'ACTIVE' : 'INACTIVE',
      membershipStatus: premium.ok ? 'PREMIUM_ACTIVE' : 'LOGIN_ONLY',
      tier: premium.ok ? 'Alight Motion Pro VIP' : 'Alight Motion Member',
      planName: 'Alight Motion Pro / Member',
      subscriptionType: 'Yearly VIP License',
      subscription: premium.ok ? 'Yearly VIP License' : 'Login Only',
      orderId: premium.order || null,
      activatedAt: now.toISOString(),
      validUntil: until.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
      validUntilTimestamp: until.getTime(),
      tokenType: 'Bearer',
      idToken: v.id,
      refreshToken: v.ref,
      premiumResponse: premium.ok ? premium.r : null,
      premiumError: premium.ok ? null : premium.why,
      profile: v.user || null,
    };

    return NextResponse.json({
      success: true,
      ok: true,
      message: premium.ok
        ? 'Verifikasi berhasil, Alight Motion Premium VIP aktif 1 Tahun!'
        : 'Login berhasil, namun aktivasi premium mengalami kendala.',
      data: formattedData,
      userData: formattedData, // backward compatibility
      raw: {
        auth: v,
        premium,
        stats,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        ok: false,
        message: error.message || 'Terjadi kesalahan saat memverifikasi link.',
      },
      { status: 500 }
    );
  }
}
