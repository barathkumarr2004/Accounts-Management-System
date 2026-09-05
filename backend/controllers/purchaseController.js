const purchaseModel = require("../models/purchaseModel");

const createPurchaseVoucher = async (req, res) => {
  try {
    const {
      voucherDate,
      narration,
      supplierLedgerId,
      purchaseLedgerId,
      items,
    } = req.body;

    if (!voucherDate) {
      return res.status(400).json({
        success: false,
        message: "Voucher date is required",
      });
    }

    if (
      supplierLedgerId === undefined ||
      supplierLedgerId === null ||
      supplierLedgerId === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Supplier ledger is required",
      });
    }

    if (
      purchaseLedgerId === undefined ||
      purchaseLedgerId === null ||
      purchaseLedgerId === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Purchase ledger is required",
      });
    }

    const supplierId = Number(supplierLedgerId);
    const purchaseId = Number(purchaseLedgerId);

    if (!Number.isInteger(supplierId) || supplierId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid supplier ledger",
      });
    }

    if (!Number.isInteger(purchaseId) || purchaseId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid purchase ledger",
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
          message: "Purchase rate cannot be negative",
        });
      }
    }

    const purchase = await purchaseModel.createPurchaseVoucher({
      voucherDate,
      narration,
      supplierLedgerId: supplierId,
      purchaseLedgerId: purchaseId,
      items,
    });

    return res.status(201).json({
      success: true,
      message: "Purchase voucher created successfully",
      data: purchase,
    });
  } catch (error) {
    console.error("CREATE PURCHASE VOUCHER ERROR:", error);

    return res.status(400).json({
      success: false,
      message:
        error.message || "Unable to create purchase voucher",
    });
  }
};

module.exports = {
  createPurchaseVoucher,
};