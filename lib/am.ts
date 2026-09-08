import { link, auth, pro, re, code } from './auth';
import { friendlyFirebaseError } from './errors';
import { getStats, incrementStats } from './stats';
import crypto from 'crypto';

export interface SendLinkResult {
  ok: boolean;
  cookie: string;
  message: string;
}

export interface VerifyLinkResult {
  ok: boolean;
  userData: any;
  raw: any;
}

export async function fetchSessionCookie(): Promise<string> {
  const timestamp = Date.now();
  const randomHex = crypto.randomBytes(8).toString('hex');
  return `am_sess_${timestamp}_${randomHex}`;
}

export async function sendVerificationLink(
  email: string,
  providedCookie?: string
): Promise<SendLinkResult> {
  const cookie = providedCookie?.trim() || (await fetchSessionCookie());
  const r = await link(email.trim().toLowerCase());

  if (!r.ok) {
    throw new Error(friendlyFirebaseError(r.why));
  }

  return {
    ok: true,
    cookie,
    message: `Link verifikasi Alight Motion berhasil dikirim ke ${email.trim()}. Periksa inbox / spam email Anda.`,
  };
}

export async function verifyMagicLink(
  email: string,
  magicLink: string,
  cookie?: string
): Promise<VerifyLinkResult> {
  const em = email.trim().toLowerCase();
  const v = await auth(em, magicLink.trim());

  if (!v.ok) {
    throw new Error(friendlyFirebaseError(v.why));
  }

  const premium = await pro(v.id || '');
  const stats = premium.ok ? incrementStats() : getStats();

  const now = new Date();
  const until = new Date();
  until.setFullYear(until.getFullYear() + 1);

  const formattedUserData = {
    uid: v.uid || v.user?.localId || '-',
    id: v.uid || v.user?.localId || '-',
    email: v.user?.email || em,
    displayName: v.user?.displayName || null,
    photoUrl: v.user?.photoUrl || null,
    isNewUser: Boolean(v.baru),
    emailVerified: v.user?.emailVerified ?? true,
    status: premium.ok ? 'ACTIVE' : 'INACTIVE',
    membershipStatus: premium.ok ? 'PREMIUM_ACTIVE' : 'LOGIN_ONLY',
    tier: premium.ok ? 'Alight Motion Pro VIP' : 'Alight Motion Member',
    subscription: premium.ok ? 'Yearly VIP License' : 'Login Only',
    planName: 'Alight Motion Pro / Member',
    subscriptionType: 'Yearly VIP License',
    orderId: premium.order || null,
    activatedAt: now.toISOString(),
    validUntil: until.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
    validUntilTimestamp: until.getTime(),
    createdAt: v.user?.createdAt ? new Date(Number(v.user.createdAt)).toLocaleString('id-ID') : now.toLocaleString('id-ID'),
    lastLoginAt: v.user?.lastLoginAt ? new Date(Number(v.user.lastLoginAt)).toLocaleString('id-ID') : now.toLocaleString('id-ID'),
    tokenType: 'Bearer',
    idToken: v.id,
    refreshToken: v.ref,
    cookie: cookie || '',
    stats,
  };

  return {
    ok: true,
    userData: formattedUserData,
    raw: {
      auth: v,
      premium,
      profile: v.user,
      stats,
    },
  };
}

export { link, auth, pro, re, code, friendlyFirebaseError, getStats, incrementStats };
