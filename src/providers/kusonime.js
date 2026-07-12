// Decode base64 dari url kusonime.com/go/?url=BASE64
const { URL } = require('url');

function decode(goUrl) {
  try {
    const parsed = new URL(goUrl);
    const encoded = parsed.searchParams.get('url');
    if (!encoded) return goUrl;

    // Decode base64
    const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
    return decoded;
  } catch (err) {
    return goUrl;
  }
}

module.exports = { decode };
