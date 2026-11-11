const { getAuditLogs } = require('../services/google');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const url = new URL(req.url, 'http://localhost');
    const forceRefresh = url.searchParams.get('forceRefresh') === 'true';
    const limit = parseInt(url.searchParams.get('limit') || '100', 10);
    const orderNumber = (url.searchParams.get('orderNumber') || url.searchParams.get('id') || url.searchParams.get('orderId') || '').trim().toLowerCase();

    let logs = await getAuditLogs({ forceRefresh, limit });
    if (orderNumber) {
      logs = logs.filter(l => (l.orderNumber || '').toLowerCase() === orderNumber);
    }

    return res.status(200).json({
      success: true,
      total: logs.length,
      logs: logs.slice(0, limit)
    });
  } catch (error) {
    console.error('API History Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

