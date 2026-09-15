"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000";

export default function TrialBalancePage() {
  const [data, setData] = useState([]);
  const [groups, setGroups] = useState([]);
  const [totals, setTotals] = useState({
    totalDebit: 0,
    totalCredit: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTrialBalance();
  }, []);

  const fetchTrialBalance = async () => {
    try {
      setLoading(true);
      setError("");

      const [trialRes, groupRes] =
        await Promise.all([
          axios.get(
            `${API_URL}/api/trialbalance`
          ),
          axios.get(
            `${API_URL}/api/groups`
          ),
        ]);

      setData(trialRes.data.data || []);

      setTotals({
        totalDebit:
          Number(trialRes.data.totalDebit) || 0,
        totalCredit:
          Number(trialRes.data.totalCredit) || 0,
      });

      setGroups(
        groupRes.data.data ||
          groupRes.data.groups ||
          []
      );
    } catch (err) {
      console.error(err);
      setError(
        "Unable to load trial balance"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (value) => {
    return Number(value || 0).toFixed(2);
  };

  const getGroupName = (ledger) => {
    if (ledger.group_name) {
      return ledger.group_name;
    }

    const group = groups.find(
      (item) =>
        Number(item.id) ===
        Number(ledger.group_id)
    );

    return group?.name || "Unknown Group";
  };

  const groupedData = Object.values(
    data.reduce((acc, ledger) => {
      const groupId =
        ledger.group_id ||
        ledger.groupId ||
        getGroupName(ledger);

      const groupName =
        getGroupName(ledger);

      if (!acc[groupId]) {
        acc[groupId] = {
          id: groupId,
          name: groupName,
          debit: 0,
          credit: 0,
        };
      }

      acc[groupId].debit +=
        Number(ledger.debit || 0);

      acc[groupId].credit +=
        Number(ledger.credit || 0);

      return acc;
    }, {})
  );

  const totalDebit =
    Number(totals.totalDebit) || 0;

  const totalCredit =
    Number(totals.totalCredit) || 0;

  const difference =
    totalDebit - totalCredit;

  const isTally =
    Math.abs(difference) < 0.01;

  return (
    <div className="trial-page">
      <div className="trial-background"></div>

      <main className="trial-container">

        <header className="trial-header">

          <div className="header-left">

            <div className="report-icon">
              TB
            </div>

            <div>
              <h1>
                Trial Balance
              </h1>

              <p>
                Verify debit and credit balances
                across all account groups
              </p>
            </div>

          </div>

          <div className="header-status">

            <div className="summary-card debit-card">
              <span>
                Debit
              </span>

              <strong>
                ₹ {formatAmount(totalDebit)}
              </strong>
            </div>

            <div className="summary-card credit-card">
              <span>
                Credit
              </span>

              <strong>
                ₹ {formatAmount(totalCredit)}
              </strong>
            </div>

            <div
              className={`tally-status ${
                isTally
                  ? "tally-success"
                  : "tally-error"
              }`}
            >
              <span>
                {isTally ? "✓" : "!"}
              </span>

              {isTally
                ? "TALLIED"
                : "MISMATCH"}
            </div>

          </div>

        </header>

        {error && (
          <div className="error-message">
            <span>!</span>
            {error}
          </div>
        )}

        <section className="report-info">

          <div>
            <span className="info-label">
              Trial Balance
            </span>

            <strong>
              {groupedData.length} Groups
            </strong>
          </div>

          <div className="info-divider"></div>

          <div>
            <span className="info-label">
              Debit Total
            </span>

            <strong className="debit-info">
              ₹ {formatAmount(totalDebit)}
            </strong>
          </div>

          <div className="info-divider"></div>

          <div>
            <span className="info-label">
              Credit Total
            </span>

            <strong className="credit-info">
              ₹ {formatAmount(totalCredit)}
            </strong>
          </div>

          <div className="info-divider"></div>

          <div>
            <span className="info-label">
              Difference
            </span>

            <strong
              className={
                isTally
                  ? "difference-ok"
                  : "difference-error"
              }
            >
              ₹{" "}
              {formatAmount(
                Math.abs(difference)
              )}
            </strong>
          </div>

        </section>

        <section className="table-card">

          <div className="table-heading">

            <div>
              <h2>
                Group Balances
              </h2>

              <p>
                Ledger balances are combined
                under their respective groups
              </p>
            </div>

            <div className="group-count">
              {groupedData.length} Groups
            </div>

          </div>

          {loading ? (
            <div className="empty-state">

              <div className="loader"></div>

              <p>
                Loading trial balance...
              </p>

            </div>
          ) : groupedData.length === 0 ? (
            <div className="empty-state">

              <div className="empty-icon">
                TB
              </div>

              <h3>
                No Group Balances
              </h3>

              <p>
                No trial balance records found.
              </p>

            </div>
          ) : (
            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>

                    <th className="id-column">
                      #
                    </th>

                    <th>
                      Group
                    </th>

                    <th className="amount-column">
                      Debit
                    </th>

                    <th className="amount-column">
                      Credit
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {groupedData.map(
                    (group, index) => (
                      <tr key={group.id}>

                        <td className="group-index">
                          {String(
                            index + 1
                          ).padStart(2, "0")}
                        </td>

                        <td>

                          <div className="group-name">

                            <div>
                              <strong>
                                {group.name}
                              </strong>
                            </div>

                          </div>

                        </td>

                        <td className={`debit-value ${Number(group.debit) >                  
                            0  ? "has-value" : ""
                          }`}
                        >
                          {Number(group.debit) >
                          0
                            ? `₹ ${formatAmount(
                                group.debit)}`: "—"}
                        </td>

                        <td
                          className={`credit-value ${
                            Number(group.credit) >
                            0
                              ? "has-value"
                              : ""
                          }`}
                        >
                          {Number(group.credit) >
                          0
                            ? `₹ ${formatAmount(
                                group.credit
                              )}`
                            : "—"}
                        </td>

                      </tr>
                    )
                  )}

                </tbody>

                <tfoot>

                  <tr>

                    <td></td>

                    <td>

                      <strong>
                        TOTAL
                      </strong>

                      <span className="total-count">
                        {groupedData.length} Groups
                      </span>

                    </td>

                    <td className="total-debit">
                      ₹{" "}
                      {formatAmount(
                        totalDebit
                      )}
                    </td>

                    <td className="total-credit">
                      ₹{" "}
                      {formatAmount(
                        totalCredit
                      )}
                    </td>

                  </tr>

                </tfoot>

              </table>

            </div>
          )}

        </section>

        <section
          className={`bottom-status ${
            isTally
              ? "bottom-success"
              : "bottom-error"
          }`}
        >

          <div className="status-icon">
            {isTally ? "✓" : "!"}
          </div>

          <div>

            <strong>
              {isTally
                ? "Trial Balance is Tallied"
                : "Trial Balance is Not Tallied"}
            </strong>

            <span>
              Debit ₹{" "}
              {formatAmount(totalDebit)}
              {" = "}
              Credit ₹{" "}
              {formatAmount(totalCredit)}
            </span>

          </div>

        </section>

      </main>

      <style>{`

        * { box-sizing:border-box; }

        .trial-page { min-height:100vh; padding:24px; background:#07111f; color:#e5edf5; font-family:Arial,sans-serif; position:relative; }

        .trial-background { position:fixed; inset:0; pointer-events:none; background:radial-gradient(700px at 10% 0%,rgba(29,126,190,.12),transparent),radial-gradient(600px at 90% 100%,rgba(20,184,166,.06),transparent); }

        .trial-container { position:relative; width:100%; max-width:1180px; margin:0 auto; }

        .trial-header { display:flex; align-items:center; justify-content:space-between; gap:20px; padding:20px 22px; margin-bottom:18px; background:#0b1b2d; border:1px solid #1d496b; border-radius:10px; box-shadow:0 8px 25px rgba(0,0,0,.25); }

        .header-left { display:flex; align-items:center; gap:14px; }

        .report-icon { width:50px; height:50px; display:flex; align-items:center; justify-content:center; background:#19a9d6; color:#06121e; border-radius:8px; font-size:17px; font-weight:900; }

        .trial-header h1 { margin:0; color:#f1f7fc; font-size:23px; font-weight:800; text-transform:uppercase; letter-spacing:.5px; }

        .trial-header p { margin:5px 0 0; color:#7891a7; font-size:12px; }

        .header-status { display:flex; align-items:stretch; gap:9px; }

        .summary-card { min-width:145px; padding:10px 14px; background:#0d2236; border:1px solid #244863; border-radius:7px; }

        .summary-card span { display:block; margin-bottom:4px; color:#71899f; font-size:10px; font-weight:700; text-transform:uppercase; }

        .summary-card strong { font-size:15px; font-weight:800; }

        .debit-card { border-color:#1c7198; }

        .debit-card strong { color:#48c9f3; }

        .credit-card { border-color:#177d7b; }

        .credit-card strong { color:#43d4c8; }

        .tally-status { min-width:105px; display:flex; align-items:center; justify-content:center; gap:6px; padding:0 14px; border-radius:7px; font-size:11px; font-weight:900; }

        .tally-success { background:#0c392f; border:1px solid #1b8c74; color:#65e5c4; }

        .tally-error { background:#3a181c; border:1px solid #92313c; color:#ff8b96; }

        .error-message { display:flex; align-items:center; gap:9px; padding:12px 15px; margin-bottom:18px; background:#351519; border:1px solid #7d2d35; border-radius:7px; color:#ff9ca5; font-size:12px; font-weight:700; }

        .error-message span { width:20px; height:20px; display:flex; align-items:center; justify-content:center; border-radius:50%; background:#e0525e; color:white; }

        .report-info { display:grid; grid-template-columns:1fr auto 1fr auto 1fr auto 1fr; align-items:center; gap:18px; padding:15px 20px; margin-bottom:18px; background:#0b1b2d; border:1px solid #173653; border-radius:8px; }

        .report-info > div:not(.info-divider) { display:flex; align-items:center; justify-content:space-between; gap:12px; }

        .info-label { color:#7189a0; font-size:10px; font-weight:700; text-transform:uppercase; }

        .report-info strong { color:#e4edf5; font-size:13px; }

        .debit-info { color:#48c9f3 !important; }

        .credit-info { color:#43d4c8 !important; }

        .difference-ok { color:#55d8bd !important; }

        .difference-error { color:#ff8791 !important; }

        .info-divider { width:1px; height:25px; background:#203d56; }

        .table-card { overflow:hidden; background:#0b1b2d; border:1px solid #173653; border-radius:10px; box-shadow:0 8px 25px rgba(0,0,0,.2); }

        .table-heading { display:flex; align-items:center; justify-content:space-between; gap:15px; padding:18px 20px; border-bottom:1px solid #173653; }

        .table-heading h2 { margin:0; color:#eaf3fa; font-size:17px; font-weight:800; }

        .table-heading p { margin:4px 0 0; color:#70869b; font-size:11px; }

        .group-count { padding:7px 12px; background:#0d2b42; border:1px solid #1d6389; border-radius:5px; color:#5bcaf1; font-size:10px; font-weight:800; }

        .table-wrapper { width:100%; overflow-x:auto; }

        table { width:100%; border-collapse:collapse; }

        thead { background:#102d45; }

        th { padding:13px 18px; color:#76bfe2; border-bottom:1px solid #1e4a68; font-size:10px; font-weight:800; text-align:left; text-transform:uppercase; letter-spacing:.7px; }

        th.amount-column { text-align:right; }

        .id-column { width:70px; }

        .amount-column { width:230px; }

        tbody tr { transition:background .15s ease; }

        tbody tr:hover { background:#102a40; }

        tbody tr:last-child td { border-bottom:none; }

        tbody td { padding:15px 18px; border-bottom:1px solid #162f46; font-size:13px; }

        .group-index { color:#526b82; font-size:11px !important; font-weight:800; }

        .group-name { display:flex; align-items:center; gap:11px; }

        .group-icon { width:30px; height:30px; display:flex; align-items:center; justify-content:center; background:#12334e; border:1px solid #24668a; border-radius:6px; color:#4cc9f1; font-size:9px; font-weight:900; }

        .group-name div { display:flex; flex-direction:column; gap:3px; }

        .group-name strong { color:#e4edf5; font-size:13px; font-weight:700; }

        .group-name small { color:#526b82; font-size:9px; }

        .debit-value,.credit-value { color:#40576c; text-align:right; font-family:Consolas,monospace; font-size:12px !important; font-weight:700; }

        .debit-value.has-value { color:#48c9f3; }

        .credit-value.has-value { color:#43d4c8; }

        tfoot { background:#0a1726; }

        tfoot td { padding:15px 18px; border-top:1px solid #285b78; color:#74c8e9; font-size:12px; }

        .total-count { margin-left:8px; color:#526b80; font-size:10px; font-weight:500; }

        .total-debit { color:#48c9f3 !important; text-align:right; font-family:Consolas,monospace; font-weight:900; }

        .total-credit { color:#43d4c8 !important; text-align:right; font-family:Consolas,monospace; font-weight:900; }

        .bottom-status { display:flex; align-items:center; justify-content:center; gap:10px; width:fit-content; margin:16px auto 0; padding:9px 18px; border-radius:6px; }

        .bottom-success { background:#0b3029; border:1px solid #1a7966; color:#61d9bd; }

        .bottom-error { background:#38171b; border:1px solid #87303a; color:#ff8994; }

        .status-icon { width:22px; height:22px; display:flex; align-items:center; justify-content:center; border-radius:50%; font-size:12px; font-weight:900; background:rgba(255,255,255,.08); }

        .bottom-status strong { display:block; font-size:11px; }

        .bottom-status span { display:block; margin-top:2px; font-size:9px; opacity:.75; }

        .empty-state { min-height:250px; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#61788d; }

        .empty-state p { margin:7px 0 0; font-size:11px; }

        .empty-state h3 { margin:10px 0 0; color:#b5c6d5; font-size:14px; }

        .empty-icon { width:42px; height:42px; display:flex; align-items:center; justify-content:center; border:1px solid #29506b; border-radius:8px; color:#4b9fc4; font-size:12px; font-weight:900; }

        .loader { width:27px; height:27px; border:3px solid #173a52; border-top-color:#2ca7d5; border-radius:50%; animation:spin .8s linear infinite; }

        @keyframes spin { to { transform:rotate(360deg); } }

        @media (max-width:1000px) { .trial-header { align-items:stretch; flex-direction:column; } .header-status { width:100%; } .summary-card { flex:1; } .tally-status { min-height:54px; } .report-info { grid-template-columns:1fr 1fr; } .report-info .info-divider { display:none; } }

        @media (max-width:700px) { .trial-page { padding:14px; } .header-status { display:grid; grid-template-columns:1fr 1fr; } .tally-status { grid-column:span 2; } .report-info { grid-template-columns:1fr; gap:10px; } .report-info > div:not(.info-divider) { padding-bottom:9px; border-bottom:1px solid #17364d; } .report-info > div:last-child { padding-bottom:0; border-bottom:none; } .table-heading { align-items:flex-start; flex-direction:column; } th,tbody td,tfoot td { padding:12px; } .amount-column { width:170px; } .bottom-status { width:100%; } }

        @media (max-width:480px) { .trial-page { padding:10px; } .trial-header { padding:15px; } .header-left { align-items:flex-start; } .report-icon { width:42px; height:42px; } .trial-header h1 { font-size:18px; } .header-status { grid-template-columns:1fr; } .tally-status { grid-column:span 1; } .summary-card { min-width:0; } }

      `}</style>
    </div>
  );
}