"use client";

import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000";

export default function LedgerReport() {
  const [ledgers, setLedgers] = useState([]);
  const [selectedLedger, setSelectedLedger] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [totalDebit, setTotalDebit] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);
  const [closingBalance, setClosingBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [ledgerLoading, setLedgerLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLedgers();
  }, []);

  const fetchLedgers = async () => {
    try {
      setLedgerLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/ledgers`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to fetch ledgers");
      }

      setLedgers(result.data || []);
    } catch (error) {
      setError(error.message || "Unable to fetch ledgers");
    } finally {
      setLedgerLoading(false);
    }
  };

  const fetchLedgerTransactions = async (ledgerId) => {
    if (!ledgerId) {
      setTransactions([]);
      setTotalDebit(0);
      setTotalCredit(0);
      setClosingBalance(0);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/journals/ledger/${ledgerId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to fetch ledger transactions");
      }

      setTransactions(result.transactions || []);
      setTotalDebit(Number(result.totalDebit || 0));
      setTotalCredit(Number(result.totalCredit || 0));
      setClosingBalance(Number(result.closingBalance || 0));
    } catch (error) {
      setTransactions([]);
      setTotalDebit(0);
      setTotalCredit(0);
      setClosingBalance(0);
      setError(error.message || "Unable to fetch ledger transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleLedgerChange = (event) => {
    const ledgerId = event.target.value;
    setSelectedLedger(ledgerId);
    fetchLedgerTransactions(ledgerId);
  };

  const formatAmount = (amount) => {
    return Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) return date;

    return value.toLocaleDateString("en-IN");
  };

  const getVoucherType = (type) => {
    if (!type) return "UNKNOWN";
    return type.replace(/_/g, " ");
  };

  const getVoucherClass = (type) => {
    switch (type) {
      case "JOURNAL":
        return "voucher-badge journal";
      case "SALES":
        return "voucher-badge sales";
      case "PURCHASE":
        return "voucher-badge purchase";
      case "RECEIPT":
        return "voucher-badge receipt";
      case "PAYMENT":
        return "voucher-badge payment";
      default:
        return "voucher-badge";
    }
  };

  const selectedLedgerData = ledgers.find(
    (ledger) => String(ledger.id) === String(selectedLedger)
  );

  const balanceType =
    closingBalance > 0
      ? "Debit Balance"
      : closingBalance < 0
      ? "Credit Balance"
      : "Balanced";

  return (
    <>
      <div className="ledger-page">
        <div className="ledger-container">

          <header className="page-header">
            <div className="page-title-section">
              <div className="page-icon">LR</div>
              <div>
                <h1>Ledger Report</h1>
                <p>View ledger transactions and running balance</p>
              </div>
            </div>

            <div className="report-badge">
              ACCOUNTING REPORT
            </div>
          </header>

          <section className="selector-card">
            <div className="selector-top">
              <div>
                <span className="section-label">LEDGER ACCOUNT</span>
                <h2>Select Ledger</h2>
              </div>

              {selectedLedgerData && (
                <div className="selected-code">
                  ID: {selectedLedgerData.id}
                </div>
              )}
            </div>

            <select
              value={selectedLedger}
              onChange={handleLedgerChange}
              disabled={ledgerLoading}
            >
              <option value="">
                {ledgerLoading ? "Loading ledgers..." : "Select a ledger"}
              </option>

              {ledgers.map((ledger) => (
                <option key={ledger.id} value={ledger.id}>
                  {ledger.name}
                </option>
              ))}
            </select>
          </section>

          {error && (
            <div className="error-box">
              <span className="error-icon">!</span>
              <div>
                <strong>Unable to load data</strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          {selectedLedger && selectedLedgerData && (
            <div className="selected-ledger">
              <div className="ledger-dot"></div>
              <div>
                <span>Selected Ledger</span>
                <strong>{selectedLedgerData.name}</strong>
              </div>
            </div>
          )}

          {selectedLedger && (
            <section className="summary-grid">

              <div className="summary-card debit-card">
                <div className="summary-icon">DR</div>
                <div>
                  <span>Total Debit</span>
                  <strong>₹ {formatAmount(totalDebit)}</strong>
                  <small>Debit transactions</small>
                </div>
              </div>

              <div className="summary-card credit-card">
                <div className="summary-icon">CR</div>
                <div>
                  <span>Total Credit</span>
                  <strong>₹ {formatAmount(totalCredit)}</strong>
                  <small>Credit transactions</small>
                </div>
              </div>

              <div className="summary-card balance-card">
                <div className="summary-icon">BL</div>
                <div>
                  <span>Closing Balance</span>
                  <strong>₹ {formatAmount(Math.abs(closingBalance))}</strong>
                  <small>{balanceType}</small>
                </div>
              </div>

            </section>
          )}

          <section className="transactions-card">

            <div className="transactions-header">
              <div className="transactions-title">
                <div className="table-icon">TR</div>
                <div>
                  <h2>Ledger Transactions</h2>
                  <p>
                    {selectedLedger
                      ? `${transactions.length} transaction${transactions.length !== 1 ? "s" : ""} found`
                      : "Select a ledger to view transaction history"}
                  </p>
                </div>
              </div>

              {selectedLedger && transactions.length > 0 && (
                <div className="transaction-count">
                  {transactions.length} ENTRIES
                </div>
              )}
            </div>

            {!selectedLedger ? (
              <div className="empty-state">
                <div className="empty-icon">LR</div>
                <h3>Select a Ledger</h3>
                <p>Choose a ledger account above to view its transactions.</p>
              </div>
            ) : loading ? (
              <div className="empty-state">
                <div className="loader"></div>
                <h3>Loading Transactions</h3>
                <p>Please wait while the ledger report is being loaded.</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">0</div>
                <h3>No Transactions Found</h3>
                <p>This ledger does not have any transaction entries yet.</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>DATE</th>
                      <th>VOUCHER NO</th>
                      <th>VOUCHER TYPE</th>
                      <th>PARTICULARS</th>
                      <th className="right">DEBIT</th>
                      <th className="right">CREDIT</th>
                      <th className="right">BALANCE</th>
                    </tr>
                  </thead>

                  <tbody>
                    {transactions.map((transaction, index) => (
                      <tr key={transaction.entry_id || index}>

                        <td>
                          <span className="date-value">
                            {formatDate(transaction.voucher_date)}
                          </span>
                        </td>

                        <td>
                          <span className="voucher-number">
                            {transaction.voucher_number || "-"}
                          </span>
                        </td>

                        <td>
                          <span className={getVoucherClass(transaction.voucher_type)}>
                            {getVoucherType(transaction.voucher_type)}
                          </span>
                        </td>

                        <td>
                          <div className="particulars">
                            {transaction.narration || "-"}
                          </div>
                        </td>

                        <td className="right debit-value">
                          {Number(transaction.debit || 0) > 0
                            ? `₹ ${formatAmount(transaction.debit)}`
                            : "—"}
                        </td>

                        <td className="right credit-value">
                          {Number(transaction.credit || 0) > 0
                            ? `₹ ${formatAmount(transaction.credit)}`
                            : "—"}
                        </td>

                        <td className="right balance-value">
                          ₹ {formatAmount(Math.abs(transaction.running_balance))}
                          <span>
                            {transaction.running_balance > 0
                              ? " Dr"
                              : transaction.running_balance < 0
                              ? " Cr"
                              : ""}
                          </span>
                        </td>

                      </tr>
                    ))}
                  </tbody>

                  <tfoot>
                    <tr>
                      <td colSpan="4">
                        <strong>Closing Total</strong>
                      </td>

                      <td className="right debit-value">
                        ₹ {formatAmount(totalDebit)}
                      </td>

                      <td className="right credit-value">
                        ₹ {formatAmount(totalCredit)}
                      </td>

                      <td className="right balance-value">
                        ₹ {formatAmount(Math.abs(closingBalance))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

          </section>

          {selectedLedger && transactions.length > 0 && (
            <div className="report-footer">
              <div>
                <span>Ledger</span>
                <strong>{selectedLedgerData?.name}</strong>
              </div>

              <div>
                <span>Transactions</span>
                <strong>{transactions.length}</strong>
              </div>

              <div>
                <span>Closing</span>
                <strong>₹ {formatAmount(Math.abs(closingBalance))}</strong>
              </div>

              <div className={`footer-status ${closingBalance >= 0 ? "debit-status" : "credit-status"}`}>
                {balanceType}
              </div>
            </div>
          )}

        </div>
      </div>

      <style>{`

        * { box-sizing:border-box; }

        body { margin:0; background:#07111f; }

        .ledger-page { min-height:100vh; padding:24px; background:#07111f; color:#e8f2f8; font-family:Arial,sans-serif; }

        .ledger-container { width:100%; max-width:1280px; margin:0 auto; }

        .page-header { display:flex; align-items:center; justify-content:space-between; gap:20px; padding:18px 20px; margin-bottom:16px; background:linear-gradient(100deg,#0c2036,#193d80); border:1px solid #2c78a5; border-radius:10px; box-shadow:0 10px 30px rgba(0,0,0,.2); }

        .page-title-section { display:flex; align-items:center; gap:13px; }

        .page-icon { width:48px; height:48px; display:flex; align-items:center; justify-content:center; background:#0ea5df; border-radius:8px; color:#fff; font-size:11px; font-weight:900; box-shadow:0 5px 18px rgba(14,165,223,.2); }

        .page-header h1 { margin:0; color:#fff; font-size:25px; font-weight:800; }

        .page-header p { margin:5px 0 0; color:#9fc7df; font-size:11px; }

        .report-badge { padding:9px 13px; background:#091a2b; border:1px solid #235273; border-radius:6px; color:#62caff; font-size:9px; font-weight:800; letter-spacing:1px; }

        .selector-card { padding:18px; margin-bottom:14px; background:#0b1b2c; border:1px solid #1b3b55; border-radius:10px; }

        .selector-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }

        .section-label { color:#4f91b6; font-size:8px; font-weight:800; letter-spacing:1px; }

        .selector-top h2 { margin:4px 0 0; color:#eaf5fb; font-size:15px; }

        .selected-code { padding:5px 8px; border:1px solid #23445c; border-radius:4px; background:#0a1828; color:#6f91a7; font-family:Consolas,monospace; font-size:9px; }

        .selector-card select { width:100%; height:45px; padding:0 13px; outline:none; border:1px solid #27516d; border-radius:6px; background:#071523; color:#e7f1f7; font-size:13px; cursor:pointer; }

        .selector-card select:hover { border-color:#328ab8; }

        .selector-card select:focus { border-color:#31a5db; box-shadow:0 0 0 2px rgba(49,165,219,.08); }

        .selector-card select:disabled { opacity:.6; cursor:not-allowed; }

        .error-box { display:flex; align-items:center; gap:11px; padding:12px 15px; margin-bottom:14px; background:#2a1519; border:1px solid #713842; border-radius:7px; color:#ff9ca5; }

        .error-icon { width:24px; height:24px; display:flex; align-items:center; justify-content:center; border-radius:50%; background:#5a252d; font-weight:900; }

        .error-box strong { display:block; font-size:11px; }

        .error-box p { margin:3px 0 0; font-size:9px; color:#d8838d; }

        .selected-ledger { display:flex; align-items:center; gap:10px; padding:11px 15px; margin-bottom:14px; background:#0b1b2c; border-left:3px solid #25a9df; border-radius:5px; }

        .ledger-dot { width:8px; height:8px; border-radius:50%; background:#2bc3eb; box-shadow:0 0 8px rgba(43,195,235,.5); }

        .selected-ledger span { display:block; margin-bottom:3px; color:#648299; font-size:8px; text-transform:uppercase; }

        .selected-ledger strong { color:#edf6fb; font-size:12px; }

        .summary-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:14px; }

        .summary-card { display:flex; align-items:center; gap:12px; min-height:105px; padding:16px; background:#0b1b2c; border:1px solid #1a3850; border-radius:9px; }

        .summary-icon { width:38px; height:38px; display:flex; align-items:center; justify-content:center; flex-shrink:0; border-radius:6px; font-size:9px; font-weight:900; }

        .debit-card .summary-icon { background:#14382e; border:1px solid #286d5a; color:#62dfb7; }

        .credit-card .summary-icon { background:#382022; border:1px solid #713b43; color:#ff9d9d; }

        .balance-card .summary-icon { background:#162e4a; border:1px solid #285b80; color:#62caff; }

        .summary-card span { display:block; margin-bottom:7px; color:#70889c; font-size:10px; }

        .summary-card strong { display:block; color:#f0f7fb; font-family:Consolas,monospace; font-size:18px; }

        .summary-card small { display:block; margin-top:5px; color:#54758b; font-size:8px; }

        .debit-card strong { color:#62dfb7; }

        .credit-card strong { color:#ff9d9d; }

        .balance-card strong { color:#62caff; }

        .transactions-card { overflow:hidden; background:#0b1b2c; border:1px solid #1a3850; border-radius:10px; }

        .transactions-header { display:flex; align-items:center; justify-content:space-between; gap:15px; padding:16px 18px; background:#0d2135; border-bottom:1px solid #1a3850; }

        .transactions-title { display:flex; align-items:center; gap:10px; }

        .table-icon { width:35px; height:35px; display:flex; align-items:center; justify-content:center; border:1px solid #285879; border-radius:5px; background:#102b44; color:#61c8ef; font-size:8px; font-weight:900; }

        .transactions-header h2 { margin:0 0 4px; color:#f0f7fb; font-size:15px; }

        .transactions-header p { margin:0; color:#647e93; font-size:9px; }

        .transaction-count { padding:6px 9px; border:1px solid #24445d; border-radius:4px; background:#081827; color:#5798b9; font-size:8px; font-weight:800; }

        .table-wrapper { width:100%; overflow-x:auto; }

        table { width:100%; min-width:1050px; border-collapse:collapse; }

        th { padding:11px 13px; background:#102a40; border-bottom:1px solid #2b5774; color:#7f9caf; font-size:8px; font-weight:800; text-align:left; letter-spacing:.5px; white-space:nowrap; }

        td { padding:13px; background:#0a192b; border-bottom:1px solid #142d42; color:#b9cbd7; font-size:10px; white-space:nowrap; }

        tbody tr:hover td { background:#0e253a; }

        .right { text-align:right; }

        .date-value { color:#9bb1c1; }

        .voucher-number { color:#5ec8f2; font-family:Consolas,monospace; font-size:10px; font-weight:800; }

        .voucher-badge { display:inline-block; padding:4px 7px; border-radius:4px; background:#192b3b; color:#9eb4c3; font-size:7px; font-weight:800; }

        .voucher-badge.journal { background:#25223f; color:#c0b8ff; border:1px solid #49436f; }

        .voucher-badge.sales { background:#11372e; color:#62dfb7; border:1px solid #246c5a; }

        .voucher-badge.purchase { background:#392d17; color:#f5c66b; border:1px solid #715a23; }

        .voucher-badge.receipt { background:#12323c; color:#61d5ee; border:1px solid #267487; }

        .voucher-badge.payment { background:#381d23; color:#ff9b9b; border:1px solid #713740; }

        .particulars { max-width:300px; overflow:hidden; color:#b9cbd7; text-overflow:ellipsis; }

        .debit-value { color:#63dbb1 !important; font-family:Consolas,monospace; font-weight:700; }

        .credit-value { color:#ff9999 !important; font-family:Consolas,monospace; font-weight:700; }

        .balance-value { color:#eef7fb !important; font-family:Consolas,monospace; font-weight:700; }

        .balance-value span { color:#6d8799; font-size:8px; }

        tfoot td { padding:14px 13px; background:#0d2438; border-top:2px solid #285b7b; border-bottom:0; color:#fff; font-size:10px; }

        .empty-state { min-height:290px; display:flex; align-items:center; justify-content:center; flex-direction:column; padding:40px 20px; text-align:center; }

        .empty-icon { width:48px; height:48px; display:flex; align-items:center; justify-content:center; margin-bottom:12px; border:1px solid #285778; border-radius:8px; background:#102b43; color:#5dc9ee; font-size:10px; font-weight:900; }

        .empty-state h3 { margin:0 0 6px; color:#e5f0f6; font-size:13px; }

        .empty-state p { max-width:400px; margin:0; color:#627b8e; font-size:9px; line-height:1.6; }

        .loader { width:30px; height:30px; margin-bottom:15px; border:3px solid #1b354b; border-top-color:#39a8d9; border-radius:50%; animation:spin .8s linear infinite; }

        @keyframes spin { to { transform:rotate(360deg); } }

        .report-footer { display:flex; align-items:center; gap:25px; margin-top:12px; padding:12px 16px; background:#0b1b2c; border:1px solid #1a3850; border-radius:7px; }

        .report-footer div:not(.footer-status) { display:flex; flex-direction:column; gap:3px; }

        .report-footer span { color:#5d778b; font-size:8px; text-transform:uppercase; }

        .report-footer strong { color:#dceaf2; font-size:10px; }

        .footer-status { margin-left:auto; padding:6px 9px; border-radius:4px; font-size:8px; font-weight:800; }

        .debit-status { background:#12342d; border:1px solid #286b58; color:#5eddb5; }

        .credit-status { background:#361d23; border:1px solid #703640; color:#ff9999; }

        @media (max-width:900px) { .ledger-page { padding:18px; } .summary-grid { grid-template-columns:1fr; } .page-header { align-items:flex-start; } }

        @media (max-width:650px) { .ledger-page { padding:12px; } .page-header { align-items:flex-start; flex-direction:column; } .report-badge { display:none; } .selector-top { align-items:flex-start; flex-direction:column; gap:8px; } .report-footer { align-items:flex-start; flex-wrap:wrap; gap:15px; } .footer-status { margin-left:0; } }

      `}</style>
    </>
  );
}