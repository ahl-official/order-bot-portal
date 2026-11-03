const { lookupOrder } = require('../services/google');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { baseOrderNumber } = req.body || {};
    if (!baseOrderNumber) {
      return res.status(400).json({ success: false, message: 'Missing baseOrderNumber' });
    }

    const past = await lookupOrder(baseOrderNumber);
    if (!past) {
      return res.status(404).json({ success: false, message: 'Base order not found: ' + baseOrderNumber });
    }

    const oldData = past.orderData;
    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Kolkata' });

    // Generate new linked Order ID
    const baseId = oldData.orderNumber || baseOrderNumber;
    let newId;
    if (baseId.includes('-CRR')) {
      newId = baseId.replace(/-CRR(\d*)$/, (m, n) => '-CRR' + (parseInt(n || '1', 10) + 1));
    } else {
      newId = baseId + '-CRR';
    }

    // Clone past specs, reset financial and schedule fields
    const newOrderData = {
      ...oldData,
      orderNumber: newId,
      orderDate: today,
      existingWearer: 'CRR',
      clientOrderLike: 'Like Order 1',
      totalBillAmount: '',
      advancePaid: '',
      balancePayable: '',
      deliveryDate: '',
      unitCost: '',
      rushOrderCharges: '0',
      changesInPayment: 'No',
      notes2: `Repeat order cloned from ${baseId}`,
      pdfUrl: ''
    };

    return res.status(200).json({
      success: true,
      message: `Repeat order ${newId} initialized from ${baseId}`,
      newOrderData
    });
  } catch (error) {
    console.error('API Repeat Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

