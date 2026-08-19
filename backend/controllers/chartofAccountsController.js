const { getChartOfAccounts } = require('../models/chartOfAccountsModel');

const getCOA = async (req, res) => {
  try {
    const data = await getChartOfAccounts();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getCOA };