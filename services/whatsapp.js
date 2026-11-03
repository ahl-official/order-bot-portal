const https = require('https');

function getWahaConfig() {
  return {
    baseUrl: process.env.WAHA_BASE_URL || 'https://waha.hairscalptradingco.com',
    apiKey: process.env.WAHA_API_KEY || 'key_WJ6tR4MUcsaVC9xak0VQLqxIHrd8yl7A',
    session: process.env.WAHA_SESSION_NAME || 'ahlaiteam'
  };
}

/**
 * Send an updated order notification to WhatsApp via WAHA
 */
function sendWhatsAppNotification(phone, messageText) {
  return new Promise((resolve) => {
    try {
      const config = getWahaConfig();
      const cleanPhone = String(phone || '').replace(/\D/g, '');
      const fullPhone = cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone.slice(-10);
      const chatId = fullPhone + '@c.us';

      const postData = JSON.stringify({
        session: config.session,
        chatId: chatId,
        text: messageText
      });

      const parsedUrl = new URL(`${config.baseUrl}/api/sendText`);
      const req = https.request(parsedUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          ...(config.apiKey ? { 'X-Api-Key': config.apiKey } : {})
        }
      }, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
          resolve({ status: res.statusCode, data });
        });
      });

      req.on('error', (err) => {
        console.warn('WAHA dispatch network error:', err.message);
        resolve({ status: 500, error: err.message });
      });

      req.write(postData);
      req.end();
    } catch (e) {
      console.warn('WAHA notification failed:', e.message);
      resolve({ status: 500, error: e.message });
    }
  });
}

module.exports = {
  sendWhatsAppNotification
};

