// Dispatch link ke bypass provider yang sesuai
const axios = require('axios');
const kusonime = require('./providers/kusonime');
const ouo = require('./providers/ouo');
const shrinkpe = require('./providers/shrinkpe');
const { detectProvider, isFinalUrl } = require('./util');

async function bypass(url) {
  let currentUrl = url;

  // Resolving chain (misal /go/ -> ouo -> final)
  for (let i = 0; i < 5; i++) {
    const provider = detectProvider(currentUrl);

    if (isFinalUrl(currentUrl)) {
      break;
    }

    try {
      if (provider === 'kusonime') {
        currentUrl = kusonime.decode(currentUrl);
      } else if (provider === 'ouo') {
        currentUrl = await ouo.bypass(currentUrl);
      } else if (provider === 'shrinkpe') {
        currentUrl = await shrinkpe.bypass(currentUrl);
      } else if (provider === 'tinyurl' || provider === 'sid' || provider === 'bitly' || provider === 'tpili') {
        // Follow redirect langsung
        let resolved = currentUrl;
        try {
          const res = await axios.get(currentUrl, {
            maxRedirects: 15,
            timeout: 15000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9',
            }
          });
          resolved = res.request?.res?.responseUrl || res.config?.url || currentUrl;
        } catch (axiosErr) {
          resolved = currentUrl; // akan di-handle di bawah
        }

        // tpi.li butuh real browser (redirect via JS/ads)
        if (provider === 'tpili' && resolved === currentUrl) {
          const shrinkpe = require('./providers/shrinkpe');
          resolved = await shrinkpe.bypass(currentUrl);
        }

        if (resolved === currentUrl) break; // tidak berubah, stop
        currentUrl = resolved;
      } else {
        // Unknown / direct, stop chain
        break;
      }
    } catch (err) {
      console.error(`[Bypass Failed] ${currentUrl}: ${err.message}`);
      break;
    }
  }

  return currentUrl;
}

module.exports = { bypass };
