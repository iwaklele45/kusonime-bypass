const { bypass } = require('./src/bypass');

const url = process.argv[2] || 'https://tpi.li/7qaCbi';
console.log(`Bypassing single link: ${url}`);

bypass(url).then(res => {
  console.log(`Result: ${res}`);
}).catch(err => {
  console.error(`Error: ${err.message}`);
});
