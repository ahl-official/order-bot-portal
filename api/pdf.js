const { lookupOrder } = require('../services/google');
const { buildOrderHtml } = require('../services/pdfBuilder');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const url = new URL(req.url, 'http://localhost');
    const orderNumber = (url.searchParams.get('orderNumber') || url.searchParams.get('orderId') || url.searchParams.get('q') || '').trim();

    if (!orderNumber) {
      return res.status(400).send('<h2>Error: Please provide ?orderNumber=AHL-XXXX</h2>');
    }

    const orderRecord = await lookupOrder(orderNumber);
    if (!orderRecord || !orderRecord.orderData) {
      return res.status(404).send(`<h2>Error: Order ${orderNumber} not found in Google Sheets</h2>`);
    }

    let html = await buildOrderHtml(orderRecord.orderData);

    // Inject print toolbar and auto-print styling
    const printToolbar = `
    <div id="printToolbar" style="background:#1e293b; color:#fff; padding:10px 16px; display:flex; justify-content:space-between; align-items:center; position:sticky; top:0; z-index:9999; box-shadow:0 2px 8px rgba(0,0,0,0.2); font-family:sans-serif;">
      <div style="font-size:14px; font-weight:600;">
        📋 Order ${orderRecord.orderNumber} &bull; ${orderRecord.orderData.clientName || 'Client'} (${orderRecord.orderData.branch || 'Mumbai'}) &bull; <span style="color:#4ade80;">Live Updated</span>
      </div>
      <div style="display:flex; gap:10px;">
        <button onclick="window.print()" style="background:#2563eb; color:#fff; border:none; padding:7px 16px; border-radius:6px; font-weight:600; cursor:pointer; font-size:13px;">🖨️ Print / Save as PDF</button>
        <button onclick="window.close()" style="background:#475569; color:#fff; border:none; padding:7px 14px; border-radius:6px; font-weight:600; cursor:pointer; font-size:13px;">✕ Close</button>
      </div>
    </div>
    <style>
      @media print {
        #printToolbar { display: none !important; }
        body { margin: 0 !important; }
      }
    </style>
    `;

    html = html.replace('<body>', '<body>' + printToolbar);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  } catch (error) {
    console.error('API PDF Error:', error);
    return res.status(500).send('<h2>Internal Server Error generating PDF: ' + error.message + '</h2>');
  }
};
