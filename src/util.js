// Detect provider dari URL + utility functions

const PROVIDERS = {
  kusonime: /kusonime\.com\/go\//,
  ouo: /ouo\.io/,
  shrinkpe: /shrink\.(pe|me)|shrinkme\.io/,
  sid: /s\.id\//,
  tinyurl: /tinyurl\.com/,
  bitly: /bit\.ly\//,
  justpaste: /justpaste\.it/,
  tpili: /tpi\.li/,
};

function detectProvider(url) {
  for (const [name, pattern] of Object.entries(PROVIDERS)) {
    if (pattern.test(url)) return name;
  }
  return 'direct';
}

function isFinalUrl(url) {
  return /drive\.google\.com|pixeldrain\.com|krakenfiles\.com|mega\.nz|terabox\.com|buzzheavier\.com|1024terabox\.com|megaup\.net|acefile\.co/i.test(url);
}

module.exports = { detectProvider, isFinalUrl };
