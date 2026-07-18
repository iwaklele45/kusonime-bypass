#!/usr/bin/env node
// Kusonime shortlink bypass
// Usage: node index.js [url]

const readline = require('readline');
const { scrape } = require('./src/scraper');
const { bypass } = require('./src/bypass');
const justpaste = require('./src/providers/justpaste');

// ANSI Colors
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
};

async function runBypass(pageUrl) {
  console.log(`\n${colors.bright}${colors.cyan}=== Kusonime Bypass ===${colors.reset}`);
  console.log(`${colors.cyan}Scraping: ${colors.reset}${pageUrl}\n`);

  let links;
  try {
    links = await scrape(pageUrl);
  } catch (err) {
    console.error(`${colors.red}${colors.bright}[Scraper Error]:${colors.reset}${colors.red} ${err.message}${colors.reset}`);
    return;
  }

  if (!links.length) {
    console.log(`${colors.yellow}Tidak ada link ditemukan di halaman.${colors.reset}`);
    return;
  }

  // Dedup goUrl — kusonime sering pakai shortlink sama untuk banyak tombol
  const seenGoUrls = new Set();
  const uniqueLinks = links.filter(({ goUrl }) => {
    if (seenGoUrls.has(goUrl)) return false;
    seenGoUrls.add(goUrl);
    return true;
  });

  console.log(`${colors.green}Ditemukan ${colors.bright}${links.length}${colors.reset}${colors.green} link (${colors.bright}${uniqueLinks.length}${colors.reset}${colors.green} unik). Memproses...${colors.reset}\n`);

  // Calculate max label length for column alignment
  let maxLabelLen = 0;
  for (const { label } of uniqueLinks) {
    if (label.length > maxLabelLen) maxLabelLen = label.length;
  }
  // justpaste.it extracted labels might be unknown, but we pad based on known labels + some margin
  maxLabelLen = Math.max(maxLabelLen, 25);

  let currentIdx = 0;
  const totalLinks = uniqueLinks.length;

  for (const { label, goUrl } of uniqueLinks) {
    currentIdx++;
    
    // Clean progress line with \r and \x1b[K (clear to end of line)
    process.stderr.write(`\r\x1b[K${colors.dim}[${currentIdx}/${totalLinks}] Memproses ${goUrl} ...${colors.reset}`);

    const resolved = await bypass(goUrl);

    // Clear progress line before printing result
    process.stderr.write('\r\x1b[K');

    if (resolved.includes('justpaste.it')) {
      process.stderr.write(`\r\x1b[K${colors.dim}[${currentIdx}/${totalLinks}] Extracting justpaste: ${resolved}${colors.reset}`);
      let extracted;
      try {
        extracted = await justpaste.extract(resolved);
      } catch (e) {
        process.stderr.write('\r\x1b[K');
        console.log(`${colors.red}[!] Gagal extract justpaste: ${e.message}${colors.reset}`);
        continue;
      }
      process.stderr.write('\r\x1b[K');
      
      for (const { label: jpLabel, url: jpUrl } of extracted) {
        const finalUrl = await bypass(jpUrl);
        const paddedLabel = `[${jpLabel}]`.padEnd(maxLabelLen + 2);
        console.log(`${colors.green}${paddedLabel}${colors.reset} ${finalUrl}`);
      }
    } else {
      // Sudah final atau shortlink lain
      const paddedLabel = `[${label}]`.padEnd(maxLabelLen + 2);
      console.log(`${colors.green}${paddedLabel}${colors.reset} ${resolved}`);
    }
  }

  console.log(`\n${colors.bright}${colors.cyan}Selesai.${colors.reset}\n`);
}

function askUrl(rl) {
  rl.question(`${colors.bright}Masukkan URL Kusonime (atau 'q' untuk keluar): ${colors.reset}`, async (answer) => {
    const input = answer.trim();
    if (input.toLowerCase() === 'q' || input.toLowerCase() === 'exit') {
      rl.close();
      return;
    }

    if (input) {
      await runBypass(input);
    }
    
    askUrl(rl);
  });
}

async function main() {
  const argUrl = process.argv[2];

  if (argUrl) {
    await runBypass(argUrl);
  } else {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    console.log(`${colors.bright}${colors.cyan}=== Mode Interaktif ===${colors.reset}`);
    askUrl(rl);
  }
}

main();
