const fs = require('fs');
const https = require('https');
const crypto = require('crypto');
const path = require('path');

let cachedToken = null;
let tokenExpiry = 0;

let cachedOrders = null;
let cachedOrdersExpiry = 0;
let cachedLogs = null;
let cachedLogsExpiry = 0;

function clearCache() {
  cachedOrders = null;
  cachedOrdersExpiry = 0;
  cachedLogs = null;
  cachedLogsExpiry = 0;
}

function getCredentials() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    let key = String(process.env.GOOGLE_PRIVATE_KEY).trim();
    if (key.startsWith('"') && key.endsWith('"')) key = key.slice(1, -1);
    if (key.startsWith("'") && key.endsWith("'")) key = key.slice(1, -1);
    return {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL.trim(),
      private_key: key.replace(/\\n/g, '\n')
    };
  }
  // Local fallback: try loading ahl-sheets-automation-0e0bcacb69d7.json
  const candidatePaths = [
    path.join(__dirname, '..', '..', 'ahl-sheets-automation-0e0bcacb69d7.json'),
    path.join(__dirname, '..', 'ahl-sheets-automation-0e0bcacb69d7.json'),
    path.join(process.cwd(), 'ahl-sheets-automation-0e0bcacb69d7.json')
  ];
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf8'));
    }
  }
  throw new Error('Google Service Account credentials not found in env or file');
}

function getSheetDocId() {
  return process.env.GOOGLE_SHEET_DOCUMENT_ID || '1Z-sAT1BUDkfbVCx7GqsYPy31IXYlkhSCHwkeYZqJDIA';
}

function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && tokenExpiry > now + 60) {
    return Promise.resolve(cachedToken);
  }

  return new Promise((resolve, reject) => {
    try {
      const creds = getCredentials();
      const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
      const claimSet = Buffer.from(JSON.stringify({
        iss: creds.client_email,
        scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now
      })).toString('base64url');

      const sign = crypto.createSign('RSA-SHA256');
      sign.update(`${header}.${claimSet}`);
      sign.end();
      const signature = sign.sign(creds.private_key, 'base64url');
      const jwt = `${header}.${claimSet}.${signature}`;

      const postData = new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      }).toString();

      const req = https.request('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        }
      }, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.access_token) {
              cachedToken = parsed.access_token;
              tokenExpiry = now + (parsed.expires_in || 3600);
              resolve(cachedToken);
            } else {
              reject(new Error('Google Auth Failed: ' + data));
            }
          } catch(e) { reject(e); }
        });
      });
      req.on('error', reject);
      req.write(postData);
      req.end();
    } catch(err) {
      reject(err);
    }
  });
}

function requestGoogle(url, options = {}) {
  return getAccessToken().then(token => {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(options.headers || {})
      };
      const req = https.request(parsedUrl, {
        method: options.method || 'GET',
        headers
      }, res => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve({ status: res.statusCode, data: json });
          } catch (e) {
            resolve({ status: res.statusCode, data });
          }
        });
      });
      req.on('error', reject);
      if (options.body) req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
      req.end();
    });
  });
}

// Field mapping: maps our clean web app field names to exact Google Sheet column headers
const FIELD_TO_HEADER = {
  clientName: 'Client Name',
  contactNo: 'Contact No',
  orderNumber: 'Order Number',
  city: 'City',
  orderDate: 'Order Date',
  deliveryDate: 'Delivery Date',
  consultationBy: 'Consultation By',
  existingWearer: 'Existing Wearer',
  branch: 'Branch',
  technicianName: 'Technician Name',
  demoGivenBy: 'Demo Given By',
  clientPreference: 'Client Preference',
  consultDensity: 'Density (Consultant)',
  consultHairline: 'Hairline (Consultant)',
  hairstyle: 'Hairstyle',
  consultBase: 'Base (Consultant)',
  life: 'Life (in Months)',
  notes1: 'Notes 1 (From Consultant)',
  paymentDoneBy: 'Payment Done By',
  totalBillAmount: 'Total Bill Amount',
  unitCost: 'Unit Cost',
  rushOrderCharges: 'Rush Order Charges',
  noOfUnits: 'No of Units Booked',
  advancePaid: 'Advance Paid',
  balancePayable: 'Balance Payable',
  notes2: 'Notes 2 (Payment Details)',
  specialNotes: 'Special Notes',
  clientStatus: 'Client Status',
  size: 'Size',
  baseType: 'Base Type',
  code: 'Code',
  colour: 'Colour',
  targetColour: 'Target Colour',
  grey: 'Grey (%)',
  hairlineSystem: 'Hairline of system',
  blechKnots: 'Blech Knots',
  workType: 'Work Type',
  densityPercentage: 'Density Percentage',
  formFilledBy: 'Order Form Filled By',
  orderSource: 'Order Source',
  typeOfDensity: 'Type of Density',
  notes3: 'Notes 3 (Client Specifications)',
  toDoAfterwork: 'To Do Afterwork',
  density: 'Density (Technician)',
  hairLength: 'Hair Length',
  top: 'Top',
  front: 'Front',
  side: 'Side',
  back: 'Back',
  parting: 'Parting',
  techHairline: 'Hairline (Technician)',
  hairlineShape: 'Hairline shape',
  clientHairline: 'Client Hairline',
  baseHairline: 'Base Hairline',
  typeOfClient: 'Type of Client',
  clientOrderLike: 'Client Order Like',
  notes4: 'Notes 4 (Technician)',
  hairlineShaped: 'Hairline Shaped',
  photoFrontUrl: 'Upload Client Photo - Front',
  photoTopUrl: 'Upload Client Photo - Top',
  photoLeftUrl: 'Upload Client Photo - Left',
  photoRightUrl: 'Upload Client Photo - Right',
  photoBackUrl: 'Upload Client Photo - Back',
  videoUrl: 'Upload Video (From Technician)',
  mouldPhotoUrl: 'Client Mould Photo',
  picTakenReason: 'Pic Not Taken Reason',
  videoTakenReason: 'Video Not Taken Reason',
  mouldTakenReason: 'Mould Not Taken Reason',
  picDemoUnitReason: 'Picture of Demo Not Taken Reason',
  clientPicAfterDemoReason: 'Client picture after given Demo Not Taken reason',
  gstPercentage: 'GST Percentage',
  gstAmountCharged: 'GST Amount Charged',
  changesInPayment: 'Changes in Payment',
  asPerDate: 'As per Date',
  pdfUrl: 'PDF File'
};

const HEADER_TO_FIELD = Object.fromEntries(Object.entries(FIELD_TO_HEADER).map(([f, h]) => [h.trim().toLowerCase(), f]));

/**
 * Lookup an order by Order Number (e.g. "AHL-2006") or Contact Phone (e.g. "9167868154")
 */
async function lookupOrder(query) {
  const cleanQ = String(query || '').trim();
  if (!cleanQ) return null;
  const digits = cleanQ.replace(/\D/g, '').slice(-10);

  const sheetId = getSheetDocId();
  const range = encodeURIComponent('Order Forms!A1:CZ5000');
  const res = await requestGoogle(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}`);
  if (res.status !== 200 || !res.data.values) {
    throw new Error('Failed to fetch Order Forms sheet: ' + JSON.stringify(res.data));
  }

  const rows = res.data.values;
  const headers = rows[0] || [];

  // Identify column indices
  let orderColIdx = headers.findIndex(h => /order\s*number/i.test(h));
  let clientColIdx = headers.findIndex(h => /client\s*name/i.test(h));
  let phoneColIdx = headers.findIndex(h => /contact\s*no/i.test(h));
  if (orderColIdx === -1) orderColIdx = 3;
  if (clientColIdx === -1) clientColIdx = 1;
  if (phoneColIdx === -1) phoneColIdx = 2;

  // Search in reverse (most recent orders first)
  for (let i = rows.length - 1; i >= 1; i--) {
    const row = rows[i];
    const rowOrder = String(row[orderColIdx] || '').trim().toLowerCase();
    const rowClient = String(row[clientColIdx] || '').trim().toLowerCase();
    const rowPhone = String(row[phoneColIdx] || '').replace(/\D/g, '').slice(-10);

    const matchesOrder = rowOrder === cleanQ.toLowerCase() || rowOrder.includes(cleanQ.toLowerCase());
    const matchesClient = cleanQ.length >= 3 && rowClient.includes(cleanQ.toLowerCase());
    const matchesPhone = digits.length >= 10 && rowPhone === digits;

    if (matchesOrder || matchesClient || matchesPhone) {
      // Map row to our clean object
      const orderData = {};
      headers.forEach((h, colIdx) => {
        const key = HEADER_TO_FIELD[String(h || '').trim().toLowerCase()];
        if (key) {
          orderData[key] = row[colIdx] || '';
        }
      });
      return {
        rowIndex: i + 1, // 1-based index for Google Sheets API
        orderNumber: orderData.orderNumber || row[orderColIdx],
        orderData,
        headers
      };
    }
  }

  return null;
}

/**
 * Update an existing order row in Google Sheets
 */
async function updateOrderRow(rowIndex, updatedOrderData) {
  const sheetId = getSheetDocId();
  // Fetch current header row to ensure precise column positioning
  const headerRes = await requestGoogle(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent('Order Forms!A1:CZ1')}`);
  const headers = headerRes.data?.values?.[0] || [];

  // Build the updated row array
  const updatedRow = [];
  headers.forEach((h) => {
    const key = HEADER_TO_FIELD[String(h || '').trim().toLowerCase()];
    if (key && Object.prototype.hasOwnProperty.call(updatedOrderData, key)) {
      updatedRow.push(updatedOrderData[key]);
    } else {
      updatedRow.push(''); // Will be filled with existing or empty
    }
  });

  // Fetch existing row to preserve columns we didn't touch
  const rowRes = await requestGoogle(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(`Order Forms!A${rowIndex}:CZ${rowIndex}`)}`);
  const existingRow = rowRes.data?.values?.[0] || [];

  const mergedRow = headers.map((h, colIdx) => {
    const key = HEADER_TO_FIELD[String(h || '').trim().toLowerCase()];
    if (key && updatedOrderData[key] !== undefined && updatedOrderData[key] !== null) {
      return String(updatedOrderData[key]);
    }
    return existingRow[colIdx] !== undefined ? existingRow[colIdx] : '';
  });

  // Update the row in Google Sheets
  const updateRange = encodeURIComponent(`Order Forms!A${rowIndex}:CZ${rowIndex}`);
  const putRes = await requestGoogle(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${updateRange}?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    body: { values: [mergedRow] }
  });

  clearCache();
  return putRes.status === 200;
}

/**
 * Fetch all filled orders from 'Order Forms' with caching
 */
async function getAllOrders(options = {}) {
  const now = Date.now();
  if (!options.forceRefresh && cachedOrders && cachedOrdersExpiry > now) {
    return cachedOrders;
  }

  const sheetId = getSheetDocId();
  const range = encodeURIComponent('Order Forms!A1:CZ2000');
  const res = await requestGoogle(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}`);
  if (res.status !== 200 || !res.data.values) {
    throw new Error('Failed to fetch Order Forms sheet: ' + JSON.stringify(res.data));
  }

  const rows = res.data.values;
  const headers = rows[0] || [];

  const col = (regex, fallback) => {
    const idx = headers.findIndex(h => regex.test(String(h || '')));
    return idx !== -1 ? idx : fallback;
  };

  const cOrder = col(/order\s*number/i, 3);
  const cClient = col(/client\s*name/i, 1);
  const cPhone = col(/contact\s*no/i, 2);
  const cCity = col(/^city$/i, 4);
  const cOrderDate = col(/order\s*date/i, 6);
  const cDeliveryDate = col(/delivery\s*date/i, 7);
  const cWearer = col(/existing\s*wearer/i, 10);
  const cBranch = col(/branch/i, 11);
  const cTotal = col(/total\s*bill/i, 22);
  const cAdvance = col(/advance\s*paid/i, 26);
  const cBalance = col(/balance\s*payable/i, 27);
  const cPaymentDoneBy = col(/payment\s*done\s*by/i, 21);
  const cSize = col(/^size$/i, 39);
  const cBaseType = col(/base\s*type/i, 41);
  const cHairLength = col(/hair\s*length/i, 58);
  const cPdf = col(/pdf\s*file/i, 84);
  const cTech = col(/technician\s*name/i, 12);
  const cConsult = col(/consultation\s*by/i, 8);
  const cWorkType = col(/work\s*type/i, 48);
  const cDensityPerc = col(/density\s*percentage/i, 51);
  const cFormFilledBy = col(/order\s*form\s*filled\s*by|form\s*filled\s*by/i, -1);
  const cOrderSource = col(/order\s*source|package\s*source/i, -1);

  const orders = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length === 0) continue;
    const orderNum = String(r[cOrder] || '').trim();
    const clientName = String(r[cClient] || '').trim();
    if (!orderNum && !clientName) continue;

    orders.push({
      rowIndex: i + 1,
      orderNumber: orderNum,
      clientName,
      contactNo: String(r[cPhone] || '').trim(),
      city: String(r[cCity] || '').trim(),
      orderDate: String(r[cOrderDate] || '').trim(),
      deliveryDate: String(r[cDeliveryDate] || '').trim(),
      existingWearer: String(r[cWearer] || '').trim(),
      branch: String(r[cBranch] || '').trim(),
      totalBillAmount: String(r[cTotal] || '0').trim(),
      advancePaid: String(r[cAdvance] || '0').trim(),
      balancePayable: String(r[cBalance] || '0').trim(),
      paymentDoneBy: String(r[cPaymentDoneBy] || '').trim(),
      size: String(r[cSize] || '').trim(),
      baseType: String(r[cBaseType] || '').trim(),
      hairLength: String(r[cHairLength] || '').trim(),
      technicianName: String(r[cTech] || '').trim(),
      consultationBy: String(r[cConsult] || '').trim(),
      workType: String(cWorkType !== -1 ? r[cWorkType] : '').trim(),
      densityPercentage: String(cDensityPerc !== -1 ? r[cDensityPerc] : '').trim(),
      formFilledBy: String(cFormFilledBy !== -1 ? r[cFormFilledBy] : '').trim(),
      orderSource: String(cOrderSource !== -1 ? r[cOrderSource] : '').trim(),
      pdfUrl: String(r[cPdf] || '').trim()
    });
  }

  // Reverse so newest orders are first
  orders.reverse();

  cachedOrders = orders;
  cachedOrdersExpiry = now + 15000;
  return orders;
}

/**
 * Fetch all audit logs from 'CRR New Order Changes Log' with caching
 */
async function getAuditLogs(options = {}) {
  const now = Date.now();
  if (!options.forceRefresh && cachedLogs && cachedLogsExpiry > now) {
    return cachedLogs;
  }

  const sheetId = getSheetDocId();
  const range = encodeURIComponent('CRR New Order Changes Log!A1:CZ1000');
  const res = await requestGoogle(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}`);
  if (res.status !== 200 || !res.data.values) {
    return [];
  }

  const rows = res.data.values;
  const headers = rows[0] || [];

  const logs = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length === 0) continue;
    const timestamp = String(r[0] || '').trim();
    const clientName = String(r[1] || '').trim();
    const contactNo = String(r[2] || '').trim();
    const orderNumber = String(r[3] || '').trim();
    if (!timestamp && !orderNumber) continue;

    logs.push({
      rowIndex: i + 1,
      timestamp,
      clientName,
      contactNo,
      orderNumber,
      city: String(r[4] || '').trim(),
      orderDate: String(r[6] || '').trim(),
      deliveryDate: String(r[7] || '').trim(),
      existingWearer: String(r[10] || '').trim(),
      branch: String(r[11] || '').trim(),
      technicianName: String(r[12] || '').trim(),
      totalBillAmount: String(r[22] || '').trim(),
      advancePaid: String(r[26] || '').trim(),
      balancePayable: String(r[27] || '').trim(),
      size: String(r[39] || '').trim(),
      baseType: String(r[41] || '').trim(),
      hairLength: String(r[58] || '').trim(),
      pdfUrl: String(r[84] || '').trim(),
      remarks: String(r[92] || r[28] || '').trim()
    });
  }

  logs.reverse();

  cachedLogs = logs;
  cachedLogsExpiry = now + 15000;
  return logs;
}

/**
 * Log an audit entry into 'CRR New Order Changes Log'
 */
async function logAudit(orderNumber, editorName, changeSummary, orderData = {}) {
  try {
    const sheetId = getSheetDocId();
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const headerRes = await requestGoogle(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent('CRR New Order Changes Log!A1:CZ1')}`);
    const headers = headerRes.data?.values?.[0] || [];

    const row = headers.map(h => {
      const cleanH = String(h || '').trim().toLowerCase();
      if (cleanH === 'timestamp') return timestamp;
      if (cleanH === 'order number') return orderNumber || orderData.orderNumber || '';
      if (cleanH === 'payment remarks' || cleanH === 'notes 2 (payment details)') {
        return `[Portal Edit by ${editorName || 'Staff'}] ${changeSummary || 'Details updated'}`;
      }
      const fieldKey = HEADER_TO_FIELD[cleanH];
      if (fieldKey && orderData[fieldKey] !== undefined) {
        return String(orderData[fieldKey]);
      }
      return '';
    });

    const range = encodeURIComponent('CRR New Order Changes Log!A:CZ');
    await requestGoogle(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}:append?valueInputOption=USER_ENTERED`, {
      method: 'POST',
      body: { values: [row] }
    });

    clearCache();
  } catch (err) {
    console.warn('Audit logging warning:', err.message);
  }
}

module.exports = {
  getAccessToken,
  requestGoogle,
  lookupOrder,
  updateOrderRow,
  getAllOrders,
  getAuditLogs,
  logAudit,
  clearCache,
  FIELD_TO_HEADER
};

