const db = require("../config/db");

const getProfitLossData = async () => {
  const [ledgers] = await db.query(`
    SELECT id, code, name, group_id
    FROM ledgers
    ORDER BY id ASC
  `);

  const [groups] = await db.query(`
    SELECT id, code, name, nature_id, parent_id
    FROM \`groups\`
    ORDER BY id ASC
  `);

  const [entries] = await db.query(`
    SELECT id, voucher_id, ledger_id, debit, credit
    FROM journal_entries
    ORDER BY id ASC
  `);

  return { ledgers, groups, entries };
};

const getLedgerVouchers = async (ledgerId) => {
  const [rows] = await db.query(
    `
    SELECT
      je.id,
      je.debit,
      je.credit,
      jv.id AS voucher_id,
      jv.voucher_number,
      jv.voucher_date,
      jv.narration,
      l.code AS ledger_code,
      l.name AS ledger_name
    FROM journal_entries je
    INNER JOIN journal_vouchers jv ON jv.id = je.voucher_id
    INNER JOIN ledgers l ON l.id = je.ledger_id
    WHERE je.ledger_id = ?
    ORDER BY jv.voucher_date DESC, jv.id DESC, je.id ASC
    `,
    [ledgerId]
  );

  return rows;
};

const getVoucherFullDetail = async (voucherId) => {
  const [vouchers] = await db.query(
    `
    SELECT id, voucher_number, voucher_date, narration
    FROM journal_vouchers
    WHERE id = ?
    `,
    [voucherId]
  );

  if (!vouchers.length) return null;

  const [entries] = await db.query(
    `
    SELECT
      je.id,
      je.ledger_id,
      l.code AS ledger_code,
      l.name AS ledger_name,
      je.debit,
      je.credit
    FROM journal_entries je
    INNER JOIN ledgers l ON l.id = je.ledger_id
    WHERE je.voucher_id = ?
    ORDER BY je.id ASC
    `,
    [voucherId]
  );

  return {
    voucher: vouchers[0],
    entries,
  };
};

module.exports = {
  getProfitLossData,
  getLedgerVouchers,
  getVoucherFullDetail,
};