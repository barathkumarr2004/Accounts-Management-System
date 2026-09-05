const db = require("../config/db");
const { getNextVoucherNumber } = require("./journalModel");

const createReceiptVoucher = async ({
  voucherDate,
  narration,
  bankLedgerId,
  partyLedgerId,
  amount,
}) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const bankId = Number(bankLedgerId);
    const partyId = Number(partyLedgerId);
    const receiptAmount = Number(amount);

    if (!Number.isInteger(bankId) || bankId <= 0) {
      throw new Error("Invalid bank/cash ledger");
    }

    if (!Number.isInteger(partyId) || partyId <= 0) {
      throw new Error("Invalid party ledger");
    }

    if (
      !Number.isFinite(receiptAmount) ||
      receiptAmount <= 0
    ) {
      throw new Error(
        "Receipt amount must be greater than zero"
      );
    }

    const [bankRows] = await connection.execute(
      `SELECT id, name
       FROM ledgers
       WHERE id = ?`,
      [bankId]
    );

    if (!bankRows.length) {
      throw new Error("Bank/cash ledger not found");
    }

    const [partyRows] = await connection.execute(
      `SELECT id, name
       FROM ledgers
       WHERE id = ?`,
      [partyId]
    );

    if (!partyRows.length) {
      throw new Error("Party ledger not found");
    }

    const voucherNumber = await getNextVoucherNumber(
      connection,
      "RECEIPT"
    );

    const [voucherResult] = await connection.execute(
      `INSERT INTO journal_vouchers
       (voucher_number, voucher_type, voucher_date, narration)
       VALUES (?, 'RECEIPT', ?, ?)`,
      [voucherNumber, voucherDate, narration || null]
    );

    const voucherId = voucherResult.insertId;

    await connection.execute(
      `INSERT INTO journal_entries
       (voucher_id, ledger_id, debit, credit)
       VALUES (?, ?, ?, ?)`,
      [voucherId, bankId, receiptAmount, 0]
    );

    await connection.execute(
      `INSERT INTO journal_entries
       (voucher_id, ledger_id, debit, credit)
       VALUES (?, ?, ?, ?)`,
      [voucherId, partyId, 0, receiptAmount]
    );

    await connection.commit();

    return {
      id: voucherId,
      voucher_number: voucherNumber,
      voucher_type: "RECEIPT",
      voucher_date: voucherDate,
      narration: narration || null,
      amount: receiptAmount,
      bank_ledger_id: bankId,
      party_ledger_id: partyId,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  createReceiptVoucher,
};