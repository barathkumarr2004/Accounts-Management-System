const db = require("../config/db");

const getTrialBalance = async () => {
  // je la irunthu ledger wise total dr, cr edukkrom
  const [rows] = await db.query(`
    SELECT
      l.id as ledger_id,
      l.name as ledger_name,
      SUM(je.debit) as total_dr,
      SUM(je.credit) as total_cr
    FROM journal_entries je
    JOIN ledgers l ON l.id = je.ledger_id
    GROUP BY l.id, l.name
  `);
  return rows;
};

const getLedgerVouchers = async (ledgerId) => {
  const [rows] = await db.query(`
    SELECT
      je.id,
      je.debit,
      je.credit,
      jv.id as voucher_id,
      jv.voucher_number,
      jv.voucher_date,
      jv.narration
    FROM journal_entries je
    JOIN journal_vouchers jv ON jv.id = je.voucher_id
    WHERE je.ledger_id =?
    ORDER BY jv.voucher_date DESC
  `, [ledgerId]);
  return rows;
};

module.exports = { getTrialBalance, getLedgerVouchers };

// module.exports = { getTrialBalance };