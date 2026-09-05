const receiptModel = require("../models/receiptModel");

const createReceiptVoucher = async (req, res) => {
  try {
    const {
      voucherDate,
      narration,
      bankLedgerId,
      partyLedgerId,
      amount,
    } = req.body;

    if (!voucherDate) {
      return res.status(400).json({
        success: false,
        message: "Voucher date is required",
      });
    }

    if (
      bankLedgerId === undefined ||
      bankLedgerId === null ||
      bankLedgerId === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Bank/cash ledger is required",
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

    const bankId = Number(bankLedgerId);
    const partyId = Number(partyLedgerId);
    const receiptAmount = Number(amount);

    if (!Number.isInteger(bankId) || bankId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid bank/cash ledger",
      });
    }

    if (!Number.isInteger(partyId) || partyId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid party ledger",
      });
    }

    if (
      !Number.isFinite(receiptAmount) ||
      receiptAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Receipt amount must be greater than zero",
      });
    }

    const receipt =
      await receiptModel.createReceiptVoucher({
        voucherDate,
        narration,
        bankLedgerId: bankId,
        partyLedgerId: partyId,
        amount: receiptAmount,
      });

    return res.status(201).json({
      success: true,
      message: "Receipt voucher created successfully",
      data: receipt,
    });
  } catch (error) {
    console.error("CREATE RECEIPT VOUCHER ERROR:", error);

    return res.status(400).json({
      success: false,
      message:
        error.message || "Unable to create receipt voucher",
    });
  }
};

module.exports = {
  createReceiptVoucher,
};