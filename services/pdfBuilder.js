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
        const imgTag = '<img src="' + photo.url + '" width="115" height="115" style="width:115px;height:115px;object-fit:cover;border:none;display:block;margin:0 auto;" onerror="this.style.display=\'none\';" />';
        cells += '<td align="center" style="width:25%;vertical-align:top;padding:4px 3px;border:none !important;">'
          + imgTag
          + '<div style="font-size:8pt;font-weight:bold;margin-top:3px;color:#000;">' + esc(photo.label) + '</div>'
          + '</td>';
      });
      for (let j = chunk.length; j < colsPerRow; j++) {
        cells += '<td style="width:25%;border:none !important;"></td>';
      }
      rowsHtml += '<tr>' + cells + '</tr>';
    }
    photoTableHtml = '<table border="0" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin-top:6px;border:none !important;">' + rowsHtml + '</table>';
  } else {
    photoTableHtml = '<p style="font-size:9pt;margin:6px 0;">No photos attached.</p>';
  }

  const html = '<!DOCTYPE html><html><head><meta charset="utf-8">'
    + '<title>Order Form - ' + esc(orderNum) + '</title>'
    + '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
    + '<style>'
    + '@page { size: A4; margin: 10mm 15mm 10mm 15mm; }'
    + '* { box-sizing: border-box; }'
    + 'body { font-family: Arial, Helvetica, sans-serif; font-size: 8.5pt; line-height: 1.18; color: #000; margin: 0; padding: 0; background: #ffffff; }'
    + 'table, tr, td, th { border: none !important; border-width: 0 !important; outline: none !important; }'
    + '.title { text-align: center; font-size: 14pt; font-weight: bold; margin: 0 0 4px 0; }'
    + '.bar-blue { border-top: 1.5px solid #2b6cb0; border-bottom: 1.5px solid #2b6cb0; color: #2b6cb0; font-weight: bold; font-size: 9pt; padding: 1.5px 0; margin: 4px 0 2px 0; }'
    + '.bar-red { border-top: 1.5px solid #cc0000; border-bottom: 1.5px solid #cc0000; color: #cc0000; font-weight: bold; font-size: 9pt; padding: 1.5px 0; margin: 4px 0 2px 0; }'
    + '.table-data { width: 100%; border-collapse: collapse; margin-bottom: 2px; border: none !important; }'
    + '.table-data td { padding: 0.5px 0; font-size: 8.5pt; font-weight: bold; vertical-align: top; line-height: 1.15; border: none !important; }'
    + '.table-data td.lbl { width: 270px; color: #000; border: none !important; }'
    + '.table-data td.val { color: #000; border: none !important; }'
    + '.notes-box { padding: 2px 0; margin: 3px 0; font-size: 8.5pt; font-weight: bold; line-height: 1.15; border: none !important; }'
    + '.double-line { border-bottom: 2px double #2b6cb0; margin: 4px 0 2px 0; }'
    + '.page-break { page-break-before: always; break-before: page; mso-break-type: section-break; clear: both; height: 0; margin: 0; padding: 0; border: none; }'
    + '@media print { .page-break { page-break-before: always; } }'
    + '</style></head><body>'

    // ==================== PAGE 1 ====================
    + '<div class="title">Order Form</div>'
    + '<div class="bar-blue">Client Details</div>'
    + '<table class="table-data" border="0" cellpadding="0" cellspacing="0" style="border:none !important;">'
    + '<tr><td class="lbl">Name :</td><td class="val">' + val('Client Name', 'clientName') + '</td></tr>'
    + '<tr><td class="lbl">Order No :</td><td class="val">' + esc(orderNum) + '</td></tr>'
    + '<tr><td class="lbl">City :</td><td class="val">' + val('City', 'city') + '</td></tr>'
    + '<tr><td class="lbl">City Other :</td><td class="val">' + val('City Other', 'cityOther') + '</td></tr>'
    + '<tr><td class="lbl">Order Date :</td><td class="val">' + val('Order Date', 'orderDate') + '</td></tr>'
    + '<tr><td class="lbl">Delivery Date :</td><td class="val">' + val('Delivery Date', 'deliveryDate') + '</td></tr>'
    + '<tr><td class="lbl">Consultation By :</td><td class="val">' + val('Consultation By', 'consultationBy') + '</td></tr>'
    + '<tr><td class="lbl">Patch no :</td><td class="val">' + val('Patch No', 'patchNo', '1') + '</td></tr>'
    + '<tr><td class="lbl">Existing Wearer :</td><td class="val">' + val('Existing Wearer', 'existingWearer') + '</td></tr>'
    + '<tr><td class="lbl">Branch :</td><td class="val">' + val('Branch', 'branch') + '</td></tr>'
    + '<tr><td class="lbl">Technician Name :</td><td class="val">' + val('Technician Name', 'technicianName') + '</td></tr>'
    + '<tr><td class="lbl">Demo Given By :</td><td class="val">' + val('Demo Given By', 'demoGivenBy') + '</td></tr>'
    + '<tr><td class="lbl">Standard :</td><td class="val">' + val('Standard', 'standard') + '</td></tr>'
    + '</table>'

    + '<div class="bar-blue">As Discussed In Consultation</div>'
    + '<table class="table-data" border="0" cellpadding="0" cellspacing="0" style="border:none !important;">'
    + '<tr><td class="lbl">Client Preference :</td><td class="val">' + val('Client Preference', 'clientPreference') + '</td></tr>'
    + '<tr><td class="lbl">Density :</td><td class="val">' + val('Density (Consultant)', 'consultDensity') + '</td></tr>'
    + '<tr><td class="lbl">Hairline :</td><td class="val">' + val('Hairline (Consultant)', 'consultHairline') + '</td></tr>'
    + '<tr><td class="lbl">Hairstyle :</td><td class="val">' + val('Hairstyle', 'hairstyle') + '</td></tr>'
    + '<tr><td class="lbl">Base :</td><td class="val">' + val('Base (Consultant)', 'consultBase') + '</td></tr>'
    + '<tr><td class="lbl">Life :</td><td class="val">' + val('Life (in Months)', 'life') + '</td></tr>'
    + '</table>'
    + '<div class="notes-box">Notes 1: ' + val('Notes 1 (From Consultant)', 'notes1', '') + '</div>'

    + '<div class="bar-blue">Payment Details</div>'
    + '<table class="table-data" border="0" cellpadding="0" cellspacing="0" style="border:none !important;">'
    + '<tr><td class="lbl">Payment Done By :</td><td class="val">' + val('Payment Done By', 'paymentDoneBy') + '</td></tr>'
    + '<tr><td class="lbl">Total Bill amt :</td><td class="val">' + amount('Total Bill Amount', 'totalBillAmount') + '</td></tr>'
    + '<tr><td class="lbl">Unit cost :</td><td class="val">' + amount('Unit Cost', 'unitCost') + '</td></tr>'
    + '<tr><td class="lbl">Rush Order :</td><td class="val">' + amount('Rush Order Charges', 'rushOrderCharges') + '</td></tr>'
    + '<tr><td class="lbl">No of Units Booked :</td><td class="val">' + val('No of Units Booked', 'noOfUnits', '1') + '</td></tr>'
    + '<tr><td class="lbl">Advance Paid :</td><td class="val">' + amount('Advance Paid', 'advancePaid') + '</td></tr>'
    + '<tr><td class="lbl">Balance Payable :</td><td class="val">' + amount('Balance Payable', 'balancePayable') + '</td></tr>'
    + '<tr><td class="lbl">GST Percentage (%) :</td><td class="val">' + val('GST Percentage', 'gstPercentage') + '</td></tr>'
    + '<tr><td class="lbl">GST Amount Charged :</td><td class="val">' + amount('GST Amount Charged', 'gstAmountCharged') + '</td></tr>'
    + '<tr><td class="lbl">1st :</td><td class="val">' + amount('Emi 1 Amount', 'emi1Amount') + '</td></tr>'
    + '<tr><td class="lbl">Date :</td><td class="val">' + val('Emi 1 Date', 'emi1Date') + '</td></tr>'
    + '<tr><td class="lbl">2nd :</td><td class="val">' + amount('Emi 2 Amount', 'emi2Amount') + '</td></tr>'
    + '<tr><td class="lbl">Date :</td><td class="val">' + val('Emi 2 Date', 'emi2Date') + '</td></tr>'
    + '<tr><td class="lbl">3rd :</td><td class="val">' + amount('Emi 3 Amount', 'emi3Amount') + '</td></tr>'
    + '<tr><td class="lbl">Date :</td><td class="val">' + val('Emi 3 Date', 'emi3Date') + '</td></tr>'
    + '</table>'
    + '<div class="notes-box">Notes 2: ' + val('Notes 2 (Payment Details)', 'notes2', '') + '</div>'
    + '<div style="font-weight: bold; margin: 4px 0 2px 0; font-size: 8.5pt;">Client type - ' + val('Client Status', 'clientStatus', 'REGULAR') + '</div>'
    + '<div class="double-line"></div>'
    + '<table class="table-data" border="0" cellpadding="0" cellspacing="0" style="border:none !important;">'
    + '<tr><td class="lbl">Pic Taken :</td><td class="val">' + val('Pic Taken', 'picTaken') + '</td></tr>'
    + '<tr><td class="lbl">Reason :</td><td class="val">' + val('Pic Not Taken Reason', 'picTakenReason') + '</td></tr>'
    + '<tr><td class="lbl">Video Taken :</td><td class="val">' + val('Video Taken', 'videoTaken') + '</td></tr>'
    + '</table>'

    // ==================== PAGE 2 ====================
    + '<div class="page-break"></div>'
    + '<table class="table-data" border="0" cellpadding="0" cellspacing="0" style="border:none !important;">'
    + '<tr><td class="lbl">Reason :</td><td class="val">' + val('Video Not Taken Reason', 'videoTakenReason') + '</td></tr>'
    + '<tr><td class="lbl">Mould Taken :</td><td class="val">' + val('Mould Taken', 'mouldTaken') + '</td></tr>'
    + '<tr><td class="lbl">Reason :</td><td class="val">' + val('Mould Not Taken Reason', 'mouldTakenReason') + '</td></tr>'
    + '<tr><td class="lbl">Picture of Demo Unit :</td><td class="val">' + val('Picture of Demo unit', 'picDemoUnit') + '</td></tr>'
    + '<tr><td class="lbl">Reason :</td><td class="val">' + val('Picture Demo Not Taken Reason', 'picDemoUnitReason') + '</td></tr>'
    + '<tr><td class="lbl">Client Picture After Given Demo :</td><td class="val">' + val('Client picture after given demo', 'clientPicAfterDemo') + '</td></tr>'
    + '<tr><td class="lbl">Reason :</td><td class="val">' + val('Client Pic Not Taken Reason', 'clientPicAfterDemoReason') + '</td></tr>'
    + '</table>'

    + '<div class="bar-red">Client Specification</div>'
    + '<table class="table-data" border="0" cellpadding="0" cellspacing="0" style="border:none !important;">'
    + '<tr><td class="lbl">Size :</td><td class="val">' + val('Size', 'size') + '</td></tr>'
    + '<tr><td class="lbl">Size Other :</td><td class="val">' + val('Size Other', 'sizeOther') + '</td></tr>'
    + '<tr><td class="lbl">Base Type :</td><td class="val">' + val('Base Type', 'baseType') + '</td></tr>'
    + '<tr><td class="lbl">Code :</td><td class="val">' + val('Code', 'code') + '</td></tr>'
    + '<tr><td class="lbl">Colour :</td><td class="val">' + val('Colour', 'colour') + '</td></tr>'
    + '<tr><td class="lbl">Colour Other :</td><td class="val">' + val('Target Colour', 'targetColour', val('Colour Other', 'colourOther')) + '</td></tr>'
    + '<tr><td class="lbl">Grey (%) :</td><td class="val">' + val('Grey (%)', 'grey') + '</td></tr>'
    + '<tr><td class="lbl">Hairline of System :</td><td class="val">' + val('Hairline of system', 'hairlineSystem') + '</td></tr>'
    + '<tr><td class="lbl">Bleach Knots :</td><td class="val">' + val('Blech Knots', 'blechKnots') + '</td></tr>'
    + '<tr><td class="lbl">Work Type :</td><td class="val">' + val('Work Type', 'workType') + '</td></tr>'
    + '<tr><td class="lbl">Type of Density (Full Lace) :</td><td class="val">' + val('Type of Density (Full Lace)', 'typeOfDensityFullLace') + '</td></tr>'
    + '<tr><td class="lbl">Air Lace Amy :</td><td class="val">' + val('Air Lace Amy', 'airLaceAmy') + '</td></tr>'
    + '<tr><td class="lbl">Air Lace Nancy :</td><td class="val">' + val('Air Lace Nancy', 'airLaceNancy') + '</td></tr>'
    + '<tr><td class="lbl">Type of Density :</td><td class="val">' + val('Type of Density', 'typeOfDensity') + '</td></tr>'
    + '</table>'
    + '<div class="notes-box">Notes 3: ' + val('Notes 3 (Client Specifications)', 'notes3', '') + '</div>'
    + '<table class="table-data" border="0" cellpadding="0" cellspacing="0" style="border:none !important;">'
    + '<tr><td class="lbl">Colour On System :</td><td class="val">' + val('Color On System', 'colorOnSystem', val('Colour', 'colour')) + '</td></tr>'
    + '<tr><td class="lbl">Colour On Client :</td><td class="val">' + val('Color On Clients', 'colorOnClients', val('Colour', 'colour')) + '</td></tr>'
    + '</table>'

    + '<div class="bar-red">To Do Afterwork</div>'
    + '<div class="notes-box">To Do Afterwork: ' + val('To Do Afterwork', 'toDoAfterwork', '') + '</div>'

    + '<div class="bar-blue">Pg. 3</div>'
    + '<table class="table-data" border="0" cellpadding="0" cellspacing="0" style="border:none !important;">'
    + '<tr><td class="lbl">Density :</td><td class="val">' + val('Density (Technician)', 'density', val('Density (Consultant)', 'consultDensity')) + '</td></tr>'
    + '<tr><td class="lbl">Hair Length :</td><td class="val">' + val('Hair Length', 'hairLength') + '</td></tr>'
    + '<tr><td class="lbl">Top :</td><td class="val">' + val('Top', 'top') + '</td></tr>'
    + '<tr><td class="lbl">Front :</td><td class="val">' + val('Front', 'front') + '</td></tr>'
    + '<tr><td class="lbl">Side :</td><td class="val">' + val('Side', 'side') + '</td></tr>'
    + '<tr><td class="lbl">Back :</td><td class="val">' + val('Back', 'back') + '</td></tr>'
    + '<tr><td class="lbl">Parting :</td><td class="val">' + val('Parting', 'parting') + '</td></tr>'
    + '<tr><td class="lbl">Hairline :</td><td class="val">' + val('Hairline (Technician)', 'techHairline', val('Hairline (Consultant)', 'consultHairline')) + '</td></tr>'
    + '<tr><td class="lbl">Hairline Shape :</td><td class="val">' + val('Hairline shape', 'hairlineShape') + '</td></tr>'
    + '<tr><td class="lbl">Colour To Use On System :</td><td class="val">' + val('Colour To use on system', 'colourToUseOnSystem', val('Colour', 'colour')) + '</td></tr>'
    + '<tr><td class="lbl">Color on Hair Head :</td><td class="val">' + val('Colour on Hair Head', 'colourOnHairHead', val('Colour', 'colour')) + '</td></tr>'
    + '<tr><td class="lbl">Client Hairline :</td><td class="val">' + val('Client Hairline', 'clientHairline') + '</td></tr>'
    + '<tr><td class="lbl">Base Hairline :</td><td class="val">' + val('Base Hairline', 'baseHairline') + '</td></tr>'
    + '<tr><td class="lbl">Type Client :</td><td class="val">' + val('Type of Client', 'typeOfClient', 'Not Fussy') + '</td></tr>'
    + '<tr><td class="lbl">Bleach Knots :</td><td class="val">' + val('Blech Knots', 'blechKnots') + '</td></tr>'
    + '<tr><td class="lbl">Client Order Like :</td><td class="val">' + val('Client Order Like', 'clientOrderLike') + '</td></tr>'
    + '<tr><td class="lbl">Client Order Like (Other) :</td><td class="val">' + val('Client Order Like Other', 'clientOrderLikeOther') + '</td></tr>'
    + '</table>'

    // ==================== PAGE 3 ====================
    + '<div class="page-break"></div>'
    + '<div class="notes-box">Notes 4: ' + val('Notes 4 (Technician)', 'notes4', '') + '</div>'
    + '<table class="table-data" border="0" cellpadding="0" cellspacing="0" style="border:none !important;">'
    + '<tr><td class="lbl">As Per Date :</td><td class="val">' + val('As per Date', 'asPerDate') + '</td></tr>'
    + '<tr><td class="lbl">Hairline Shaped :</td><td class="val">' + val('Hairline Shaped', 'hairlineShaped') + '</td></tr>'
    + '<tr><td class="lbl">Hairline Shaped 2 :</td><td class="val">' + val('Hairline Shaped 2', 'hairlineShaped2') + '</td></tr>'
    + '<tr><td class="lbl">Type :</td><td class="val">' + val('Client Preference', 'clientPreference') + '</td></tr>'
    + '</table>'

    + '<div class="bar-red">Client History</div>'
    + '<div style="font-weight: bold; margin: 3px 0; font-size: 8.5pt;">No previous order history available.</div>'

    + '<div class="bar-blue">Client Photos</div>'
    + '<div style="font-size: 8pt; font-weight: bold; margin-bottom: 4px;">Current Order #' + esc(orderNum) + ' &bull; ' + val('Order Date', 'orderDate') + '</div>'
    + photoTableHtml

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
