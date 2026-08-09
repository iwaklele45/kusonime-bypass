const { bypass } = require('./src/bypass');

// ANSI Colors
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  red: "\x1b[31m",
};

function link(url) {
  return `\x1b]8;;${url}\x1b\\${url}\x1b]8;;\x1b\\`;
}

const url = process.argv[2] || 'https://tpi.li/7qaCbi';
console.log(`${colors.bright}${colors.cyan}Bypassing single link:${colors.reset} ${url}`);

bypass(url).then(res => {
  console.log(`${colors.green}Result:${colors.reset} ${link(res)}`);
}).catch(err => {
  console.error(`${colors.red}Error:${colors.reset} ${err.message}`);
});
