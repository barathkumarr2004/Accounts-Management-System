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
      const type = String(journal.voucher_type || "JOURNAL").toUpperCase();
      const typeMatch = typeFilter === "ALL" || type === typeFilter;

      const searchMatch =
        !value ||
        String(journal.voucher_number || "").toLowerCase().includes(value) ||
        type.toLowerCase().includes(value) ||
        String(journal.narration || "").toLowerCase().includes(value) ||
        journal.entries?.some((entry) =>
          String(entry.ledger_name || "").toLowerCase().includes(value)
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

  const getTypeClass = (type) => {
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
      <div className="daybook-page">
        <div className="daybook-container">

          <header className="page-header">
            <div className="header-content">
              <div className="header-icon">DB</div>

              <div>
                <div className="title-row">
                  <h1>Day Book</h1>
                </div>

                <p>
                  Complete overview of all accounting transactions
                </p>
              </div>
            </div>
          </header>

          <section className="summary-grid">

            <div className="summary-card voucher-card">
              <div className="summary-content">
                <span className="summary-label">
                  TOTAL VOUCHERS
                </span>

                <strong>
                  {filteredJournals.length}
                </strong>

                <small>
                  {search || typeFilter !== "ALL"
                    ? "Filtered vouchers"
                    : "All recorded vouchers"}
                </small>
              </div>

              <div className="summary-icon blue">
                DB
              </div>
            </div>

            <div className="summary-card debit-card">
              <div className="summary-content">
                <span className="summary-label">
                  TOTAL DEBIT
                </span>

                <strong>
                  ₹ {formatAmount(totalDebit)}
                </strong>

                <small>
                  Debit transaction value
                </small>
              </div>

              <div className="summary-icon green">
                DR
              </div>
            </div>

            <div className="summary-card credit-card">
              <div className="summary-content">
                <span className="summary-label">
                  TOTAL CREDIT
                </span>

                <strong>
                  ₹ {formatAmount(totalCredit)}
                </strong>

                <small>
                  Credit transaction value
                </small>
              </div>

              <div className="summary-icon purple">
                CR
              </div>
            </div>

          </section>

          <section className="transactions-card">

            <div className="transactions-header">
              <div className="transactions-title">
                <div className="transaction-icon">
                  TR
                </div>

                <div>
                  <div className="heading-row">
                    <h2>All Transactions</h2>

                    <span className="count-badge">
                      {filteredJournals.length}
                    </span>
                  </div>

                  <p>
                    Search and filter your accounting vouchers
                  </p>
                </div>
              </div>

              <div className="controls">

                <div className="select-wrapper">
                  <select
                    value={typeFilter}
                    onChange={(e) =>
                      setTypeFilter(e.target.value)
                    }
                  >
                    <option value="ALL">
                      All Types
                    </option>

                    <option value="JOURNAL">
                      Journal
                    </option>

                    <option value="SALES">
                      Sales
                    </option>

                    <option value="PURCHASE">
                      Purchase
                    </option>

                    <option value="RECEIPT">
                      Receipt
                    </option>

                    <option value="PAYMENT">
                      Payment
                    </option>
                  </select>
                </div>

                <div className="search-wrapper">
                  <span className="search-icon">
                    🔍
                  </span>

                  <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Search voucher, ledger, narration..."
                  />

                  {search && (
                    <button
                      className="clear-search"
                      onClick={() => setSearch("")}
                    >
                      ×
                    </button>
                  )}
                </div>

              </div>
            </div>

            {loading && (
              <div className="state-container">
                <div className="spinner"></div>

                <h3>
                  Loading Day Book
                </h3>

                <p>
                  Please wait while transactions are being loaded.
                </p>
              </div>
            )}

            {!loading && error && (
              <div className="error-container">
                <div className="error-icon">
                  !
                </div>

                <div>
                  <strong>
                    Unable to load transactions
                  </strong>

                  <p>
                    {error}
                  </p>
                </div>
              </div>
            )}

            {!loading &&
              !error &&
              filteredJournals.length === 0 && (
                <div className="state-container">
                  <div className="empty-icon">
                    {search || typeFilter !== "ALL"
                      ? "🔍"
                      : "DB"}
                  </div>

                  <h3>
                    {search || typeFilter !== "ALL"
                      ? "No Transactions Found"
                      : "No Transactions Yet"}
                  </h3>

                  <p>
                    {search || typeFilter !== "ALL"
                      ? "No transaction matches your current search or filter."
                      : "Create a journal voucher to start recording transactions."}
                  </p>

                  {search || typeFilter !== "ALL" ? (
                    <button
                      className="reset-button"
                      onClick={() => {
                        setSearch("");
                        setTypeFilter("ALL");
                      }}
                    >
                      Clear Filters
                    </button>
                  ) : (
                    <Link
                      href="/journal"
                      className="create-button empty-button"
                    >
                      + Create Journal
                    </Link>
                  )}
                </div>
              )}

            {!loading &&
              !error &&
              filteredJournals.length > 0 && (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>DATE</th>
                        <th>VOUCHER NO</th>
                        <th>TYPE</th>
                        <th>PARTICULARS</th>
                        <th className="right">
                          DEBIT
                        </th>
                        <th className="right">
                          CREDIT
                        </th>
                        <th className="center">
                          ACTION
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredJournals.map(
                        (journal, index) => {
                          const type = String(
                            journal.voucher_type ||
                              "JOURNAL"
                          ).toUpperCase();

                          return (
                            <tr key={journal.id}>

                              <td>
                                <div className="row-number">
                                  {String(
                                    index + 1
                                  ).padStart(2, "0")}
                                </div>
                              </td>

                              <td>
                                <div className="date-value">
                                  {formatDate(
                                    journal.voucher_date
                                  )}
                                </div>

                                <div className="date-label">
                                  Voucher Date
                                </div>
                              </td>

                              <td>
                                <span className="voucher-number">
                                  {journal.voucher_number ||
                                    "-"}
                                </span>
                              </td>

                              <td>
                                <span
                                  className={`type-badge ${getTypeClass(
                                    type
                                  )}`}
                                >
                                  <span className="type-dot"></span>
                                  {type}
                                </span>
                              </td>

                              <td>
                                <div className="particulars">

                                  {(journal.entries || []).map(
                                    (entry) => (
                                      <div
                                        className="ledger-row"
                                        key={entry.id}
                                      >
                                        <span className="ledger-dot"></span>

                                        <span>
                                          {entry.ledger_name ||
                                            "-"}
                                        </span>
                                      </div>
                                    )
                                  )}

                                  {journal.narration && (
                                    <div className="narration-box">
                                      <span className="narration-label">
                                        NARRATION
                                      </span>

                                      <span className="narration-text">
                                        {journal.narration}
                                      </span>
                                    </div>
                                  )}

                                </div>
                              </td>

                              <td className="right">
                                {(journal.entries || []).map(
                                  (entry) => (
                                    <div
                                      className="amount debit"
                                      key={entry.id}
                                    >
                                      {Number(
                                        entry.debit || 0
                                      ) > 0
                                        ? `₹ ${formatAmount(
                                            entry.debit
                                          )}`
                                        : (
                                          <span className="dash">
                                            —
                                          </span>
                                        )}
                                    </div>
                                  )
                                )}
                              </td>

                              <td className="right">
                                {(journal.entries || []).map(
                                  (entry) => (
                                    <div
                                      className="amount credit"
                                      key={entry.id}
                                    >
                                      {Number(
                                        entry.credit || 0
                                      ) > 0
                                        ? `₹ ${formatAmount(
                                            entry.credit
                                          )}`
                                        : (
                                          <span className="dash">
                                            —
                                          </span>
                                        )}
                                    </div>
                                  )
                                )}
                              </td>

                              <td className="center">
                                <button
                                  className="view-button"
                                  onClick={() =>
                                    router.push(
                                      `/journal/${journal.id}`
                                    )
                                  }
                                >
                                  View
                                  <span>→</span>
                                </button>
                              </td>

                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              )}

          </section>

          {!loading &&
            !error &&
            filteredJournals.length > 0 && (
              <footer className="page-footer">
                <span>
                  Showing{" "}
                  <strong>
                    {filteredJournals.length}
                  </strong>{" "}
                  of{" "}
                  <strong>
                    {journals.length}
                  </strong>{" "}
                  vouchers
                </span>

                <span>
                  Debit ₹ {formatAmount(totalDebit)}
                  {"  "}•{"  "}
                  Credit ₹ {formatAmount(totalCredit)}
                </span>
              </footer>
            )}

        </div>
      </div>

      <style>{`

        * { box-sizing:border-box; }

        body { margin:0; background:#07111f; }

        .daybook-page { min-height:100vh; padding:24px; background:radial-gradient(circle at 85% 0%,#152c55 0,transparent 28%),#07111f; color:#e8f1f7; font-family:Arial,Helvetica,sans-serif; }

        .daybook-container { width:100%; max-width:1450px; margin:0 auto; }

        .page-header { display:flex; align-items:center; justify-content:space-between; gap:20px; padding:20px 24px; margin-bottom:16px; background:linear-gradient(110deg,#0d1e35,#193a78); border:1px solid #2a6fa0; border-radius:10px; box-shadow:0 10px 30px rgba(0,0,0,.25); }

        .header-content { display:flex; align-items:center; gap:14px; }

        .header-icon { width:48px; height:48px; display:flex; align-items:center; justify-content:center; border-radius:8px; background:#16a7df; color:#fff; font-size:11px; font-weight:900; box-shadow:0 5px 15px rgba(22,167,223,.2); }

        .title-row { display:flex; align-items:center; gap:9px; }

        .title-row h1 { margin:0; color:#fff; font-size:25px; font-weight:800; }

        .title-row p { margin:0; }

        .page-header p { margin:5px 0 0; color:#a3c6dc; font-size:11px; }

        .live-badge { padding:4px 7px; border:1px solid #28684f; border-radius:4px; background:#10342a; color:#5ee0ae; font-size:7px; font-weight:800; letter-spacing:.6px; }

        .create-button { display:inline-flex; align-items:center; justify-content:center; gap:7px; padding:10px 14px; border:1px solid #2e7ee0; border-radius:6px; background:#1d5fd1; color:#fff; text-decoration:none; font-size:11px; font-weight:800; transition:.2s; }

        .create-button:hover { background:#2870ed; transform:translateY(-1px); }

        .create-button span { font-size:16px; line-height:1; }

        .summary-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:13px; margin-bottom:16px; }

        .summary-card { display:flex; align-items:center; justify-content:space-between; min-height:105px; padding:17px; background:#0b1b2d; border:1px solid #1b3853; border-radius:9px; box-shadow:0 7px 22px rgba(0,0,0,.18); }

        .summary-label { display:block; margin-bottom:8px; color:#668197; font-size:8px; font-weight:800; letter-spacing:.8px; }

        .summary-content strong { display:block; color:#f2f7fa; font-family:Consolas,monospace; font-size:21px; font-weight:800; }

        .summary-content small { display:block; margin-top:6px; color:#526d81; font-size:8px; }

        .summary-icon { width:40px; height:40px; display:flex; align-items:center; justify-content:center; border-radius:7px; font-size:9px; font-weight:900; }

        .summary-icon.blue { background:#102e4a; border:1px solid #285a7c; color:#62c8ee; }

        .summary-icon.green { background:#11352d; border:1px solid #286b59; color:#61dcb1; }

        .summary-icon.purple { background:#2b2142; border:1px solid #58427e; color:#c6a8ff; }

        .debit-card .summary-content strong { color:#61dcb1; }

        .credit-card .summary-content strong { color:#c6a8ff; }

        .transactions-card { overflow:hidden; background:#0b1b2d; border:1px solid #1b3853; border-radius:10px; box-shadow:0 8px 28px rgba(0,0,0,.2); }

        .transactions-header { display:flex; align-items:center; justify-content:space-between; gap:18px; padding:17px 18px; background:#0d2035; border-bottom:1px solid #1b3853; }

        .transactions-title { display:flex; align-items:center; gap:10px; }

        .transaction-icon { width:35px; height:35px; display:flex; align-items:center; justify-content:center; border:1px solid #285675; border-radius:6px; background:#102a43; color:#5ec9ee; font-size:8px; font-weight:900; }

        .heading-row { display:flex; align-items:center; gap:8px; }

        .heading-row h2 { margin:0; color:#edf5fa; font-size:15px; font-weight:800; }

        .count-badge { padding:3px 7px; border-radius:10px; background:#15345c; color:#60b8ec; font-size:8px; font-weight:800; }

        .transactions-header p { margin:4px 0 0; color:#5e778b; font-size:9px; }

        .controls { display:flex; align-items:center; gap:8px; }

        .select-wrapper select { height:39px; padding:0 10px; outline:none; border:1px solid #294761; border-radius:6px; background:#081726; color:#b9cbd6; font-size:10px; cursor:pointer; }

        .select-wrapper select:focus { border-color:#2d91c1; }

        .search-wrapper { position:relative; width:280px; }

        .search-wrapper input { width:100%; height:39px; padding:0 30px 0 33px; outline:none; border:1px solid #294761; border-radius:6px; background:#081726; color:#d9e5eb; font-size:10px; }

        .search-wrapper input::placeholder { color:#4f687b; }

        .search-wrapper input:focus { border-color:#2d91c1; box-shadow:0 0 0 2px rgba(45,145,193,.08); }

        .search-icon { position:absolute; top:50%; left:11px; transform:translateY(-50%); color:#53758b; font-size:11px; }

        .clear-search { position:absolute; top:50%; right:7px; transform:translateY(-50%); border:0; background:transparent; color:#60798b; font-size:15px; cursor:pointer; }

        .table-container { width:100%; overflow-x:auto; }

        table { width:100%; min-width:1180px; border-collapse:collapse; }

        th { padding:11px 13px; background:#0a192a; border-bottom:1px solid #254762; color:#627f94; font-size:8px; font-weight:800; text-align:left; letter-spacing:.5px; white-space:nowrap; }

        td { padding:14px 13px; border-bottom:1px solid #142d42; background:#0b1b2d; color:#bacbd5; font-size:10px; vertical-align:top; }

        tbody tr:hover td { background:#0e2439; }

        .right { text-align:right; }

        .center { text-align:center; }

        .row-number { width:27px; height:27px; display:flex; align-items:center; justify-content:center; border:1px solid #1c344c; border-radius:6px; background:#102238; color:#61798a; font-family:Consolas,monospace; font-size:8px; font-weight:800; }

        .date-value { color:#c5d4dd; font-size:10px; font-weight:700; white-space:nowrap; }

        .date-label { margin-top:4px; color:#435e72; font-size:7px; }

        .voucher-number { display:inline-block; padding:6px 8px; border:1px solid #255b89; border-radius:5px; background:#0e2949; color:#5bc3ef; font-family:Consolas,monospace; font-size:9px; font-weight:800; white-space:nowrap; }

        .type-badge { display:inline-flex; align-items:center; gap:5px; padding:5px 7px; border-radius:4px; font-size:7px; font-weight:900; white-space:nowrap; }

        .type-dot { width:5px; height:5px; border-radius:50%; background:currentColor; }

        .type-badge.journal { background:#25203e; border:1px solid #4c416e; color:#beaaff; }

        .type-badge.sales { background:#10362d; border:1px solid #286957; color:#61ddb2; }

        .type-badge.purchase { background:#392d18; border:1px solid #6d5724; color:#f1c568; }

        .type-badge.receipt { background:#10343e; border:1px solid #287184; color:#61d3ec; }

        .type-badge.payment { background:#391e24; border:1px solid #713740; color:#ff9999; }

        .particulars { min-width:300px; max-width:390px; }

        .ledger-row { display:flex; align-items:center; gap:7px; margin-bottom:6px; color:#c5d4dd; font-size:10px; font-weight:600; }

        .ledger-dot { width:5px; height:5px; flex-shrink:0; border-radius:50%; background:#3e91e8; box-shadow:0 0 5px rgba(62,145,232,.4); }

        .narration-box { margin-top:8px; padding:7px 9px; border-left:2px solid #27537a; border-radius:4px; background:#081726; }

        .narration-label { display:block; color:#415e73; font-size:7px; font-weight:800; letter-spacing:.5px; }

        .narration-text { display:block; margin-top:3px; overflow:hidden; color:#617b8d; font-size:8px; font-style:italic; text-overflow:ellipsis; white-space:nowrap; }

        .amount { margin-bottom:6px; color:#61dcb1; font-family:Consolas,monospace; font-size:10px; font-weight:700; white-space:nowrap; }

        .amount.credit { color:#c7a5ff; }

        .dash { color:#344b5d; }

        .view-button { display:inline-flex; align-items:center; gap:6px; padding:7px 10px; border:1px solid #285477; border-radius:5px; background:#0a1c30; color:#61b8e7; font-size:9px; font-weight:800; cursor:pointer; transition:.2s; }

        .view-button:hover { border-color:#3b8fc2; background:#102b45; color:#8ad8fa; }

        .view-button span { font-size:11px; }

        .state-container { min-height:350px; display:flex; align-items:center; justify-content:center; flex-direction:column; padding:40px 20px; text-align:center; }

        .state-container h3 { margin:12px 0 5px; color:#e4eef4; font-size:14px; }

        .state-container p { max-width:420px; margin:0; color:#5d778b; font-size:9px; line-height:1.6; }

        .empty-icon { width:46px; height:46px; display:flex; align-items:center; justify-content:center; border:1px solid #285575; border-radius:8px; background:#102a42; color:#5fc7ec; font-size:10px; font-weight:900; }

        .spinner { width:32px; height:32px; border:3px solid #19334b; border-top-color:#3ea9d9; border-radius:50%; animation:spin .8s linear infinite; }

        @keyframes spin { to { transform:rotate(360deg); } }

        .reset-button { margin-top:15px; padding:8px 12px; border:1px solid #294964; border-radius:5px; background:#0b1d31; color:#79a2ba; font-size:9px; font-weight:700; cursor:pointer; }

        .reset-button:hover { border-color:#3d83aa; color:#9ac9e2; }

        .empty-button { margin-top:15px; }

        .error-container { display:flex; align-items:center; gap:10px; margin:18px; padding:13px; border:1px solid #6d313a; border-radius:7px; background:#29161b; }

        .error-icon { width:27px; height:27px; display:flex; align-items:center; justify-content:center; border-radius:50%; background:#5b252d; color:#ff9b9b; font-weight:900; }

        .error-container strong { display:block; color:#f3a0a0; font-size:10px; }

        .error-container p { margin:3px 0 0; color:#bd7079; font-size:8px; }

        .page-footer { display:flex; align-items:center; justify-content:space-between; padding:11px 2px; color:#4d677b; font-size:8px; }

        .page-footer strong { color:#70899a; }

        @media (max-width:1000px) { .daybook-page { padding:18px; } .summary-grid { grid-template-columns:1fr; } .transactions-header { align-items:flex-start; flex-direction:column; } .controls { width:100%; } .search-wrapper { flex:1; width:auto; } }

        @media (max-width:650px) { .daybook-page { padding:10px; } .page-header { align-items:flex-start; flex-direction:column; } .header-content { align-items:flex-start; } .create-button { width:100%; } .live-badge { display:none; } .controls { align-items:stretch; flex-direction:column; } .select-wrapper select { width:100%; } .search-wrapper { width:100%; } .page-footer { align-items:flex-start; flex-direction:column; gap:5px; } }

      `}</style>
    </>
  );
}