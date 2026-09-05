const db = require("../config/db");
const { getNextVoucherNumber } = require("./journalModel");

const createPaymentVoucher = async ({
  voucherDate,
  narration,
  expenseLedgerId,
  bankLedgerId,
  amount,
}) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const expenseId = Number(expenseLedgerId);
    const bankId = Number(bankLedgerId);
    const paymentAmount = Number(amount);

    if (!Number.isInteger(expenseId) || expenseId <= 0) {
      throw new Error("Invalid expense/party ledger");
    }

    if (!Number.isInteger(bankId) || bankId <= 0) {
      throw new Error("Invalid bank/cash ledger");
    }

    if (
      !Number.isFinite(paymentAmount) ||
      paymentAmount <= 0
    ) {
      throw new Error(
        "Payment amount must be greater than zero"
      );
    }

    const [expenseRows] = await connection.execute(
      `SELECT id, name
       FROM ledgers
       WHERE id = ?`,
      [expenseId]
    );

    if (!expenseRows.length) {
      throw new Error(
        "Expense/party ledger not found"
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

    const voucherNumber = await getNextVoucherNumber(
      connection,
      "PAYMENT"
    );

    const [voucherResult] = await connection.execute(
      `INSERT INTO journal_vouchers
       (
         voucher_number,
         voucher_type,
         voucher_date,
         narration
       )
       VALUES (?, 'PAYMENT', ?, ?)`,
      [
        voucherNumber,
        voucherDate,
        narration || null,
      ]
    );

    const voucherId = voucherResult.insertId;

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
        expenseId,
        paymentAmount,
        0,
      ]
    );

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
        bankId,
        0,
        paymentAmount,
      ]
    );

    await connection.commit();

    return {
      id: voucherId,
      voucher_number: voucherNumber,
      voucher_type: "PAYMENT",
      voucher_date: voucherDate,
      narration: narration || null,
      amount: paymentAmount,
      expense_ledger_id: expenseId,
      bank_ledger_id: bankId,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  createPaymentVoucher,
};