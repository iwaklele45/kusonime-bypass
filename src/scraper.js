// Scrape kusonime page, extract all download links with their labels
// Kusonime uses .smokeurlrh div for download rows and .smokettlrh for section title
const axios = require('axios');
const cheerio = require('cheerio');

async function scrape(pageUrl) {
  const { data: html } = await axios.get(pageUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    },
    timeout: 15000,
  });

  const $ = cheerio.load(html);
  const results = [];

  // Kusonime pages use both legacy classes and newer `rh` variants.
  $('.smokeddlrh, .smokeddl').each((_, section) => {
    const sectionTitle = $(section).find('.smokettlrh, .smokettl').first().text().trim();

    $(section).find('.smokeurlrh, .smokeurl').each((_, row) => {
      const resolution = $(row).find('strong').first().text().trim();
      const rowLabel = [sectionTitle, resolution].filter(Boolean).join(' | ');

      $(row).find('a[href]').each((_, el) => {
        const href = $(el).attr('href');
        const hostLabel = $(el).text().trim() || 'Unknown';
        if (href && href.startsWith('http')) {
          results.push({ label: `${rowLabel} [${hostLabel}]`, goUrl: href });
        }
      });
    });
  });

  // Fallback: kusonime.com/go/ links anywhere on page
  if (!results.length) {
    $('a[href*="kusonime.com/go/"]').each((_, el) => {
      const href = $(el).attr('href');
      const label = $(el).text().trim() || 'Unknown';
      if (href) results.push({ label, goUrl: href });
    });
  }

  return results;
}

module.exports = { scrape };
