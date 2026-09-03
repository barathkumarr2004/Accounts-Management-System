const salesModel = require("../models/salesModel");

const createSalesVoucher = async (req, res) => {
  try {
    const {
      voucherDate,
      narration,
      partyLedgerId,
      salesLedgerId,
      items,
    } = req.body;

    if (!voucherDate) {
      return res.status(400).json({
        success: false,
        message: "Voucher date is required",
      });
    }

    if (
      partyLedgerId === undefined ||
      partyLedgerId === null ||
      partyLedgerId === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Party ledger is required",
      });
    }

    if (
      salesLedgerId === undefined ||
      salesLedgerId === null ||
      salesLedgerId === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Sales ledger is required",
      });
    }

    const partyId = Number(partyLedgerId);
    const salesId = Number(salesLedgerId);

    if (!Number.isInteger(partyId) || partyId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid party ledger",
      });
    }

    if (!Number.isInteger(salesId) || salesId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid sales ledger",
      });
    }

    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({
        success: false,
        message: "At least one stock item is required",
      });
    }

    for (const item of items) {
      const stockId = Number(item.stockId);
      const quantity = Number(item.quantity);
      const rate = Number(item.rate);

      if (!Number.isInteger(stockId) || stockId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid stock item",
        });
      }

      if (!Number.isFinite(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be greater than zero",
        });
      }

      if (!Number.isFinite(rate) || rate < 0) {
        return res.status(400).json({
          success: false,
          message: "Sales rate cannot be negative",
        });
      }
    }

    const sales = await salesModel.createSalesVoucher({
      voucherDate,
      narration,
      partyLedgerId: partyId,
      salesLedgerId: salesId,
      items,
    });

    return res.status(201).json({
      success: true,
      message: "Sales voucher created successfully",
      data: sales,
    });
  } catch (error) {
    console.error("CREATE SALES VOUCHER ERROR:", error);

    return res.status(400).json({
      success: false,
      message:
        error.message || "Unable to create sales voucher",
    });
  }
};

module.exports = {
  createSalesVoucher,
};