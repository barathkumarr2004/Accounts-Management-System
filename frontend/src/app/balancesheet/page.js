"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const BalanceSheet = () => {
  const [data, setData] = useState({ liabilities: [], assets: [], totalLiabilities: 0, totalAssets: 0, pnl: null });
  const [vouchers, setVouchers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedLedger, setSelectedLedger] = useState(null);
  const router = useRouter();

  const handleLedgerClick = async (ledger) => {
    if (ledger.isPnl) {
      router.push("/profitloss");
      return;
    }

    setSelectedLedger(ledger);

    try {
      const res = await axios.get(`http://localhost:5000/api/balancesheet/ledgers/${ledger.id}/vouchers`);
      setVouchers(res.data.vouchers || []);
      setShowModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/balancesheet");
        setData(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const totalLiabilities = Number(data.totalLiabilities || 0);
  const totalAssets = Number(data.totalAssets || 0);
  const isTally = totalLiabilities === totalAssets && totalLiabilities !== 0;

  const formatAmount = (amount) => Number(amount || 0).toFixed(2);

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB");
  };

  const totalDebit = vouchers.reduce((sum, voucher) => sum + Number(voucher.debit || 0), 0);
  const totalCredit = vouchers.reduce((sum, voucher) => sum + Number(voucher.credit || 0), 0);

  return (
    <div className="balance-page">
      <div className="balance-container">

        <header className={`balance-header ${isTally ? "tally-header" : "error-header"}`}>
          <div className="header-content">
            <div className="balance-icon">BS</div>
            <div>
              <h1>BALANCE SHEET</h1>
              <p>Statement of financial position</p>
            </div>
          </div>

          <div className={`tally-badge ${isTally ? "tally" : "not-tally"}`}>
            <span>{isTally ? "TALLIED" : "NOT TALLIED"}</span>
            <strong>₹ {formatAmount(totalLiabilities)} = ₹ {formatAmount(totalAssets)}</strong>
          </div>
        </header>

        <div className="balance-grid">

          <section className="balance-card liabilities-card">
            <div className="card-heading liabilities-heading">
              <div className="heading-left">
                <span className="section-number">01</span>
                <div>
                  <h2>Liabilities</h2>
                  <p>Capital and obligations</p>
                </div>
              </div>
              <span className="heading-amount">₹ {formatAmount(totalLiabilities)}</span>
            </div>

            <div className="table-heading">
              <span>Account</span>
              <span>Amount</span>
            </div>

            <div className="account-list">
              {data.liabilities.length === 0 ? (
                <div className="empty-account">No liabilities found</div>
              ) : (
                data.liabilities.map((ledger, index) => (
                  <div
                    className={`account-row ${ledger.isPnl ? "pnl-row" : ""}`}
                    key={`${ledger.id}-${index}`}
                    onClick={() => handleLedgerClick(ledger)}
                  >
                    <div className="account-name">
                      <span className="account-index">{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <strong>{ledger.name}</strong>
                        {ledger.isPnl && <small>Profit & Loss adjustment</small>}
                      </div>
                    </div>

                    <strong className={ledger.isPnl ? "pnl-amount" : "account-amount"}>
                      ₹ {formatAmount(ledger.amount)}
                    </strong>
                  </div>
                ))
              )}
            </div>

            <div className="card-total">
              <span>Total Liabilities</span>
              <strong>₹ {formatAmount(totalLiabilities)}</strong>
            </div>
          </section>

          <section className="balance-card assets-card">
            <div className="card-heading assets-heading">
              <div className="heading-left">
                <span className="section-number">02</span>
                <div>
                  <h2>Assets</h2>
                  <p>Resources owned by business</p>
                </div>
              </div>
              <span className="heading-amount">₹ {formatAmount(totalAssets)}</span>
            </div>

            <div className="table-heading">
              <span>Account</span>
              <span>Amount</span>
            </div>

            <div className="account-list">
              {data.assets.length === 0 ? (
                <div className="empty-account">No assets found</div>
              ) : (
                data.assets.map((ledger, index) => (
                  <div
                    className={`account-row ${ledger.isPnl ? "pnl-row asset-pnl" : ""}`}
                    key={`${ledger.id}-${index}`}
                    onClick={() => handleLedgerClick(ledger)}
                  >
                    <div className="account-name">
                      <span className="account-index">{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <strong>{ledger.name}</strong>
                        {ledger.isPnl && (
                          <small>
                            {ledger.type || "Loss"} • Expense ₹ {formatAmount(data.pnl?.totalExpense)}
                          </small>
                        )}
                      </div>
                    </div>

                    <strong className={ledger.isPnl ? "pnl-amount asset-pnl-text" : "account-amount"}>
                      ₹ {formatAmount(ledger.amount)} {ledger.isPnl ? "Dr" : ""}
                    </strong>
                  </div>
                ))
              )}

              {data.pnl && (
                <div className="formula-box">
                  <div className="formula-label">TALLY FORMULA</div>
                  <p>
                    Net Profit = (Direct + Indirect Income ₹ {formatAmount(data.pnl.totalIncome)}) - (Direct + Indirect Expense ₹ {formatAmount(data.pnl.totalExpense)})
                  </p>
                  <strong>
                    = {data.pnl.type} ₹ {formatAmount(data.pnl.amount)}
                  </strong>
                </div>
              )}
            </div>

            <div className="card-total">
              <span>Total Assets</span>
              <strong>₹ {formatAmount(totalAssets)}</strong>
            </div>
          </section>

        </div>

        <div className={`tally-result ${isTally ? "result-success" : "result-error"}`}>
          <div className="result-icon">{isTally ? "✓" : "!"}</div>
          <div>
            <strong>{isTally ? "Balance Sheet Tallied" : "Balance Sheet Not Tallied"}</strong>
            <p>
              Liabilities ₹ {formatAmount(totalLiabilities)} {isTally ? "=" : "≠"} Assets ₹ {formatAmount(totalAssets)}
            </p>
          </div>
        </div>

      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="voucher-modal" onClick={(event) => event.stopPropagation()}>

            <div className="modal-header">
              <div className="modal-title">
                <div className="modal-icon">LR</div>
                <div>
                  <h2>Ledger Transactions</h2>
                  <p>{selectedLedger?.name || "Ledger"} {selectedLedger?.code ? `• ${selectedLedger.code}` : ""}</p>
                </div>
              </div>

              <button className="close-button" onClick={() => setShowModal(false)}>×</button>
            </div>

            <div className="modal-summary">
              <div className="summary-box">
                <span>Transactions</span>
                <strong>{vouchers.length}</strong>
              </div>

              <div className="summary-box debit-box">
                <span>Total Debit</span>
                <strong>₹ {formatAmount(totalDebit)}</strong>
              </div>

              <div className="summary-box credit-box">
                <span>Total Credit</span>
                <strong>₹ {formatAmount(totalCredit)}</strong>
              </div>
            </div>

            <div className="modal-body">
              {vouchers.length === 0 ? (
                <div className="empty-modal">
                  <div className="empty-icon">LR</div>
                  <h3>No Transactions Found</h3>
                  <p>No voucher transactions are available for this ledger.</p>
                </div>
              ) : (
                <div className="voucher-table-wrapper">
                  <table className="voucher-table">
                    <thead>
                      <tr>
                        <th>Voucher No</th>
                        <th>Type</th>
                        <th>Date</th>
                        <th>Narration</th>
                        <th className="right">Debit</th>
                        <th className="right">Credit</th>
                        <th className="center">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {vouchers.map((voucher, index) => (
                        <tr key={`${voucher.id}-${index}`}>
                          <td>
                            <span className="voucher-number">
                              {voucher.voucher_number || "-"}
                            </span>
                          </td>

                          <td>
                            <span className={`voucher-type ${String(voucher.voucher_type || "JOURNAL").toLowerCase()}`}>
                              {voucher.voucher_type || "JOURNAL"}
                            </span>
                          </td>

                          <td>{formatDate(voucher.voucher_date)}</td>

                          <td className="narration">
                            {voucher.narration || "-"}
                          </td>

                          <td className="right debit-value">
                            {Number(voucher.debit || 0) > 0 ? `₹ ${formatAmount(voucher.debit)}` : "—"}
                          </td>

                          <td className="right credit-value">
                            {Number(voucher.credit || 0) > 0 ? `₹ ${formatAmount(voucher.credit)}` : "—"}
                          </td>

                          <td className="center">
                            <button
                              className="view-button"
                              onClick={() => {
                                setShowModal(false);
                                router.push(`/journal/${voucher.voucher_id}`);
                              }}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}

                      <tr className="total-row">
                        <td colSpan="4">Total</td>
                        <td className="right debit-value">₹ {formatAmount(totalDebit)}</td>
                        <td className="right credit-value">₹ {formatAmount(totalCredit)}</td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      <style>{`

        * { box-sizing:border-box; }

        .balance-page { min-height:100vh; padding:24px; background:#07111f; color:#e8f1f7; font-family:Arial,sans-serif; }

        .balance-container { width:100%; max-width:1250px; margin:0 auto; }

        .balance-header { min-height:88px; display:flex; align-items:center; justify-content:space-between; gap:20px; padding:16px 20px; margin-bottom:14px; background:linear-gradient(100deg,#0b1b31,#193d82); border:1px solid #2d78a8; border-radius:9px; box-shadow:0 10px 30px rgba(0,0,0,.25); }

        .tally-header { border-color:#16a7c9; }

        .error-header { border-color:#a63b49; }

        .header-content { display:flex; align-items:center; gap:13px; }

        .balance-icon { width:50px; height:50px; display:flex; align-items:center; justify-content:center; background:#0ea5e9; border-radius:8px; color:#fff; font-size:12px; font-weight:900; box-shadow:0 5px 16px rgba(14,165,233,.2); }

        .balance-header h1 { margin:0; color:#f5fbff; font-size:24px; font-weight:900; letter-spacing:.2px; }

        .balance-header p { margin:5px 0 0; color:#9ec8df; font-size:10px; }

        .tally-badge { display:flex; flex-direction:column; align-items:flex-end; gap:4px; padding:8px 12px; border-radius:5px; font-size:8px; font-weight:800; }

        .tally-badge strong { font-family:Consolas,monospace; font-size:11px; }

        .tally { background:#0b3035; border:1px solid #1596ae; color:#52d9ed; }

        .not-tally { background:#351920; border:1px solid #a23c4b; color:#ff8996; }

        .balance-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }

        .balance-card { min-height:530px; display:flex; flex-direction:column; overflow:hidden; background:#0d1c35; border-radius:9px; }

        .liabilities-card { border:1px solid #397bad; }

        .assets-card { border:1px solid #397bad; }

        .card-heading { min-height:70px; display:flex; align-items:center; justify-content:space-between; padding:11px 15px; }

        .liabilities-heading { background:#153b76; }

        .assets-heading { background:#172f65; }

        .heading-left { display:flex; align-items:center; gap:10px; }

        .section-number { width:28px; height:28px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.14); border-radius:5px; color:#9bc9e4; font-family:Consolas,monospace; font-size:9px; font-weight:800; }

        .card-heading h2 { margin:0; color:#f0f7fb; font-size:15px; text-transform:uppercase; }

        .card-heading p { margin:4px 0 0; color:#7898af; font-size:9px; }

        .heading-amount { color:#4bd5ed; font-family:Consolas,monospace; font-size:12px; font-weight:800; }

        .table-heading { display:grid; grid-template-columns:1fr 160px; padding:9px 15px; background:#091528; border-bottom:1px solid #1e354e; color:#607b92; font-size:9px; font-weight:800; text-transform:uppercase; }

        .table-heading span:last-child { text-align:right; }

        .account-list { flex:1; }

        .account-row { min-height:58px; display:flex; align-items:center; justify-content:space-between; gap:15px; padding:9px 15px; border-bottom:1px solid rgba(255,255,255,.065); cursor:pointer; transition:.15s ease; }

        .account-row:hover { background:#122b47; }

        .account-name { display:flex; align-items:center; gap:12px; min-width:0; }

        .account-index { color:#536c82; font-family:Consolas,monospace; font-size:9px; }

        .account-name div { display:flex; flex-direction:column; gap:3px; min-width:0; }

        .account-name strong { color:#eaf4fa; font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

        .account-name small { color:#5d788f; font-size:8px; }

        .account-amount { color:#48d8ef; font-family:Consolas,monospace; font-size:11px; white-space:nowrap; }

        .pnl-row { background:rgba(251,146,60,.08); }

        .pnl-row:hover { background:rgba(251,146,60,.15); }

        .pnl-row .account-name strong { color:#fb923c; }

        .pnl-amount { color:#fb923c; font-family:Consolas,monospace; font-size:11px; white-space:nowrap; }

        .asset-pnl { background:rgba(251,146,60,.08); }

        .asset-pnl-text { color:#fb923c; }

        .empty-account { min-height:350px; display:flex; align-items:center; justify-content:center; color:#536d82; font-size:11px; }

        .formula-box { margin:12px; padding:10px 12px; background:#0b182d; border:1px dashed #2a7197; border-radius:6px; }

        .formula-label { margin-bottom:5px; color:#5c819b; font-size:8px; font-weight:800; letter-spacing:.5px; }

        .formula-box p { margin:0; color:#8fa8ba; font-size:9px; line-height:1.6; }

        .formula-box strong { display:block; margin-top:5px; color:#fb923c; font-family:Consolas,monospace; font-size:9px; }

        .card-total { min-height:58px; display:flex; align-items:center; justify-content:space-between; padding:10px 15px; margin-top:auto; background:#071225; border-top:1px solid #3478a7; color:#edf5fa; font-size:12px; font-weight:800; }

        .card-total strong { color:#5ee2c2; font-family:Consolas,monospace; }

        .tally-result { min-height:54px; display:flex; align-items:center; justify-content:center; gap:10px; width:max-content; max-width:100%; margin:14px auto 0; padding:7px 18px; border-radius:6px; }

        .result-success { background:#b4f1d9; color:#064e3b; }

        .result-error { background:#ffd0d4; color:#7f1d1d; }

        .result-icon { width:22px; height:22px; display:flex; align-items:center; justify-content:center; border-radius:50%; background:rgba(0,0,0,.08); font-size:11px; font-weight:900; }

        .tally-result strong { display:block; font-size:10px; }

        .tally-result p { margin:3px 0 0; font-family:Consolas,monospace; font-size:9px; }

        .modal-overlay { position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; padding:20px; background:rgba(0,0,0,.78); backdrop-filter:blur(3px); }

        .voucher-modal { width:100%; max-width:1100px; max-height:88vh; display:flex; flex-direction:column; overflow:hidden; background:#0b172b; border:1px solid #347eaa; border-radius:9px; box-shadow:0 20px 70px rgba(0,0,0,.6); }

        .modal-header { display:flex; align-items:center; justify-content:space-between; padding:14px 17px; background:linear-gradient(100deg,#0d2139,#17376f); border-bottom:1px solid #285a82; }

        .modal-title { display:flex; align-items:center; gap:10px; }

        .modal-icon { width:38px; height:38px; display:flex; align-items:center; justify-content:center; background:#123d63; border:1px solid #3184aa; border-radius:6px; color:#55c9ee; font-size:9px; font-weight:900; }

        .modal-header h2 { margin:0; color:#edf8ff; font-size:15px; }

        .modal-header p { margin:4px 0 0; color:#7691a8; font-size:9px; }

        .close-button { width:30px; height:30px; border:1px solid #783a45; border-radius:5px; background:#351a20; color:#ff8995; font-size:19px; line-height:1; cursor:pointer; }

        .close-button:hover { background:#55232d; }

        .modal-summary { display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; padding:11px 14px; background:#081326; border-bottom:1px solid #1d344c; }

        .summary-box { padding:8px 10px; background:#0e2138; border:1px solid #203e59; border-radius:5px; }

        .summary-box span { display:block; margin-bottom:4px; color:#637f95; font-size:8px; text-transform:uppercase; }

        .summary-box strong { color:#dcecf7; font-family:Consolas,monospace; font-size:11px; }

        .debit-box strong { color:#f6c55c; }

        .credit-box strong { color:#5ee2c2; }

        .modal-body { overflow:auto; padding:14px; }

        .voucher-table-wrapper { overflow-x:auto; border:1px solid #203a54; border-radius:6px; }

        .voucher-table { width:100%; min-width:900px; border-collapse:collapse; font-size:10px; }

        .voucher-table th { padding:10px; background:#153b76; border-bottom:1px solid #3c79a7; color:#e6f2fc; text-align:left; font-size:8px; text-transform:uppercase; white-space:nowrap; }

        .voucher-table td { padding:10px; background:#0c1a2e; border-bottom:1px solid #1b3047; color:#a9bdce; white-space:nowrap; }

        .voucher-table tbody tr:hover td { background:#112943; }

        .voucher-table .right { text-align:right; }

        .voucher-table .center { text-align:center; }

        .voucher-number { color:#55c9ee; font-family:Consolas,monospace; font-weight:800; }

        .voucher-type { display:inline-block; padding:4px 7px; border:1px solid #2d4c66; border-radius:4px; background:#182c44; color:#9fc0d7; font-size:7px; font-weight:800; }

        .voucher-type.sales { background:#102f2c; border-color:#1d7062; color:#5ee2c2; }

        .voucher-type.purchase { background:#352b16; border-color:#786221; color:#f6c55c; }

        .voucher-type.receipt { background:#102f37; border-color:#267a8a; color:#55d6ee; }

        .voucher-type.payment { background:#351b24; border-color:#7b3748; color:#ff8995; }

        .voucher-type.journal { background:#202844; border-color:#45527a; color:#aebeff; }

        .narration { max-width:280px; overflow:hidden; text-overflow:ellipsis; }

        .debit-value { color:#f6c55c !important; font-family:Consolas,monospace; font-weight:700; }

        .credit-value { color:#5ee2c2 !important; font-family:Consolas,monospace; font-weight:700; }

        .view-button { min-height:28px; padding:0 10px; border:0; border-radius:4px; background:#0ea5c9; color:#fff; font-size:8px; font-weight:800; cursor:pointer; }

        .view-button:hover { background:#19b9dd; }

        .total-row td { background:#071225 !important; border-top:2px solid #347eaa; border-bottom:0; color:#e6f2fa; font-weight:800; }

        .empty-modal { min-height:260px; display:flex; align-items:center; justify-content:center; flex-direction:column; text-align:center; }

        .empty-icon { width:48px; height:48px; display:flex; align-items:center; justify-content:center; margin-bottom:10px; background:#123d63; border:1px solid #2d789e; border-radius:8px; color:#55c9ee; font-size:10px; font-weight:900; }

        .empty-modal h3 { margin:0; color:#dceaf5; font-size:14px; }

        .empty-modal p { margin:7px 0 0; color:#637d93; font-size:10px; }

        @media (max-width:900px) { .balance-grid { grid-template-columns:1fr; } .balance-card { min-height:430px; } }

        @media (max-width:650px) { .balance-page { padding:14px; } .balance-header { align-items:flex-start; flex-direction:column; } .tally-badge { width:100%; align-items:flex-start; } .card-heading { min-height:64px; } .account-row { padding:9px 12px; } .modal-overlay { padding:10px; } .modal-summary { grid-template-columns:1fr; } .modal-body { padding:10px; } .tally-result { width:100%; } }

      `}</style>
    </div>
  );
};

export default BalanceSheet;