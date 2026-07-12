// Bypass shrink.pe / tpi.li menggunakan Playwright
const { chromium } = require('playwright');

async function bypass(url) {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    // Buat context dengan custom User-Agent
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 720 },
    });

    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Tunggu 4 detik awal
    await page.waitForTimeout(4000);

    // Auto-scroll ke bawah untuk memicu countdown atau load element
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(3000);

    // Coba cari dan klik tombol "Get Link", "Please Wait", "Click here to continue"
    const selectors = [
      'a:has-text("Get Link")',
      'button:has-text("Get Link")',
      '#getlink',
      'a:has-text("Click Here to Continue")',
      'button:has-text("Click Here to Continue")',
      'a:has-text("Continue")',
      'button:has-text("Continue")',
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

    // Tunggu navigasi selesai atau stabil
    await page.waitForTimeout(5000);

    const finalUrl = page.url();
    return finalUrl;
  } catch (err) {
    console.error(`[Playwright Bypass Error]: ${err.message}`);
    return url;
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = { bypass };
// ponytail: tidak bypass reCAPTCHA, jika mandek harus headless: false
