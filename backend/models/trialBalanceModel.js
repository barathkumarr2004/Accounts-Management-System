const db = require("../config/db");

const getTrialBalance = async () => {
  const [rows] = await db.query(`
    SELECT
      main_group.id AS group_id,
      main_group.name AS group_name,

      SUM(
        CASE
          WHEN balances.balance > 0
          THEN balances.balance
          ELSE 0
        END
      ) AS total_debit,

      SUM(
        CASE
          WHEN balances.balance < 0
          THEN ABS(balances.balance)
          ELSE 0
        END
      ) AS total_credit

    FROM (
      SELECT
        l.id AS ledger_id,
        l.group_id,

        COALESCE(SUM(je.debit), 0)
        -
        COALESCE(SUM(je.credit), 0)
        AS balance

      FROM ledgers AS l

      INNER JOIN journal_entries AS je
        ON je.ledger_id = l.id

      GROUP BY
        l.id,
        l.group_id
    ) AS balances

    INNER JOIN \`groups\` AS current_group
      ON current_group.id = balances.group_id

    LEFT JOIN \`groups\` AS parent_group
      ON parent_group.id = current_group.parent_id

    INNER JOIN \`groups\` AS main_group
      ON main_group.id = COALESCE(
        parent_group.id,
        current_group.id
      )

    GROUP BY
      main_group.id,
      main_group.name

    HAVING
      total_debit > 0
      OR total_credit > 0

    ORDER BY
      main_group.id ASC
  `);

  return rows;
};

const getLedgerVouchers = async (ledgerId) => {
  const [rows] = await db.query(
    `
    SELECT
      je.id,
      je.debit,
      je.credit,
      jv.id AS voucher_id,
      jv.voucher_number,
      jv.voucher_type,
      jv.voucher_date,
      jv.narration

    FROM journal_entries AS je

    INNER JOIN journal_vouchers AS jv
      ON jv.id = je.voucher_id

    WHERE je.ledger_id = ?

    ORDER BY
      jv.voucher_date DESC,
      jv.id DESC,
      je.id ASC
    `,
    [ledgerId]
  );

  return rows;
};

module.exports = {
  getTrialBalance,
  getLedgerVouchers,
};