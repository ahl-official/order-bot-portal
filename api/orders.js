const { getAllOrders } = require('../services/google');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const url = new URL(req.url, 'http://localhost');
    const search = (url.searchParams.get('search') || '').trim().toLowerCase();
    const branch = (url.searchParams.get('branch') || '').trim().toLowerCase();
    const wearer = (url.searchParams.get('wearer') || '').trim().toLowerCase();
    const phone = (url.searchParams.get('phone') || '').trim().replace(/\D/g, '').slice(-10);
    const forceRefresh = url.searchParams.get('forceRefresh') === 'true';

    let orders = await getAllOrders({ forceRefresh });

    if (phone) {
      orders = orders.filter(o => o.contactNo.replace(/\D/g, '').slice(-10) === phone);
    }
    if (branch && branch !== 'all') {
      orders = orders.filter(o => o.branch.toLowerCase().includes(branch));
    }
    if (wearer && wearer !== 'all') {
      orders = orders.filter(o => {
        const w = o.existingWearer.toLowerCase();
        if (wearer === 'crr') return w.includes('crr') || w.includes('repeat');
        if (wearer === 'nbd') return w.includes('nbd') || w.includes('new');
        return true;
      });
    }
    if (search) {
      orders = orders.filter(o =>
        o.orderNumber.toLowerCase().includes(search) ||
        o.clientName.toLowerCase().includes(search) ||
        o.contactNo.includes(search)
      );
    }

    return res.status(200).json({
      success: true,
      total: orders.length,
      orders
    });
  } catch (error) {
    console.error('API Orders Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

