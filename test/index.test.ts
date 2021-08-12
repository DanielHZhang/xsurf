import {
  createChecksum,
  createToken,
  createTokenAsync,
  urlSafeBase64,
  verifyChecksum,
} from 'src/index';

describe('Utility functions', () => {
  test('Encode URL-safe base64', () => {
    const base64 = 'e8/51e2fa+4f/00+4609+9d/d2+9b3794c/59619=====';
    const result = 'e8_51e2fa-4f_00-4609-9d_d2-9b3794c_59619';
    expect(urlSafeBase64(base64)).toEqual(result);
  });
});

describe('CSRF tokens', () => {
  test('Generate CSRF token sync', () => {
    const token = createToken();
    expect(token.length).toEqual(32);

    const randomNumber = Math.round(Math.random() * 100);
    const customToken = createToken(randomNumber);
    const tokenBuffer = Buffer.from(customToken);
    const expectedByteSize = 4 * Math.ceil(randomNumber / 3);
    const paddingDifference = expectedByteSize - tokenBuffer.length;
    // Due to base64 padding the final sequence with '=' or '==', which is removed by our
    // url-safe encode, the expected difference in byte size should be 0 <= delta <= 2
    expect(paddingDifference).toBeLessThanOrEqual(2);
    expect(paddingDifference).toBeGreaterThanOrEqual(0);
  });

  test('Generate CSRF token async', async () => {
    const token = await createTokenAsync();
    expect(token.length).toEqual(32);
  });

  const token = 'such protect';
  const secret = 'much secure';
  const knownChecksum = 'fEFyEXot47K5knjFe7MB-CKW4q99a7BmP9rKwrxf9Qk';

  test('Generate checksum', () => {
    const checksum = createChecksum(token, secret);
    expect(checksum).toEqual(knownChecksum);
  });

  test('Validate token checksum', () => {
    const checksum = createChecksum(token, secret);
    const attempt1 = '';
    const attempt2 = 'weagjpoeawjgpoajepgojdaskfjlkdavnlkmvlkadvmlkdvsamlk';
    const attempt3 = 'x'.repeat(10 * 1024 * 1024);

    expect(verifyChecksum(attempt1, checksum, secret)).toEqual(false);
    expect(verifyChecksum(attempt2, checksum, secret)).toEqual(false);
    expect(verifyChecksum(attempt3, checksum, secret)).toEqual(false);
    expect(verifyChecksum(token, checksum, secret)).toEqual(true);
  });
});
