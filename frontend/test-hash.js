const crypto = require('crypto');

const username = 'fatuma@example.com';
const clientId = '2grn8ckja99d2ji9vo1hdsr8c5';
const clientSecret = '1lug5334o6jgfrii48iqqqek1099ld15fnsij2h3tr86rfcu2q5';

const message = username + clientId;
const hmac = crypto.createHmac('sha256', clientSecret);
hmac.update(message);
const hash = hmac.digest('base64');

console.log('SECRET_HASH:', hash);