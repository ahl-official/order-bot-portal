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

  const html = '<!DOCTYPE html><html><head><meta charset="utf-8">'
    + '<title>Order Form - ' + esc(orderNum) + '</title>'
    + '<style>'
    + '* { box-sizing: border-box; }'
    + 'body { font-family: Arial, Helvetica, sans-serif; font-size: 11pt; line-height: 1.35; color: #000; margin: 0; padding: 24px 36px; background: #fff; }'
    + '.title { text-align: center; font-size: 18pt; font-weight: bold; margin-bottom: 12px; }'
    + '.bar-blue { border-top: 2px solid #2b6cb0; border-bottom: 2px solid #2b6cb0; color: #2b6cb0; font-weight: bold; font-size: 11pt; padding: 3px 0; margin: 10px 0 6px 0; }'
    + '.bar-red { border-top: 2px solid #cc0000; border-bottom: 2px solid #cc0000; color: #cc0000; font-weight: bold; font-size: 11pt; padding: 3px 0; margin: 10px 0 6px 0; }'
    + '.table-data { width: 100%; border-collapse: collapse; margin-bottom: 4px; }'
    + '.table-data td { padding: 1.5px 0; font-size: 10pt; font-weight: bold; vertical-align: top; }'
    + '.table-data td.lbl { width: 320px; color: #000; }'
    + '.table-data td.val { color: #000; }'
    + '.notes-box { border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 4px 0; margin: 6px 0; font-size: 10pt; font-weight: bold; line-height: 1.3; }'
    + '.double-line { border-bottom: 3px double #2b6cb0; margin: 8px 0 6px 0; }'
    + '.page-break { page-break-before: always; break-before: page; padding-top: 15px; }'
    + '</style></head><body>'

    // ==================== PAGE 1 ====================
    + '<div class="title">Order Form</div>'
    + '<div class="bar-blue">Client Details</div>'
    + '<table class="table-data">'
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
    + '<table class="table-data">'
    + '<tr><td class="lbl">Client Preference :</td><td class="val">' + val('clientPreference', 'Client Preference') + '</td></tr>'
    + '<tr><td class="lbl">Density :</td><td class="val">' + val('consultDensity', 'Density (Consultant)') + '</td></tr>'
    + '<tr><td class="lbl">Hairline :</td><td class="val">' + val('consultHairline', 'Hairline (Consultant)') + '</td></tr>'
    + '<tr><td class="lbl">Hairstyle :</td><td class="val">' + val('hairstyle', 'Hairstyle') + '</td></tr>'
    + '<tr><td class="lbl">Base :</td><td class="val">' + val('consultBase', 'Base (Consultant)') + '</td></tr>'
    + '<tr><td class="lbl">Life :</td><td class="val">' + val('life', 'Life (in Months)') + '</td></tr>'
    + '</table>'
    + '<div class="notes-box">Notes 1: ' + val('notes1', 'Notes 1 (From Consultant)', 'None') + '</div>'

    + '<div class="bar-blue">Payment Details</div>'
    + '<table class="table-data">'
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
    + '<div style="font-weight: bold; margin: 6px 0; font-size: 10pt;">Client type - ' + val('clientStatus', 'Client Status', 'REGULAR') + '</div>'
    + '<div class="double-line"></div>'
    + '<table class="table-data">'
    + '<tr><td class="lbl">Pic Taken :</td><td class="val">' + val('picTaken', 'Pic Taken') + '</td></tr>'
    + '<tr><td class="lbl">Reason :</td><td class="val">' + val('picTakenReason', 'Pic Not Taken Reason') + '</td></tr>'
    + '<tr><td class="lbl">Video Taken :</td><td class="val">' + val('videoTaken', 'Video Taken') + '</td></tr>'
    + '</table>'

    // ==================== PAGE 2 ====================
    + '<div class="page-break"></div>'
    + '<table class="table-data">'
    + '<tr><td class="lbl">Reason :</td><td class="val">' + val('videoTakenReason', 'Video Not Taken Reason') + '</td></tr>'
    + '<tr><td class="lbl">Mould Taken :</td><td class="val">' + val('mouldTaken', 'Mould Taken') + '</td></tr>'
    + '<tr><td class="lbl">Reason :</td><td class="val">' + val('mouldTakenReason', 'Mould Not Taken Reason') + '</td></tr>'
    + '<tr><td class="lbl">Picture of Demo Unit :</td><td class="val">' + val('picDemoUnit', 'Picture of Demo unit') + '</td></tr>'
    + '<tr><td class="lbl">Reason :</td><td class="val">' + val('picDemoUnitReason', 'Picture Demo Not Taken Reason') + '</td></tr>'
    + '<tr><td class="lbl">Client Picture After Given Demo :</td><td class="val">' + val('clientPicAfterDemo', 'Client picture after given demo') + '</td></tr>'
    + '<tr><td class="lbl">Reason :</td><td class="val">' + val('clientPicAfterDemoReason', 'Client Pic Not Taken Reason') + '</td></tr>'
    + '</table>'

    + '<div class="bar-red">Client Specification</div>'
    + '<table class="table-data">'
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
    + '<table class="table-data">'
    + '<tr><td class="lbl">Colour On System :</td><td class="val">' + val('colorOnSystem', 'Color On System', val('colour', 'Colour')) + '</td></tr>'
    + '<tr><td class="lbl">Colour On Client :</td><td class="val">' + val('colorOnClients', 'Color On Clients', val('colour', 'Colour')) + '</td></tr>'
    + '</table>'

    + '<div class="bar-red">To Do Afterwork</div>'
    + '<div class="notes-box">To Do Afterwork: ' + val('toDoAfterwork', 'To Do Afterwork', 'None') + '</div>'

    + '<div class="bar-blue">Pg. 3</div>'
    + '<table class="table-data">'
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

    // ==================== PAGE 3 ====================
    + '<div class="page-break"></div>'
    + '<div class="notes-box">Notes 4: ' + val('notes4', 'Notes 4 (Technician)', 'None') + '</div>'
    + '<table class="table-data">'
    + '<tr><td class="lbl">As Per Date :</td><td class="val">' + val('asPerDate', 'As per Date') + '</td></tr>'
    + '<tr><td class="lbl">Hairline Shaped :</td><td class="val">' + val('hairlineShaped', 'Hairline Shaped') + '</td></tr>'
    + '<tr><td class="lbl">Hairline Shaped 2 :</td><td class="val">' + val('hairlineShaped2', 'Hairline Shaped 2') + '</td></tr>'
    + '<tr><td class="lbl">Type :</td><td class="val">' + val('clientPreference', 'Client Preference') + '</td></tr>'
    + '</table>'

    + '<div class="bar-red">Client History</div>'
    + '<div style="font-weight: bold; margin: 6px 0; font-size: 10pt;">No previous order history available.</div>'

    + '<div class="bar-blue">Client Photos</div>'
    + '<div style="font-size: 9pt; font-weight: bold; margin-bottom: 8px;">Current Order #' + esc(orderNum) + ' &bull; ' + val('orderDate', 'Order Date') + '</div>'
    + '<p style="font-size:10pt">Photos synchronized with Google Drive media storage.</p>'

    + '</body></html>';

  return html;
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
