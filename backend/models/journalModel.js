const db = require("../config/db");
const VOUCHER_TYPES = require("../constants/voucherTypes");

const validVoucherTypes = Object.values(VOUCHER_TYPES);

const getNextVoucherNumber = async (
  connection,
  voucherType = "JOURNAL"
) => {
  if (!validVoucherTypes.includes(voucherType)) {
    throw new Error("Invalid voucher type");
  }

  const prefixes = {
    JOURNAL: "JV",
    SALES: "SV",
    PURCHASE: "PV",
    RECEIPT: "RV",
    PAYMENT: "PM",
  };

  const prefix = prefixes[voucherType];

  const [rows] = await connection.query(
    `
    SELECT voucher_number
    FROM journal_vouchers
    WHERE voucher_type = ?
    ORDER BY id DESC
    LIMIT 1
    `,
    [voucherType]
  );

  if (!rows.length) return `${prefix}-00001`;

  const number = parseInt(
    rows[0].voucher_number.split("-")[1],
    10
  );

  return `${prefix}-${String(number + 1).padStart(5, "0")}`;
};

const createJournalVoucher = async ({
  voucherType = "JOURNAL",
  voucherDate,
  narration,
  entries,
}) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const voucherNumber = await getNextVoucherNumber(
      connection,
      voucherType
    );

    const [voucherResult] = await connection.execute(
      `INSERT INTO journal_vouchers
       (
         voucher_number,
         voucher_type,
         voucher_date,
         narration
       )
       VALUES (?, ?, ?, ?)`,
      [
        voucherNumber,
        voucherType,
        voucherDate,
        narration || null,
      ]
    );

    const voucherId = voucherResult.insertId;

    for (const entry of entries) {
      await connection.execute(
        `INSERT INTO journal_entries
         (
           voucher_id,
           ledger_id,
           debit,
           credit
         )
         VALUES (?, ?, ?, ?)`,
        [
          voucherId,
          entry.ledgerId,
          entry.debit || 0,
          entry.credit || 0,
        ]
      );
    }

    await connection.commit();

    return {
      id: voucherId,
      voucher_number: voucherNumber,
      voucher_type: voucherType,
      voucher_date: voucherDate,
      narration: narration || null,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getAllJournals = async () => {
  const [rows] = await db.query(`
    SELECT
      jv.id AS voucher_id,
      jv.voucher_number,
      jv.voucher_type,
      jv.voucher_date,
      jv.narration,
      je.id AS entry_id,
      je.ledger_id,
      l.code AS ledger_code,
      l.name AS ledger_name,
      je.debit,
      je.credit
    FROM journal_vouchers jv
    LEFT JOIN journal_entries je
      ON jv.id = je.voucher_id
    LEFT JOIN ledgers l
      ON je.ledger_id = l.id
    ORDER BY
      jv.voucher_date DESC,
      jv.id DESC,
      je.id ASC
  `);

  const journals = [];

  rows.forEach((row) => {
    let journal = journals.find(
      (item) => item.id === row.voucher_id
    );

    if (!journal) {
      journal = {
        id: row.voucher_id,
        voucher_number: row.voucher_number,
        voucher_type: row.voucher_type,
        voucher_date: row.voucher_date,
        narration: row.narration,
        entries: [],
        total_debit: 0,
        total_credit: 0,
      };

      journals.push(journal);
    }

    if (row.entry_id) {
      journal.entries.push({
        id: row.entry_id,
        ledger_id: row.ledger_id,
        ledger_code: row.ledger_code,
        ledger_name: row.ledger_name,
        debit: Number(row.debit || 0),
        credit: Number(row.credit || 0),
      });

      journal.total_debit += Number(row.debit || 0);
      journal.total_credit += Number(row.credit || 0);
    }
  });

  return journals;
};

const getJournalVoucherById = async (id) => {
  const [vouchers] = await db.execute(
    `SELECT
       id,
       voucher_number,
       voucher_type,
       voucher_date,
       narration
     FROM journal_vouchers
     WHERE id = ?`,
    [id]
  );

  if (!vouchers.length) return null;

  const [entries] = await db.execute(
    `SELECT
       je.id,
       je.ledger_id,
       l.code AS ledger_code,
       l.name AS ledger_name,
       je.debit,
       je.credit
     FROM journal_entries je
     INNER JOIN ledgers l
       ON je.ledger_id = l.id
     WHERE je.voucher_id = ?
     ORDER BY je.id ASC`,
    [id]
  );

  return {
    ...vouchers[0],
    entries,
  };
};

module.exports = {
  getNextVoucherNumber,
  createJournalVoucher,
  getAllJournals,
  getJournalVoucherById,
};