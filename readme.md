# xsurf

[![NPM Version][npm-version-image]][npm-url]
[![Node.js Version][node-image]][node-url]
[![NPM Downloads][npm-downloads-image]][npm-url]
[![Node.js CI][ci-image]][ci-url]

A performant, zero-dependency Node.js utility for generating and validating CSRF tokens, written entirely in Typescript.

Token creation and verification logic is based on [this specification](https://github.com/xing/cross-application-csrf-prevention).

### Installation

Via npm:

```
npm i xsurf
```

Via yarn:

```
yarn add xsurf
```

### Middlewares and plugins

Want to integrate CSRF protection middleware into your framework of choice? These middlewares use xsurf:

- Express: express-xsurf
- Fastify: fastify-xsurf

## Usage API

### `createToken(length?: number)`

Synchronously creates a CSRF token of the specified length (32 bytes by default) to be stored in a cookie and copied to the request header on the client.

```typescript
const token = createToken();
request.setCookie('x-csrf-token', token);
```

```typescript
// Create token with 64 bytes of random data
const token = createToken(64);
```

### `createTokenAsync(length?: number): Promise<string>`

Asynchronous version of `createToken()`. Should only be used in niche scenarios because the underlying async `crypto.randomBytes()` call tends to sacrifice crypto ops/sec in favor of js ops/sec, leading to generally poorer performance.

```typescript
async function handle() {
  const token = await createToken();
  // Do something with token
}
```

### `createChecksum(token: string, secret: string): string`

Generate a checksum of the CSRF token using an HMAC SHA256 digest of the token and secret. This value should be stored in an `httpOnly` cookie and be used to verify incoming requests.

```typescript
const secret = process.env.CSRF_SECRET;
const token = request.cookies['x-csrf-token'];
// Make checksum and store in a cookie
const checksum = createChecksum(token, secret);
request.setCookie('x-csrf-checksum', checksum);
```

### `verifyChecksum(token: string, checksum: string, secret: string): boolean`

Verify the validity the provided token against the true checksum using a time-safe comparison. The provided token should originate from the HTTP request header while the checksum should be read from the `httpOnly` cookie.

```typescript
const secret = process.env.CSRF_SECRET;
const headerToken = request.headers['x-csrf-token'];
// Validate the request header token by comparing its checksum to the true checksum stored in a cookie
const checksum = request.cookies['x-csrf-checksum'];
const valid = verifyChecksum(headerToken, checksum, secret);
```

## License

[MIT License](https://github.com/DanielHZhang/xsurf/blob/main/license.md)

[ci-image]: https://github.com/DanielHZhang/xsurf/workflows/nodejs-ci/badge.svg
[ci-url]: https://github.com/DanielHZhang/xsurf/workflows/nodejs-ci
[node-image]: https://badgen.net/npm/node/xsurf
[node-url]: https://nodejs.org/en/download
[npm-downloads-image]: https://badgen.net/npm/dm/xsurf
[npm-url]: https://npmjs.org/package/xsurf
[npm-version-image]: https://badgen.net/npm/v/xsurf
