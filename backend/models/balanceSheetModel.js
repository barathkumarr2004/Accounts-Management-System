const db = require("../config/db");

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


const getVoucherFullDetail = async (voucherId) => {
  const [voucher] = await db.query(`SELECT * FROM journal_vouchers WHERE id =?`, [voucherId]);
  const [entries] = await db.query(`
    SELECT je.*, l.name as ledger_name
    FROM journal_entries je
    JOIN ledgers l ON l.id = je.ledger_id
    WHERE je.voucher_id =?
  `, [voucherId]);
  return { voucher: voucher[0], entries };
};

module.exports = { getLedgerVouchers, getVoucherFullDetail };