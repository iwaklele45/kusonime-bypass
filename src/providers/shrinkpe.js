// Bypass shrink.pe / tpi.li / shrinkme.io
// Strategy:
//   1. Fetch via axios, extract base64 URL dari input[name="token"]
//   2. Fallback: Playwright headless jika langkah 1 gagal
const axios = require('axios');
const cheerio = require('cheerio');

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

// Decode base64 URL dari token field shrinkpe/tpi.li
// Format token: [hash][alias][date][base64_encoded_final_url]
function extractUrlFromToken(token) {
  if (!token) return null;
  // 'aHR0cH' = base64 prefix untuk 'http'
  const pos = token.indexOf('aHR0cH');
  if (pos === -1) return null;
  try {
    const decoded = Buffer.from(token.slice(pos), 'base64').toString('utf-8');
    if (decoded.startsWith('http')) return decoded;
  } catch (_) {}
  return null;
}

async function bypassViaAxios(url) {
  const res = await axios.get(url, { headers: HEADERS, timeout: 15000 });
  const $ = cheerio.load(res.data);
  const token = $('input[name="token"]').val();
  return extractUrlFromToken(token);
}

async function bypassViaPlaywright(url) {
  const { chromium } = require('playwright');
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ userAgent: HEADERS['User-Agent'], viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Coba extract token dari DOM dulu sebelum klik apapun
    const tokenVal = await page.$eval('input[name="token"]', el => el.value).catch(() => null);
    const fromToken = extractUrlFromToken(tokenVal);
    if (fromToken) return fromToken;

    // Tunggu dan coba klik tombol lanjut
    await page.waitForTimeout(5000);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(3000);

    const selectors = [
      'a:has-text("Get Link")', 'button:has-text("Get Link")',
      '#getlink',
      'a:has-text("Click Here to Continue")', 'button:has-text("Click Here to Continue")',
      'a:has-text("Continue")', 'button:has-text("Continue")',
    ];
    for (const sel of selectors) {
      try {
        const btn = await page.$(sel);
        if (btn && await btn.isVisible()) {
          await btn.click();
          await page.waitForTimeout(3000);
        }
      } catch (_) {}
    }

    await page.waitForTimeout(5000);
    return page.url();
  } finally {
    if (browser) await browser.close();
  }
}

async function bypass(url) {
  // Tahap 1: axios cepat
  try {
    const result = await bypassViaAxios(url);
    if (result) return result;
  } catch (_) {}

  // Tahap 2: Playwright fallback
  try {
    return await bypassViaPlaywright(url);
  } catch (err) {
    console.error(`[Playwright Bypass Error]: ${err.message}`);
    return url;
  }
}

module.exports = { bypass };
// ponytail: jika Cloudflare Turnstile aktif di semua request, perlu cf-clearance cookie atau layanan solver
