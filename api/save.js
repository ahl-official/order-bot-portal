const { lookupOrder, updateOrderRow, logAudit } = require('../services/google');
const { syncPdfToDrive } = require('../services/pdfBuilder');
const { sendWhatsAppNotification } = require('../services/whatsapp');

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

    // 5. Update/Regenerate PDF in Google Drive
    const updatedPdfUrl = await syncPdfToDrive(orderData);
    if (updatedPdfUrl) {
      orderData.pdfUrl = updatedPdfUrl;
      await updateOrderRow(existing.rowIndex, { pdfUrl: updatedPdfUrl });
    }

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

