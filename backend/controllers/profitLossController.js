const db = require("../config/db");
const model = require("../models/profitLossModel");


const getNature = (groupId, groupMap) => {
  let current = groupMap[groupId];
  let depth = 0;

  while (current && depth < 20) {
    if (current.nature_id !== null && current.nature_id !== undefined) {
      return Number(current.nature_id);
    }

    if (!current.parent_id) break;

    current = groupMap[current.parent_id];
    depth++;
  }

  return null;
};

const getGroupChain = (groupId, groupMap) => {
  const names = [];
  let current = groupMap[groupId];
  let depth = 0;

  while (current && depth < 20) {
    names.push(String(current.name || "").toLowerCase());

    if (!current.parent_id) break;

    current = groupMap[current.parent_id];
    depth++;
  }

  return names.join(" ");
};

const getProfitLoss = async (req, res) => {
  try {
    const { ledgers, groups, entries } =
      await model.getProfitLossData();

    const groupMap = {};
    groups.forEach((group) => {
      groupMap[group.id] = group;
    });

    const balanceMap = {};

    ledgers.forEach((ledger) => {
      balanceMap[ledger.id] = {
        id: ledger.id,
        code: ledger.code,
        name: ledger.name,
        group_id: ledger.group_id,
        debit: 0,
        credit: 0,
      };
    });

    entries.forEach((entry) => {
      const ledger = balanceMap[entry.ledger_id];

      if (!ledger) return;

      ledger.debit += Number(entry.debit || 0);
      ledger.credit += Number(entry.credit || 0);
    });

    const directIncome = [];
    const indirectIncome = [];
    const directExpense = [];
    const indirectExpense = [];

    Object.values(balanceMap).forEach((ledger) => {
      const debit = Number(ledger.debit || 0);
      const credit = Number(ledger.credit || 0);
      const natureId = getNature(ledger.group_id, groupMap);
      const groupChain = getGroupChain(ledger.group_id, groupMap);

      if (natureId === 4) {
        const amount = credit - debit;

        if (amount <= 0) return;

        const item = {
          id: ledger.id,
          code: ledger.code,
          name: ledger.name,
          group_id: ledger.group_id,
          amount,
        };

        if (groupChain.includes("direct")) {
          directIncome.push(item);
        } else {
          indirectIncome.push(item);
        }

        return;
      }

      if (natureId === 5) {
        const amount = debit - credit;

        if (amount <= 0) return;

        const item = {
          id: ledger.id,
          code: ledger.code,
          name: ledger.name,
          group_id: ledger.group_id,
          amount,
        };

        if (
          groupChain.includes("direct") ||
          groupChain.includes("purchase")
        ) {
          directExpense.push(item);
        } else {
          indirectExpense.push(item);
        }
      }
    });

    const totalDirectIncome = directIncome.reduce(
      (total, item) => total + item.amount,
      0
    );

    const totalIndirectIncome = indirectIncome.reduce(
      (total, item) => total + item.amount,
      0
    );

    const totalDirectExpense = directExpense.reduce(
      (total, item) => total + item.amount,
      0
    );

    const totalIndirectExpense = indirectExpense.reduce(
      (total, item) => total + item.amount,
      0
    );

    const totalIncome =
      totalDirectIncome + totalIndirectIncome;

    const totalExpense =
      totalDirectExpense + totalIndirectExpense;

    const netProfitLoss = totalIncome - totalExpense;

    let resultType = "No Profit No Loss";
    let resultAmount = 0;

    if (netProfitLoss > 0) {
      resultType = "Profit";
      resultAmount = netProfitLoss;
    } else if (netProfitLoss < 0) {
      resultType = "Loss";
      resultAmount = Math.abs(netProfitLoss);
    }

    return res.status(200).json({
      success: true,
      data: {
        directIncome,
        indirectIncome,
        directExpense,
        indirectExpense,
        totalDirectIncome,
        totalIndirectIncome,
        totalDirectExpense,
        totalIndirectExpense,
        totalIncome,
        totalExpense,
        netProfitLoss,
        resultType,
        resultAmount,
      },
    });
  } catch (error) {
    console.error("GET PROFIT LOSS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load Profit & Loss",
    });
  }
};

const getVouchersByLedger = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ledger id
    if (!id || Number.isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid ledger id",
      });
    }

    const [rows] = await db.execute(
      `
      SELECT
        jv.id AS voucher_id,
        jv.voucher_number,
        jv.voucher_date,
        jv.narration,

        je.id AS entry_id,
        je.ledger_id,
        je.debit,
        je.credit

      FROM journal_entries je

      INNER JOIN journal_vouchers jv
        ON je.voucher_id = jv.id

      WHERE je.ledger_id = ?

      ORDER BY
        jv.voucher_date DESC,
        jv.id DESC,
        je.id ASC
      `,
      [Number(id)]
    );

    return res.status(200).json({
      success: true,
      vouchers: rows,
    });
  } catch (error) {
    console.error(
      "Get Ledger Vouchers Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch ledger vouchers",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

module.exports = {
  getProfitLoss,
  getVouchersByLedger,
};