const db = require("../config/db");

exports.createJournal = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const {
      voucher_no,
      voucher_date,
      narration,
      lines,
    } = req.body;

    // Validate voucher
    if (
      !voucher_no ||
      !voucher_date ||
      !Array.isArray(lines) ||
      lines.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Voucher details and journal lines are required",
      });
    }

    let totalDebit = 0;
    let totalCredit = 0;

    for (const line of lines) {
      const accountId = Number(line.account_id);
      const debit = Number(line.debit || 0);
      const credit = Number(line.credit || 0);

      if (!Number.isInteger(accountId) || accountId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid ledger account",
        });
      }

      if (debit < 0 || credit < 0) {
        return res.status(400).json({
          success: false,
          message: "Debit and credit cannot be negative",
        });
      }

      if (debit > 0 && credit > 0) {
        return res.status(400).json({
          success: false,
          message: "A journal line cannot contain both debit and credit",
        });
      }

      if (debit === 0 && credit === 0) {
        return res.status(400).json({
          success: false,
          message: "Each journal line must have debit or credit",
        });
      }

      totalDebit += debit;
      totalCredit += credit;
    }

    // Avoid floating point comparison problems
    totalDebit = Number(totalDebit.toFixed(2));
    totalCredit = Number(totalCredit.toFixed(2));

    if (totalDebit !== totalCredit) {
      return res.status(400).json({
        success: false,
        message: "Debit and credit totals must be equal",
        totalDebit,
        totalCredit,
      });
    }

    if (totalDebit <= 0) {
      return res.status(400).json({
        success: false,
        message: "Journal amount must be greater than zero",
      });
    }

    await connection.beginTransaction();

    // Insert voucher header
    const [journal] = await connection.query(
      `
      INSERT INTO journal_entries
      (
        voucher_no,
        voucher_date,
        narration
      )
      VALUES (?, ?, ?)
      `,
      [
        voucher_no,
        voucher_date,
        narration || null,
      ]
    );

    const journalId = journal.insertId;

    // Insert voucher lines
    for (const line of lines) {
      await connection.query(
        `
        INSERT INTO journal_entry_lines
        (
          journal_id,
          account_id,
          debit,
          credit,
          description
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          journalId,
          Number(line.account_id),
          Number(line.debit || 0),
          Number(line.credit || 0),
          line.description || null,
        ]
      );
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Journal created successfully",
      journal_id: journalId,
      totalDebit,
      totalCredit,
    });

  } catch (error) {
  console.error("CREATE JOURNAL ERROR");
  console.error("MESSAGE:", error.message);
  console.error("CODE:", error.code);
  console.error("SQL MESSAGE:", error.sqlMessage);
  console.error("SQL:", error.sql);

  await connection.rollback();

  return res.status(500).json({
    success: false,
    message: error.message,
    code: error.code || null,
    sqlMessage: error.sqlMessage || null,
  });
}
};