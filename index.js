#!/usr/bin/env node
// Kusonime shortlink bypass
// Usage: node index.js [url]

const readline = require('readline');
const { scrape } = require('./src/scraper');
const { bypass } = require('./src/bypass');
const justpaste = require('./src/providers/justpaste');

function link(url) {
  return `\x1b]8;;${url}\x1b\\${url}\x1b]8;;\x1b\\`;
}

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

function parseArgs(args) {
  const flags = new Set();
  let url = null;

  for (const arg of args) {
    if (arg.startsWith('--')) {
      const res = arg.slice(2).toLowerCase();
      if (['360', '480', '720', '1080', '3840'].includes(res)) {
        flags.add(res);
      }
    } else if (!url && (arg.startsWith('http://') || arg.startsWith('https://'))) {
      url = arg;
    }
  }

  return { targetResolutions: flags, url };
}

function filterByResolution(label, targetResolutions) {
  if (!targetResolutions || targetResolutions.size === 0) return true;
  const upperLabel = label.toUpperCase();
  for (const res of targetResolutions) {
    if (upperLabel.includes(`${res}P`) || upperLabel.includes(res)) {
      return true;
    }
  }
  return false;
}

async function runBypass(pageUrl, targetResolutions = new Set()) {
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

  // Filter resolution fast-path jika ada flag
  const filteredLinks = links.filter(({ label }) => filterByResolution(label, targetResolutions));

  if (!filteredLinks.length) {
    console.log(`${colors.yellow}Tidak ada link matching resolusi ${Array.from(targetResolutions).join(', ')}P.${colors.reset}`);
    return;
  }

  // Dedup goUrl — kusonime sering pakai shortlink sama untuk banyak tombol
  const seenGoUrls = new Set();
  const uniqueLinks = filteredLinks.filter(({ goUrl }) => {
    if (seenGoUrls.has(goUrl)) return false;
    seenGoUrls.add(goUrl);
    return true;
  });

  console.log(`${colors.green}Ditemukan ${colors.bright}${filteredLinks.length}${colors.reset}${colors.green} link (${colors.bright}${uniqueLinks.length}${colors.reset}${colors.green} unik). Memproses...${colors.reset}\n`);

  // Calculate max label length for column alignment
  let maxLabelLen = 0;
  for (const { label } of uniqueLinks) {
    if (label.length > maxLabelLen) maxLabelLen = label.length;
  }
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
      
      const filteredExtracted = extracted.filter(({ label: jpLabel }) => filterByResolution(jpLabel, targetResolutions));
      for (const { label: jpLabel, url: jpUrl } of filteredExtracted) {
        const finalUrl = await bypass(jpUrl);
        const paddedLabel = `[${jpLabel}]`.padEnd(maxLabelLen + 2);
        console.log(`${colors.green}${paddedLabel}${colors.reset} ${link(finalUrl)}`);
      }
    } else {
      // Sudah final atau shortlink lain
      const paddedLabel = `[${label}]`.padEnd(maxLabelLen + 2);
      console.log(`${colors.green}${paddedLabel}${colors.reset} ${link(resolved)}`);
    }
  }

  console.log(`\n${colors.bright}${colors.cyan}Selesai.${colors.reset}\n`);
}

function askUrl(rl) {
  rl.question(`${colors.bright}Masukkan URL Kusonime [opsi: --360 --480 --720 --1080 --3840] (atau 'q' untuk keluar): ${colors.reset}`, async (answer) => {
    const input = answer.trim();
    if (input.toLowerCase() === 'q' || input.toLowerCase() === 'exit') {
      rl.close();
      return;
    }

    if (input) {
      const parts = input.split(/\s+/);
      const { targetResolutions, url } = parseArgs(parts);
      if (url) {
        await runBypass(url, targetResolutions);
      } else {
        console.log(`${colors.red}URL tidak valid.${colors.reset}`);
      }
    }
    
    askUrl(rl);
  });
}

async function main() {
  const { targetResolutions, url } = parseArgs(process.argv.slice(2));

  if (url) {
    await runBypass(url, targetResolutions);
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
