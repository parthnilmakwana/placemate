const https = require('https');

https.get('https://fonts.googleapis.com/css?family=Roboto:400,500,700|Merriweather:400,700', {
  headers: {
    'User-Agent': 'wget'
  }
}, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => console.log(data));
});
