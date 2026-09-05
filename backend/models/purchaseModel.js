const db = require("../config/db");

const createPurchaseVoucher = async ({
  voucherDate,
  narration,
  supplierLedgerId,
  purchaseLedgerId,
  items,
}) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    if (!supplierLedgerId || !purchaseLedgerId) {
      throw new Error(
        "Supplier ledger and purchase ledger are required"
      );
    }

    if (!Array.isArray(items) || !items.length) {
      throw new Error("At least one item is required");
    }

    const supplierId = Number(supplierLedgerId);
    const purchaseId = Number(purchaseLedgerId);

    if (!Number.isInteger(supplierId) || supplierId <= 0) {
      throw new Error("Invalid supplier ledger");
    }

    if (!Number.isInteger(purchaseId) || purchaseId <= 0) {
      throw new Error("Invalid purchase ledger");
    }

    let totalPurchaseAmount = 0;
    const stockItems = [];

    for (const item of items) {
      const stockId = Number(item.stockId);
      const quantity = Number(item.quantity);
      const purchaseRate = Number(item.rate);

      if (!Number.isInteger(stockId) || stockId <= 0) {
        throw new Error("Invalid stock item");
      }

      if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new Error("Quantity must be greater than zero");
      }

      if (!Number.isFinite(purchaseRate) || purchaseRate < 0) {
        throw new Error("Purchase rate cannot be negative");
      }

      const [stockRows] = await connection.execute(
        `
        SELECT
          id,
          item_code,
          item_name,
          purchase_rate
        FROM stock_master
        WHERE id = ?
          AND is_active = 1
        FOR UPDATE
        `,
        [stockId]
      );

      if (!stockRows.length) {
        throw new Error(
          `Stock item not found: ${stockId}`
        );
      }

      const stock = stockRows[0];
      const purchaseAmount = quantity * purchaseRate;

      totalPurchaseAmount += purchaseAmount;

      stockItems.push({
        stockId,
        quantity,
        purchaseRate,
        purchaseAmount,
        itemName: stock.item_name,
      });
    }

    if (totalPurchaseAmount <= 0) {
      throw new Error(
        "Purchase amount must be greater than zero"
      );
    }

    const [voucherRows] = await connection.execute(
      `
      SELECT voucher_number
      FROM journal_vouchers
      WHERE voucher_type = 'PURCHASE'
      ORDER BY id DESC
      LIMIT 1
      `
    );

    let voucherNumber = "PV-00001";

    if (voucherRows.length) {
      const lastNumber =
        voucherRows[0].voucher_number;

      const number = parseInt(
        lastNumber.split("-")[1],
        10
      );

      voucherNumber = `PV-${String(number + 1)
        .padStart(5, "0")}`;
    }

    const [voucherResult] = await connection.execute(
      `
      INSERT INTO journal_vouchers
      (
        voucher_number,
        voucher_type,
        voucher_date,
        narration
      )
      VALUES (?, 'PURCHASE', ?, ?)
      `,
      [
        voucherNumber,
        voucherDate,
        narration || null,
      ]
    );

    const voucherId = voucherResult.insertId;

    await connection.execute(
      `
      INSERT INTO journal_entries
      (
        voucher_id,
        ledger_id,
        debit,
        credit
      )
      VALUES (?, ?, ?, ?)
      `,
      [voucherId, purchaseId, totalPurchaseAmount, 0]
    );

    await connection.execute(
      `
      INSERT INTO journal_entries
      (
        voucher_id,
        ledger_id,
        debit,
        credit
      )
      VALUES (?, ?, ?, ?)
      `,
      [voucherId, supplierId, 0, totalPurchaseAmount]
    );

    for (const item of stockItems) {
      await connection.execute(
        `
        INSERT INTO stock_transactions
        (
          stock_id,
          voucher_id,
          transaction_type,
          quantity,
          rate,
          amount
        )
        VALUES (?, ?, 'IN', ?, ?, ?)
        `,
        [
          item.stockId,
          voucherId,
          item.quantity,
          item.purchaseRate,
          item.purchaseAmount,
        ]
      );
    }

    await connection.commit();

    return {
      id: voucherId,
      voucher_number: voucherNumber,
      voucher_type: "PURCHASE",
      voucher_date: voucherDate,
      narration: narration || null,
      total_amount: totalPurchaseAmount,
      items: stockItems,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  createPurchaseVoucher,
};