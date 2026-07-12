// Bypass ouo.io via POST dengan token dari HTML
const axios = require('axios');
const cheerio = require('cheerio');

async function bypass(url) {
  const session = axios.create({
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    maxRedirects: 10,
    timeout: 15000,
  });

  // GET untuk ambil token
  const r1 = await session.get(url);
  const $ = cheerio.load(r1.data);
  const token = $('input[name="token"]').val();

  if (!token) {
    // Tidak ada form — mungkin sudah di-redirect ke final URL
    return r1.request?.res?.responseUrl || url;
  }

  // POST dengan token
  const params = new URLSearchParams({ token });
  const r2 = await session.post(url, params.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer': url,
    },
    maxRedirects: 10,
  });

  return r2.request?.res?.responseUrl || r2.config?.url || url;
}

module.exports = { bypass };
// ponytail: tidak handle ouo.io ganti anti-bot; tambah fallback Playwright jika POST 403
