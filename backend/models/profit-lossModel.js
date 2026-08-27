const db = require("../config/db");

const getProfitLossData = async () => {
  const [rows] = await db.execute(`
    SELECT
      n.name AS nature_name,
      l.name AS ledger_name,
      COALESCE(SUM(je.debit), 0) AS total_dr,
      COALESCE(SUM(je.credit), 0) AS total_cr

    FROM journal_entries je
    INNER JOIN 
    ledgers l  ON je.ledger_id = l.id

    INNER JOIN 
    \`groups\` g ON l.group_id = g.id

    INNER JOIN nature n ON g.nature_id = n.id

    WHERE n.name IN ('Income', 'Expenses')

    GROUP BY n.name, l.id, l.name

    ORDER BY n.name, l.name
  `);

  return rows;
};

module.exports = {
  getProfitLossData,
};