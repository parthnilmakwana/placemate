const https = require('https');

https.get('https://fonts.googleapis.com/css?family=Roboto:400,500,700|Merriweather:400,700', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko'
  }
}, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => console.log(data));
});
