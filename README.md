# Kusonime Shortlink Bypass

Alat untuk bypass shortlink download Kusonime dan mencetak direct download URL (Google Drive, Mega.nz, Acefile, Buzzheavier, Krakenfiles, Megaup, Terabox, dll).

## Fitur

- Scrape tabel download Kusonime secara otomatis
- Decode Base64 redirect (`/go/?url=`)
- Bypass `s.id` → `justpaste.it` → extract semua link per resolusi
- Bypass `tpi.li` / `shrink.pe` / `shrinkme.io` via token HTML (cepat, tanpa browser)
- Fallback Playwright headless jika token tidak ditemukan
- Bypass `ouo.io` via POST request
- Follow redirect shortlink umum (`tinyurl`, `bit.ly`)
- Dedup otomatis link yang sama

## Instalasi

```bash
npm install
```

Playwright hanya dipakai sebagai fallback. Jika ingin menyiapkannya:

```bash
npx playwright install chromium
```

## Cara Penggunaan

```bash
node index.js https://kusonime.com/tensura-s4-batch-sub-indo/
```

Tanpa argumen → default ke Tensura S4 Batch.

### Contoh Output

```
Scraping: https://kusonime.com/tensura-s4-batch-sub-indo/

Ditemukan 28 link (3 unik). Memproses...

[360P | GoogleSharer] https://acefile.co/f/...
[360P | GoogleDrive]  https://drive.usercontent.google.com/...
[360P | Mega.nz]      https://mega.nz/file/...
[480P | GoogleSharer] https://acefile.co/f/...
...

Selesai.
```

### Test Single Link

```bash
node test-single.js https://tpi.li/7qaCbi
```

## Shortlink yang Didukung

| Provider | Metode |
|---|---|
| `kusonime.com/go/` | Decode Base64 |
| `s.id` | Follow redirect HTTP |
| `justpaste.it` | Scrape + decode redirect URL |
| `tpi.li` | Ekstrak token dari HTML (axios) |
| `shrink.pe` / `shrinkme.io` | Ekstrak token dari HTML (axios), fallback Playwright |
| `ouo.io` | POST dengan form token |
| `tinyurl.com` / `bit.ly` | Follow redirect HTTP |
