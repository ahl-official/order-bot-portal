const { lookupOrder } = require('../services/google');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const q = req.query.q || req.query.id || req.query.phone || req.query.orderNumber;
    if (!q) {
      return res.status(400).json({ success: false, message: 'Missing search query (q)' });
    }

    const result = await lookupOrder(q);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Order not found for: ' + q });
    }

    return res.status(200).json({
      success: true,
      orderNumber: result.orderNumber,
      order: result.orderData
    });
  } catch (error) {
    console.error('API Lookup Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

