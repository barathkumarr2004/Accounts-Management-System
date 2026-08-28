const model = require("../models/trialBalanceModel");

const getTrialBalanceController = async (req, res) => {
  try {
    const rows = await model.getTrialBalance();
    const trialData = [];
    let totalDebit = 0;
    let totalCredit = 0;

    rows.forEach(r => {
      const dr = Number(r.total_dr);
      const cr = Number(r.total_cr);
      const closing = dr - cr;
      if (closing === 0) return;

      if (closing > 0) {
        trialData.push({ id: r.ledger_id, name: r.ledger_name, debit: Math.abs(closing), credit: 0 });
        totalDebit += Math.abs(closing);
      } else {
        trialData.push({ id: r.ledger_id, name: r.ledger_name, debit: 0, credit: Math.abs(closing) });
        totalCredit += Math.abs(closing);
      }
    });

    res.json({ success: true, data: trialData, totalDebit, totalCredit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getVouchersByLedger = async (req, res) => {
  try {
    const ledgerId = req.params.ledgerId || req.params.id;
    const vouchers = await model.getLedgerVouchers(ledgerId);
    res.json({ success: true, data: vouchers, vouchers: vouchers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getTrialBalanceController, getVouchersByLedger };