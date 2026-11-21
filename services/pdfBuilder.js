const { requestGoogle } = require('./google');

function buildOrderHtml(d) {
  const orderNum = d.orderNumber || d['Order Number'] || 'AHL-XXXX';
  const esc = v => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const val = (k, altKey = '', f = '') => {
    let x = d[k];
    if (x === undefined || x === null || String(x).trim() === '') {
      if (altKey) x = d[altKey];
    }
    return (x === undefined || x === null || String(x).trim() === '') ? f : esc(x);
  };
  const amount = (k, altKey = '', f = '') => {
    let x = d[k];
    if (x === undefined || x === null || String(x).trim() === '') {
      if (altKey) x = d[altKey];
    }
    if (x === undefined || x === null || String(x).trim() === '') return f;
    const n = Number(String(x).replace(/[^0-9.-]/g, ''));
    return Number.isFinite(n) ? n.toLocaleString('en-IN') : esc(x);
  };

  function getDriveDirectImg(url) {
    if (!url) return '';
    const m1 = String(url).match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (m1) return 'https://lh3.googleusercontent.com/d/' + m1[1];
    const m2 = String(url).match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (m2) return 'https://lh3.googleusercontent.com/d/' + m2[1];
    return url;
  }

  const mediaFields = [
    ['Front photo', 'uploadClientPhotoFront', 'Upload Client Photo - Front'],
    ['Top photo', 'uploadClientPhotoTop', 'Upload Client Photo - Top'],
    ['Left photo', 'uploadClientPhotoLeft', 'Upload Client Photo - Left'],
    ['Right photo', 'uploadClientPhotoRight', 'Upload Client Photo - Right'],
    ['Back photo', 'uploadClientPhotoBack', 'Upload Client Photo - Back'],
    ['Mould picture', 'clientMouldPhoto', 'Client Mould Photo'],
    ['Demo unit picture', 'demoPicture', 'Demo Picture'],
    ['Client after demo', 'clientConsentFormPage1', 'Client Consent Form Page 1']
  ];

  const activePhotos = mediaFields.map(([label, k1, k2]) => {
    const originalUrl = String(d[k1] || d[k2] || '').trim();
    if (!originalUrl) return null;
    return { label, url: getDriveDirectImg(originalUrl) };
  }).filter(Boolean);

  let photoTableHtml = '';
  if (activePhotos.length > 0) {
    const colsPerRow = 4;
    let rowsHtml = '';
    for (let i = 0; i < activePhotos.length; i += colsPerRow) {
      const chunk = activePhotos.slice(i, i + colsPerRow);
      let cells = '';
      chunk.forEach(photo => {
        const imgTag = '<img src="' + photo.url + '" width="115" height="115" style="width:115px;height:115px;object-fit:cover;border:1px solid #cbd5e1;border-radius:4px;display:block;margin:0 auto;" onerror="this.style.display=\'none\';" />';
        cells += '<td align="center" style="width:25%;vertical-align:top;padding:4px 3px;border:none;">'
          + imgTag
          + '<div style="font-size:7.5pt;font-weight:bold;margin-top:3px;color:#1e293b;">' + esc(photo.label) + '</div>'
          + '</td>';
      });
      for (let j = chunk.length; j < colsPerRow; j++) {
        cells += '<td style="width:25%;border:none;"></td>';
      }
      rowsHtml += '<tr>' + cells + '</tr>';
    }
    photoTableHtml = '<table border="0" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin-top:6px;border:none;">' + rowsHtml + '</table>';
  } else {
    photoTableHtml = '<p style="font-size:8pt;margin:6px 0;color:#64748b;">No client photos attached.</p>';
  }

  const html = '<!DOCTYPE html><html><head><meta charset="utf-8">'
    + '<title>Order Form - ' + esc(orderNum) + '</title>'
    + '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
    + '<style>'
    + '@page { size: A4 portrait; margin: 0; }'
    + '* { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }'
    + 'html, body { margin: 0; padding: 0; background: #525659; font-family: Arial, Helvetica, sans-serif; font-size: 8.5pt; line-height: 1.18; color: #000; }'
    + '.a4-container { display: flex; flex-direction: column; align-items: center; padding: 24px 0 40px 0; gap: 24px; }'
    + '.a4-page { width: 210mm; min-height: 297mm; height: 297mm; background: #ffffff; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4); padding: 11mm 15mm 11mm 15mm; position: relative; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; }'
    + '.page-content { flex: 1; display: flex; flex-direction: column; }'
    + '.page-footer { border-top: 1px solid #cbd5e1; padding-top: 4px; margin-top: 4px; font-size: 7.5pt; color: #64748b; display: flex; justify-content: space-between; align-items: center; }'
    + 'table, tr, td, th { border: none !important; border-width: 0 !important; outline: none !important; }'
    + '.title { text-align: center; font-size: 14pt; font-weight: bold; margin: 0 0 4px 0; letter-spacing: 0.5px; text-transform: uppercase; color: #0f172a; }'
    + '.bar-blue { border-top: 1.5px solid #2b6cb0; border-bottom: 1.5px solid #2b6cb0; color: #2b6cb0; font-weight: bold; font-size: 8.5pt; padding: 1.5px 0; margin: 3px 0 2px 0; text-transform: uppercase; letter-spacing: 0.3px; }'
    + '.bar-red { border-top: 1.5px solid #cc0000; border-bottom: 1.5px solid #cc0000; color: #cc0000; font-weight: bold; font-size: 8.5pt; padding: 1.5px 0; margin: 3px 0 2px 0; text-transform: uppercase; letter-spacing: 0.3px; }'
    + '.table-data { width: 100%; border-collapse: collapse; margin-bottom: 2px; border: none !important; }'
    + '.table-data td { padding: 0.5px 0; font-size: 8pt; font-weight: bold; vertical-align: top; line-height: 1.15; border: none !important; }'
    + '.table-data td.lbl { width: 250px; color: #1e293b; }'
    + '.table-data td.val { color: #000; }'
    + '.notes-box { padding: 1.5px 0; margin: 2px 0; font-size: 8pt; font-weight: bold; line-height: 1.15; border: none !important; color: #1e293b; }'
    + '.double-line { border-bottom: 2px double #2b6cb0; margin: 3px 0 2px 0; }'
    + '@media print {'
    + '  html, body { background: transparent !important; margin: 0 !important; padding: 0 !important; }'
    + '  .a4-container { padding: 0 !important; gap: 0 !important; }'
    + '  .a4-page { width: 210mm !important; height: 297mm !important; min-height: 297mm !important; margin: 0 !important; padding: 11mm 15mm 11mm 15mm !important; box-shadow: none !important; page-break-after: always !important; break-after: page !important; }'
    + '  #printToolbar { display: none !important; }'
    + '}'
    + '</style></head><body>'
    + '<div class="a4-container">'

    // ==================== PAGE 1 ====================
    + '<div class="a4-page" id="page-1">'
    + '<div class="page-content">'
    + '<div class="title">Order Form</div>'
    + '<div class="bar-blue">Client Details</div>'
    + '<table class="table-data" border="0" cellpadding="0" cellspacing="0">'
    + '<tr><td class="lbl">Name :</td><td class="val">' + val('clientName', 'Client Name') + '</td></tr>'
    + '<tr><td class="lbl">Order No :</td><td class="val">' + esc(orderNum) + '</td></tr>'
    + '<tr><td class="lbl">City :</td><td class="val">' + val('city', 'City') + '</td></tr>'
    + '<tr><td class="lbl">City Other :</td><td class="val">' + val('cityOther', 'City Other') + '</td></tr>'
    + '<tr><td class="lbl">Order Date :</td><td class="val">' + val('orderDate', 'Order Date') + '</td></tr>'
    + '<tr><td class="lbl">Delivery Date :</td><td class="val">' + val('deliveryDate', 'Delivery Date') + '</td></tr>'
    + '<tr><td class="lbl">Consultation By :</td><td class="val">' + val('consultationBy', 'Consultation By') + '</td></tr>'
    + '<tr><td class="lbl">Patch no :</td><td class="val">' + val('patchNo', 'Patch No', '1') + '</td></tr>'
    + '<tr><td class="lbl">Existing Wearer :</td><td class="val">' + val('existingWearer', 'Existing Wearer') + '</td></tr>'
    + '<tr><td class="lbl">Branch :</td><td class="val">' + val('branch', 'Branch') + '</td></tr>'
    + '<tr><td class="lbl">Technician Name :</td><td class="val">' + val('technicianName', 'Technician Name') + '</td></tr>'
    + '<tr><td class="lbl">Demo Given By :</td><td class="val">' + val('demoGivenBy', 'Demo Given By') + '</td></tr>'
    + '<tr><td class="lbl">Standard :</td><td class="val">' + val('standard', 'Standard') + '</td></tr>'
    + '</table>'

    + '<div class="bar-blue">As Discussed In Consultation</div>'
    + '<table class="table-data" border="0" cellpadding="0" cellspacing="0">'
    + '<tr><td class="lbl">Client Preference :</td><td class="val">' + val('clientPreference', 'Client Preference') + '</td></tr>'
    + '<tr><td class="lbl">Density :</td><td class="val">' + val('consultDensity', 'Density (Consultant)') + '</td></tr>'
    + '<tr><td class="lbl">Hairline :</td><td class="val">' + val('consultHairline', 'Hairline (Consultant)') + '</td></tr>'
    + '<tr><td class="lbl">Hairstyle :</td><td class="val">' + val('hairstyle', 'Hairstyle') + '</td></tr>'
    + '<tr><td class="lbl">Base :</td><td class="val">' + val('consultBase', 'Base (Consultant)') + '</td></tr>'
    + '<tr><td class="lbl">Life :</td><td class="val">' + val('life', 'Life (in Months)') + '</td></tr>'
    + '</table>'
    + '<div class="notes-box">Notes 1: ' + val('notes1', 'Notes 1 (From Consultant)', 'None') + '</div>'

    + '<div class="bar-blue">Payment Details</div>'
    + '<table class="table-data" border="0" cellpadding="0" cellspacing="0">'
    + '<tr><td class="lbl">Payment Done By :</td><td class="val">' + val('paymentDoneBy', 'Payment Done By') + '</td></tr>'
    + '<tr><td class="lbl">Total Bill amt :</td><td class="val">' + amount('totalBillAmount', 'Total Bill Amount') + '</td></tr>'
    + '<tr><td class="lbl">Unit cost :</td><td class="val">' + amount('unitCost', 'Unit Cost') + '</td></tr>'
    + '<tr><td class="lbl">Rush Order :</td><td class="val">' + amount('rushOrderCharges', 'Rush Order Charges') + '</td></tr>'
    + '<tr><td class="lbl">No of Units Booked :</td><td class="val">' + val('noOfUnits', 'No of Units Booked', '1') + '</td></tr>'
    + '<tr><td class="lbl">Advance Paid :</td><td class="val">' + amount('advancePaid', 'Advance Paid') + '</td></tr>'
    + '<tr><td class="lbl">Balance Payable :</td><td class="val">' + amount('balancePayable', 'Balance Payable') + '</td></tr>'
    + '<tr><td class="lbl">GST Percentage (%) :</td><td class="val">' + val('gstPercentage', 'GST Percentage') + '</td></tr>'
    + '<tr><td class="lbl">GST Amount Charged :</td><td class="val">' + amount('gstAmountCharged', 'GST Amount Charged') + '</td></tr>'
    + '<tr><td class="lbl">1st :</td><td class="val">' + amount('emi1Amount', 'Emi 1 Amount') + '</td></tr>'
    + '<tr><td class="lbl">Date :</td><td class="val">' + val('emi1Date', 'Emi 1 Date') + '</td></tr>'
    + '<tr><td class="lbl">2nd :</td><td class="val">' + amount('emi2Amount', 'Emi 2 Amount') + '</td></tr>'
    + '<tr><td class="lbl">Date :</td><td class="val">' + val('emi2Date', 'Emi 2 Date') + '</td></tr>'
    + '<tr><td class="lbl">3rd :</td><td class="val">' + amount('emi3Amount', 'Emi 3 Amount') + '</td></tr>'
    + '<tr><td class="lbl">Date :</td><td class="val">' + val('emi3Date', 'Emi 3 Date') + '</td></tr>'
    + '</table>'
    + '<div class="notes-box">Notes 2: ' + val('notes2', 'Notes 2 (Payment Details)', 'None') + '</div>'
    + '<div style="font-weight: bold; margin: 3px 0 2px 0; font-size: 8pt;">Client type - ' + val('clientStatus', 'Client Status', 'REGULAR') + '</div>'
    + '<div class="double-line"></div>'
    + '<table class="table-data" border="0" cellpadding="0" cellspacing="0">'
    + '<tr><td class="lbl">Pic Taken :</td><td class="val">' + val('picTaken', 'Pic Taken') + '</td></tr>'
    + '<tr><td class="lbl">Reason :</td><td class="val">' + val('picTakenReason', 'Pic Not Taken Reason') + '</td></tr>'
    + '<tr><td class="lbl">Video Taken :</td><td class="val">' + val('videoTaken', 'Video Taken') + '</td></tr>'
    + '</table>'
    + '</div>'
    + '<div class="page-footer">'
    + '<span>American Hairline &bull; Confidential Order Record</span>'
    + '<span>' + esc(orderNum) + ' &bull; Page 1 of 3</span>'
    + '</div>'
    + '</div>'

    // ==================== PAGE 2 ====================
    + '<div class="a4-page" id="page-2">'
    + '<div class="page-content">'
    + '<table class="table-data" border="0" cellpadding="0" cellspacing="0">'
    + '<tr><td class="lbl">Reason :</td><td class="val">' + val('videoTakenReason', 'Video Not Taken Reason') + '</td></tr>'
    + '<tr><td class="lbl">Mould Taken :</td><td class="val">' + val('mouldTaken', 'Mould Taken') + '</td></tr>'
    + '<tr><td class="lbl">Reason :</td><td class="val">' + val('mouldTakenReason', 'Mould Not Taken Reason') + '</td></tr>'
    + '<tr><td class="lbl">Picture of Demo Unit :</td><td class="val">' + val('picDemoUnit', 'Picture of Demo unit') + '</td></tr>'
    + '<tr><td class="lbl">Reason :</td><td class="val">' + val('picDemoUnitReason', 'Picture Demo Not Taken Reason') + '</td></tr>'
    + '<tr><td class="lbl">Client Picture After Given Demo :</td><td class="val">' + val('clientPicAfterDemo', 'Client picture after given demo') + '</td></tr>'
    + '<tr><td class="lbl">Reason :</td><td class="val">' + val('clientPicAfterDemoReason', 'Client Pic Not Taken Reason') + '</td></tr>'
    + '</table>'

    + '<div class="bar-red">Client Specification</div>'
    + '<table class="table-data" border="0" cellpadding="0" cellspacing="0">'
    + '<tr><td class="lbl">Size :</td><td class="val">' + val('size', 'Size') + '</td></tr>'
    + '<tr><td class="lbl">Size Other :</td><td class="val">' + val('sizeOther', 'Size Other') + '</td></tr>'
    + '<tr><td class="lbl">Base Type :</td><td class="val">' + val('baseType', 'Base Type') + '</td></tr>'
    + '<tr><td class="lbl">Code :</td><td class="val">' + val('code', 'Code') + '</td></tr>'
    + '<tr><td class="lbl">Colour :</td><td class="val">' + val('colour', 'Colour') + '</td></tr>'
    + '<tr><td class="lbl">Colour Other :</td><td class="val">' + val('targetColour', 'Target Colour') + '</td></tr>'
    + '<tr><td class="lbl">Grey (%) :</td><td class="val">' + val('grey', 'Grey (%)') + '</td></tr>'
    + '<tr><td class="lbl">Hairline of System :</td><td class="val">' + val('hairlineSystem', 'Hairline of system') + '</td></tr>'
    + '<tr><td class="lbl">Bleach Knots :</td><td class="val">' + val('blechKnots', 'Blech Knots') + '</td></tr>'
    + '<tr><td class="lbl">Work Type :</td><td class="val">' + val('workType', 'Work Type') + '</td></tr>'
    + '<tr><td class="lbl">Type of Density (Full Lace) :</td><td class="val">' + val('typeOfDensityFullLace', 'Type of Density (Full Lace)') + '</td></tr>'
    + '<tr><td class="lbl">Air Lace Amy :</td><td class="val">' + val('airLaceAmy', 'Air Lace Amy') + '</td></tr>'
    + '<tr><td class="lbl">Air Lace Nancy :</td><td class="val">' + val('airLaceNancy', 'Air Lace Nancy') + '</td></tr>'
    + '<tr><td class="lbl">Type of Density :</td><td class="val">' + val('typeOfDensity', 'Type of Density') + '</td></tr>'
    + '</table>'
    + '<div class="notes-box">Notes 3: ' + val('notes3', 'Notes 3 (Client Specifications)', 'None') + '</div>'
    + '<table class="table-data" border="0" cellpadding="0" cellspacing="0">'
    + '<tr><td class="lbl">Colour On System :</td><td class="val">' + val('colorOnSystem', 'Color On System', val('colour', 'Colour')) + '</td></tr>'
    + '<tr><td class="lbl">Colour On Client :</td><td class="val">' + val('colorOnClients', 'Color On Clients', val('colour', 'Colour')) + '</td></tr>'
    + '</table>'

    + '<div class="bar-red">To Do Afterwork</div>'
    + '<div class="notes-box">To Do Afterwork: ' + val('toDoAfterwork', 'To Do Afterwork', 'None') + '</div>'

    + '<div class="bar-blue">Pg. 3</div>'
    + '<table class="table-data" border="0" cellpadding="0" cellspacing="0">'
    + '<tr><td class="lbl">Density :</td><td class="val">' + val('density', 'Density (Technician)', val('consultDensity', 'Density (Consultant)')) + '</td></tr>'
    + '<tr><td class="lbl">Hair Length :</td><td class="val">' + val('hairLength', 'Hair Length') + '</td></tr>'
    + '<tr><td class="lbl">Top :</td><td class="val">' + val('top', 'Top') + '</td></tr>'
    + '<tr><td class="lbl">Front :</td><td class="val">' + val('front', 'Front') + '</td></tr>'
    + '<tr><td class="lbl">Side :</td><td class="val">' + val('side', 'Side') + '</td></tr>'
    + '<tr><td class="lbl">Back :</td><td class="val">' + val('back', 'Back') + '</td></tr>'
    + '<tr><td class="lbl">Parting :</td><td class="val">' + val('parting', 'Parting') + '</td></tr>'
    + '<tr><td class="lbl">Hairline :</td><td class="val">' + val('techHairline', 'Hairline (Technician)', val('consultHairline', 'Hairline (Consultant)')) + '</td></tr>'
    + '<tr><td class="lbl">Hairline Shape :</td><td class="val">' + val('hairlineShape', 'Hairline shape') + '</td></tr>'
    + '<tr><td class="lbl">Colour To Use On System :</td><td class="val">' + val('colourToUseOnSystem', 'Colour To use on system', val('colour', 'Colour')) + '</td></tr>'
    + '<tr><td class="lbl">Color on Hair Head :</td><td class="val">' + val('colourOnHairHead', 'Colour on Hair Head', val('colour', 'Colour')) + '</td></tr>'
    + '<tr><td class="lbl">Client Hairline :</td><td class="val">' + val('clientHairline', 'Client Hairline') + '</td></tr>'
    + '<tr><td class="lbl">Base Hairline :</td><td class="val">' + val('baseHairline', 'Base Hairline') + '</td></tr>'
    + '<tr><td class="lbl">Type Client :</td><td class="val">' + val('typeOfClient', 'Type of Client', 'Not Fussy') + '</td></tr>'
    + '<tr><td class="lbl">Bleach Knots :</td><td class="val">' + val('blechKnots', 'Blech Knots') + '</td></tr>'
    + '<tr><td class="lbl">Client Order Like :</td><td class="val">' + val('clientOrderLike', 'Client Order Like') + '</td></tr>'
    + '<tr><td class="lbl">Client Order Like (Other) :</td><td class="val">' + val('clientOrderLikeOther', 'Client Order Like Other') + '</td></tr>'
    + '</table>'
    + '</div>'
    + '<div class="page-footer">'
    + '<span>American Hairline &bull; Confidential Order Record</span>'
    + '<span>' + esc(orderNum) + ' &bull; Page 2 of 3</span>'
    + '</div>'
    + '</div>'

    // ==================== PAGE 3 ====================
    + '<div class="a4-page" id="page-3">'
    + '<div class="page-content">'
    + '<div class="notes-box">Notes 4: ' + val('notes4', 'Notes 4 (Technician)', 'None') + '</div>'
    + '<table class="table-data" border="0" cellpadding="0" cellspacing="0">'
    + '<tr><td class="lbl">As Per Date :</td><td class="val">' + val('asPerDate', 'As per Date') + '</td></tr>'
    + '<tr><td class="lbl">Hairline Shaped :</td><td class="val">' + val('hairlineShaped', 'Hairline Shaped') + '</td></tr>'
    + '<tr><td class="lbl">Hairline Shaped 2 :</td><td class="val">' + val('hairlineShaped2', 'Hairline Shaped 2') + '</td></tr>'
    + '<tr><td class="lbl">Type :</td><td class="val">' + val('clientPreference', 'Client Preference') + '</td></tr>'
    + '</table>'

    + '<div class="bar-red">Client History</div>'
    + '<div style="font-weight: bold; margin: 3px 0; font-size: 8pt; color:#475569;">No previous order history available.</div>'

    + '<div class="bar-blue">Client Photos</div>'
    + '<div style="font-size: 8pt; font-weight: bold; margin-bottom: 4px; color:#1e293b;">Order #' + esc(orderNum) + ' &bull; ' + val('orderDate', 'Order Date') + '</div>'
    + photoTableHtml
    + '</div>'
    + '<div class="page-footer">'
    + '<span>American Hairline &bull; Confidential Order Record</span>'
    + '<span>' + esc(orderNum) + ' &bull; Page 3 of 3</span>'
    + '</div>'
    + '</div>'

    + '</div>' // end .a4-container
    + '</body></html>';

  return html;
}

/**
 * Searches and syncs the PDF in Google Drive
 */
async function syncPdfToDrive(orderData) {
  try {
    const orderNumber = String(orderData.orderNumber || orderData['Order Number'] || '').trim();
    if (!orderNumber) return null;

    // 1. Check if the order data already carries a valid Google Drive PDF link
    const existingLink = orderData.pdfUrl || orderData['PDF File'];
    if (existingLink && existingLink.includes('drive.google.com/file/d/') && !existingLink.includes('1l_4rGmkF74zgiRAONxRWEacmRqPzxHh2')) {
      return existingLink;
    }

    // 2. Query Drive for a real PDF matching this order number
    const q = encodeURIComponent(`name contains '${orderNumber}' and mimeType = 'application/pdf' and trashed = false`);
    const searchRes = await requestGoogle(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,mimeType,webViewLink)`);
    const existingFile = searchRes.data?.files?.[0];

    if (existingFile && existingFile.webViewLink) {
      return existingFile.webViewLink;
    }

    // 3. Fallback: Search for any non-trashed file containing the order number
    const qAll = encodeURIComponent(`name contains '${orderNumber}' and trashed = false`);
    const searchResAll = await requestGoogle(`https://www.googleapis.com/drive/v3/files?q=${qAll}&fields=files(id,name,mimeType,webViewLink)`);
    const matched = (searchResAll.data?.files || []).find(f => f.mimeType === 'application/pdf');
    if (matched && matched.webViewLink) {
      return matched.webViewLink;
    }

    return null;
  } catch (err) {
    console.error('Error syncing PDF to Drive:', err);
    return null;
  }
}

module.exports = {
  buildOrderHtml,
  syncPdfToDrive
};
