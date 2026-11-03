const { requestGoogle } = require('./google');

function buildOrderHtml(d) {
  const v = (val) => (val && val !== '' && val !== 'undefined') ? String(val).replace(/</g,'&lt;').replace(/>/g,'&gt;') : '';
  const vc = (val, expected) => (v(val).toLowerCase() === expected.toLowerCase()) ? 'checked' : '';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; font-family: Arial, sans-serif; }
  body { width: 210mm; background: #fff; color: #000; font-size: 11px; line-height: 1.3; }
  .page { width: 210mm; min-height: 297mm; padding: 10mm 15mm; page-break-after: always; position: relative; background-color: #f2f7ec; }
  .header { text-align: center; color: #4a6fa5; font-size: 20px; letter-spacing: 2px; margin-bottom: 15px; text-transform: uppercase; font-weight: bold; }
  .flex { display: flex; }
  .space-between { justify-content: space-between; }
  .mb-10 { margin-bottom: 8px; }
  .border-box { border: 1px solid #4a6fa5; border-radius: 4px; padding: 8px; margin-bottom: 10px; background: #fff; }
  .title { font-weight: bold; color: #1e3a8a; margin-bottom: 6px; font-size: 12px; }
  .field { margin-bottom: 4px; }
  .label { font-weight: bold; color: #475569; }
  .val { color: #0369a1; font-weight: 600; }
</style>
</head>
<body>
  <div class="page">
    <div class="header">AMERICAN HAIRLINE - ORDER FORM</div>
    <div class="flex space-between mb-10">
      <div><strong>Order No:</strong> <span class="val">${v(d.orderNumber)}</span></div>
      <div><strong>Order Date:</strong> <span class="val">${v(d.orderDate)}</span></div>
      <div><strong>Delivery Date:</strong> <span class="val">${v(d.deliveryDate)}</span></div>
    </div>
    
    <div class="border-box">
      <div class="title">1. CLIENT & BRANCH DETAILS</div>
      <div class="flex space-between">
        <div class="field"><span class="label">Client Name:</span> <span class="val">${v(d.clientName)}</span></div>
        <div class="field"><span class="label">Contact:</span> <span class="val">${v(d.contactNo)}</span></div>
        <div class="field"><span class="label">City:</span> <span class="val">${v(d.city)}</span></div>
        <div class="field"><span class="label">Branch:</span> <span class="val">${v(d.branch)}</span></div>
      </div>
      <div class="flex space-between" style="margin-top:6px;">
        <div class="field"><span class="label">Consultation By:</span> <span class="val">${v(d.consultationBy)}</span></div>
        <div class="field"><span class="label">Technician:</span> <span class="val">${v(d.technicianName)}</span></div>
        <div class="field"><span class="label">Wearer Type:</span> <span class="val">${v(d.existingWearer)}</span></div>
      </div>
    </div>

    <div class="border-box">
      <div class="title">2. CONSULTATION & HAIR SPECIFICATIONS</div>
      <div class="flex space-between">
        <div class="field"><span class="label">Preference:</span> <span class="val">${v(d.clientPreference)}</span></div>
        <div class="field"><span class="label">Density:</span> <span class="val">${v(d.consultDensity || d.density)}</span></div>
        <div class="field"><span class="label">Hairline:</span> <span class="val">${v(d.consultHairline || d.techHairline)}</span></div>
        <div class="field"><span class="label">Hairstyle:</span> <span class="val">${v(d.hairstyle)}</span></div>
      </div>
      <div class="flex space-between" style="margin-top:6px;">
        <div class="field"><span class="label">Base:</span> <span class="val">${v(d.consultBase || d.baseType)}</span></div>
        <div class="field"><span class="label">Life:</span> <span class="val">${v(d.life)}</span></div>
        <div class="field"><span class="label">Size:</span> <span class="val">${v(d.size)}</span></div>
        <div class="field"><span class="label">Work Type:</span> <span class="val">${v(d.workType)}</span></div>
      </div>
    </div>

    <div class="border-box">
      <div class="title">3. TECHNICIAN MEASUREMENTS & SPECIFICATIONS</div>
      <div class="flex space-between">
        <div class="field"><span class="label">Top:</span> <span class="val">${v(d.top)} in</span></div>
        <div class="field"><span class="label">Front:</span> <span class="val">${v(d.front)} in</span></div>
        <div class="field"><span class="label">Side:</span> <span class="val">${v(d.side)} in</span></div>
        <div class="field"><span class="label">Back:</span> <span class="val">${v(d.back)} in</span></div>
      </div>
      <div class="flex space-between" style="margin-top:6px;">
        <div class="field"><span class="label">Hair Length:</span> <span class="val">${v(d.hairLength)}</span></div>
        <div class="field"><span class="label">Parting:</span> <span class="val">${v(d.parting)}</span></div>
        <div class="field"><span class="label">Front Shape:</span> <span class="val">${v(d.hairlineShaped)}</span></div>
        <div class="field"><span class="label">Client Hairline:</span> <span class="val">${v(d.clientHairline)}</span></div>
      </div>
    </div>

    <div class="border-box">
      <div class="title">4. PAYMENT DETAILS</div>
      <div class="flex space-between">
        <div class="field"><span class="label">Total Amount:</span> <span class="val">₹${v(d.totalBillAmount)}</span></div>
        <div class="field"><span class="label">Advance Paid:</span> <span class="val">₹${v(d.advancePaid)}</span></div>
        <div class="field"><span class="label">Balance Payable:</span> <span class="val">₹${v(d.balancePayable)}</span></div>
        <div class="field"><span class="label">Mode:</span> <span class="val">${v(d.paymentDoneBy)}</span></div>
      </div>
      <div class="flex space-between" style="margin-top:6px;">
        <div class="field"><span class="label">GST %:</span> <span class="val">${v(d.gstPercentage)}%</span></div>
        <div class="field"><span class="label">GST Amount:</span> <span class="val">₹${v(d.gstAmountCharged)}</span></div>
        <div class="field"><span class="label">Rush Charges:</span> <span class="val">₹${v(d.rushOrderCharges)}</span></div>
        <div class="field"><span class="label">Changes:</span> <span class="val">${v(d.changesInPayment)}</span></div>
      </div>
    </div>

    <div class="border-box">
      <div class="title">5. AFTERWORK & NOTES</div>
      <div class="field"><span class="label">To Do Afterwork:</span> <span class="val">${v(d.toDoAfterwork)}</span></div>
      <div class="field" style="margin-top:4px;"><span class="label">Special Notes:</span> <span class="val">${v(d.specialNotes)}</span></div>
      <div class="field" style="margin-top:4px;"><span class="label">Payment Notes:</span> <span class="val">${v(d.notes2)}</span></div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Regenerates the PDF in Google Drive
 */
async function syncPdfToDrive(orderData) {
  try {
    const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || '1fkoqNh-26LdbaOxTD7kC3glmd3AtgdIc';
    const orderNumber = orderData.orderNumber || 'AHL-ORDER';
    const fileName = `${orderNumber}.html`;

    const htmlContent = buildOrderHtml(orderData);

    // 1. Search if an existing file with this name exists in Drive
    const q = encodeURIComponent(`name = '${orderNumber}' or name = '${fileName}' or name = '${orderNumber}.pdf'`);
    const searchRes = await requestGoogle(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,webViewLink)`);
    const existingFile = searchRes.data?.files?.[0];

    if (existingFile) {
      // Update existing file content
      const uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=media`;
      await requestGoogle(uploadUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'text/html' },
        body: htmlContent
      });
      return existingFile.webViewLink || `https://drive.google.com/file/d/${existingFile.id}/view`;
    } else {
      // Create new file
      const createRes = await requestGoogle('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        body: {
          name: `${orderNumber}.html`,
          parents: [rootFolderId]
        }
      });
      if (createRes.data?.id) {
        const fileId = createRes.data.id;
        await requestGoogle(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'text/html' },
          body: htmlContent
        });
        return `https://drive.google.com/file/d/${fileId}/view`;
      }
    }
    return '';
  } catch (err) {
    console.warn('PDF Drive Sync warning:', err.message);
    return orderData.pdfUrl || '';
  }
}

module.exports = {
  buildOrderHtml,
  syncPdfToDrive
};

