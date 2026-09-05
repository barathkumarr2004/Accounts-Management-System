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

      const response = await fetch(
        `${API_URL}/api/journals/ledger/${ledgerId}`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to fetch ledger transactions"
        );
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
      setError(
        error.message || "Unable to fetch ledger transactions"
      );
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
    if (!type) return "-";

    return type.replace(/_/g, " ");
  };

  const getVoucherClass = (type) => {
    switch (type) {
      case "JOURNAL":
        return "voucher journal";

      case "SALES":
        return "voucher sales";

      case "PURCHASE":
        return "voucher purchase";

      case "RECEIPT":
        return "voucher receipt";

      case "PAYMENT":
        return "voucher payment";

      default:
        return "voucher";
    }
  };

  const selectedLedgerData = ledgers.find(
    (ledger) => String(ledger.id) === String(selectedLedger)
  );

  return (
    <>
      <div className="ledger-page">
        <div className="ledger-header">
          <div>
            <h1>Ledger Report</h1>
            <p>View ledger transactions and running balance</p>
          </div>

          <div className="header-badge">
            ACCOUNTING REPORT
          </div>
        </div>

        <div className="filter-card">
          <div className="filter-label">
            Select Ledger
          </div>

          <select
            value={selectedLedger}
            onChange={handleLedgerChange}
            disabled={ledgerLoading}
          >
            <option value="">
              {ledgerLoading
                ? "Loading ledgers..."
                : "Select a ledger"}
            </option>

            {ledgers.map((ledger) => (
              <option key={ledger.id} value={ledger.id}>
                {ledger.name}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {selectedLedger && selectedLedgerData && (
          <div className="selected-ledger">
            <span>Selected Ledger</span>
            <strong>{selectedLedgerData.name}</strong>
          </div>
        )}

        {selectedLedger && (
          <div className="summary-grid">
            <div className="summary-card">
              <span>Total Debit</span>
              <strong>
                ₹ {formatAmount(totalDebit)}
              </strong>
            </div>

            <div className="summary-card">
              <span>Total Credit</span>
              <strong>
                ₹ {formatAmount(totalCredit)}
              </strong>
            </div>

            <div className="summary-card">
              <span>Closing Balance</span>
              <strong>
                ₹ {formatAmount(Math.abs(closingBalance))}
              </strong>

              <small>
                {closingBalance > 0
                  ? "Debit Balance"
                  : closingBalance < 0
                  ? "Credit Balance"
                  : "Balanced"}
              </small>
            </div>
          </div>
        )}

        <div className="table-card">
          <div className="table-header">
            <div>
              <h2>Ledger Transactions</h2>
              <p>
                {selectedLedger
                  ? `${transactions.length} transaction${
                      transactions.length !== 1 ? "s" : ""
                    } found`
                  : "Select a ledger to view transactions"}
              </p>
            </div>
          </div>

          {!selectedLedger ? (
            <div className="empty-state">
              <div className="empty-icon">₹</div>
              <h3>Select a Ledger</h3>
              <p>
                Choose a ledger from the dropdown to view
                its transaction history.
              </p>
            </div>
          ) : loading ? (
            <div className="empty-state">
              <div className="loader"></div>
              <h3>Loading Transactions</h3>
              <p>
                Please wait while ledger transactions are
                being fetched.
              </p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">0</div>
              <h3>No Transactions</h3>
              <p>
                No transactions found for this ledger.
              </p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Voucher No</th>
                    <th>Voucher Type</th>
                    <th>Particulars</th>
                    <th className="amount-column">
                      Debit
                    </th>
                    <th className="amount-column">
                      Credit
                    </th>
                    <th className="amount-column">
                      Balance
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.entry_id}>
                      <td>
                        {formatDate(transaction.voucher_date)}
                      </td>

                      <td>
                        <span className="voucher-number">
                          {transaction.voucher_number}
                        </span>
                      </td>

                      <td>
                        <span
                          className={getVoucherClass(
                            transaction.voucher_type
                          )}
                        >
                          {getVoucherType(
                            transaction.voucher_type
                          )}
                        </span>
                      </td>

                      <td>
                        <div className="particulars">
                          {transaction.narration || "-"}
                        </div>
                      </td>

                      <td className="amount debit">
                        {transaction.debit > 0
                          ? `₹ ${formatAmount(
                              transaction.debit
                            )}`
                          : "-"}
                      </td>

                      <td className="amount credit">
                        {transaction.credit > 0
                          ? `₹ ${formatAmount(
                              transaction.credit
                            )}`
                          : "-"}
                      </td>

                      <td className="amount balance">
                        ₹{" "}
                        {formatAmount(
                          Math.abs(
                            transaction.running_balance
                          )
                        )}

                        <span>
                          {transaction.running_balance > 0
                            ? " Dr"
                            : transaction.running_balance <
                              0
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
                      Closing Total
                    </td>

                    <td className="amount">
                      ₹ {formatAmount(totalDebit)}
                    </td>

                    <td className="amount">
                      ₹ {formatAmount(totalCredit)}
                    </td>

                    <td className="amount">
                      ₹{" "}
                      {formatAmount(
                        Math.abs(closingBalance)
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>

      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #07111f;
        }

        .ledger-page {
          min-height: 100vh;
          padding: 30px;
          background: #07111f;
          color: #e8f0f8;
          font-family: Arial, sans-serif;
        }

        .ledger-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 25px;
        }

        .ledger-header h1 {
          margin: 0 0 7px;
          font-size: 28px;
          font-weight: 700;
          color: #ffffff;
        }

        .ledger-header p {
          margin: 0;
          color: #8ea4b9;
          font-size: 14px;
        }

        .header-badge {
          padding: 9px 14px;
          border: 1px solid #1d405e;
          border-radius: 8px;
          background: #0b1b2c;
          color: #62c4ff;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .filter-card {
          padding: 22px;
          margin-bottom: 18px;
          background: #0b1b2c;
          border: 1px solid #18334b;
          border-radius: 12px;
        }

        .filter-label {
          margin-bottom: 9px;
          color: #a9bed1;
          font-size: 13px;
          font-weight: 600;
        }

        .filter-card select {
          width: 100%;
          height: 44px;
          padding: 0 13px;
          border: 1px solid #28445c;
          border-radius: 7px;
          outline: none;
          background: #071523;
          color: #e8f0f8;
          font-size: 14px;
          cursor: pointer;
        }

        .filter-card select:focus {
          border-color: #369bd6;
        }

        .filter-card select:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message {
          padding: 13px 16px;
          margin-bottom: 18px;
          border: 1px solid #713535;
          border-radius: 8px;
          background: #2a1518;
          color: #ff9b9b;
          font-size: 14px;
        }

        .selected-ledger {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
          padding: 12px 16px;
          border-left: 3px solid #38a8e8;
          background: #0b1b2c;
          border-radius: 6px;
        }

        .selected-ledger span {
          color: #8197aa;
          font-size: 13px;
        }

        .selected-ledger strong {
          color: #ffffff;
          font-size: 14px;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 20px;
        }

        .summary-card {
          padding: 20px;
          background: #0b1b2c;
          border: 1px solid #18334b;
          border-radius: 10px;
        }

        .summary-card span {
          display: block;
          margin-bottom: 10px;
          color: #8299ad;
          font-size: 13px;
        }

        .summary-card strong {
          display: block;
          color: #ffffff;
          font-size: 21px;
        }

        .summary-card small {
          display: block;
          margin-top: 6px;
          color: #5ca9d4;
          font-size: 11px;
        }

        .table-card {
          overflow: hidden;
          background: #0b1b2c;
          border: 1px solid #18334b;
          border-radius: 12px;
        }

        .table-header {
          padding: 20px 22px;
          border-bottom: 1px solid #18334b;
        }

        .table-header h2 {
          margin: 0 0 5px;
          color: #ffffff;
          font-size: 18px;
        }

        .table-header p {
          margin: 0;
          color: #8197aa;
          font-size: 12px;
        }

        .table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        table {
          width: 100%;
          min-width: 1000px;
          border-collapse: collapse;
        }

        th {
          padding: 13px 14px;
          background: #0e2438;
          color: #9db4c8;
          font-size: 11px;
          font-weight: 700;
          text-align: left;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          white-space: nowrap;
        }

        td {
          padding: 14px;
          border-top: 1px solid #142c40;
          color: #c9d6e1;
          font-size: 13px;
          white-space: nowrap;
        }

        tbody tr:hover {
          background: #0e2235;
        }

        .voucher-number {
          color: #62c4ff;
          font-weight: 700;
        }

        .voucher {
          display: inline-block;
          padding: 5px 8px;
          border-radius: 5px;
          background: #17283a;
          color: #a9bed1;
          font-size: 10px;
          font-weight: 700;
        }

        .voucher.journal {
          color: #c4b5fd;
          background: #211c3b;
        }

        .voucher.sales {
          color: #67e8b5;
          background: #12352d;
        }

        .voucher.purchase {
          color: #f6c36a;
          background: #392c17;
        }

        .voucher.receipt {
          color: #65d7ff;
          background: #12313d;
        }

        .voucher.payment {
          color: #ff9b9b;
          background: #391b20;
        }

        .particulars {
          max-width: 280px;
          overflow: hidden;
          color: #c9d6e1;
          text-overflow: ellipsis;
        }

        .amount-column {
          text-align: right;
        }

        .amount {
          text-align: right;
          font-variant-numeric: tabular-nums;
        }

        .debit {
          color: #69d3a8;
        }

        .credit {
          color: #ff9f9f;
        }

        .balance {
          color: #ffffff;
          font-weight: 600;
        }

        .balance span {
          color: #8197aa;
          font-size: 10px;
        }

        tfoot td {
          padding: 16px 14px;
          background: #0e2438;
          border-top: 1px solid #27465e;
          color: #ffffff;
          font-weight: 700;
        }

        .empty-state {
          padding: 70px 20px;
          text-align: center;
        }

        .empty-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
          margin: 0 auto 15px;
          border: 1px solid #28506c;
          border-radius: 50%;
          background: #0e2438;
          color: #62c4ff;
          font-size: 20px;
          font-weight: 700;
        }

        .empty-state h3 {
          margin: 0 0 8px;
          color: #ffffff;
          font-size: 16px;
        }

        .empty-state p {
          margin: 0;
          color: #8197aa;
          font-size: 13px;
        }

        .loader {
          width: 30px;
          height: 30px;
          margin: 0 auto 18px;
          border: 3px solid #18334b;
          border-top-color: #43a9e0;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 800px) {
          .ledger-page {
            padding: 18px;
          }

          .ledger-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .header-badge {
            display: none;
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }

          .selected-ledger {
            align-items: flex-start;
            flex-direction: column;
            gap: 4px;
          }
        }
      `}</style>
    </>
  );
}