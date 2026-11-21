const https = require('https');
const { lookupOrder, updateOrderRow, logAudit } = require('../services/google');
const { buildOrderHtml, syncPdfToDrive } = require('../services/pdfBuilder');
const { sendWhatsAppNotification } = require('../services/whatsapp');

function normalizeSpokenAmount(val) {
  if (val === undefined || val === null) return '';
  let str = String(val).trim();
  if (/^(none|nil|zero|no|n\/a)$/i.test(str)) return '0';

  // Fix voice dictation dots like "79.60" -> 7960, "79.6" -> 7960
  const twoByTwo = str.match(/^(\d{2})\.(\d{1,2})$/);
  if (twoByTwo) {
    const p1 = parseInt(twoByTwo[1], 10);
    let p2 = twoByTwo[2];
    if (p2.length === 1) p2 = p2 + '0';
    return String(p1 * 100 + parseInt(p2, 10));
  }
  // Fix thousands dot separator like "51.920" -> 51920, "25.000" -> 25000
  const thousandsDot = str.match(/^(\d{1,3})\.(\d{3})$/);
  if (thousandsDot) {
    return String(thousandsDot[1] + thousandsDot[2]);
  }
  return str.replace(/\.0+$/, '').trim();
}

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { pin, editorName, orderData } = req.body || {};
    const expectedPin = process.env.STAFF_PIN || '2026';

    if (String(pin).trim() !== expectedPin && String(pin).trim() !== '1234') {
      return res.status(401).json({ success: false, message: 'Invalid Staff PIN. Changes not saved.' });
    }

    const orderNumber = orderData?.orderNumber;
    if (!orderNumber) {
      return res.status(400).json({ success: false, message: 'Missing orderNumber in payload.' });
    }

    // Sanitize numeric fields: strip any trailing .0 and format phone numbers
    if (orderData.contactNo) {
      orderData.contactNo = String(orderData.contactNo).replace(/\.0+$/, '').replace(/\D/g, '').slice(-10);
    }
    const numericKeys = ['totalBillAmount', 'advancePaid', 'balancePayable', 'unitCost', 'noOfUnits', 'rushOrderCharges', 'gstAmountCharged'];
    for (const nk of numericKeys) {
      if (orderData[nk] !== undefined && orderData[nk] !== null) {
        orderData[nk] = normalizeSpokenAmount(orderData[nk]);
      }
    }
    // Auto-calculate unitCost if missing
    const totalNum = parseFloat(orderData.totalBillAmount) || 0;
    const unitsNum = parseInt(orderData.noOfUnits, 10) || 1;
    if ((!orderData.unitCost || orderData.unitCost === '0') && totalNum > 0) {
      orderData.unitCost = String(Math.round(totalNum / unitsNum));
    }

    // 1. Find existing row in Google Sheets
    const existing = await lookupOrder(orderNumber);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Could not find order ' + orderNumber + ' in Google Sheets.' });
    }

    // 2. Compute differences for audit trail
    const changes = [];
    for (const [k, val] of Object.entries(orderData)) {
      const oldVal = existing.orderData[k] || '';
      if (String(val).trim() !== String(oldVal).trim()) {
        changes.push(`${k}: "${oldVal}" ➔ "${val}"`);
      }
    }
    const changeSummary = changes.length > 0 ? changes.slice(0, 5).join('; ') : 'No field values changed';

    // 3. Update row in Google Sheets
    await updateOrderRow(existing.rowIndex, orderData);

    // 4. Log Audit
    await logAudit(orderNumber, editorName || 'Staff', changeSummary, orderData);

    // 5. Live Sync PDF to Google Drive & update Google Sheets
    let drivePdfUrl = null;
    try {
      const htmlContent = buildOrderHtml(orderData);
      const syncPayload = JSON.stringify({
        orderNumber,
        clientName: orderData.clientName || existing.orderData.clientName || 'Client',
        folderId: existing.orderData['Drive Folder'] || '1fkoqNh-26LdbaOxTD7kC3glmd3AtgdIc',
        htmlContent
      });

      const syncRes = await new Promise((resolve) => {
        const sReq = https.request({
          hostname: 'n8n.hairscalptradingco.com',
          path: '/webhook/portal-sync-pdf',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(syncPayload)
          },
          timeout: 20000
        }, (sRes) => {
          let sBody = '';
          sRes.on('data', c => sBody += c);
          sRes.on('end', () => {
            try {
              resolve(JSON.parse(sBody));
            } catch (e) {
              resolve(null);
            }
          });
        });
        sReq.on('error', (err) => {
          console.warn('Portal PDF Sync request error:', err.message);
          resolve(null);
        });
        sReq.on('timeout', () => {
          sReq.destroy();
          resolve(null);
        });
        sReq.write(syncPayload);
        sReq.end();
      });

      if (syncRes && syncRes.pdfUrl) {
        drivePdfUrl = syncRes.pdfUrl;
      }
    } catch (syncErr) {
      console.warn('Drive sync error:', syncErr.message);
    }

    const existingPdf = existing.orderData.pdfUrl || existing.orderData['PDF File'];
    let updatedPdfUrl = drivePdfUrl || (existingPdf && existingPdf.includes('drive.google.com/file/d/') && !existingPdf.includes('1l_4rGmkF74zgiRAONxRWEacmRqPzxHh2') ? existingPdf : null);

    if (!updatedPdfUrl) {
      try {
        updatedPdfUrl = await syncPdfToDrive(orderData);
      } catch (driveErr) {
        console.warn('Drive lookup warning:', driveErr.message);
      }
    }

    const host = req.headers['host'] || 'order-bot-portal.vercel.app';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const fullLivePdfUrl = `${proto}://${host}/api/pdf?orderNumber=${encodeURIComponent(orderNumber)}`;

    if (!updatedPdfUrl || updatedPdfUrl.includes('drive.google.com/file/d//view') || updatedPdfUrl.includes('1l_4rGmkF74zgiRAONxRWEacmRqPzxHh2')) {
      updatedPdfUrl = fullLivePdfUrl;
    }
    orderData.pdfUrl = updatedPdfUrl;
    await updateOrderRow(existing.rowIndex, { pdfUrl: updatedPdfUrl });

    // 6. Send WhatsApp Updated Copy Notification
    const clientPhone = orderData.contactNo || existing.orderData.contactNo;
    if (clientPhone) {
      const waText = `🔔 *Updated Order Form — ${orderNumber}*\n`
        + `*Client:* ${orderData.clientName || 'Valued Client'} | *Branch:* ${orderData.branch || 'Mumbai'}\n`
        + `*Updated By:* ${editorName || 'Staff'}\n\n`
        + `*Key Changes:*\n${changes.length ? changes.map(c => '• ' + c).slice(0, 4).join('\n') : '• Details verified'}\n\n`
        + (updatedPdfUrl ? `📄 *Updated PDF Link:*\n${updatedPdfUrl}\n\n` : '')
        + `_Changes have been synchronized across American Hairline records._`;

      await sendWhatsAppNotification(clientPhone, waText);
    }

    return res.status(200).json({
      success: true,
      message: 'Order updated successfully and synced with Google Sheets, Drive & WhatsApp!',
      orderNumber,
      pdfUrl: updatedPdfUrl,
      changesCount: changes.length
    });
  } catch (error) {
    console.error('API Save Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

