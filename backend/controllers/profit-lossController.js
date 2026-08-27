const profit_lossModel = require("../models/profit-lossModel");

const getProfitLoss = async (req, res) => {
  try {
    const rows = await profit_lossModel.getProfitLossData();

    let income = 0;
    let expenses = 0;

    rows.forEach((row) => {
      const debit = Number(row.total_dr) || 0;
      const credit = Number(row.total_cr) || 0;

      if (row.nature_name === "Income") {
        income += credit - debit;
      }

      if (row.nature_name === "Expenses") {
        expenses += debit - credit;
      }
    });

    const result = income - expenses;

    return res.status(200).json({
      success: true,

      data: {
        rows,

        income,
        expenses,

        profit: result > 0 ? result : 0,

        loss: result < 0 ? Math.abs(result) : 0,
      },
    });
  } catch (error) {
    console.error("Profit & Loss Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to read profit & loss data",
    });
  }
};

module.exports = {
  getProfitLoss,
};