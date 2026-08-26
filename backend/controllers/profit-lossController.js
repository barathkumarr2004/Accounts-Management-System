const profit_lossModel = require("../models/profit-lossModel");

const getProfitLoss = async (req, res) => {
    try {

        const rows = await profit_lossModel.getProfitLossData();

        let income = 0;
        let expenses = 0;

        rows.forEach(row => {

            if (row.nature_name === "Income") {
                income += Number(row.total_cr) - Number(row.total_dr);
            }

            if (row.nature_name === "Expenses") {
                expenses += Number(row.total_dr) - Number(row.total_cr);
            }

        });

        const result = income - expenses;

        return res.status(200).json({
            success: true,
            data: {
                income,
                expenses,
                profit: result > 0 ? result : 0,
                loss: result < 0 ? Math.abs(result) : 0
            }
        });

    } catch (error) {
        console.error("PROFIT LOSS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to read data"
        });
    }
};

module.exports = {
    getProfitLoss
};
