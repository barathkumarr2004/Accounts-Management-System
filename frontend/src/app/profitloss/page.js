"use client";
import { useEffect, useState } from "react";

export default function ProfitLossPage() {
  const [leftData, setLeftData] = useState([]); // Expenses
  const [rightData, setRightData] = useState([]); // Incomes
  const [totals, setTotals] = useState({ left: 0, right: 0, profit: 0, loss: 0 });

  useEffect(() => {
    fetchProfitLoss();
  }, []);

  const fetchProfitLoss = async () => {
    // 1. Get your data - change this to your actual API / supabase calls
    // I am assuming you have same tables as balance sheet
    const ledgersRes = await fetch("/api/ledgers").then(r => r.json());
    const groupsRes = await fetch("/api/groups").then(r => r.json());
    const entriesRes = await fetch("/api/journal-entries").then(r => r.json());
    // entries = [{ ledger_id, dr_amount, cr_amount }]

    const groupsMap = {};
    groupsRes.forEach(g => groupsMap[g.id] = g);

    // 2. Calculate closing for each ledger
    const ledgerClosing = {};
    ledgersRes.forEach(l => {
      ledgerClosing[l.id] = { ledger: l, dr: 0, cr: 0 };
    });

    entriesRes.forEach(e => {
      if (ledgerClosing[e.ledger_id]) {
        ledgerClosing[e.ledger_id].dr += Number(e.dr_amount || 0);
        ledgerClosing[e.ledger_id].cr += Number(e.cr_amount || 0);
      }
    });

    const expenses = [];
    const incomes = [];
    let totalExp = 0;
    let totalInc = 0;

    Object.values(ledgerClosing).forEach(({ ledger, dr, cr }) => {
      const closing = dr - cr; // +ve = Dr, -ve = Cr
      const gInfo = groupsMap[ledger.group_id];
      if (!gInfo) return;

      const nature_id = gInfo.nature_id; // 3=Income, 4=Expense
      const nameLower = ledger.name.toLowerCase();

      // Tally Rule:
      // nature 4 = Expense -> Debit balance = Expense (positive closing)
      // nature 3 = Income -> Credit balance = Income (negative closing)

      if (nature_id === 4 || gInfo.name.toLowerCase().includes("expense") || nameLower.includes("rent") || nameLower.includes("salary")) {
        if (closing > 0) {
          expenses.push({ name: ledger.name, amount: closing });
          totalExp += closing;
        } else if (closing < 0) {
          // Negative expense = actually income (rare case)
          incomes.push({ name: ledger.name, amount: Math.abs(closing) });
          totalInc += Math.abs(closing);
        }
      }

      if (nature_id === 3 || gInfo.name.toLowerCase().includes("income") || nameLower.includes("sales") || nameLower.includes("service")) {
        if (closing < 0) {
          incomes.push({ name: ledger.name, amount: Math.abs(closing) });
          totalInc += Math.abs(closing);
        } else if (closing > 0) {
          expenses.push({ name: ledger.name, amount: closing });
          totalExp += closing;
        }
      }
    });

    // 3. Calculate Net Profit / Loss
    let profit = 0;
    let loss = 0;
    let finalLeftTotal = totalExp;
    let finalRightTotal = totalInc;

    if (totalInc > totalExp) {
      profit = totalInc - totalExp;
      finalLeftTotal = totalExp + profit; // Left = Expense + Net Profit
    } else {
      loss = totalExp - totalInc;
      finalRightTotal = totalInc + loss; // Right = Income + Net Loss
    }

    setLeftData(expenses);
    setRightData(incomes);
    setTotals({ left: finalLeftTotal, right: finalRightTotal, profit, loss, totalExp, totalInc });
  };

  return (
    <div className="p-4 bg-[#f0f0f0] min-h-screen">
      <h1 className="text-xl font-bold text-center mb-4">Profit & Loss A/c</h1>

      <div className="max-w-5xl mx-auto bg-white border border-black flex">
        {/* LEFT - Expenses */}
        <div className="w-1/2 border-r border-black">
          <div className="flex justify-between bg-gray-100 p-2 border-b border-black font-bold">
            <span>Particulars</span>
            <span>Amount</span>
          </div>
          <div className="p-2 min-h-[400px]">
            {leftData.map((item, i) => (
              <div key={i} className="flex justify-between py-1">
                <span>{item.name}</span>
                <span>{item.amount.toFixed(2)}</span>
              </div>
            ))}
            {totals.profit > 0 && (
              <div className="flex justify-between py-1 font-bold border-t mt-2">
                <span>Net Profit</span>
                <span>{totals.profit.toFixed(2)}</span>
              </div>
            )}
          </div>
          <div className="flex justify-between p-2 border-t border-black font-bold bg-gray-100">
            <span>Total</span>
            <span>{totals.left.toFixed(2)}</span>
          </div>
        </div>

        {/* RIGHT - Incomes */}
        <div className="w-1/2">
          <div className="flex justify-between bg-gray-100 p-2 border-b border-black font-bold">
            <span>Particulars</span>
            <span>Amount</span>
          </div>
          <div className="p-2 min-h-[400px]">
            {rightData.map((item, i) => (
              <div key={i} className="flex justify-between py-1">
                <span>{item.name}</span>
                <span>{item.amount.toFixed(2)}</span>
              </div>
            ))}
            {totals.loss > 0 && (
              <div className="flex justify-between py-1 font-bold border-t mt-2">
                <span>Net Loss</span>
                <span>{totals.loss.toFixed(2)}</span>
              </div>
            )}
            {/* Your current example */}
            {totals.totalInc === 0 && totals.loss > 0 && (
              <div className="text-xs text-gray-500 mt-2">* Eg: Rent 30,000 will come here as Net Loss</div>
            )}
          </div>
          <div className="flex justify-between p-2 border-t border-black font-bold bg-gray-100">
            <span>Total</span>
            <span>{totals.right.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="text-center mt-4 text-sm">
        {totals.loss > 0? `Net Loss: ${totals.loss}` : `Net Profit: ${totals.profit}`} | Left {totals.left} = Right {totals.right}
      </div>
    </div>
  );
}