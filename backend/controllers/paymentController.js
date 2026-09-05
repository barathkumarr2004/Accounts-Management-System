const paymentModel = require("../models/paymentModel");

const createPaymentVoucher = async (req, res) => {
  try {
    const {
      voucherDate,
      narration,
      expenseLedgerId,
      bankLedgerId,
      amount,
    } = req.body;

    if (!voucherDate) {
      return res.status(400).json({
        success: false,
        message: "Voucher date is required",
      });
    }

    if (
      expenseLedgerId === undefined ||
      expenseLedgerId === null ||
      expenseLedgerId === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Expense/party ledger is required",
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

    const expenseId = Number(expenseLedgerId);
    const bankId = Number(bankLedgerId);
    const paymentAmount = Number(amount);

    if (!Number.isInteger(expenseId) || expenseId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid expense/party ledger",
      });
    }

    if (!Number.isInteger(bankId) || bankId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid bank/cash ledger",
      });
    }

    if (
      !Number.isFinite(paymentAmount) ||
      paymentAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment amount must be greater than zero",
      });
    }

    const payment =
      await paymentModel.createPaymentVoucher({
        voucherDate,
        narration,
        expenseLedgerId: expenseId,
        bankLedgerId: bankId,
        amount: paymentAmount,
      });

    return res.status(201).json({
      success: true,
      message: "Payment voucher created successfully",
      data: payment,
    });
  } catch (error) {
    console.error("CREATE PAYMENT VOUCHER ERROR:", error);

    return res.status(400).json({
      success: false,
      message:
        error.message || "Unable to create payment voucher",
    });
  }
};

module.exports = {
  createPaymentVoucher,
};