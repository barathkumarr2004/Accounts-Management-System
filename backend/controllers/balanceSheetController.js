const db = require("../config/db");
const model = require("../models/balanceSheetModel"); // <-- ithu mattum puthusa add pannen da

const getBalanceSheet = async (req, res) => {
  try {
    const [ledgers] = await db.query("SELECT * FROM ledgers");
    const [groups] = await db.query("SELECT * FROM `groups`");
    const [jes] = await db.query("SELECT * FROM journal_entries");

    const gMap = {};
    groups.forEach(g => gMap[g.id] = g);

    const getNature = (gid) => {
      let c = gMap[gid], d=0;
      while(c && d<10){
        if(c.nature_id) return Number(c.nature_id);
        if(c.parent_id) c = gMap[c.parent_id];
        else break;
        d++;
      }
      return null;
    };

    const getGroupChain = (gid) => {
      let names = [];
      let c = gMap[gid], d=0;
      while(c && d<10){
        names.push((c.name||"").toLowerCase());
        if(c.parent_id) c = gMap[c.parent_id];
        else break;
        d++;
      }
      return names.join(" ");
    };

    let bal = {};
    ledgers.forEach(l => bal[l.id] = { id: l.id, name: l.name, group_id: l.group_id, dr:0, cr:0 });
    jes.forEach(j => {
      if(bal[j.ledger_id]){
        bal[j.ledger_id].dr+=Number(j.debit||0);
        bal[j.ledger_id].cr+=Number(j.credit||0);
      }
    });

    let liabilities = [];
    let assets = [];
    let directIncome = 0, indirectIncome = 0;
    let directExpense = 0, indirectExpense = 0;

    Object.values(bal).forEach(b => {
      const closing = b.dr - b.cr;
      if(closing === 0) return;
      const amount = Math.abs(closing);
      const nid = getNature(b.group_id);
      const chain = getGroupChain(b.group_id);

      if (nid === 3) {
        liabilities.push({ id: b.id, name: b.name, amount, isPnl: false });
      } else if (nid === 1 || nid === 2) {
        assets.push({ id: b.id, name: b.name, amount, isPnl: false });
      } else if (nid === 4) {
        if(chain.includes("direct")) directIncome += (b.cr - b.dr);
        else indirectIncome += (b.cr - b.dr);
      } else if (nid === 5) {
        if(chain.includes("direct") || chain.includes("purchase")) directExpense += (b.dr - b.cr);
        else indirectExpense += (b.dr - b.cr);
      }
    });

    // TALLY PRIME FORMULA
    const totalIncome = directIncome + indirectIncome;
    const totalExpense = directExpense + indirectExpense;
    const netProfit = totalIncome - totalExpense;

    let pnl = null;
    if (netProfit > 0) {
      pnl = { type: "Profit", amount: netProfit, totalIncome, totalExpense };
      liabilities.push({ name: "Profit & Loss A/c", amount: netProfit, isPnl: true, type: "Profit" });
    } else if (netProfit < 0) {
      const loss = Math.abs(netProfit);
      pnl = { type: "Loss", amount: loss, totalIncome, totalExpense };
      assets.push({ name: "Profit & Loss A/c", amount: loss, isPnl: true, type: "Loss" });
    }

    res.json({
      success: true,
      liabilities,
      assets,
      pnl,
      totalLiabilities: liabilities.reduce((a,b)=>a+b.amount,0),
      totalAssets: assets.reduce((a,b)=>a+b.amount,0)
    });

  } catch(err){
    console.error(err);
    res.status(500).json({success:false, message: err.message});
  }
};

// ===== ITHU MATTUM PUTHUSA ADD PANNEN DA =====
const getVouchersByLedger = async (req, res) => {
  try {
    const { id } = req.params;
    const vouchers = await model.getLedgerVouchers(id);
    res.json({ success: true, vouchers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getVoucherDetail = async (req, res) => {
  try {
    const { voucherId } = req.params;
    const data = await model.getVoucherFullDetail(voucherId);
    res.json({ success: true,...data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getBalanceSheet, getVouchersByLedger, getVoucherDetail };