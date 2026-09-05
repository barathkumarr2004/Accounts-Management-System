"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { fetchJournalVouchers } from "../../store/slices/journalSlice";

export default function DayBookPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { journals = [], loading, error } = useSelector(
    (state) => state.journals
  );

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  useEffect(() => {
    dispatch(fetchJournalVouchers());
  }, [dispatch]);

  const filteredJournals = useMemo(() => {
    const value = search.toLowerCase().trim();

    return journals.filter((journal) => {
      const type = String(
        journal.voucher_type || "JOURNAL"
      ).toUpperCase();

      const typeMatch =
        typeFilter === "ALL" || type === typeFilter;

      const searchMatch =
        !value ||
        String(journal.voucher_number || "")
          .toLowerCase()
          .includes(value) ||
        type.toLowerCase().includes(value) ||
        String(journal.narration || "")
          .toLowerCase()
          .includes(value) ||
        journal.entries?.some((entry) =>
          String(entry.ledger_name || "")
            .toLowerCase()
            .includes(value)
        );

      return typeMatch && searchMatch;
    });
  }, [journals, search, typeFilter]);

  const totalDebit = filteredJournals.reduce(
    (total, journal) =>
      total +
      (journal.entries || []).reduce(
        (sum, entry) => sum + Number(entry.debit || 0),
        0
      ),
    0
  );

  const totalCredit = filteredJournals.reduce(
    (total, journal) =>
      total +
      (journal.entries || []).reduce(
        (sum, entry) => sum + Number(entry.credit || 0),
        0
      ),
    0
  );

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "-";

  const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const typeClass = (type) => {
    switch (type) {
      case "SALES":
        return "sales";
      case "PURCHASE":
        return "purchase";
      case "RECEIPT":
        return "receipt";
      case "PAYMENT":
        return "payment";
      default:
        return "journal";
    }
  };

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #07101f;
          color: #e5e7eb;
          font-family: Arial, Helvetica, sans-serif;
        }

        .daybook {
          min-height: 100vh;
          padding: 28px;
          background:
            radial-gradient(circle at top right, #13264a 0, transparent 32%),
            #07101f;
        }

        .container {
          max-width: 1450px;
          margin: auto;
        }

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 24px 28px;
          margin-bottom: 22px;
          background: #0d1930;
          border: 1px solid #20365b;
          border-radius: 16px;
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.25);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 58px;
          height: 58px;
          border-radius: 14px;
          background: linear-gradient(135deg, #2563eb, #4f46e5);
          font-size: 27px;
        }

        .title {
          margin: 0;
          font-size: 27px;
          font-weight: 800;
          color: #f8fafc;
        }

        .subtitle {
          margin: 6px 0 0;
          color: #94a3b8;
          font-size: 13px;
        }

        .status {
          display: inline-block;
          margin-left: 10px;
          padding: 4px 9px;
          border-radius: 20px;
          background: #063b31;
          color: #34d399;
          font-size: 10px;
          font-weight: 700;
          vertical-align: middle;
        }

        .new-btn {
          padding: 11px 17px;
          border-radius: 9px;
          background: linear-gradient(135deg, #2563eb, #4f46e5);
          color: #fff;
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
          transition: 0.2s;
        }

        .new-btn:hover {
          transform: translateY(-2px);
        }

        .summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 22px;
        }

        .card {
          padding: 20px;
          background: #0d1930;
          border: 1px solid #20365b;
          border-radius: 14px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        .card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .card-label {
          margin: 0;
          color: #94a3b8;
          font-size: 12px;
          font-weight: 600;
        }

        .card-value {
          margin: 8px 0 0;
          color: #f8fafc;
          font-size: 24px;
          font-weight: 800;
        }

        .card-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 43px;
          height: 43px;
          border-radius: 11px;
          background: #14274a;
          color: #60a5fa;
          font-size: 19px;
        }

        .debit-icon {
          color: #34d399;
        }

        .credit-icon {
          color: #c084fc;
        }

        .main {
          overflow: hidden;
          background: #0d1930;
          border: 1px solid #20365b;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.22);
        }

        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 20px 22px;
          border-bottom: 1px solid #20365b;
        }

        .section-title {
          margin: 0;
          color: #f8fafc;
          font-size: 17px;
          font-weight: 800;
        }

        .count {
          display: inline-block;
          margin-left: 8px;
          padding: 3px 8px;
          border-radius: 20px;
          background: #142d55;
          color: #60a5fa;
          font-size: 10px;
        }

        .section-subtitle {
          margin: 5px 0 0;
          color: #64748b;
          font-size: 11px;
        }

        .controls {
          display: flex;
          gap: 10px;
        }

        .filter,
        .search {
          height: 40px;
          border: 1px solid #294366;
          border-radius: 8px;
          background: #091527;
          color: #cbd5e1;
          outline: none;
          font-size: 12px;
        }

        .filter {
          padding: 0 11px;
          cursor: pointer;
        }

        .search-box {
          position: relative;
          width: 320px;
        }

        .search {
          width: 100%;
          padding: 0 35px 0 36px;
        }

        .search:focus,
        .filter:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
        }

        .clear {
          position: absolute;
          right: 7px;
          top: 50%;
          transform: translateY(-50%);
          border: 0;
          background: transparent;
          color: #64748b;
          cursor: pointer;
        }

        .table-wrap {
          overflow-x: auto;
        }

        table {
          width: 100%;
          min-width: 1150px;
          border-collapse: collapse;
        }

        th {
          padding: 14px 16px;
          background: #091527;
          border-bottom: 1px solid #20365b;
          color: #64748b;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.5px;
          text-align: left;
          text-transform: uppercase;
        }

        th.amount,
        td.amount {
          text-align: right;
        }

        th.action,
        td.action {
          text-align: center;
        }

        td {
          padding: 17px 16px;
          border-bottom: 1px solid #172944;
          vertical-align: top;
        }

        tbody tr {
          transition: 0.15s;
        }

        tbody tr:hover {
          background: #101f38;
        }

        .number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 7px;
          background: #14233a;
          color: #64748b;
          font-size: 10px;
          font-weight: 800;
        }

        .date {
          color: #cbd5e1;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }

        .date-note {
          margin-top: 5px;
          color: #475569;
          font-size: 9px;
        }

        .voucher {
          display: inline-block;
          padding: 7px 10px;
          border: 1px solid #214a82;
          border-radius: 7px;
          background: #10294c;
          color: #60a5fa;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
        }

        .type {
          display: inline-flex;
          padding: 7px 10px;
          border-radius: 7px;
          font-size: 9px;
          font-weight: 800;
          white-space: nowrap;
        }

        .type.journal {
          background: #273449;
          color: #cbd5e1;
        }

        .type.sales {
          background: #102d52;
          color: #60a5fa;
        }

        .type.purchase {
          background: #422710;
          color: #fb923c;
        }

        .type.receipt {
          background: #06382e;
          color: #34d399;
        }

        .type.payment {
          background: #421d25;
          color: #f87171;
        }

        .particulars {
          min-width: 290px;
          max-width: 390px;
        }

        .ledger {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 7px;
          color: #cbd5e1;
          font-size: 12px;
          font-weight: 600;
        }

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #3b82f6;
        }

        .narration {
          margin-top: 10px;
          padding: 8px 10px;
          border-left: 2px solid #294b7a;
          background: #091527;
          border-radius: 5px;
        }

        .narration-label {
          color: #475569;
          font-size: 8px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .narration-text {
          margin-top: 3px;
          color: #64748b;
          font-size: 10px;
          font-style: italic;
        }

        .amount-value {
          color: #60a5fa;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
          margin-bottom: 7px;
        }

        .credit-value {
          color: #c084fc;
        }

        .dash {
          color: #334155;
        }

        .view {
          padding: 8px 12px;
          border: 1px solid #294366;
          border-radius: 7px;
          background: #0b192e;
          color: #60a5fa;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s;
        }

        .view:hover {
          border-color: #3b82f6;
          background: #10294c;
        }

        .state {
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 30px;
          text-align: center;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #1e3a5f;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .state-icon {
          font-size: 38px;
        }

        .state-title {
          margin: 14px 0 0;
          color: #e2e8f0;
          font-size: 16px;
          font-weight: 800;
        }

        .state-text {
          max-width: 430px;
          margin: 7px 0 0;
          color: #64748b;
          font-size: 12px;
          line-height: 1.5;
        }

        .clear-btn {
          margin-top: 16px;
          padding: 9px 14px;
          border: 1px solid #294366;
          border-radius: 8px;
          background: #0b192e;
          color: #94a3b8;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .error {
          margin: 22px;
          padding: 16px;
          border: 1px solid #6b2832;
          border-radius: 10px;
          background: #29151b;
        }

        .error-title {
          margin: 0;
          color: #fca5a5;
          font-size: 13px;
          font-weight: 700;
        }

        .error-text {
          margin: 5px 0 0;
          color: #f87171;
          font-size: 11px;
        }

        .footer {
          display: flex;
          justify-content: space-between;
          padding: 13px 3px;
          color: #475569;
          font-size: 10px;
        }

        .footer strong {
          color: #64748b;
        }

        @media (max-width: 900px) {
          .daybook {
            padding: 16px;
          }

          .header {
            align-items: flex-start;
            flex-direction: column;
          }

          .new-btn {
            width: 100%;
            text-align: center;
          }

          .summary {
            grid-template-columns: 1fr;
          }

          .toolbar {
            align-items: stretch;
            flex-direction: column;
          }

          .controls {
            flex-direction: column;
          }

          .search-box {
            width: 100%;
          }

          .footer {
            flex-direction: column;
            gap: 7px;
          }
        }

        @media (max-width: 600px) {
          .daybook {
            padding: 10px;
          }

          .header {
            padding: 20px;
          }

          .header-left {
            align-items: flex-start;
          }

          .title {
            font-size: 22px;
          }

          .status {
            display: none;
          }

          .card-value {
            font-size: 21px;
          }
        }
      `}</style>

      <div className="daybook">
        <div className="container">
          <div className="header">
            <div className="header-left">

              <div>
                <h1 className="title">
                  Day Book
                </h1>

                <p className="subtitle">
                  Complete overview of accounting transactions
                </p>
              </div>
            </div>
          </div>

          <div className="summary">
            <div className="card">
              <div className="card-top">
                <div>
                  <p className="card-label">Total Vouchers</p>
                  <p className="card-value">{journals.length}</p>
                </div>

                <div className="card-icon">📋</div>
              </div>
            </div>

            <div className="card">
              <div className="card-top">
                <div>
                  <p className="card-label">Total Debit</p>
                  <p className="card-value">
                    ₹ {formatAmount(totalDebit)}
                  </p>
                </div>

                <div className="card-icon debit-icon">↓</div>
              </div>
            </div>

            <div className="card">
              <div className="card-top">
                <div>
                  <p className="card-label">Total Credit</p>
                  <p className="card-value">
                    ₹ {formatAmount(totalCredit)}
                  </p>
                </div>

                <div className="card-icon credit-icon">↑</div>
              </div>
            </div>
          </div>

          <div className="main">
            <div className="toolbar">
              <div>
                <h2 className="section-title">
                  All Transactions
                  <span className="count">
                    {filteredJournals.length}
                  </span>
                </h2>

                <p className="section-subtitle">
                  Search and filter voucher transactions
                </p>
              </div>

              <div className="controls">
                <select
                  className="filter"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="ALL">All Types</option>
                  <option value="JOURNAL">Journal</option>
                  <option value="SALES">Sales</option>
                  <option value="PURCHASE">Purchase</option>
                  <option value="RECEIPT">Receipt</option>
                  <option value="PAYMENT">Payment</option>
                </select>

                <div className="search-box">
                  <span className="search-icon">🔍</span>

                  <input
                    className="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search voucher, ledger, narration..."
                  />

                  {search && (
                    <button
                      className="clear"
                      onClick={() => setSearch("")}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {loading && (
              <div className="state">
                <div className="spinner" />
                <p className="state-title">
                  Loading Day Book...
                </p>
                <p className="state-text">
                  Please wait while transactions are loaded.
                </p>
              </div>
            )}

            {!loading && error && (
              <div className="error">
                <p className="error-title">
                  Unable to load transactions
                </p>

                <p className="error-text">{error}</p>
              </div>
            )}

            {!loading &&
              !error &&
              filteredJournals.length === 0 && (
                <div className="state">
                  <div className="state-icon">
                    {search || typeFilter !== "ALL" ? "🔍" : "📒"}
                  </div>

                  <p className="state-title">
                    {search || typeFilter !== "ALL"
                      ? "No Transactions Found"
                      : "No Transactions Yet"}
                  </p>

                  <p className="state-text">
                    {search || typeFilter !== "ALL"
                      ? "No voucher, type, ledger or narration matches your filter."
                      : "Create a Journal Voucher to start recording transactions."}
                  </p>

                  {search || typeFilter !== "ALL" ? (
                    <button
                      className="clear-btn"
                      onClick={() => {
                        setSearch("");
                        setTypeFilter("ALL");
                      }}
                    >
                      Clear Filters
                    </button>
                  ) : (
                    <Link href="/journal" className="new-btn">
                      + Create Journal
                    </Link>
                  )}
                </div>
              )}

            {!loading &&
              !error &&
              filteredJournals.length > 0 && (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Date</th>
                        <th>Voucher No</th>
                        <th>Type</th>
                        <th>Particulars</th>
                        <th className="amount">Debit</th>
                        <th className="amount">Credit</th>
                        <th className="action">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredJournals.map((journal, index) => {
                        const type = String(
                          journal.voucher_type || "JOURNAL"
                        ).toUpperCase();

                        return (
                          <tr key={journal.id}>
                            <td>
                              <div className="number">
                                {index + 1}
                              </div>
                            </td>

                            <td>
                              <div className="date">
                                {formatDate(journal.voucher_date)}
                              </div>

                              <div className="date-note">
                                Voucher Date
                              </div>
                            </td>

                            <td>
                              <span className="voucher">
                                {journal.voucher_number || "-"}
                              </span>
                            </td>

                            <td>
                              <span className={`type ${typeClass(type)}`}>
                                {type}
                              </span>
                            </td>

                            <td className="particulars">
                              {(journal.entries || []).map((entry) => (
                                <div
                                  className="ledger"
                                  key={entry.id}
                                >
                                  <span className="dot" />
                                  {entry.ledger_name || "-"}
                                </div>
                              ))}

                              {journal.narration && (
                                <div className="narration">
                                  <div className="narration-label">
                                    Narration
                                  </div>

                                  <div className="narration-text">
                                    {journal.narration}
                                  </div>
                                </div>
                              )}
                            </td>

                            <td className="amount">
                              {(journal.entries || []).map((entry) => (
                                <div
                                  className="amount-value"
                                  key={entry.id}
                                >
                                  {Number(entry.debit || 0) > 0
                                    ? `₹ ${formatAmount(entry.debit)}`
                                    : (
                                      <span className="dash">—</span>
                                    )}
                                </div>
                              ))}
                            </td>

                            <td className="amount">
                              {(journal.entries || []).map((entry) => (
                                <div
                                  className="amount-value credit-value"
                                  key={entry.id}
                                >
                                  {Number(entry.credit || 0) > 0
                                    ? `₹ ${formatAmount(entry.credit)}`
                                    : (
                                      <span className="dash">—</span>
                                    )}
                                </div>
                              ))}
                            </td>

                            <td className="action">
                              <button
                                className="view"
                                onClick={() =>
                                  router.push(
                                    `/journal/${journal.id}`
                                  )
                                }
                              >
                                View →
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
          </div>

          {!loading &&
            !error &&
            filteredJournals.length > 0 && (
              <div className="footer">
                <span>
                  Showing <strong>{filteredJournals.length}</strong> of{" "}
                  <strong>{journals.length}</strong> vouchers
                </span>

                <span>
                  Day Book • Accounting Transactions
                </span>
              </div>
            )}
        </div>
      </div>
    </>
  );
}