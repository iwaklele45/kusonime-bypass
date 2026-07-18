const { bypass } = require('./src/bypass');

// ANSI Colors
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  red: "\x1b[31m",
};

const url = process.argv[2] || 'https://tpi.li/7qaCbi';
console.log(`${colors.bright}${colors.cyan}Bypassing single link:${colors.reset} ${url}`);

bypass(url).then(res => {
  console.log(`${colors.green}Result:${colors.reset} ${res}`);
}).catch(err => {
  console.error(`${colors.red}Error:${colors.reset} ${err.message}`);
});
