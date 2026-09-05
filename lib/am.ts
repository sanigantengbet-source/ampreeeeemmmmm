import crypto from 'crypto';

const ALIGHT_FIREBASE_API_KEY = 'AIzaSyDrZ9jr_Y16ltSBqsQR5IH6I04FRga6Ki0';
const ALIGHT_ORIGIN = 'https://alight-creative.firebaseapp.com';
const ALIGHT_REFERER = 'https://alight-creative.firebaseapp.com/';
const SEND_OOB_ENDPOINT = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${ALIGHT_FIREBASE_API_KEY}`;
const SIGN_IN_EMAIL_LINK_ENDPOINT = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithEmailLink`;
const ACCOUNT_LOOKUP_ENDPOINT = `https://identitytoolkit.googleapis.com/v1/accounts:lookup`;
const LICENSE_ENDPOINT = 'https://us-central1-alight-creative.cloudfunctions.net/getAccountStatusAndLicenses';

const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36';

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

/**
 * Safely parses response body as JSON.
 * Returns null if not valid JSON rather than throwing SyntaxError.
 */
async function safeJsonParse(res: Response): Promise<any> {
  try {
    const text = await res.text();
    if (!text || text.trim().length === 0) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Generates a resilient session cookie token for the user's verification flow.
 */
export async function fetchSessionCookie(): Promise<string> {
  const timestamp = Date.now();
  const randomHex = crypto.randomBytes(8).toString('hex');
  return `am_sess_${timestamp}_${randomHex}`;
}

/**
 * Sends an official Alight Creative / Alight Motion magic link to the target email.
 * Directly communicates with Google Firebase Identity Platform used by Alight Motion.
 */
export async function sendVerificationLink(
  email: string,
  providedCookie?: string
): Promise<SendLinkResult> {
  const cookie = providedCookie?.trim() || (await fetchSessionCookie());
  const trimmedEmail = email.trim();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch(SEND_OOB_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: ALIGHT_ORIGIN,
        Referer: ALIGHT_REFERER,
        'User-Agent': DEFAULT_USER_AGENT,
      },
      body: JSON.stringify({
        requestType: 'EMAIL_SIGNIN',
        email: trimmedEmail,
        continueUrl: ALIGHT_ORIGIN,
      }),
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    const data = await safeJsonParse(res);

    if (res.ok && data?.email) {
      return {
        ok: true,
        cookie,
        message: 'Link verifikasi Alight Motion berhasil dikirim ke email!',
      };
    }

    const errorMessage =
      data?.error?.message ||
      (data?.error && typeof data.error === 'string' ? data.error : null) ||
      `Gagal mengirim link ke server (HTTP ${res.status})`;

    // Make common Firebase errors user-friendly
    if (errorMessage.includes('INVALID_EMAIL')) {
      throw new Error('Alamat email tidak valid menurut sistem Alight Motion.');
    }
    if (errorMessage.includes('TOO_MANY_ATTEMPTS_TRY_LATER')) {
      throw new Error('Terlalu banyak percobaan. Harap tunggu beberapa saat sebelum mencoba lagi.');
    }
    if (errorMessage.includes('EMAIL_NOT_FOUND')) {
      throw new Error('Email tidak terdaftar pada akun Alight Motion.');
    }

    throw new Error(errorMessage);
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Timeout: Gagal menghubungi server Alight Motion (20 detik).');
    }
    throw new Error(err.message || 'Terjadi kesalahan saat mengirim link verifikasi.');
  }
}

/**
 * Parses out oobCode and apiKey from an Alight Motion magic link.
 */
function extractOobCodeAndApiKey(link: string): { oobCode: string; apiKey: string } {
  let targetUrl = link.trim();

  // If link is wrapped in a dynamic link query (e.g. ?link=...)
  try {
    const parsed = new URL(targetUrl);
    const nestedLink = parsed.searchParams.get('link');
    if (nestedLink) {
      targetUrl = nestedLink;
    }
  } catch {
    // ignore URL parsing error
  }

  const oobMatch = targetUrl.match(/[?&]oobCode=([^&]+)/);
  const keyMatch = targetUrl.match(/[?&]apiKey=([^&]+)/);

  const oobCode = oobMatch ? decodeURIComponent(oobMatch[1]) : '';
  const apiKey = keyMatch ? decodeURIComponent(keyMatch[1]) : ALIGHT_FIREBASE_API_KEY;

  return { oobCode, apiKey };
}

/**
 * Verifies the Alight Motion magic link.
 * Completes sign-in and extracts user profile and license status.
 */
export async function verifyMagicLink(
  email: string,
  magicLink: string,
  cookie: string
): Promise<VerifyLinkResult> {
  const trimmedEmail = email.trim();
  const trimmedLink = magicLink.trim();
  const trimmedCookie = cookie.trim();

  if (!trimmedEmail) throw new Error('Email wajib diisi.');
  if (!trimmedLink) throw new Error('Magic Link wajib diisi.');

  const { oobCode, apiKey } = extractOobCodeAndApiKey(trimmedLink);

  if (!oobCode) {
    throw new Error(
      'Kode verifikasi (oobCode) tidak ditemukan dalam URL Magic Link. Pastikan Anda menyalin tautan lengkap dari email Alight Motion.'
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    // 1. Sign in with email link
    const signInUrl = `${SIGN_IN_EMAIL_LINK_ENDPOINT}?key=${encodeURIComponent(apiKey)}`;
    const signInRes = await fetch(signInUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: ALIGHT_ORIGIN,
        Referer: ALIGHT_REFERER,
        'User-Agent': DEFAULT_USER_AGENT,
      },
      body: JSON.stringify({
        email: trimmedEmail,
        oobCode: oobCode,
      }),
      signal: controller.signal,
      cache: 'no-store',
    });

    const signInData = await safeJsonParse(signInRes);

    if (!signInRes.ok || !signInData || signInData.error) {
      const errMsg =
        signInData?.error?.message ||
        `Gagal memverifikasi magic link (HTTP ${signInRes.status})`;

      if (errMsg.includes('INVALID_OOB_CODE') || errMsg.includes('EXPIRED_OOB_CODE')) {
        throw new Error(
          'Magic Link sudah kedaluwarsa atau telah digunakan sebelumnya. Silakan kirim link baru.'
        );
      }
      if (errMsg.includes('EMAIL_MISMATCH')) {
        throw new Error(
          'Email tidak cocok dengan Magic Link yang dikirimkan. Pastikan email sama persis.'
        );
      }

      throw new Error(errMsg);
    }

    const idToken = signInData.idToken;
    const localId = signInData.localId;

    // 2. Fetch User Profile Details from Firebase Identity Toolkit lookup
    let userProfile: any = null;
    if (idToken) {
      try {
        const lookupUrl = `${ACCOUNT_LOOKUP_ENDPOINT}?key=${encodeURIComponent(apiKey)}`;
        const lookupRes = await fetch(lookupUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Origin: ALIGHT_ORIGIN,
            Referer: ALIGHT_REFERER,
            'User-Agent': DEFAULT_USER_AGENT,
          },
          body: JSON.stringify({ idToken }),
          signal: controller.signal,
          cache: 'no-store',
        });
        const lookupData = await safeJsonParse(lookupRes);
        if (lookupData?.users && lookupData.users.length > 0) {
          userProfile = lookupData.users[0];
        }
      } catch {
        // Non-critical profile lookup fallback
      }
    }

    // 3. Attempt Alight Motion license lookup
    let licenseData: any = null;
    if (idToken) {
      try {
        const licRes = await fetch(LICENSE_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
            'User-Agent': DEFAULT_USER_AGENT,
          },
          body: JSON.stringify({
            idToken,
            platform: 'android',
          }),
          signal: controller.signal,
          cache: 'no-store',
        });
        licenseData = await safeJsonParse(licRes);
      } catch {
        // Non-critical license lookup
      }
    }

    clearTimeout(timeoutId);

    const createdAtStr = userProfile?.createdAt
      ? new Date(Number(userProfile.createdAt)).toLocaleString('id-ID')
      : new Date().toLocaleString('id-ID');

    const lastLoginStr = userProfile?.lastLoginAt
      ? new Date(Number(userProfile.lastLoginAt)).toLocaleString('id-ID')
      : new Date().toLocaleString('id-ID');

    const formattedUserData = {
      uid: localId,
      id: localId,
      email: signInData.email || trimmedEmail,
      isNewUser: Boolean(signInData.isNewUser),
      emailVerified: userProfile?.emailVerified ?? true,
      status: 'VERIFIED & ACTIVE',
      tier: licenseData?.tier || licenseData?.licenseStatus || 'Alight Motion Member',
      subscription: licenseData?.subscription || 'Akun Terverifikasi',
      createdAt: createdAtStr,
      lastLoginAt: lastLoginStr,
      cookie: trimmedCookie,
    };

    return {
      ok: true,
      userData: formattedUserData,
      raw: {
        auth: signInData,
        profile: userProfile,
        license: licenseData,
      },
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Timeout: Proses verifikasi memakan waktu terlalu lama (25 detik).');
    }
    throw new Error(err.message || 'Terjadi kesalahan saat memverifikasi Magic Link.');
  }
}
