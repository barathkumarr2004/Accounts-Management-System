"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { fetchProfitLoss, fetchLedgerVouchers, clearLedgerVouchers } from "../../store/slices/profitLossSlice";

const ProfitLoss = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const { data, loading, error, ledgerVouchers, ledgerVouchersLoading, ledgerVouchersError } = useSelector((state) => state.profitLoss);

  const [showModal, setShowModal] = useState(false);
  const [selectedLedger, setSelectedLedger] = useState(null);

  useEffect(() => {
    dispatch(fetchProfitLoss());
  }, [dispatch]);

  const directIncome = data?.directIncome || [];
  const indirectIncome = data?.indirectIncome || [];
  const directExpense = data?.directExpense || [];
  const indirectExpense = data?.indirectExpense || [];

  const incomeLedgers = useMemo(() => [...directIncome, ...indirectIncome], [directIncome, indirectIncome]);
  const expenseLedgers = useMemo(() => [...directExpense, ...indirectExpense], [directExpense, indirectExpense]);

  const totalIncome = Number(data?.totalIncome || 0);
  const totalExpense = Number(data?.totalExpense || 0);
  const resultAmount = Number(data?.resultAmount || 0);

  const isProfit = data?.resultType === "Profit";
  const isLoss = data?.resultType === "Loss";

  const handleLedgerClick = (ledger) => {
    setSelectedLedger(ledger);
    dispatch(clearLedgerVouchers());
    dispatch(fetchLedgerVouchers(ledger.id));
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedLedger(null);
    dispatch(clearLedgerVouchers());
  };

  const handleVoucherView = (voucher) => {
    if (!voucher?.voucher_id) return;
    closeModal();
    router.push(`/journal/${voucher.voucher_id}`);
  };

  const formatAmount = (amount) => Number(amount || 0).toFixed(2);

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB");
  };

  const voucherTotalDebit = ledgerVouchers.reduce((total, voucher) => total + Number(voucher.debit || 0), 0);
  const voucherTotalCredit = ledgerVouchers.reduce((total, voucher) => total + Number(voucher.credit || 0), 0);

  if (loading && !data) {
    return (
      <div className="pl-page">
        <div className="state-card">
          <div className="loading-circle">PL</div>
          <h2>Loading Profit & Loss</h2>
          <p>Please wait while the report is loading...</p>
        </div>

        <style>{`
          .pl-page { min-height:100vh; padding:24px; background:#07111f; color:#e8f1f7; font-family:Arial,sans-serif; }
          .state-card { min-height:300px; display:flex; align-items:center; justify-content:center; flex-direction:column; background:#0d1c35; border:1px solid #285a82; border-radius:10px; text-align:center; }
          .loading-circle { width:55px; height:55px; display:flex; align-items:center; justify-content:center; margin-bottom:15px; background:#123d63; border:1px solid #2c91bc; border-radius:10px; color:#55c9ee; font-weight:900; }
          .state-card h2 { margin:0 0 7px; color:#cce8ff; font-size:19px; }
          .state-card p { margin:0; color:#668199; font-size:12px; }
        `}</style>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="pl-page">
        <div className="state-card error-state">
          <div className="error-circle">!</div>
          <h2>Unable to Load Report</h2>
          <p>{error}</p>
          <button className="retry-button" onClick={() => dispatch(fetchProfitLoss())}>Retry</button>
        </div>

        <style>{`
          .pl-page { min-height:100vh; padding:24px; background:#07111f; color:#e8f1f7; font-family:Arial,sans-serif; }
          .state-card { min-height:300px; display:flex; align-items:center; justify-content:center; flex-direction:column; background:#0d1c35; border:1px solid #285a82; border-radius:10px; text-align:center; }
          .error-state { border-color:#8d333e; }
          .error-circle { width:55px; height:55px; display:flex; align-items:center; justify-content:center; margin-bottom:15px; background:#3a171d; border:1px solid #a33b47; border-radius:50%; color:#ff8994; font-size:22px; font-weight:900; }
          .state-card h2 { margin:0 0 7px; color:#cce8ff; font-size:19px; }
          .state-card p { max-width:500px; margin:0 0 18px; color:#ff8994; font-size:12px; }
          .retry-button { min-height:38px; padding:0 18px; border:0; border-radius:5px; background:#1267d6; color:#fff; font-weight:800; cursor:pointer; }
          .retry-button:hover { background:#1979f0; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="pl-page">
      <div className="pl-container">

        <header className={`pl-header ${isProfit ? "profit-border" : isLoss ? "loss-border" : ""}`}>
          <div className="header-left">
            <div className="pl-icon">PL</div>
            <div>
              <h1>Profit & Loss A/C</h1>
              <p>Income and expense statement for the business</p>
            </div>
          </div>

          <div className={`result-badge ${isProfit ? "profit-badge" : "loss-badge"}`}>
            <span>{isProfit ? "PROFIT" : "LOSS"}</span>
            <strong>₹ {formatAmount(resultAmount)}</strong>
          </div>
        </header>

        <div className="summary-grid">

          <section className="account-card income-card">
            <div className="card-header income-header">
              <div>
                <span className="section-label">01</span>
                <h2>Income</h2>
              </div>
              <strong>₹ {formatAmount(totalIncome)}</strong>
            </div>

            <div className="column-head">
              <span>#</span>
              <span>Ledger Account</span>
              <span>Amount</span>
            </div>

            <div className="ledger-list">
              {incomeLedgers.length === 0 ? (
                <div className="empty-row">No income found</div>
              ) : (
                incomeLedgers.map((ledger, index) => (
                  <div className="ledger-row" key={`income-${ledger.id}-${ledger.code}-${index}`} onClick={() => handleLedgerClick(ledger)}>
                    <span className="row-number">{String(index + 1).padStart(2, "0")}</span>
                    <div className="ledger-info">
                      <strong>{ledger.name}</strong>
                      {ledger.code && <small>{ledger.code}</small>}
                    </div>
                    <strong className="income-amount">₹ {formatAmount(ledger.amount)}</strong>
                  </div>
                ))
              )}
            </div>

            <div className="card-total income-total">
              <span>Total Income</span>
              <strong>₹ {formatAmount(totalIncome)}</strong>
            </div>
          </section>

          <section className="account-card expense-card">
            <div className="card-header expense-header">
              <div>
                <span className="section-label">02</span>
                <h2>Expenses</h2>
              </div>
              <strong>₹ {formatAmount(totalExpense)}</strong>
            </div>

            <div className="column-head">
              <span>#</span>
              <span>Ledger Account</span>
              <span>Amount</span>
            </div>

            <div className="ledger-list">
              {expenseLedgers.length === 0 ? (
                <div className="empty-row">No expenses found</div>
              ) : (
                expenseLedgers.map((ledger, index) => (
                  <div className="ledger-row" key={`expense-${ledger.id}-${ledger.code}-${index}`} onClick={() => handleLedgerClick(ledger)}>
                    <span className="row-number">{String(index + 1).padStart(2, "0")}</span>
                    <div className="ledger-info">
                      <strong>{ledger.name}</strong>
                      {ledger.code && <small>{ledger.code}</small>}
                    </div>
                    <strong className="expense-amount">₹ {formatAmount(ledger.amount)}</strong>
                  </div>
                ))
              )}
            </div>

            <div className="card-total expense-total">
              <span>Total Expense</span>
              <strong>₹ {formatAmount(totalExpense)}</strong>
            </div>
          </section>

        </div>

        <section className="formula-card">
          <div className="formula-title">
            <span className="formula-icon">Σ</span>
            <div>
              <h3>Profit & Loss Calculation</h3>
              <p>Tally accounting formula</p>
            </div>
          </div>

          <div className="formula">
            Net Profit / Loss = (Direct Income + Indirect Income) - (Direct Expense + Indirect Expense)
          </div>

          <div className="calculation">
            ₹ {formatAmount(totalIncome)} - ₹ {formatAmount(totalExpense)}
            <span>=</span>
            <strong className={isProfit ? "profit-text" : "loss-text"}>
              {isProfit ? "Profit" : "Loss"} ₹ {formatAmount(resultAmount)}
            </strong>
          </div>
        </section>

        <section className={`net-result ${isProfit ? "net-profit" : "net-loss"}`}>
          <div className="net-result-left">
            <span>Net Result</span>
            <h2>Net {isProfit ? "Profit" : "Loss"}</h2>
            <p>Final result after adjusting total income and expenses</p>
          </div>

          <div className="net-result-amount">
            ₹ {formatAmount(resultAmount)}
          </div>
        </section>

      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="voucher-modal" onClick={(event) => event.stopPropagation()}>

            <div className="modal-header">
              <div className="modal-title-area">
                <div className="modal-icon">LR</div>
                <div>
                  <h2>Ledger Transactions</h2>
                  <p>{selectedLedger?.name || "Ledger"} {selectedLedger?.code ? `• ${selectedLedger.code}` : ""}</p>
                </div>
              </div>

              <button className="close-button" onClick={closeModal}>×</button>
            </div>

            <div className="modal-summary">
              <div className="modal-stat">
                <span>Transactions</span>
                <strong>{ledgerVouchers.length}</strong>
              </div>

              <div className="modal-stat debit-stat">
                <span>Total Debit</span>
                <strong>₹ {formatAmount(voucherTotalDebit)}</strong>
              </div>

              <div className="modal-stat credit-stat">
                <span>Total Credit</span>
                <strong>₹ {formatAmount(voucherTotalCredit)}</strong>
              </div>
            </div>

            <div className="modal-body">
              {ledgerVouchersLoading ? (
                <div className="modal-empty">
                  <div className="loading-circle">...</div>
                  <p>Loading voucher transactions...</p>
                </div>
              ) : ledgerVouchersError ? (
                <div className="modal-empty error-modal">
                  <div className="error-circle">!</div>
                  <p>{ledgerVouchersError}</p>
                </div>
              ) : ledgerVouchers.length === 0 ? (
                <div className="modal-empty">
                  <div className="empty-modal-icon">LR</div>
                  <h3>No Transactions</h3>
                  <p>No voucher transactions found for this ledger.</p>
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
                      {ledgerVouchers.map((voucher, index) => (
                        <tr key={`${voucher.voucher_id}-${voucher.id}-${index}`}>
                          <td>
                            <span className="voucher-number">
                              {voucher.voucher_number || "-"}
                            </span>
                          </td>

                          <td>
                            <span className={`voucher-type ${String(voucher.voucher_type || "").toLowerCase()}`}>
                              {voucher.voucher_type || "JOURNAL"}
                            </span>
                          </td>

                          <td>{formatDate(voucher.voucher_date)}</td>

                          <td className="narration-cell">
                            {voucher.narration || "-"}
                          </td>

                          <td className="right debit-value">
                            {Number(voucher.debit || 0) > 0 ? `₹ ${formatAmount(voucher.debit)}` : "—"}
                          </td>

                          <td className="right credit-value">
                            {Number(voucher.credit || 0) > 0 ? `₹ ${formatAmount(voucher.credit)}` : "—"}
                          </td>

                          <td className="center">
                            <button className="view-button" onClick={() => handleVoucherView(voucher)}>
                              View
                            </button>
                          </td>
                        </tr>
                      ))}

                      <tr className="voucher-total-row">
                        <td colSpan="4">Total</td>
                        <td className="right debit-value">₹ {formatAmount(voucherTotalDebit)}</td>
                        <td className="right credit-value">₹ {formatAmount(voucherTotalCredit)}</td>
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

        .pl-page { min-height:100vh; padding:24px; background:#07111f; color:#e8f1f7; font-family:Arial,sans-serif; }

        .pl-container { width:100%; max-width:1250px; margin:0 auto; }

        .pl-header { min-height:92px; display:flex; align-items:center; justify-content:space-between; gap:20px; padding:18px 22px; margin-bottom:18px; background:linear-gradient(100deg,#0c1c31,#183d82); border:1px solid #397eb1; border-radius:10px; box-shadow:0 10px 30px rgba(0,0,0,.25); }

        .pl-header.profit-border { border-color:#22a77e; }

        .pl-header.loss-border { border-color:#b43e4c; }

        .header-left { display:flex; align-items:center; gap:14px; }

        .pl-icon { width:52px; height:52px; display:flex; align-items:center; justify-content:center; background:#0ea5e9; border-radius:8px; color:#fff; font-size:13px; font-weight:900; box-shadow:0 5px 18px rgba(14,165,233,.18); }

        .pl-header h1 { margin:0; color:#f5fbff; font-size:25px; font-weight:900; text-transform:uppercase; }

        .pl-header p { margin:5px 0 0; color:#a9d0e7; font-size:11px; }

        .result-badge { display:flex; align-items:center; gap:10px; padding:9px 13px; border-radius:5px; font-size:9px; font-weight:800; }

        .result-badge strong { font-family:Consolas,monospace; font-size:13px; }

        .profit-badge { background:#0c3028; border:1px solid #238d72; color:#5ee2c2; }

        .loss-badge { background:#361a20; border:1px solid #9c3d4b; color:#ff8995; }

        .summary-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }

        .account-card { overflow:hidden; min-height:505px; display:flex; flex-direction:column; background:#0d1c35; border-radius:10px; }

        .income-card { border:1px solid #3275a1; }

        .expense-card { border:1px solid #9a3948; }

        .card-header { min-height:62px; display:flex; align-items:center; justify-content:space-between; padding:10px 15px; }

        .income-header { background:#123974; }

        .expense-header { background:#401d2b; }

        .card-header div { display:flex; align-items:center; gap:10px; }

        .section-label { width:26px; height:26px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,.09); border:1px solid rgba(255,255,255,.15); border-radius:5px; font-family:Consolas,monospace; font-size:9px; }

        .card-header h2 { margin:0; color:#f5fbff; font-size:15px; text-transform:uppercase; }

        .card-header > strong { font-family:Consolas,monospace; font-size:13px; }

        .income-header > strong { color:#48d8ef; }

        .expense-header > strong { color:#ff6977; }

        .column-head { display:grid; grid-template-columns:45px 1fr 150px; padding:10px 15px; background:rgba(255,255,255,.035); border-bottom:1px solid rgba(255,255,255,.1); color:#7792aa; font-size:9px; font-weight:800; text-transform:uppercase; letter-spacing:.4px; }

        .column-head span:last-child { text-align:right; }

        .ledger-list { flex:1; min-height:0; }

        .ledger-row { display:grid; grid-template-columns:45px 1fr 150px; align-items:center; min-height:55px; padding:9px 15px; border-bottom:1px solid rgba(255,255,255,.07); cursor:pointer; transition:.15s ease; }

        .income-card .ledger-row:hover { background:#112d49; }

        .expense-card .ledger-row:hover { background:#321c29; }

        .row-number { color:#526b82; font-family:Consolas,monospace; font-size:10px; }

        .ledger-info { display:flex; flex-direction:column; gap:3px; }

        .ledger-info strong { color:#edf6fc; font-size:12px; }

        .ledger-info small { color:#536d83; font-family:Consolas,monospace; font-size:9px; }

        .income-amount { color:#48d8ef; font-family:Consolas,monospace; font-size:11px; text-align:right; }

        .expense-amount { color:#ff6977; font-family:Consolas,monospace; font-size:11px; text-align:right; }

        .empty-row { min-height:350px; display:flex; align-items:center; justify-content:center; color:#526b82; font-size:11px; }

        .card-total { min-height:57px; display:flex; align-items:center; justify-content:space-between; padding:10px 15px; margin-top:auto; background:#081326; font-size:12px; font-weight:800; }

        .income-total { border-top:1px solid #3275a1; color:#edf6fc; }

        .income-total strong { color:#48d8ef; font-family:Consolas,monospace; }

        .expense-total { border-top:1px solid #9a3948; color:#edf6fc; }

        .expense-total strong { color:#ff6977; font-family:Consolas,monospace; }

        .formula-card { padding:17px 19px; margin-top:14px; background:#101b35; border:1px solid #354c78; border-radius:9px; }

        .formula-title { display:flex; align-items:center; gap:10px; margin-bottom:13px; }

        .formula-icon { width:32px; height:32px; display:flex; align-items:center; justify-content:center; background:#162d56; border:1px solid #35699a; border-radius:6px; color:#55c9ee; font-size:15px; font-weight:900; }

        .formula-title h3 { margin:0; color:#dcecf8; font-size:13px; }

        .formula-title p { margin:3px 0 0; color:#58738b; font-size:9px; }

        .formula { padding:11px 13px; background:#0a1428; border:1px solid #233b5a; border-radius:5px; color:#a9bfd1; font-size:11px; line-height:1.6; }

        .calculation { display:flex; align-items:center; gap:10px; margin-top:11px; color:#8299ad; font-family:Consolas,monospace; font-size:11px; }

        .calculation span { color:#4e687f; }

        .profit-text { color:#5ee2c2; }

        .loss-text { color:#ff6977; }

        .net-result { display:flex; align-items:center; justify-content:space-between; gap:20px; min-height:86px; padding:15px 19px; margin-top:14px; border-radius:9px; }

        .net-profit { background:#0b2925; border:1px solid #238d72; }

        .net-loss { background:#2c171e; border:1px solid #9c3d4b; }

        .net-result-left span { color:#678095; font-size:9px; }

        .net-result-left h2 { margin:4px 0 3px; color:#f0f7fb; font-size:15px; }

        .net-result-left p { margin:0; color:#5b7185; font-size:9px; }

        .net-result-amount { font-family:Consolas,monospace; font-size:23px; font-weight:900; }

        .net-profit .net-result-amount { color:#5ee2c2; }

        .net-loss .net-result-amount { color:#ff6977; }

        .modal-overlay { position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; padding:20px; background:rgba(0,0,0,.78); backdrop-filter:blur(3px); }

        .voucher-modal { width:100%; max-width:1100px; max-height:88vh; overflow:hidden; display:flex; flex-direction:column; background:#0b172b; border:1px solid #357cab; border-radius:10px; box-shadow:0 20px 70px rgba(0,0,0,.55); }

        .modal-header { display:flex; align-items:center; justify-content:space-between; padding:15px 18px; background:linear-gradient(100deg,#0d2139,#17376f); border-bottom:1px solid #285a82; }

        .modal-title-area { display:flex; align-items:center; gap:11px; }

        .modal-icon { width:39px; height:39px; display:flex; align-items:center; justify-content:center; background:#123d63; border:1px solid #3184aa; border-radius:6px; color:#55c9ee; font-size:10px; font-weight:900; }

        .modal-header h2 { margin:0; color:#edf8ff; font-size:16px; }

        .modal-header p { margin:4px 0 0; color:#7893aa; font-size:9px; }

        .close-button { width:31px; height:31px; border:1px solid #753642; border-radius:5px; background:#351a20; color:#ff8995; font-size:20px; line-height:1; cursor:pointer; }

        .close-button:hover { background:#54232d; }

        .modal-summary { display:grid; grid-template-columns:1fr 1fr 1fr; gap:9px; padding:12px 15px; border-bottom:1px solid #1e344d; background:#091427; }

        .modal-stat { padding:9px 11px; background:#0d2037; border:1px solid #213e5a; border-radius:5px; }

        .modal-stat span { display:block; margin-bottom:4px; color:#637e95; font-size:8px; text-transform:uppercase; }

        .modal-stat strong { color:#dcecf7; font-family:Consolas,monospace; font-size:12px; }

        .modal-stat.debit-stat strong { color:#f6c55c; }

        .modal-stat.credit-stat strong { color:#5ee2c2; }

        .modal-body { overflow:auto; padding:15px; }

        .voucher-table-wrapper { width:100%; overflow-x:auto; border:1px solid #203a54; border-radius:6px; }

        .voucher-table { width:100%; min-width:850px; border-collapse:collapse; font-size:10px; }

        .voucher-table th { padding:11px 10px; background:#123974; border-bottom:1px solid #3c79a7; color:#e6f2fc; text-align:left; font-size:9px; text-transform:uppercase; white-space:nowrap; }

        .voucher-table td { padding:11px 10px; border-bottom:1px solid #1b3047; color:#a9bdce; white-space:nowrap; }

        .voucher-table tbody tr { background:#0c1a2e; }

        .voucher-table tbody tr:hover { background:#112943; }

        .voucher-table tbody tr:last-child td { border-bottom:none; }

        .voucher-table .right { text-align:right; }

        .voucher-table .center { text-align:center; }

        .voucher-number { color:#55c9ee; font-family:Consolas,monospace; font-weight:800; }

        .voucher-type { display:inline-block; padding:4px 7px; border-radius:4px; background:#182c44; border:1px solid #2c4a64; color:#9fc0d7; font-size:8px; font-weight:800; }

        .voucher-type.sales { background:#102f2c; border-color:#1d7062; color:#5ee2c2; }

        .voucher-type.purchase { background:#352b16; border-color:#786221; color:#f6c55c; }

        .voucher-type.receipt { background:#102f37; border-color:#267a8a; color:#55d6ee; }

        .voucher-type.payment { background:#351b24; border-color:#7b3748; color:#ff8995; }

        .voucher-type.journal { background:#202844; border-color:#45527a; color:#aebeff; }

        .narration-cell { max-width:260px; overflow:hidden; text-overflow:ellipsis; }

        .debit-value { color:#f6c55c !important; font-family:Consolas,monospace; font-weight:700; }

        .credit-value { color:#5ee2c2 !important; font-family:Consolas,monospace; font-weight:700; }

        .view-button { min-height:29px; padding:0 10px; border:0; border-radius:4px; background:#0ea5c9; color:#fff; font-size:9px; font-weight:800; cursor:pointer; }

        .view-button:hover { background:#19b9dd; }

        .voucher-total-row { background:#081225 !important; border-top:2px solid #357cab; }

        .voucher-total-row td { color:#e6f2fa; font-weight:800; }

        .modal-empty { min-height:260px; display:flex; align-items:center; justify-content:center; flex-direction:column; text-align:center; }

        .modal-empty p { margin:8px 0 0; color:#637d93; font-size:11px; }

        .modal-empty h3 { margin:0; color:#dceaf5; font-size:14px; }

        .empty-modal-icon { width:48px; height:48px; display:flex; align-items:center; justify-content:center; margin-bottom:10px; background:#123d63; border:1px solid #2d789e; border-radius:8px; color:#55c9ee; font-size:11px; font-weight:900; }

        .error-modal p { color:#ff8995; }

        @media (max-width:900px) { .summary-grid { grid-template-columns:1fr; } .account-card { min-height:420px; } .empty-row { min-height:250px; } }

        @media (max-width:650px) { .pl-page { padding:14px; } .pl-header { align-items:flex-start; flex-direction:column; padding:16px; } .result-badge { width:100%; justify-content:space-between; } .summary-grid { gap:12px; } .formula-card,.net-result { padding:14px; } .net-result { align-items:flex-start; flex-direction:column; } .net-result-amount { font-size:20px; } .modal-overlay { padding:10px; } .modal-summary { grid-template-columns:1fr; } .modal-body { padding:10px; } }

      `}</style>
    </div>
  );
};

export default ProfitLoss;