#!/usr/bin/env node
// Kusonime shortlink bypass
// Usage: node index.js [url]
// Default: https://kusonime.com/tensura-s4-batch-sub-indo/

const { scrape } = require('./src/scraper');
const { bypass } = require('./src/bypass');
const justpaste = require('./src/providers/justpaste');

const DEFAULT_URL = 'https://kusonime.com/tensura-s4-batch-sub-indo/';
const pageUrl = process.argv[2] || DEFAULT_URL;

async function main() {
  console.log(`\nScraping: ${pageUrl}\n`);

  let links;
  try {
    links = await scrape(pageUrl);
  } catch (err) {
    console.error(`[Scraper Error]: ${err.message}`);
    process.exit(1);
  }

  if (!links.length) {
    console.log('Tidak ada link ditemukan di halaman.');
    process.exit(0);
  }

  // Dedup goUrl — kusonime sering pakai shortlink sama untuk banyak tombol
  const seenGoUrls = new Set();
  const uniqueLinks = links.filter(({ goUrl }) => {
    if (seenGoUrls.has(goUrl)) return false;
    seenGoUrls.add(goUrl);
    return true;
  });

  console.log(`Ditemukan ${links.length} link (${uniqueLinks.length} unik). Memproses...\n`);

  for (const { label, goUrl } of uniqueLinks) {
    process.stderr.write(`Memproses ${goUrl} ...\n`);

    const resolved = await bypass(goUrl);

    if (resolved.includes('justpaste.it')) {
      // Extract semua link dari justpaste dan bypass masing-masing
      process.stderr.write(`  → justpaste: ${resolved}\n`);
      let extracted;
      try {
        extracted = await justpaste.extract(resolved);
      } catch (e) {
        console.log(`[!] Gagal extract justpaste: ${e.message}`);
        continue;
      }
      for (const { label: jpLabel, url: jpUrl } of extracted) {
        const finalUrl = await bypass(jpUrl);
        console.log(`[${jpLabel}] ${finalUrl}`);
      }
    } else {
      // Sudah final atau shortlink lain
      console.log(`[${label}] ${resolved}`);
    }
  }

  console.log('\nSelesai.');
}

main();
