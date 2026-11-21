const { requestGoogle } = require('./google');

function buildOrderHtml(d) {
  const orderNum = d.orderNumber || d['Order Number'] || 'AHL-XXXX';
  const esc = v => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const val = (k, altKey = '', f = '—') => {
    let x = d[k];
    if (x === undefined || x === null || String(x).trim() === '') {
      if (altKey) x = d[altKey];
    }
    return (x === undefined || x === null || String(x).trim() === '') ? f : esc(x);
  };
  const amount = (k, altKey = '', f = '—') => {
    let x = d[k];
    if (x === undefined || x === null || String(x).trim() === '') {
      if (altKey) x = d[altKey];
    }
    if (x === undefined || x === null || String(x).trim() === '') return f;
    const n = Number(String(x).replace(/[^0-9.-]/g, ''));
    return Number.isFinite(n) ? ('₹ ' + n.toLocaleString('en-IN')) : esc(x);
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
    ['Front Photo', 'uploadClientPhotoFront', 'Upload Client Photo - Front'],
    ['Top Photo', 'uploadClientPhotoTop', 'Upload Client Photo - Top'],
    ['Left Photo', 'uploadClientPhotoLeft', 'Upload Client Photo - Left'],
    ['Right Photo', 'uploadClientPhotoRight', 'Upload Client Photo - Right'],
    ['Back Photo', 'uploadClientPhotoBack', 'Upload Client Photo - Back'],
    ['Mould Picture', 'clientMouldPhoto', 'Client Mould Photo'],
    ['Demo Unit', 'demoPicture', 'Demo Picture'],
    ['Consent / After Demo', 'clientConsentFormPage1', 'Client Consent Form Page 1']
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
    photoTableHtml = '<p style="font-size:8pt;margin:6px 0;color:#64748b;">No client photos attached to this order.</p>';
  }

  const html = '<!DOCTYPE html><html><head><meta charset="utf-8">'
    + '<title>Order Form - ' + esc(orderNum) + '</title>'
    + '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
    + '<style>'
    + '* { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }'
    + 'html, body { margin: 0; padding: 0; background: #ffffff; color: #111827; font-family: Arial, Helvetica, sans-serif; font-size: 8.5pt; line-height: 1.22; }'
    + '.page { background: #ffffff; padding: 12mm 15mm; page-break-after: always; break-after: page; }'
    + '.page:last-child { page-break-after: auto; break-after: auto; }'
    + '.header-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; border-bottom: 2px solid #0f172a; padding-bottom: 4px; }'
    + '.header-title { font-size: 15pt; font-weight: 800; color: #0f172a; letter-spacing: 1px; text-transform: uppercase; }'
    + '.header-sub { font-size: 8pt; color: #64748b; font-weight: 600; margin-top: 2px; }'
    + '.header-badge { background: #1e3a8a; color: #ffffff; font-weight: 800; font-size: 11pt; padding: 4px 12px; border-radius: 4px; text-align: center; }'
    + '.bar-blue { background: #1e3a8a; color: #ffffff; font-weight: bold; font-size: 8.5pt; padding: 3px 8px; margin: 6px 0 3px 0; text-transform: uppercase; letter-spacing: 0.5px; border-radius: 2px; }'
    + '.bar-red { background: #991b1b; color: #ffffff; font-weight: bold; font-size: 8.5pt; padding: 3px 8px; margin: 6px 0 3px 0; text-transform: uppercase; letter-spacing: 0.5px; border-radius: 2px; }'
    + 'table.data-table { width: 100%; border-collapse: collapse; margin-bottom: 2px; }'
    + 'table.data-table td { padding: 2px 4px; font-size: 8pt; font-weight: bold; vertical-align: top; border-bottom: 1px solid #f1f5f9; }'
    + 'table.data-table td.lbl { width: 230px; color: #475569; }'
    + 'table.data-table td.val { color: #0f172a; }'
    + '.notes-box { background: #f8fafc; border-left: 3px solid #3b82f6; padding: 4px 8px; margin: 4px 0; font-size: 8pt; font-weight: bold; color: #1e293b; }'
    + '.notes-box-red { background: #fef2f2; border-left: 3px solid #ef4444; padding: 4px 8px; margin: 4px 0; font-size: 8pt; font-weight: bold; color: #991b1b; }'
    + '.footer-table { width: 100%; border-collapse: collapse; margin-top: 10px; border-top: 1px solid #cbd5e1; padding-top: 4px; }'
    + '.footer-table td { font-size: 7.5pt; color: #64748b; font-weight: 600; padding: 4px 0; border: none !important; }'
    + '@media screen {'
    + '  body { background: #525659; padding: 20px 0; }'
    + '  .page { width: 210mm; min-height: 297mm; margin: 0 auto 20px auto; box-shadow: 0 4px 18px rgba(0, 0, 0, 0.4); }'
    + '}'
    + '@media print {'
    + '  body { background: #ffffff !important; padding: 0 !important; }'
    + '  .page { width: 100% !important; margin: 0 !important; padding: 12mm 15mm !important; box-shadow: none !important; }'
    + '  #printToolbar { display: none !important; }'
    + '}'
    + '</style></head><body>'

    // ==================== PAGE 1 ====================
    + '<div class="page" id="page-1">'
    + '<table class="header-table" border="0" cellpadding="0" cellspacing="0">'
    + '<tr>'
    + '<td><div class="header-title">American Hairline</div><div class="header-sub">Official Client Order Form &bull; System Specification</div></td>'
    + '<td align="right"><div class="header-badge">' + esc(orderNum) + '</div></td>'
    + '</tr>'
    + '</table>'

    + '<div class="bar-blue">Client &amp; Order Details</div>'
    + '<table class="data-table" border="0" cellpadding="0" cellspacing="0">'
    + '<tr><td class="lbl">Client Name :</td><td class="val">' + val('clientName', 'Client Name') + '</td></tr>'
    + '<tr><td class="lbl">Contact Mobile :</td><td class="val">' + val('contactNo', 'Contact No') + '</td></tr>'
    + '<tr><td class="lbl">Order Number :</td><td class="val">' + esc(orderNum) + '</td></tr>'
    + '<tr><td class="lbl">City :</td><td class="val">' + val('city', 'City') + '</td></tr>'
    + '<tr><td class="lbl">Branch :</td><td class="val">' + val('branch', 'Branch') + '</td></tr>'
    + '<tr><td class="lbl">Order Date :</td><td class="val">' + val('orderDate', 'Order Date') + '</td></tr>'
    + '<tr><td class="lbl">Delivery Date :</td><td class="val">' + val('deliveryDate', 'Delivery Date') + '</td></tr>'
    + '<tr><td class="lbl">Consultation By :</td><td class="val">' + val('consultationBy', 'Consultation By') + '</td></tr>'
    + '<tr><td class="lbl">Technician Name :</td><td class="val">' + val('technicianName', 'Technician Name') + '</td></tr>'
    + '<tr><td class="lbl">Demo Given By :</td><td class="val">' + val('demoGivenBy', 'Demo Given By') + '</td></tr>'
    + '<tr><td class="lbl">Patch No :</td><td class="val">' + val('patchNo', 'Patch No', '1') + '</td></tr>'
    + '<tr><td class="lbl">Existing Wearer / Stage :</td><td class="val">' + val('existingWearer', 'Existing Wearer') + '</td></tr>'
    + '<tr><td class="lbl">Standard :</td><td class="val">' + val('standard', 'Standard') + '</td></tr>'
    + '</table>'

    + '<div class="bar-blue">As Discussed In Consultation</div>'
    + '<table class="data-table" border="0" cellpadding="0" cellspacing="0">'
    + '<tr><td class="lbl">Client Preference :</td><td class="val">' + val('clientPreference', 'Client Preference') + '</td></tr>'
    + '<tr><td class="lbl">Density (Consultant) :</td><td class="val">' + val('consultDensity', 'Density (Consultant)') + '</td></tr>'
    + '<tr><td class="lbl">Hairline (Consultant) :</td><td class="val">' + val('consultHairline', 'Hairline (Consultant)') + '</td></tr>'
    + '<tr><td class="lbl">Hairstyle :</td><td class="val">' + val('hairstyle', 'Hairstyle') + '</td></tr>'
    + '<tr><td class="lbl">Base (Consultant) :</td><td class="val">' + val('consultBase', 'Base (Consultant)') + '</td></tr>'
    + '<tr><td class="lbl">Expected Life :</td><td class="val">' + val('life', 'Life (in Months)') + '</td></tr>'
    + '</table>'
    + '<div class="notes-box">Consultant Notes: ' + val('notes1', 'Notes 1 (From Consultant)', 'None') + '</div>'

    + '<div class="bar-blue">Payment &amp; Commercial Details</div>'
    + '<table class="data-table" border="0" cellpadding="0" cellspacing="0">'
    + '<tr><td class="lbl">Payment Done By :</td><td class="val">' + val('paymentDoneBy', 'Payment Done By') + '</td></tr>'
    + '<tr><td class="lbl">Total Bill Amount :</td><td class="val">' + amount('totalBillAmount', 'Total Bill Amount') + '</td></tr>'
    + '<tr><td class="lbl">Unit Cost :</td><td class="val">' + amount('unitCost', 'Unit Cost') + '</td></tr>'
    + '<tr><td class="lbl">Rush Order Charges :</td><td class="val">' + amount('rushOrderCharges', 'Rush Order Charges') + '</td></tr>'
    + '<tr><td class="lbl">No of Units Booked :</td><td class="val">' + val('noOfUnits', 'No of Units Booked', '1') + '</td></tr>'
    + '<tr><td class="lbl">Advance Paid :</td><td class="val">' + amount('advancePaid', 'Advance Paid') + '</td></tr>'
    + '<tr><td class="lbl">Balance Payable :</td><td class="val">' + amount('balancePayable', 'Balance Payable') + '</td></tr>'
    + '<tr><td class="lbl">GST Percentage (%) :</td><td class="val">' + val('gstPercentage', 'GST Percentage') + '</td></tr>'
    + '<tr><td class="lbl">GST Amount Charged :</td><td class="val">' + amount('gstAmountCharged', 'GST Amount Charged') + '</td></tr>'
    + '<tr><td class="lbl">EMI 1 / Date :</td><td class="val">' + amount('emi1Amount', 'Emi 1 Amount') + (d.emi1Date ? (' (' + esc(d.emi1Date) + ')') : '') + '</td></tr>'
    + '<tr><td class="lbl">EMI 2 / Date :</td><td class="val">' + amount('emi2Amount', 'Emi 2 Amount') + (d.emi2Date ? (' (' + esc(d.emi2Date) + ')') : '') + '</td></tr>'
    + '<tr><td class="lbl">EMI 3 / Date :</td><td class="val">' + amount('emi3Amount', 'Emi 3 Amount') + (d.emi3Date ? (' (' + esc(d.emi3Date) + ')') : '') + '</td></tr>'
    + '</table>'
    + '<div class="notes-box">Payment Notes: ' + val('notes2', 'Notes 2 (Payment Details)', 'None') + '</div>'
    + '<table class="data-table" border="0" cellpadding="0" cellspacing="0">'
    + '<tr><td class="lbl">Client Type :</td><td class="val">' + val('clientStatus', 'Client Status', 'REGULAR') + '</td></tr>'
    + '<tr><td class="lbl">Pic Taken :</td><td class="val">' + val('picTaken', 'Pic Taken') + (d.picTakenReason ? (' (Reason: ' + esc(d.picTakenReason) + ')') : '') + '</td></tr>'
    + '<tr><td class="lbl">Video Taken :</td><td class="val">' + val('videoTaken', 'Video Taken') + (d.videoTakenReason ? (' (Reason: ' + esc(d.videoTakenReason) + ')') : '') + '</td></tr>'
    + '</table>'

    + '<table class="footer-table" border="0" cellpadding="0" cellspacing="0">'
    + '<tr>'
    + '<td>American Hairline Pvt. Ltd. &bull; Confidential Order Record</td>'
    + '<td align="right">' + esc(orderNum) + ' &bull; Page 1 of 3</td>'
    + '</tr>'
    + '</table>'
    + '</div>' // end page 1

    // ==================== PAGE 2 ====================
    + '<div class="page" id="page-2">'
    + '<table class="header-table" border="0" cellpadding="0" cellspacing="0">'
    + '<tr>'
    + '<td><div class="header-title">American Hairline</div><div class="header-sub">Technical Specifications &amp; Assessment</div></td>'
    + '<td align="right"><div class="header-badge">' + esc(orderNum) + '</div></td>'
    + '</tr>'
    + '</table>'

    + '<div class="bar-red">Client Specifications</div>'
    + '<table class="data-table" border="0" cellpadding="0" cellspacing="0">'
    + '<tr><td class="lbl">Size :</td><td class="val">' + val('size', 'Size') + '</td></tr>'
    + '<tr><td class="lbl">Base Type :</td><td class="val">' + val('baseType', 'Base Type') + '</td></tr>'
    + '<tr><td class="lbl">Code :</td><td class="val">' + val('code', 'Code') + '</td></tr>'
    + '<tr><td class="lbl">Colour :</td><td class="val">' + val('colour', 'Colour') + '</td></tr>'
    + '<tr><td class="lbl">Target Colour :</td><td class="val">' + val('targetColour', 'Target Colour') + '</td></tr>'
    + '<tr><td class="lbl">Grey (%) :</td><td class="val">' + val('grey', 'Grey (%)') + '</td></tr>'
    + '<tr><td class="lbl">Hairline of System :</td><td class="val">' + val('hairlineSystem', 'Hairline of system') + '</td></tr>'
    + '<tr><td class="lbl">Bleach Knots :</td><td class="val">' + val('blechKnots', 'Blech Knots') + '</td></tr>'
    + '<tr><td class="lbl">Work Type :</td><td class="val">' + val('workType', 'Work Type') + '</td></tr>'
    + '<tr><td class="lbl">Type of Density (Full Lace) :</td><td class="val">' + val('typeOfDensityFullLace', 'Type of Density (Full Lace)') + '</td></tr>'
    + '<tr><td class="lbl">Air Lace Amy :</td><td class="val">' + val('airLaceAmy', 'Air Lace Amy') + '</td></tr>'
    + '<tr><td class="lbl">Air Lace Nancy :</td><td class="val">' + val('airLaceNancy', 'Air Lace Nancy') + '</td></tr>'
    + '<tr><td class="lbl">Type of Density :</td><td class="val">' + val('typeOfDensity', 'Type of Density') + '</td></tr>'
    + '<tr><td class="lbl">Colour on System :</td><td class="val">' + val('colorOnSystem', 'Color On System', val('colour', 'Colour')) + '</td></tr>'
    + '<tr><td class="lbl">Colour on Client Hair :</td><td class="val">' + val('colorOnClients', 'Color On Clients', val('colour', 'Colour')) + '</td></tr>'
    + '</table>'
    + '<div class="notes-box-red">Specification Notes: ' + val('notes3', 'Notes 3 (Client Specifications)', 'None') + '</div>'

    + '<div class="bar-red">To Do Afterwork</div>'
    + '<div class="notes-box-red">Afterwork Required: ' + val('toDoAfterwork', 'To Do Afterwork', 'None') + '</div>'

    + '<div class="bar-blue">Technician Assessment &amp; Measurements</div>'
    + '<table class="data-table" border="0" cellpadding="0" cellspacing="0">'
    + '<tr><td class="lbl">Density (Technician) :</td><td class="val">' + val('density', 'Density (Technician)', val('consultDensity', 'Density (Consultant)')) + '</td></tr>'
    + '<tr><td class="lbl">Hair Length :</td><td class="val">' + val('hairLength', 'Hair Length') + '</td></tr>'
    + '<tr><td class="lbl">Measurements (Top / Front) :</td><td class="val">' + val('top', 'Top') + ' / ' + val('front', 'Front') + '</td></tr>'
    + '<tr><td class="lbl">Measurements (Side / Back) :</td><td class="val">' + val('side', 'Side') + ' / ' + val('back', 'Back') + '</td></tr>'
    + '<tr><td class="lbl">Parting :</td><td class="val">' + val('parting', 'Parting') + '</td></tr>'
    + '<tr><td class="lbl">Hairline (Technician) :</td><td class="val">' + val('techHairline', 'Hairline (Technician)', val('consultHairline', 'Hairline (Consultant)')) + '</td></tr>'
    + '<tr><td class="lbl">Hairline Shape :</td><td class="val">' + val('hairlineShape', 'Hairline shape') + '</td></tr>'
    + '<tr><td class="lbl">Base Hairline :</td><td class="val">' + val('baseHairline', 'Base Hairline') + '</td></tr>'
    + '<tr><td class="lbl">Client Hairline :</td><td class="val">' + val('clientHairline', 'Client Hairline') + '</td></tr>'
    + '<tr><td class="lbl">Colour To Use On System :</td><td class="val">' + val('colourToUseOnSystem', 'Colour To use on system', val('colour', 'Colour')) + '</td></tr>'
    + '<tr><td class="lbl">Colour on Hair Head :</td><td class="val">' + val('colourOnHairHead', 'Colour on Hair Head', val('colour', 'Colour')) + '</td></tr>'
    + '<tr><td class="lbl">Client Type :</td><td class="val">' + val('typeOfClient', 'Type of Client', 'Not Fussy') + '</td></tr>'
    + '<tr><td class="lbl">Client Order Like :</td><td class="val">' + val('clientOrderLike', 'Client Order Like') + (d.clientOrderLikeOther ? (' (' + esc(d.clientOrderLikeOther) + ')') : '') + '</td></tr>'
    + '<tr><td class="lbl">Mould Taken :</td><td class="val">' + val('mouldTaken', 'Mould Taken') + (d.mouldTakenReason ? (' (Reason: ' + esc(d.mouldTakenReason) + ')') : '') + '</td></tr>'
    + '<tr><td class="lbl">Picture of Demo Unit :</td><td class="val">' + val('picDemoUnit', 'Picture of Demo unit') + (d.picDemoUnitReason ? (' (Reason: ' + esc(d.picDemoUnitReason) + ')') : '') + '</td></tr>'
    + '<tr><td class="lbl">Client Picture After Demo :</td><td class="val">' + val('clientPicAfterDemo', 'Client picture after given demo') + (d.clientPicAfterDemoReason ? (' (Reason: ' + esc(d.clientPicAfterDemoReason) + ')') : '') + '</td></tr>'
    + '</table>'
    + '<div class="notes-box">Technician Notes: ' + val('notes4', 'Notes 4 (Technician)', 'None') + '</div>'

    + '<table class="footer-table" border="0" cellpadding="0" cellspacing="0">'
    + '<tr>'
    + '<td>American Hairline Pvt. Ltd. &bull; Confidential Order Record</td>'
    + '<td align="right">' + esc(orderNum) + ' &bull; Page 2 of 3</td>'
    + '</tr>'
    + '</table>'
    + '</div>' // end page 2

    // ==================== PAGE 3 ====================
    + '<div class="page" id="page-3">'
    + '<table class="header-table" border="0" cellpadding="0" cellspacing="0">'
    + '<tr>'
    + '<td><div class="header-title">American Hairline</div><div class="header-sub">Media Documentation &amp; Verification</div></td>'
    + '<td align="right"><div class="header-badge">' + esc(orderNum) + '</div></td>'
    + '</tr>'
    + '</table>'

    + '<div class="bar-red">Client History</div>'
    + '<table class="data-table" border="0" cellpadding="0" cellspacing="0">'
    + '<tr><td class="lbl">Existing Wearer / Category :</td><td class="val">' + val('existingWearer', 'Existing Wearer', 'New Client (NBD)') + '</td></tr>'
    + '<tr><td class="lbl">As Per Date :</td><td class="val">' + val('asPerDate', 'As per Date') + '</td></tr>'
    + '<tr><td class="lbl">Hairline Shaped :</td><td class="val">' + val('hairlineShaped', 'Hairline Shaped') + '</td></tr>'
    + '<tr><td class="lbl">Form Filled By :</td><td class="val">' + val('formFilledBy', 'Order Form Filled By', 'Staff') + '</td></tr>'
    + '</table>'

    + '<div class="bar-blue">Client Photos Gallery</div>'
    + '<div style="font-size: 8pt; font-weight: bold; margin: 4px 0; color: #1e293b;">Order #' + esc(orderNum) + ' &bull; ' + val('clientName', 'Client Name') + ' (' + val('branch', 'Branch') + ')</div>'
    + photoTableHtml

    + '<div class="bar-blue" style="margin-top: 14px;">Order Verification &amp; Authorization</div>'
    + '<table style="width: 100%; border-collapse: collapse; margin-top: 8px;">'
    + '<tr>'
    + '<td style="width: 50%; padding: 12px 10px; border: 1px dashed #cbd5e1; border-radius: 4px; vertical-align: top;">'
    + '<div style="font-size: 8pt; font-weight: bold; color: #475569; text-transform: uppercase;">Consultant Sign-off</div>'
    + '<div style="font-size: 9pt; font-weight: bold; color: #0f172a; margin-top: 4px;">' + val('consultationBy', 'Consultation By', 'Consultant') + '</div>'
    + '<div style="font-size: 7.5pt; color: #94a3b8; margin-top: 16px;">Signature &amp; Date Verified</div>'
    + '</td>'
    + '<td style="width: 50%; padding: 12px 10px; border: 1px dashed #cbd5e1; border-radius: 4px; vertical-align: top;">'
    + '<div style="font-size: 8pt; font-weight: bold; color: #475569; text-transform: uppercase;">Technician Sign-off</div>'
    + '<div style="font-size: 9pt; font-weight: bold; color: #0f172a; margin-top: 4px;">' + val('technicianName', 'Technician Name', 'Technician') + '</div>'
    + '<div style="font-size: 7.5pt; color: #94a3b8; margin-top: 16px;">Signature &amp; Date Verified</div>'
    + '</td>'
    + '</tr>'
    + '</table>'

    + '<table class="footer-table" border="0" cellpadding="0" cellspacing="0" style="margin-top: 20px;">'
    + '<tr>'
    + '<td>American Hairline Pvt. Ltd. &bull; Confidential Order Record</td>'
    + '<td align="right">' + esc(orderNum) + ' &bull; Page 3 of 3</td>'
    + '</tr>'
    + '</table>'
    + '</div>' // end page 3

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
