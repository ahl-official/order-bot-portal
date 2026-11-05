const { requestGoogle } = require('./google');

function buildOrderHtml(d) {
  const orderNum = d.orderNumber || d['Order Number'] || 'AHL-XXXX';
  const esc = v => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const val = (k, f = '') => {
    const x = d[k];
    return (x === undefined || x === null || String(x).trim() === '') ? f : esc(x);
  };
  const amount = (k, f = '') => {
    const x = d[k];
    if (x === undefined || x === null || String(x).trim() === '') return f;
    const n = Number(String(x).replace(/[^0-9.-]/g, ''));
    return Number.isFinite(n) ? n.toLocaleString('en-IN') : esc(x);
  };

  const html = '<!DOCTYPE html><html><head><meta charset="utf-8">'
    + '<title>Order Form - ' + esc(orderNum) + '</title>'
    + '<style>'
    + 'body { font-family: Arial, Helvetica, sans-serif; font-size: 11pt; line-height: 1.4; color: #000; margin: 30px; }'
    + 'h1 { font-size: 20pt; font-weight: bold; margin: 0 0 16px; color: #000; }'
    + 'h2 { font-size: 13pt; font-weight: bold; margin: 16px 0 8px; color: #000; }'
    + 'p.f { margin: 2px 0; font-size: 10.5pt; color: #000; }'
    + 'p.f b { display: inline-block; min-width: 150px; font-weight: bold; color: #000; }'
    + '.pb { page-break-before: always; break-before: page; margin-top: 20px; }'
    + '</style></head><body>'
    // PAGE 1: Client Details, As Discussed In Consultation, Payment Details
    + '<h1>Order Form</h1>'
    + '<h2>Client Details</h2>'
    + '<p class="f"><b>Name :</b> ' + val('clientName', val('Client Name')) + '</p>'
    + '<p class="f"><b>Order No :</b> ' + esc(orderNum) + '</p>'
    + '<p class="f"><b>City :</b> ' + val('city', val('City')) + '</p>'
    + '<p class="f"><b>City Other :</b> ' + val('cityOther', val('City Other')) + '</p>'
    + '<p class="f"><b>Order Date :</b> ' + val('orderDate', val('Order Date')) + '</p>'
    + '<p class="f"><b>Delivery Date :</b> ' + val('deliveryDate', val('Delivery Date')) + '</p>'
    + '<p class="f"><b>Consultation By :</b> ' + val('consultationBy', val('Consultation By')) + '</p>'
    + '<p class="f"><b>Patch no :</b> ' + val('patchNo', val('Patch No', '1')) + '</p>'
    + '<p class="f"><b>Existing Wearer :</b> ' + val('existingWearer', val('Existing Wearer')) + '</p>'
    + '<p class="f"><b>Branch :</b> ' + val('branch', val('Branch')) + '</p>'
    + '<p class="f"><b>Technician Name :</b> ' + val('technicianName', val('Technician Name')) + '</p>'
    + '<p class="f"><b>Demo Given By :</b> ' + val('demoGivenBy', val('Demo Given By')) + '</p>'
    + '<p class="f"><b>Standard :</b> ' + val('standard', val('Standard')) + '</p>'

    + '<h2>As Discussed In Consultation</h2>'
    + '<p class="f"><b>Client Preference :</b> ' + val('clientPreference', val('Client Preference')) + '</p>'
    + '<p class="f"><b>Density :</b> ' + val('consultDensity', val('Density (Consultant)')) + '</p>'
    + '<p class="f"><b>Hairline :</b> ' + val('consultHairline', val('Hairline (Consultant)')) + '</p>'
    + '<p class="f"><b>Hairstyle :</b> ' + val('hairstyle', val('Hairstyle')) + '</p>'
    + '<p class="f"><b>Base :</b> ' + val('consultBase', val('Base (Consultant)')) + '</p>'
    + '<p class="f"><b>Life :</b> ' + val('life', val('Life (in Months)')) + '</p>'
    + '<p class="f"><b>Notes 1:</b> ' + val('notes1', val('Notes 1 (From Consultant)')) + '</p>'

    + '<h2>Payment Details</h2>'
    + '<p class="f"><b>Payment Done By :</b> ' + val('paymentDoneBy', val('Payment Done By')) + '</p>'
    + '<p class="f"><b>Total Bill amt :</b> ' + amount('totalBillAmount', amount('Total Bill Amount')) + '</p>'
    + '<p class="f"><b>Unit cost :</b> ' + amount('unitCost', amount('Unit Cost')) + '</p>'
    + '<p class="f"><b>Rush Order :</b> ' + amount('rushOrderCharges', amount('Rush Order Charges')) + '</p>'
    + '<p class="f"><b>No of Units Booked :</b> ' + val('noOfUnits', val('No of Units Booked', '1')) + '</p>'
    + '<p class="f"><b>Advance Paid :</b> ' + amount('advancePaid', amount('Advance Paid')) + '</p>'
    + '<p class="f"><b>Balance Payable :</b> ' + amount('balancePayable', amount('Balance Payable')) + '</p>'
    + '<p class="f"><b>GST Percentage (%) :</b> ' + val('gstPercentage', val('GST Percentage')) + '</p>'
    + '<p class="f"><b>GST Amount Charged :</b> ' + amount('gstAmountCharged', amount('GST Amount Charged')) + '</p>'
    + '<p class="f"><b>1st :</b> ' + amount('emi1Amount', amount('Emi 1 Amount')) + ' &nbsp;&nbsp;&nbsp;&nbsp; <b>Date :</b> ' + val('emi1Date', val('Emi 1 Date')) + '</p>'
    + '<p class="f"><b>2nd :</b> ' + amount('emi2Amount', amount('Emi 2 Amount')) + ' &nbsp;&nbsp;&nbsp;&nbsp; <b>Date :</b> ' + val('emi2Date', val('Emi 2 Date')) + '</p>'
    + '<p class="f"><b>3rd :</b> ' + amount('emi3Amount', amount('Emi 3 Amount')) + ' &nbsp;&nbsp;&nbsp;&nbsp; <b>Date :</b> ' + val('emi3Date', val('Emi 3 Date')) + '</p>'
    + '<p class="f"><b>Notes 2:</b> ' + val('notes2', val('Notes 2 (Payment Details)')) + '</p>'
    + '<p class="f"><b>Client type -</b> ' + val('clientStatus', val('Client Status', 'REGULAR')) + '</p>'
    + '<p class="f"><b>Pic Taken :</b> ' + val('picTaken', val('Pic Taken')) + ' &nbsp;&nbsp;&nbsp;&nbsp; <b>Reason :</b> ' + val('picTakenReason', val('Pic Not Taken Reason')) + '</p>'
    + '<p class="f"><b>Video Taken :</b> ' + val('videoTaken', val('Video Taken')) + ' &nbsp;&nbsp;&nbsp;&nbsp; <b>Reason :</b> ' + val('videoTakenReason', val('Video Not Taken Reason')) + '</p>'

    // PAGE 2: Client Specification & Technician Specification
    + '<div class="pb"></div>'
    + '<p class="f"><b>Mould Taken :</b> ' + val('mouldTaken', val('Mould Taken')) + ' &nbsp;&nbsp;&nbsp;&nbsp; <b>Reason :</b> ' + val('mouldTakenReason', val('Mould Not Taken Reason')) + '</p>'
    + '<p class="f"><b>Picture of Demo Unit :</b> ' + val('picDemoUnit', val('Picture of Demo unit')) + ' &nbsp;&nbsp;&nbsp;&nbsp; <b>Reason :</b> ' + val('picDemoUnitReason', val('Picture Demo Not Taken Reason')) + '</p>'
    + '<p class="f"><b>Client Picture After Given Demo :</b> ' + val('clientPicAfterDemo', val('Client picture after given demo')) + ' &nbsp;&nbsp;&nbsp;&nbsp; <b>Reason :</b> ' + val('clientPicAfterDemoReason', val('Client Pic Not Taken Reason')) + '</p>'

    + '<h2>Client Specification</h2>'
    + '<p class="f"><b>Size :</b> ' + val('size', val('Size')) + '</p>'
    + '<p class="f"><b>Size Other :</b> ' + val('sizeOther', val('Size Other')) + '</p>'
    + '<p class="f"><b>Base Type :</b> ' + val('baseType', val('Base Type')) + '</p>'
    + '<p class="f"><b>Code :</b> ' + val('code', val('Code')) + '</p>'
    + '<p class="f"><b>Colour :</b> ' + val('colour', val('Colour')) + '</p>'
    + '<p class="f"><b>Colour Other :</b> ' + val('targetColour', val('Target Colour')) + '</p>'
    + '<p class="f"><b>Grey (%) :</b> ' + val('grey', val('Grey (%)')) + '</p>'
    + '<p class="f"><b>Hairline of System :</b> ' + val('hairlineSystem', val('Hairline of system')) + '</p>'
    + '<p class="f"><b>Bleach Knots :</b> ' + val('blechKnots', val('Blech Knots')) + '</p>'
    + '<p class="f"><b>Work Type :</b> ' + val('workType', val('Work Type')) + '</p>'
    + '<p class="f"><b>Type of Density (Full Lace) :</b> ' + val('typeOfDensityFullLace', val('Type of Density (Full Lace)')) + '</p>'
    + '<p class="f"><b>Air Lace Amy :</b> ' + val('airLaceAmy', val('Air Lace Amy')) + '</p>'
    + '<p class="f"><b>Air Lace Nancy :</b> ' + val('airLaceNancy', val('Air Lace Nancy')) + '</p>'
    + '<p class="f"><b>Type of Density :</b> ' + val('typeOfDensity', val('Type of Density')) + '</p>'
    + '<p class="f"><b>Notes 3:</b> ' + val('notes3', val('Notes 3 (Client Specifications)')) + '</p>'
    + '<p class="f"><b>Colour On System :</b> ' + val('colorOnSystem', val('Color On System', val('colour', val('Colour')))) + '</p>'
    + '<p class="f"><b>Colour On Client :</b> ' + val('colorOnClients', val('Color On Clients', val('colour', val('Colour')))) + '</p>'

    + '<h2>To Do Afterwork</h2>'
    + '<p class="f"><b>To Do Afterwork:</b> ' + val('toDoAfterwork', val('To Do Afterwork')) + '</p>'

    + '<h2>Technician Specification</h2>'
    + '<p class="f"><b>Density :</b> ' + val('density', val('Density (Technician)', val('consultDensity', val('Density (Consultant)')))) + '</p>'
    + '<p class="f"><b>Hair Length :</b> ' + val('hairLength', val('Hair Length')) + '</p>'
    + '<p class="f"><b>Top :</b> ' + val('top', val('Top')) + ' &nbsp;&nbsp;&nbsp;&nbsp; <b>Front :</b> ' + val('front', val('Front')) + ' &nbsp;&nbsp;&nbsp;&nbsp; <b>Side :</b> ' + val('side', val('Side')) + ' &nbsp;&nbsp;&nbsp;&nbsp; <b>Back :</b> ' + val('back', val('Back')) + '</p>'
    + '<p class="f"><b>Parting :</b> ' + val('parting', val('Parting')) + '</p>'
    + '<p class="f"><b>Hairline :</b> ' + val('techHairline', val('Hairline (Technician)', val('consultHairline', val('Hairline (Consultant)')))) + '</p>'
    + '<p class="f"><b>Hairline Shape :</b> ' + val('hairlineShape', val('Hairline shape')) + '</p>'
    + '<p class="f"><b>Colour To Use On System :</b> ' + val('colourToUseOnSystem', val('Colour To use on system', val('colour', val('Colour')))) + '</p>'
    + '<p class="f"><b>Color on Hair Head :</b> ' + val('colourOnHairHead', val('Colour on Hair Head', val('colour', val('Colour')))) + '</p>'
    + '<p class="f"><b>Client Hairline :</b> ' + val('clientHairline', val('Client Hairline')) + '</p>'
    + '<p class="f"><b>Base Hairline :</b> ' + val('baseHairline', val('Base Hairline')) + '</p>'
    + '<p class="f"><b>Type Client :</b> ' + val('typeOfClient', val('Type of Client', 'Not Fussy')) + '</p>'
    + '<p class="f"><b>Bleach Knots :</b> ' + val('blechKnots', val('Blech Knots')) + '</p>'
    + '<p class="f"><b>Client Order Like :</b> ' + val('clientOrderLike', val('Client Order Like')) + '</p>'
    + '<p class="f"><b>Client Order Like (Other) :</b> ' + val('clientOrderLikeOther', val('Client Order Like Other')) + '</p>'

    // PAGE 3: Notes 4, History & Photos
    + '<div class="pb"></div>'
    + '<p class="f"><b>Notes 4:</b> ' + val('notes4', val('Notes 4 (Technician)')) + '</p>'
    + '<p class="f"><b>As Per Date :</b> ' + val('asPerDate', val('As per Date')) + '</p>'
    + '<p class="f"><b>Hairline Shaped :</b> ' + val('hairlineShaped', val('Hairline Shaped')) + '</p>'
    + '<p class="f"><b>Hairline Shaped 2 :</b> ' + val('hairlineShaped2', val('Hairline Shaped 2')) + '</p>'
    + '<p class="f"><b>Type :</b> ' + val('clientPreference', val('Client Preference')) + '</p>'

    + '<h2>Client History</h2>'
    + '<p class="f">No previous order history available.</p>'

    + '<h2>Client Photos</h2>'
    + '<p class="f">Current Order #' + esc(orderNum) + ' &bull; ' + val('orderDate', val('Order Date')) + '</p>'
    + '<p class="f">Photos synchronized with Google Drive media storage.</p>'

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
