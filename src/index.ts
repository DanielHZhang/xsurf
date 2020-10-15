import crypto from 'crypto';

/** Replace all '=' regardless of position (in valid base64, = should only be present at the end) */
const urlSafeRegex = /[+/=]/g;
const replaceMap: Record<string, string> = {'+': '-', '/': '_', '=': ''};

/** Use a default of 24 bytes of random data so the encoded representation is 32 characters. */
const randomDataLength = 24;

export function urlSafeBase64(rawBase64: string): string {
  return rawBase64.replace(urlSafeRegex, (match) => replaceMap[match]);
}

/**
 * Create a CSRF token of the specified length. Defaults to 24 bytes of random data.
 * @param length Number of bytes of random data to use for the token.
 */
export function createToken(length: number = randomDataLength): string {
  const randomBytes = crypto.randomBytes(length);
  return urlSafeBase64(randomBytes.toString('base64'));
}

/**
 * Asynchronously create a CSRF token. The async version of `crypto.randomBytes` tends to
 * sacrifice crypto ops/sec in favor of js ops/sec, and thus this method should only be
 * used niche scenarios (i.e. when the specified length is large).
 *
 * See: https://github.com/uuidjs/uuid/issues/150
 * @param length Number of bytes of random data to use for the token.
 */
export async function createTokenAsync(length: number = randomDataLength): Promise<string> {
  const randomBytes = await new Promise<Buffer>((resolve, reject) => {
    crypto.randomBytes(length, (error, buffer) => (error ? reject(error) : resolve(buffer)));
  });
  return urlSafeBase64(randomBytes.toString('base64'));
}

/**
 * Generate a checksum of the CSRF token using an HMAC SHA256 digest of the token.
 * @param token CSRF token to have checksum generated against.
 * @param secret Shared secret key.
 */
export function createChecksum(token: string, secret: string): string {
  const hmac = crypto.createHmac('sha256', secret).update(token).digest('base64');
  return urlSafeBase64(hmac);
}

/**
 * Verify if a given token is valid against its checksum using a time-safe comparison.
 * @param token Token attempt sent from the client.
 * @param checksum Generated checksum of the original token.
 * @param secret Shared secret key.
 */
export function verifyChecksum(token: string, checksum: string, secret: string): boolean {
  if (!token || !checksum || typeof token !== 'string' || typeof checksum !== 'string') {
    return false;
  }
  const attempt = createChecksum(token, secret);
  if (attempt.length !== checksum.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(attempt, 'utf-8'), Buffer.from(checksum, 'utf-8'));
}
