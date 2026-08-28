"use client";
import { useEffect, useState } from "react";
import axios from "axios";
const API_URL = "http://localhost:5000";
export default function TrialBalancePage() {
  const [data, setData] = useState([]);
  const [totals, setTotals] = useState({ totalDebit: 0, totalCredit: 0 });
  const [selectedLedger, setSelectedLedger] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
    axios.get(`${API_URL}/api/trialbalance`).then(res => {
      setData(res.data.data || []);
      setTotals({ totalDebit: res.data.totalDebit || 0, totalCredit: res.data.totalCredit || 0 });
    });
  }, []);
  const handleLedgerClick = async (ledger) => {
    setSelectedLedger(ledger);
    const res = await axios.get(`${API_URL}/api/trialbalance/${ledger.id}/vouchers`);
    setVouchers(res.data.data || res.data.vouchers || []);
    setShowModal(true);
  };
  const isTally = Number(totals.totalDebit) === Number(totals.totalCredit) && totals.totalDebit != 0;
  const tDr = vouchers.reduce((s, v) => s + Number(v.debit || 0), 0);
  const tCr = vouchers.reduce((s, v) => s + Number(v.credit || 0), 0);
  const bal = tDr - tCr;
  return (
    <div style={{ minHeight: "100vh", background: "#020617", padding: "24px", fontFamily: "Inter", color: "#e2e8f0" }}>
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(650px at 0% 0%, rgba(56,189,248,0.18), transparent)", pointerEvents: "none" }}></div>
      <div style={{ position: "relative", maxWidth: "1150px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #38bdf8", background: "rgba(2,6,23,0.85)", borderRadius: "18px", padding: "22px 28px", marginBottom: "22px", boxShadow: "0 0 25px rgba(56,189,248,0.15)" }}>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <div style={{ width: "50px", height: "50px", background: "#38bdf8", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#020617", fontWeight: 900, fontSize: "20px" }}>TB</div>
            <div>
              <div style={{ fontWeight: 900, color: "#38bdf8", fontSize: "22px", letterSpacing: "0.5px" }}>TRIAL BALANCE</div>
              <div style={{ fontSize: "15px", color: "#94a3b8", marginTop: "4px", fontWeight: 500 }}>{data.length} ledgers detected • Click any row to view entries</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ border: "1px solid #38bdf8", padding: "12px 20px", borderRadius: "10px", fontSize: "15px", color: "#38bdf8", fontWeight: 800 }}>DR: {Number(totals.totalDebit).toFixed(2)}</div>
            <div style={{ border: "1px solid #22d3ee", padding: "12px 20px", borderRadius: "10px", fontSize: "15px", color: "#22d3ee", fontWeight: 800 }}>CR: {Number(totals.totalCredit).toFixed(2)}</div>
            <div style={{ background: isTally ? "#38bdf8" : "#ef4444", color: isTally ? "#020617" : "#fff", padding: "12px 20px", borderRadius: "10px", fontSize: "15px", fontWeight: 900 }}>{isTally ? "TALLIED" : "MISMATCH"}</div>
          </div>
        </div>
        <div style={{ border: "1px solid rgba(56,189,248,0.25)", borderRadius: "18px", background: "rgba(15,23,42,0.75)", overflow: "hidden", backdropFilter: "blur(10px)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "0.5fr 2fr 1fr 1fr", padding: "18px 24px", background: "rgba(56,189,248,0.12)", borderBottom: "1px solid rgba(56,189,248,0.25)", fontSize: "14px", color: "#38bdf8", fontWeight: 800, letterSpacing: "0.8px" }}>
            <span>ID</span><span>LEDGER NAME</span><span style={{ textAlign: "right" }}>DEBIT</span><span style={{ textAlign: "right" }}>CREDIT</span>
          </div>
          {data.map((r, i) => (
            <div key={r.id} onClick={() => handleLedgerClick(r)} style={{ display: "grid", gridTemplateColumns: "0.5fr 2fr 1fr 1fr", padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)", cursor: "pointer", fontSize: "17px" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(56,189,248,0.1)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <span style={{ color: "#64748b", fontSize: "15px", fontWeight: 700 }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ fontWeight: 600, fontSize: "17px", color: "#f1f5f9" }}>{r.name}</span>
              <span style={{ textAlign: "right", fontFamily: "monospace", fontSize: "17px", color: r.debit ? "#38bdf8" : "#334155", fontWeight: 800 }}>{r.debit ? Number(r.debit).toFixed(2) : "—"}</span>
              <span style={{ textAlign: "right", fontFamily: "monospace", fontSize: "17px", color: r.credit ? "#22d3ee" : "#334155", fontWeight: 800 }}>{r.credit ? Number(r.credit).toFixed(2) : "—"}</span>
            </div>
          ))}
          <div style={{ display: "grid", gridTemplateColumns: "0.5fr 2fr 1fr 1fr", padding: "20px 24px", background: "rgba(56,189,248,0.22)", borderTop: "2px solid #38bdf8", fontWeight: 900, fontSize: "17px", color: "#38bdf8" }}>
            <span></span><span>TOTAL {data.length} FILES</span>
            <span style={{ textAlign: "right" }}>{Number(totals.totalDebit).toFixed(2)}</span>
            <span style={{ textAlign: "right" }}>{Number(totals.totalCredit).toFixed(2)}</span>
          </div>
        </div>
      </div>
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(2,6,23,0.88)", backdropFilter: "blur(14px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }}>
          <div style={{ background: "#0f172a", border: "1px solid #38bdf8", width: "96%", maxWidth: "1000px", borderRadius: "18px", overflow: "hidden", boxShadow: "0 0 50px rgba(56,189,248,0.3)" }}>
            <div style={{ padding: "20px 26px", borderBottom: "1px solid rgba(56,189,248,0.25)", display: "flex", justifyContent: "space-between", background: "rgba(56,189,248,0.08)" }}>
              <div><b style={{ color: "#38bdf8", fontSize: "19px" }}>{selectedLedger?.name} {vouchers.length} entries</b><div style={{ fontSize: "14px", color: "#94a3b8", marginTop: "6px", fontWeight: 500 }}>DR {tDr.toFixed(2)} | CR {tCr.toFixed(2)} | BAL {Math.abs(bal).toFixed(2)} {bal >= 0 ? "Dr" : "Cr"}</div></div>
              <button onClick={() => setShowModal(false)} style={{ background: "#38bdf8", border: "none", color: "#020617", padding: "11px 22px", borderRadius: "10px", fontWeight: 900, cursor: "pointer", fontSize: "15px" }}>CLOSE</button>
            </div>
            <div style={{ maxHeight: "60vh", overflow: "auto" }}>
              <table style={{ width: "100%", fontSize: "16px", borderCollapse: "collapse" }}>
                <thead style={{ background: "#020617", position: "sticky", top: 0, color: "#38bdf8" }}><tr><th style={{ padding: "16px", textAlign: "left", fontSize: "13px", fontWeight: 800 }}>VOUCHER NO</th><th style={{ padding: "16px", fontSize: "13px", fontWeight: 800 }}>DATE</th><th style={{ padding: "16px", textAlign: "left", fontSize: "13px", fontWeight: 800 }}>NARRATION</th><th style={{ padding: "16px", textAlign: "right", fontSize: "13px", fontWeight: 800 }}>DEBIT</th><th style={{ padding: "16px", textAlign: "right", fontSize: "13px", fontWeight: 800 }}>CREDIT</th><th></th></tr></thead>
                <tbody>
                  {vouchers.map(v => (
                    <tr key={v.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", color: "#cbd5e1" }}>
                      <td style={{ padding: "16px", fontFamily: "monospace", color: "#38bdf8", fontWeight: 800, fontSize: "15px" }}>{v.voucher_number || v.id}</td>
                      <td style={{ padding: "16px", textAlign: "center", fontSize: "15px" }}>{v.voucher_date ? new Date(v.voucher_date).toLocaleDateString() : ""}</td>
                      <td style={{ padding: "16px", fontSize: "16px", color: "#e2e8f0" }}>{v.narration}</td>
                      <td style={{ padding: "16px", textAlign: "right", color: "#38bdf8", fontWeight: 800, fontSize: "16px" }}>{Number(v.debit || 0).toFixed(2)}</td>
                      <td style={{ padding: "16px", textAlign: "right", color: "#22d3ee", fontWeight: 800, fontSize: "16px" }}>{Number(v.credit || 0).toFixed(2)}</td>
                      <td style={{ padding: "16px" }}><button onClick={() => window.location.href = `/journal/${v.voucher_id}`} style={{ border: "1px solid #38bdf8", background: "transparent", color: "#38bdf8", padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 800, cursor: "pointer" }}>OPEN</button></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot><tr style={{ background: "rgba(56,189,248,0.22)", fontWeight: 900, color: "#38bdf8", fontSize: "16px" }}><td colSpan={3} style={{ padding: "18px", textAlign: "right" }}>TOTAL OF {vouchers.length}</td><td style={{ padding: "18px", textAlign: "right" }}>{tDr.toFixed(2)}</td><td style={{ padding: "18px", textAlign: "right" }}>{tCr.toFixed(2)}</td><td style={{ padding: "18px", textAlign: "center" }}><span style={{ background: "#38bdf8", color: "#020617", padding: "6px 14px", borderRadius: "8px", fontSize: "14px" }}>BAL {Math.abs(bal).toFixed(2)}</span></td></tr></tfoot>
              </table>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", padding: "16px", background: "#020617" }}>
              <div style={{ border: "1px solid #38bdf8", borderRadius: "12px", padding: "16px", textAlign: "center" }}><div style={{ fontSize: "13px", color: "#64748b", fontWeight: 700 }}>DEBIT</div><div style={{ fontWeight: 900, color: "#38bdf8", fontSize: "18px", marginTop: "4px" }}>{tDr.toFixed(2)} ({vouchers.length})</div></div>
              <div style={{ border: "1px solid #22d3ee", borderRadius: "12px", padding: "16px", textAlign: "center" }}><div style={{ fontSize: "13px", color: "#64748b", fontWeight: 700 }}>CREDIT</div><div style={{ fontWeight: 900, color: "#22d3ee", fontSize: "18px", marginTop: "4px" }}>{tCr.toFixed(2)} ({vouchers.length})</div></div>
              <div style={{ background: "#38bdf8", borderRadius: "12px", padding: "16px", textAlign: "center", color: "#020617" }}><div style={{ fontSize: "13px", fontWeight: 800 }}>BALANCE</div><div style={{ fontWeight: 900, fontSize: "18px", marginTop: "4px" }}>{Math.abs(bal).toFixed(2)} {bal >= 0 ? "Dr" : "Cr"}</div></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
