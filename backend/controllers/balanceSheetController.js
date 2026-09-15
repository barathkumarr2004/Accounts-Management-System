const db = require("../config/db");
const model = require("../models/balanceSheetModel");

const getBalanceSheet = async (req, res) => {
  try {
    const [ledgers] = await db.query(
      "SELECT * FROM ledgers"
    );

    const [groups] = await db.query(
      "SELECT * FROM `groups`"
    );

    const [jes] = await db.query(
      "SELECT * FROM journal_entries"
    );

    const groupMap = {};

    groups.forEach((group) => {
      groupMap[group.id] = group;
    });

    const getNature = (groupId) => {
      let current = groupMap[groupId];
      let depth = 0;

      while (current && depth < 20) {
        if (
          current.nature_id !== null &&
          current.nature_id !== undefined
        ) {
          return Number(current.nature_id);
        }

        if (!current.parent_id) break;

        current = groupMap[current.parent_id];
        depth++;
      }

      return null;
    };

    const getMainGroup = (groupId) => {
      let current = groupMap[groupId];
      let depth = 0;

      while (
        current &&
        current.parent_id &&
        depth < 20
      ) {
        current = groupMap[current.parent_id];
        depth++;
      }

      return current;
    };

    const getGroupChain = (groupId) => {
      const names = [];
      let current = groupMap[groupId];
      let depth = 0;

      while (current && depth < 20) {
        names.push(
          String(current.name || "").toLowerCase()
        );

        if (!current.parent_id) break;

        current = groupMap[current.parent_id];
        depth++;
      }

      return names.join(" ");
    };

    const balanceMap = {};

    ledgers.forEach((ledger) => {
      balanceMap[ledger.id] = {
        id: ledger.id,
        name: ledger.name,
        group_id: ledger.group_id,
        debit: 0,
        credit: 0,
      };
    });

    jes.forEach((entry) => {
      const ledger = balanceMap[entry.ledger_id];

      if (!ledger) return;

      ledger.debit += Number(entry.debit || 0);
      ledger.credit += Number(entry.credit || 0);
    });

    const assetGroups = {};
    const liabilityGroups = {};

    let directIncome = 0;
    let indirectIncome = 0;
    let directExpense = 0;
    let indirectExpense = 0;

    Object.values(balanceMap).forEach((ledger) => {
      const debit = Number(ledger.debit || 0);
      const credit = Number(ledger.credit || 0);
      const balance = debit - credit;

      if (Math.abs(balance) < 0.01) return;

      const natureId = getNature(ledger.group_id);
      const groupChain = getGroupChain(ledger.group_id);
      const mainGroup = getMainGroup(ledger.group_id);

      if (!mainGroup) return;

      const mainGroupId = mainGroup.id;
      const mainGroupName = mainGroup.name;

      if (natureId === 3) {
        const amount = credit - debit;

        if (amount <= 0) return;

        if (!liabilityGroups[mainGroupId]) {
          liabilityGroups[mainGroupId] = {
            id: mainGroupId,
            name: mainGroupName,
            amount: 0,
            isPnl: false,
          };
        }

        liabilityGroups[mainGroupId].amount += amount;

        return;
      }

      if (natureId === 1 || natureId === 2) {
        const amount = debit - credit;

        if (amount > 0) {
          if (!assetGroups[mainGroupId]) {
            assetGroups[mainGroupId] = {
              id: mainGroupId,
              name: mainGroupName,
              amount: 0,
              isPnl: false,
            };
          }

          assetGroups[mainGroupId].amount += amount;
        } else if (amount < 0) {
          const liabilityAmount = Math.abs(amount);

          if (!liabilityGroups[mainGroupId]) {
            liabilityGroups[mainGroupId] = {
              id: mainGroupId,
              name: mainGroupName,
              amount: 0,
              isPnl: false,
            };
          }

          liabilityGroups[mainGroupId].amount +=
            liabilityAmount;
        }

        return;
      }

      if (natureId === 4) {
        const amount = credit - debit;

        if (amount <= 0) return;

        if (groupChain.includes("direct")) {
          directIncome += amount;
        } else {
          indirectIncome += amount;
        }

        return;
      }

      if (natureId === 5) {
        const amount = debit - credit;

        if (amount <= 0) return;

        if (
          groupChain.includes("direct") ||
          groupChain.includes("purchase")
        ) {
          directExpense += amount;
        } else {
          indirectExpense += amount;
        }
      }
    });

    const totalIncome =
      directIncome + indirectIncome;

    const totalExpense =
      directExpense + indirectExpense;

    const netProfit =
      totalIncome - totalExpense;

    let pnl = null;

    if (netProfit > 0) {
      pnl = {
        type: "Profit",
        amount: netProfit,
        totalIncome,
        totalExpense,
      };

      liabilityGroups["pnl-profit"] = {
        name: "Profit & Loss A/c",
        amount: netProfit,
        isPnl: true,
        type: "Profit",
      };
    }

    if (netProfit < 0) {
      const loss = Math.abs(netProfit);

      pnl = {
        type: "Loss",
        amount: loss,
        totalIncome,
        totalExpense,
      };

      assetGroups["pnl-loss"] = {
        name: "Profit & Loss A/c",
        amount: loss,
        isPnl: true,
        type: "Loss",
      };
    }

    const liabilities = Object.values(
      liabilityGroups
    );

    const assets = Object.values(assetGroups);

    const totalLiabilities = liabilities.reduce(
      (total, item) =>
        total + Number(item.amount || 0),
      0
    );

    const totalAssets = assets.reduce(
      (total, item) =>
        total + Number(item.amount || 0),
      0
    );

    return res.json({
      success: true,
      liabilities,
      assets,
      pnl,
      totalLiabilities,
      totalAssets,
    });
  } catch (error) {
    console.error(
      "GET BALANCE SHEET ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch balance sheet",
    });
  }
};

const getVouchersByLedger = async (req, res) => {
  try {
    const { id } = req.params;

    if (
      !id ||
      Number.isNaN(Number(id))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ledger ID",
      });
    }

    const vouchers =
      await model.getLedgerVouchers(id);

    return res.json({
      success: true,
      vouchers,
    });
  } catch (error) {
    console.error(
      "GET LEDGER VOUCHERS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch ledger vouchers",
    });
  }
};

const getVoucherDetail = async (req, res) => {
  try {
    const { voucherId } = req.params;

    if (
      !voucherId ||
      Number.isNaN(Number(voucherId))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid voucher ID",
      });
    }

    const data =
      await model.getVoucherFullDetail(
        voucherId
      );

    return res.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error(
      "GET VOUCHER DETAIL ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch voucher detail",
    });
  }
};

module.exports = {
  getBalanceSheet,
  getVouchersByLedger,
  getVoucherDetail,
};