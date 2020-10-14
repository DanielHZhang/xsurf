import {createToken, createChecksum, urlSafeBase64, verifyChecksum} from 'src/index';

describe('Utility functions', () => {
  test('Encode URL-safe base64', () => {
    const base64 = 'e8/51e2fa+4f/00+4609+9d/d2+9b3794c/59619=====';
    const result = 'e8_51e2fa-4f_00-4609-9d_d2-9b3794c_59619';
    expect(urlSafeBase64(base64)).toEqual(result);
  });
});

describe('CSRF tokens', () => {
  test('Generate CSRF token', () => {
    const token = createToken();
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
