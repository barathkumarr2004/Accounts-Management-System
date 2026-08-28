"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const BalanceSheet = () => {
  const [data, setData] = useState({ liabilities: [], assets: [], totalLiabilities: 0, totalAssets: 0, pnl: null });
  // ==== ITHU MATTUM PUTHUSA ADD PANNEN DA ====
  const [vouchers, setVouchers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedLedger, setSelectedLedger] = useState(null);
  const router = useRouter();

  const handleLedgerClick = async (ledger) => {
    if (ledger.isPnl) return;
    setSelectedLedger(ledger);
    try {
      const res = await axios.get(`http://localhost:5000/api/balancesheet/ledgers/${ledger.id}/vouchers`);
      setVouchers(res.data.vouchers);
      setShowModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  // ==== MUDINCHU DA ====

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/balancesheet");
        console.log(res.data);
        setData(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const isTally = Number(data.totalLiabilities) === Number(data.totalAssets) && data.totalLiabilities!== 0;

  return (
    <div style={{ minHeight: "100vh", background: "#0b122e", color: "white", padding: "15px", fontFamily: "Arial" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: isTally? "2px solid #22d3ee" : "2px solid #f87171", borderRadius: "8px", padding: "12px 20px", background: "linear-gradient(90deg, #0b122e, #1e3a8a)", marginBottom: "12px" }}>
        <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "900" }}>BALANCE SHEET</h1>
        <span style={{ fontSize: "11px", background: isTally? "rgba(34,211,238,0.2)" : "rgba(248,113,113,0.2)", color: isTally? "#67e8f9" : "#fca5a5", padding: "5px 12px", borderRadius: "20px", border: isTally? "1px solid #22d3ee" : "1px solid #f87171" }}>
          {isTally? `Total Tallied: ${data.totalLiabilities}.00 = ${data.totalAssets}.00` : `Not Tallied: ${data.totalLiabilities}.00 ≠ ${data.totalAssets}.00`}
        </span>
      </div>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "300px", border: "1.5px solid #60a5fa", borderRadius: "12px", overflow: "hidden", background: "#131d42" }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 15px", background: "#1e3a8a", fontWeight: "bold", fontSize: "14px" }}>
            <span>LIABILITIES</span><span style={{ color: "#22d3ee" }}>AMOUNT</span>
          </div>
          <div style={{ minHeight: "420px" }}>
            {data.liabilities.length === 0? <p style={{ padding: "15px", opacity: 0.6 }}>No Liabilities</p> :
              data.liabilities.map((l, i) => (
                <div key={i} onClick={() => handleLedgerClick(l)} style={{ display: "flex", justifyContent: "space-between", padding: "12px 15px", borderBottom: "1px solid rgba(255,255,255,0.08)", fontSize: "14px", background: l.isPnl? "rgba(34,211,238,0.15)" : "transparent", cursor: l.isPnl ? "default" : "pointer" }}>
                  <span style={{ color: l.isPnl? "#6ee7b7" : "white", fontWeight: l.isPnl? "bold" : "normal" }}>{l.name}</span>
                  <span style={{ color: l.isPnl? "#6ee7b7" : "#22d3ee", fontWeight: "bold" }}>{Number(l.amount).toFixed(2)}</span>
                </div>
              ))
            }
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 15px", background: "rgba(0,0,0,0.6)", borderTop: "1px solid #60a5fa", fontWeight: "bold" }}>
            <span>Total</span><span style={{ color: "#6ee7b7" }}>{Number(data.totalLiabilities).toFixed(2)}</span>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: "300px", border: "1.5px solid #60a5fa", borderRadius: "12px", overflow: "hidden", background: "#131d42" }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 15px", background: "#172554", fontWeight: "bold", fontSize: "14px" }}>
            <span>ASSETS</span><span style={{ color: "#22d3ee" }}>AMOUNT</span>
          </div>
          <div style={{ minHeight: "420px" }}>
            {data.assets.length === 0? <p style={{ padding: "15px", opacity: 0.6 }}>No Assets</p> :
              data.assets.map((a, i) => (
                <div key={i} onClick={() => handleLedgerClick(a)} style={{ display: "flex", justifyContent: "space-between", padding: "12px 15px", borderBottom: "1px solid rgba(255,255,255,0.08)", fontSize: "14px", background: a.isPnl? "rgba(251,146,60,0.12)" : "transparent", cursor: a.isPnl ? "default" : "pointer" }}>
                  <span style={{ color: a.isPnl? "#fb923c" : "white", fontWeight: a.isPnl? "bold" : "normal" }}>
                    {a.name} {a.isPnl? <span style={{fontSize:"11px"}}>({a.type} - {data.pnl?.totalExpense} Exp)</span> : ""}
                  </span>
                  <span style={{ color: a.isPnl? "#fb923c" : "#22d3ee", fontWeight: "bold" }}>{Number(a.amount).toFixed(2)} {a.isPnl? "Dr" : ""}</span>
                </div>
              ))
            }
            {data.pnl && (
              <div style={{ margin: "12px", padding: "10px", border: "1px dashed rgba(34,211,238,0.5)", borderRadius: "8px", background: "rgba(30,47,90,0.6)", fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>
                Tally Formula: Net Profit = (Direct+Indirect Income {data.pnl.totalIncome}) - (Direct+Indirect Expense {data.pnl.totalExpense}) = {data.pnl.type} {data.pnl.amount}
              </div>
            )}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 15px", background: "rgba(0,0,0,0.6)", borderTop: "1px solid #60a5fa", fontWeight: "bold" }}>
            <span>Total</span><span style={{ color: "#6ee7b7" }}>{Number(data.totalAssets).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: "15px" }}>
        <div style={{ background: isTally? "#a7f3d0" : "#fecaca", color: isTally? "#064e3b" : "#7f1d1d", padding: "6px 18px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold" }}>
          {isTally? `Liabilities ${data.totalLiabilities}.00 = Assets ${data.totalAssets}.00 ✓ SAME` : `Liabilities ${data.totalLiabilities}.00 ≠ Assets ${data.totalAssets}.00 ✗ NOT TALLIED`}
        </div>
      </div>

      {/* ===== MODAL PUTHUSA ADD PANNEN DA - UN DESIGN LA VE ==== */}
      {showModal && (
         <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
         <div style={{ background: "#131d42", border: "1.5px solid #60a5fa", borderRadius: "12px", width: "90%", maxHeight: "80vh", overflow: "auto", padding: "20px" }}>
         <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
         <h3 style={{ margin: 0, color: "#22d3ee" }}>{selectedLedger?.name} - Vouchers</h3>
         <button onClick={() => setShowModal(false)} style={{ background: "#f87171", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px" }}>Close</button>
         </div>

  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", tableLayout: "fixed" }}>
  <thead>
    <tr style={{ background: "#1e3a8a" }}>
      <th style={{ padding: "10px", textAlign: "left", width: "14%" }}>Voucher No</th>
      <th style={{ padding: "10px", textAlign: "left", width: "14%" }}>Date</th>
      <th style={{ padding: "10px", textAlign: "left", width: "18%" }}>Narration</th>
      <th style={{ padding: "10px", textAlign: "right", width: "18%" }}>Debit</th>
      <th style={{ padding: "10px", textAlign: "right", width: "18%" }}>Credit</th>
      <th style={{ padding: "10px", textAlign: "center", width: "18%" }}>Action</th>
    </tr>
  </thead>
  <tbody>
    {vouchers.map((v) => (
      <tr key={v.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <td style={{ padding: "10px" }}>{v.voucher_number}</td>
        <td style={{ padding: "10px" }}>{new Date(v.voucher_date).toLocaleDateString()}</td>
        <td style={{ padding: "10px", opacity: 0.8 }}>{v.narration}</td>
        <td style={{ padding: "10px", textAlign: "right", color: "#fbbf24" }}>{Number(v.debit) > 0 ? Number(v.debit).toFixed(2) : "0.00"}</td>
        <td style={{ padding: "10px", textAlign: "right", color: "#6ee7b7" }}>{Number(v.credit) > 0 ? Number(v.credit).toFixed(2) : "0.00"}</td>
        <td style={{ padding: "10px", textAlign: "center" }}>
          <button onClick={() => { setShowModal(false); router.push(`/journal/${v.voucher_id}`); }} style={{ background: "#22d3ee", color: "#0b122e", border: "none", padding: "5px 12px", borderRadius: "5px", fontWeight: "bold", cursor: "pointer" }}>View</button>
        </td>
      </tr>
    ))}
    <tr style={{ background: "rgba(0,0,0,0.5)", fontWeight: "bold", borderTop: "2px solid #60a5fa" }}>
      <td colSpan={2} style={{ padding: "10px" }}></td>
      <td style={{ padding: "10px", textAlign: "right" }}>Total:</td>
      <td style={{ padding: "10px", textAlign: "right", color: "#fbbf24" }}>{vouchers.reduce((a,b)=>a+Number(b.debit||0),0).toFixed(2)}</td>
      <td style={{ padding: "10px", textAlign: "right", color: "#6ee7b7" }}>{vouchers.reduce((a,b)=>a+Number(b.credit||0),0).toFixed(2)}</td>
      <td></td>
    </tr>
  </tbody>
</table>
  </div>
          </div>
      )}
    </div>
  );
};

export default BalanceSheet;