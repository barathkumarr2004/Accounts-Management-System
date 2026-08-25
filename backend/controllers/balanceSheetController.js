// const db = require("../config/db");

// const getBalanceSheet = async (req, res) => {
//   try {
//     const [ledgers] = await db.query("SELECT * FROM ledgers");
//     const [groups] = await db.query("SELECT * FROM `groups`");
//     const [journalEntries] = await db.query("SELECT * FROM journal_entries");

//     const groupMap = {};
//     groups.forEach(g => groupMap[g.id] = g);

//     const getNatureId = (gid) => {
//       let curr = groupMap[gid];
//       let d = 0;
//       while (curr && d < 10) {
//         if (curr.nature_id) return Number(curr.nature_id);
//         if (curr.parent_id) curr = groupMap[curr.parent_id];
//         else break;
//         d++;
//       }
//       return 1;
//     };

//     const getGroupName = (gid) => {
//       let curr = groupMap[gid];
//       return curr? curr.name : "";
//     };

//     let bal = {};
//     ledgers.forEach(l => bal[l.id] = { name: l.name, group_id: l.group_id, dr: 0, cr: 0 });

//     journalEntries.forEach(j => {
//       if (bal[j.ledger_id]) {
//         bal[j.ledger_id].dr += Number(j.debit || 0);
//         bal[j.ledger_id].cr += Number(j.credit || 0);
//       }
//     });

//     let liabilities = [];
//     let assets = [];

//     Object.values(bal).forEach(b => {
//       const closing = b.dr - b.cr;
//       if (closing === 0) return;

//       const amount = Math.abs(closing);
//       const nid = getNatureId(b.group_id);
//       const gName = getGroupName(b.group_id);

//       // Correct Logic:
//       // nature_id 1=Assets, 2=Bank Accounts -> Assets
//       // nature_id 3=Liabilities -> Liabilities
//       // nature_id 4=Income -> Liabilities (P&L)
//       // nature_id 5=Expenses -> Assets (P&L)

//       if (nid === 1 || nid === 2) {
//         // Bank Accounts like sbi, hdfc, canara -> Assets
//         assets.push({ name: b.name, amount, group: gName });
//       } else if (nid === 3) {
//         liabilities.push({ name: b.name, amount, group: gName });
//       } else if (nid === 4) {
//         liabilities.push({ name: b.name, amount, group: gName });
//       } else if (nid === 5) {
//         // rent, Purchase -> Expense -> for Balance Sheet we show in Assets side
//         assets.push({ name: `${b.name} (Exp)`, amount, group: gName });
//       } else {
//         assets.push({ name: b.name, amount, group: gName });
//       }
//     });

//     // If you want Proper Balance Sheet (Only Assets & Liabilities, No Expense)
//     // Comment above and use this:
//     // Note: If you want ONLY Bank Accounts, filter like below
//     // For demo, we will keep Expense also to tally 35000=35000

//     // To show Bank as Assets and Rent as Liabilities for tally:
//     // Swap if needed - your API shows sbi in Liabilities, so if you want same as your API:
//     // Just exchange assets and liabilities arrays

//     // FINAL TALLY VERSION (As per your screenshot 35000=35000)
//     // If you want sbi,hdfc in Liabilities as per your last screenshot, use this below:
//     // liabilities = assets filter bank accounts
//     // Let's keep correct accounting: Bank in Assets

//     const totalLiabilities = liabilities.reduce((a,b)=>a+b.amount,0);
//     const totalAssets = assets.reduce((a,b)=>a+b.amount,0);

//     res.json({
//       success: true,
//       liabilities,
//       assets,
//       totalLiabilities,
//       totalAssets
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: err.message, liabilities: [], assets: [], totalLiabilities: 0, totalAssets: 0 });
//   }
// };

// module.exports = { getBalanceSheet };



const db = require("../config/db");

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

    let bal = {};
    ledgers.forEach(l => bal[l.id] = { name: l.name, group_id: l.group_id, dr:0, cr:0 });
    jes.forEach(j => {
      if(bal[j.ledger_id]){
        bal[j.ledger_id].dr+=Number(j.debit||0);
        bal[j.ledger_id].cr+=Number(j.credit||0);
      }
    });

    let liabilities = [];
    let assets = [];

    Object.values(bal).forEach(b => {
      const closing = b.dr - b.cr;
      if(closing === 0) return;

      const amount = Math.abs(closing); // Credit a irunthalum amount mattum eduppom
      const nid = getNature(b.group_id);
      const gName = gMap[b.group_id]?.name || "";

      // NEENGA SONNA CORRECT LOGIC:
      if (nid === 3) {
        // Liabilities group na - EPPAVUME Liabilities la
        liabilities.push({ name: b.name, amount, group: gName });
      } else if (nid === 1 || nid === 2) {
        // Assets / Bank group na - EPPAVUME Assets la
        assets.push({ name: b.name, amount, group: gName });
      }
      // nid 4,5 (Income, Expense) - SKIP - Engayume vara koodathu
    });

    res.json({
      success: true,
      liabilities,
      assets,
      totalLiabilities: liabilities.reduce((a,b)=>a+b.amount,0),
      totalAssets: assets.reduce((a,b)=>a+b.amount,0)
    });

  } catch(err){
    console.error(err);
    res.status(500).json({success:false, message: err.message});
  }
};

module.exports = { getBalanceSheet };