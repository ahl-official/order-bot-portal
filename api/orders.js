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
    const workType = (url.searchParams.get('workType') || '').trim().toLowerCase();
    const consultant = (url.searchParams.get('consultant') || '').trim().toLowerCase();
    const payment = (url.searchParams.get('payment') || '').trim().toLowerCase();
    const phone = (url.searchParams.get('phone') || '').trim().replace(/\D/g, '').slice(-10);
    const forceRefresh = url.searchParams.get('forceRefresh') === 'true';

    let orders = await getAllOrders({ forceRefresh });

    if (phone) {
      orders = orders.filter(o => o.contactNo.replace(/\D/g, '').slice(-10) === phone);
    }
    if (branch && branch !== 'all') {
      orders = orders.filter(o => (o.branch || '').toLowerCase().includes(branch));
    }
    if (wearer && wearer !== 'all') {
      orders = orders.filter(o => {
        const w = (o.existingWearer || '').toLowerCase();
        if (wearer === 'nbd') {
          return (w.includes('nbd') || w.includes('new')) && !(w.includes('crr') || w.includes('repeat'));
        }
        if (wearer === 'nbd_crr') {
          return (w.includes('nbd') || w.includes('new')) && (w.includes('crr') || w.includes('repeat'));
        }
        if (wearer === 'repeat_order') {
          return (w.includes('repeat') || w.includes('crr')) && !(w.includes('nbd') || w.includes('new'));
        }
        if (wearer === 'repeat_crr') {
          return w.includes('repeat crr') || (w.includes('crr') && !w.includes('nbd'));
        }
        if (wearer === 'crr') return w.includes('crr') || w.includes('repeat');
        return true;
      });
    }
    if (workType && workType !== 'all') {
      orders = orders.filter(o => {
        const wt = (o.workType || '').toLowerCase();
        if (workType === 'regular') return wt === 'regular' || wt.includes('standard') || !wt;
        if (workType === 'local') return wt.includes('local');
        if (workType === 'semi') return wt.includes('semi');
        if (workType === 'custom') return wt.includes('custom') && !wt.includes('local') && !wt.includes('semi');
        return wt.includes(workType);
      });
    }
    if (consultant && consultant !== 'all') {
      orders = orders.filter(o => (o.consultationBy || '').toLowerCase().includes(consultant));
    }
    if (payment && payment !== 'all') {
      orders = orders.filter(o => {
        const total = parseFloat(o.totalBillAmount) || 0;
        const adv = parseFloat(o.advancePaid) || 0;
        const bal = parseFloat(o.balancePayable) || 0;
        if (payment === 'low_adv') return total > 0 && adv < 5000;
        if (payment === 'pending') return bal > 0;
        if (payment === 'paid') return bal <= 0;
        return true;
      });
    }
    if (search) {
      orders = orders.filter(o =>
        (o.orderNumber || '').toLowerCase().includes(search) ||
        (o.clientName || '').toLowerCase().includes(search) ||
        (o.contactNo || '').includes(search) ||
        (o.consultationBy || '').toLowerCase().includes(search) ||
        (o.technicianName || '').toLowerCase().includes(search)
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
