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

    const logs = await getAuditLogs({ forceRefresh, limit });

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

