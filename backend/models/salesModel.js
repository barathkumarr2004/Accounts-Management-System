const db = require("../config/db");

const createSalesVoucher = async ({
  voucherDate,
  narration,
  partyLedgerId,
  salesLedgerId,
  items,
}) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    if (!partyLedgerId || !salesLedgerId) {
      throw new Error(
        "Party ledger and sales ledger are required"
      );
    }

    if (!Array.isArray(items) || !items.length) {
      throw new Error("At least one item is required");
    }

    const partyId = Number(partyLedgerId);
    const salesId = Number(salesLedgerId);

    if (!Number.isInteger(partyId) || partyId <= 0) {
      throw new Error("Invalid party ledger");
    }

    if (!Number.isInteger(salesId) || salesId <= 0) {
      throw new Error("Invalid sales ledger");
    }

    let totalSalesAmount = 0;
    const stockItems = [];

    for (const item of items) {
      const stockId = Number(item.stockId);
      const quantity = Number(item.quantity);
      const salesRate = Number(item.rate);

      if (!Number.isInteger(stockId) || stockId <= 0) {
        throw new Error("Invalid stock item");
      }

      if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new Error("Quantity must be greater than zero");
      }

      if (!Number.isFinite(salesRate) || salesRate < 0) {
        throw new Error("Sales rate cannot be negative");
      }

      const [stockRows] = await connection.execute(
        `
        SELECT
          id,
          item_code,
          item_name,
          opening_qty,
          purchase_rate,
          sales_rate
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

      const [movementRows] = await connection.execute(
        `
        SELECT
          COALESCE(
            SUM(
              CASE
                WHEN transaction_type = 'IN'
                THEN quantity
                WHEN transaction_type = 'OUT'
                THEN -quantity
                ELSE 0
              END
            ),
            0
          ) AS movement_qty
        FROM stock_transactions
        WHERE stock_id = ?
        `,
        [stockId]
      );

      const openingQty = Number(stock.opening_qty || 0);
      const movementQty = Number(
        movementRows[0].movement_qty || 0
      );
      const currentQty = openingQty + movementQty;

      if (quantity > currentQty) {
        throw new Error(
          `Insufficient stock for ${stock.item_name}. ` +
          `Available: ${currentQty}`
        );
      }

      const salesAmount = quantity * salesRate;
      const stockRate = Number(stock.purchase_rate || 0);
      const stockAmount = quantity * stockRate;

      totalSalesAmount += salesAmount;

      stockItems.push({
        stockId,
        quantity,
        salesRate,
        salesAmount,
        stockRate,
        stockAmount,
      });
    }

    if (totalSalesAmount <= 0) {
      throw new Error(
        "Sales amount must be greater than zero"
      );
    }

    const [voucherRows] = await connection.execute(
      `
      SELECT voucher_number
      FROM journal_vouchers
      WHERE voucher_type = 'SALES'
      ORDER BY id DESC
      LIMIT 1
      `
    );

    let voucherNumber = "SV-00001";

    if (voucherRows.length) {
      const lastNumber =
        voucherRows[0].voucher_number;

      const number = parseInt(
        lastNumber.split("-")[1],
        10
      );

      voucherNumber = `SV-${String(number + 1)
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
      VALUES (?, 'SALES', ?, ?)
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
      [voucherId, partyId, totalSalesAmount, 0]
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
      [voucherId, salesId, 0, totalSalesAmount]
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
        VALUES (?, ?, 'OUT', ?, ?, ?)
        `,
        [
          item.stockId,
          voucherId,
          item.quantity,
          item.stockRate,
          item.stockAmount,
        ]
      );
    }

    await connection.commit();

    return {
      id: voucherId,
      voucher_number: voucherNumber,
      voucher_type: "SALES",
      voucher_date: voucherDate,
      narration: narration || null,
      total_amount: totalSalesAmount,
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
  createSalesVoucher,
};