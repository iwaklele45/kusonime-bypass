// Scrape justpaste.it page dan extract semua link (tpi.li / final URL)
// Link di justpaste dibungkus: justpaste.it/redirect/SLUG/ENCODED_URL
const axios = require('axios');
const cheerio = require('cheerio');

async function extract(justpasteUrl) {
  const { data: html } = await axios.get(justpasteUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    timeout: 15000,
  });

  const $ = cheerio.load(html);
  const links = [];

  $('a[href*="justpaste.it/redirect/"]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href) return;

    // Decode URL encoded di belakang /redirect/SLUG/
    const parts = href.split('/redirect/');
    if (parts.length < 2) return;

    const afterRedirect = parts[1]; // misal: efdqb/https%3A%2F%2Ftpi.li%2FXXX
    const slashIdx = afterRedirect.indexOf('/');
    if (slashIdx === -1) return;

    const encodedUrl = afterRedirect.slice(slashIdx + 1);
    let decoded;
    try {
      decoded = decodeURIComponent(encodedUrl);
    } catch (_) {
      return;
    }

    // Skip homepage kusonime / donasi
    if (decoded.includes('kusonime.com') && decoded.length < 25) return;
    if (decoded.includes('donasi') || decoded.includes('bit.ly')) return;

    // Coba tebak resolusi dan host dari teks sebelum <a>
    // Cari text node sebelumnya atau container parent text
    let label = 'Direct';

    // Cari teks di text node terdekat sebelum element
    let prevText = '';
    let node = el.previousSibling;
    while (node) {
      if (node.type === 'text') {
        prevText = node.data + prevText;
      } else if (node.name === 'br') {
        break; // Stop di baris baru
      }
      node = node.previousSibling;
    }

    // Cari resolusi (360P, 480P, 720P, 1080P) dari parent tag <p> atau <div>
    let resolution = '';
    const parentText = $(el).closest('p, div').text() || '';
    const resMatch = parentText.match(/(360P|480P|720P|1080P)/i);
    if (resMatch) {
      resolution = resMatch[0];
    }

    // Bersihkan label host (misal "Google Sharer : " -> "Google Sharer")
    let host = prevText.replace(/[:\s ]/g, '').trim();
    if (!host) {
      // Fallback
      host = $(el).text().trim();
    }

    label = [resolution, host].filter(Boolean).join(' | ');

    links.push({ label, url: decoded });
  });

  return links;
}

module.exports = { extract };
