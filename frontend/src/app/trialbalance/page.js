"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000";

export default function TrialBalancePage() {
  const [data, setData] = useState([]);
  const [totals, setTotals] = useState({
    totalDebit: 0,
    totalCredit: 0,
  });

  const [selectedLedger, setSelectedLedger] =
    useState(null);

  const [vouchers, setVouchers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [voucherLoading, setVoucherLoading] =
    useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTrialBalance();
  }, []);

  const fetchTrialBalance = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        `${API_URL}/api/trialbalance`
      );

      setData(res.data.data || []);

      setTotals({
        totalDebit: res.data.totalDebit || 0,
        totalCredit: res.data.totalCredit || 0,
      });
    } catch (err) {
      console.error(err);
      setError("Unable to load trial balance");
    } finally {
      setLoading(false);
    }
  };

  const handleLedgerClick = async (ledger) => {
    try {
      setSelectedLedger(ledger);
      setVoucherLoading(true);
      setShowModal(true);

      const res = await axios.get(
        `${API_URL}/api/trialbalance/${ledger.id}/vouchers`
      );

      setVouchers(
        res.data.data ||
          res.data.vouchers ||
          []
      );
    } catch (err) {
      console.error(err);
      setVouchers([]);
    } finally {
      setVoucherLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedLedger(null);
    setVouchers([]);
  };

  const totalDebit =
    Number(totals.totalDebit) || 0;

  const totalCredit =
    Number(totals.totalCredit) || 0;

  const difference = totalDebit - totalCredit;

  const isTally =
    totalDebit === totalCredit &&
    totalDebit !== 0;

  const voucherDebit = vouchers.reduce(
    (sum, voucher) =>
      sum + Number(voucher.debit || 0),
    0
  );

  const voucherCredit = vouchers.reduce(
    (sum, voucher) =>
      sum + Number(voucher.credit || 0),
    0
  );

  const voucherBalance =
    voucherDebit - voucherCredit;

  const formatAmount = (value) => {
    return Number(value || 0).toFixed(2);
  };

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
              <h1>Trial Balance</h1>

              <p>
                Verify debit and credit balances
                across all ledger accounts
              </p>
            </div>

          </div>

          <div className="header-status">

            <div className="summary-card debit-card">
              <span>Debit</span>
              <strong>
                ₹ {formatAmount(totalDebit)}
              </strong>
            </div>

            <div className="summary-card credit-card">
              <span>Credit</span>
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
              {data.length} Ledger Accounts
            </strong>
          </div>

          <div className="info-divider"></div>

          <div>
            <span className="info-label">
              Difference
            </span>

            <strong
              className={
                difference === 0
                  ? "difference-ok"
                  : "difference-error"
              }
            >
              ₹ {formatAmount(Math.abs(difference))}
            </strong>
          </div>

          <div className="info-divider"></div>

          <div>
            <span className="info-label">
              Status
            </span>

            <strong
              className={
                isTally
                  ? "status-ok"
                  : "status-error"
              }
            >
              {isTally
                ? "Balanced"
                : "Not Balanced"}
            </strong>
          </div>

        </section>

        <section className="table-card">

          <div className="table-heading">

            <div>
              <h2>Ledger Balances</h2>

              <p>
                Click any ledger account to view
                transaction entries
              </p>
            </div>

            <div className="ledger-count">
              {data.length} Accounts
            </div>

          </div>

          {loading ? (
            <div className="empty-state">
              <div className="loader"></div>
              <p>Loading trial balance...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                TB
              </div>

              <h3>No Ledger Accounts</h3>

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
                      Ledger Account
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

                  {data.map((ledger, index) => (
                    <tr
                      key={ledger.id}
                      onClick={() =>
                        handleLedgerClick(
                          ledger
                        )
                      }
                    >

                      <td className="ledger-index">
                        {String(index + 1).padStart(
                          2,
                          "0"
                        )}
                      </td>

                      <td>
                        <div className="ledger-name">
                          <span className="ledger-dot"></span>
                          {ledger.name}
                        </div>
                      </td>

                      <td
                        className={`debit-value ${
                          Number(ledger.debit) > 0
                            ? "has-value"
                            : ""
                        }`}
                      >
                        {Number(ledger.debit) > 0
                          ? `₹ ${formatAmount(
                              ledger.debit
                            )}`
                          : "—"}
                      </td>

                      <td
                        className={`credit-value ${
                          Number(ledger.credit) > 0
                            ? "has-value"
                            : ""
                        }`}
                      >
                        {Number(ledger.credit) > 0
                          ? `₹ ${formatAmount(
                              ledger.credit
                            )}`
                          : "—"}
                      </td>

                    </tr>
                  ))}

                </tbody>

                <tfoot>

                  <tr>

                    <td></td>

                    <td>
                      <strong>
                        TOTAL
                      </strong>

                      <span className="total-count">
                        {data.length} Accounts
                      </span>
                    </td>

                    <td className="total-debit">
                      ₹ {formatAmount(totalDebit)}
                    </td>

                    <td className="total-credit">
                      ₹ {formatAmount(totalCredit)}
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
              Debit ₹ {formatAmount(totalDebit)}
              {" = "}
              Credit ₹ {formatAmount(totalCredit)}
            </span>
          </div>

        </section>

      </main>

      {showModal && (
        <div
          className="modal-overlay"
          onClick={closeModal}
        >

          <div
            className="voucher-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div className="modal-title">

                <div className="modal-icon">
                  TB
                </div>

                <div>
                  <h2>
                    {selectedLedger?.name}
                  </h2>

                  <p>
                    Ledger Transaction Details
                  </p>
                </div>

              </div>

              <button
                className="close-button"
                onClick={closeModal}
              >
                ×
              </button>

            </div>

            <div className="modal-summary">

              <div>
                <span>Entries</span>
                <strong>
                  {vouchers.length}
                </strong>
              </div>

              <div>
                <span>Debit</span>
                <strong className="modal-debit">
                  ₹ {formatAmount(voucherDebit)}
                </strong>
              </div>

              <div>
                <span>Credit</span>
                <strong className="modal-credit">
                  ₹ {formatAmount(voucherCredit)}
                </strong>
              </div>

              <div>
                <span>Balance</span>
                <strong className="modal-balance">
                  ₹ {formatAmount(
                    Math.abs(voucherBalance)
                  )}{" "}
                  {voucherBalance >= 0
                    ? "Dr"
                    : "Cr"}
                </strong>
              </div>

            </div>

            <div className="modal-body">

              {voucherLoading ? (
                <div className="empty-state">
                  <div className="loader"></div>
                  <p>
                    Loading transactions...
                  </p>
                </div>
              ) : vouchers.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    —
                  </div>

                  <h3>
                    No Transactions
                  </h3>

                  <p>
                    No voucher entries found
                    for this ledger.
                  </p>
                </div>
              ) : (
                <div className="voucher-table-wrapper">

                  <table className="voucher-table">

                    <thead>
                      <tr>
                        <th>
                          Voucher No
                        </th>

                        <th>
                          Date
                        </th>

                        <th>
                          Narration
                        </th>

                        <th className="right">
                          Debit
                        </th>

                        <th className="right">
                          Credit
                        </th>

                        <th>
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>

                      {vouchers.map(
                        (voucher) => (
                          <tr
                            key={voucher.id}
                          >

                            <td>
                              <span className="voucher-number">
                                {voucher.voucher_number ||
                                  voucher.id}
                              </span>
                            </td>

                            <td>
                              {voucher.voucher_date
                                ? new Date(
                                    voucher.voucher_date
                                  ).toLocaleDateString()
                                : "—"}
                            </td>

                            <td className="narration">
                              {voucher.narration ||
                                "—"}
                            </td>

                            <td className="right voucher-debit">
                              {Number(
                                voucher.debit || 0
                              ) > 0
                                ? `₹ ${formatAmount(
                                    voucher.debit
                                  )}`
                                : "—"}
                            </td>

                            <td className="right voucher-credit">
                              {Number(
                                voucher.credit || 0
                              ) > 0
                                ? `₹ ${formatAmount(
                                    voucher.credit
                                  )}`
                                : "—"}
                            </td>

                            <td>
                              <button
                                className="open-button"
                                onClick={() =>
                                  (window.location.href =
                                    `/journal/${voucher.voucher_id}`)
                                }
                              >
                                View
                              </button>
                            </td>

                          </tr>
                        )
                      )}

                    </tbody>

                    <tfoot>

                      <tr>

                        <td
                          colSpan="3"
                          className="footer-total"
                        >
                          Total
                        </td>

                        <td className="right voucher-debit">
                          ₹{" "}
                          {formatAmount(
                            voucherDebit
                          )}
                        </td>

                        <td className="right voucher-credit">
                          ₹{" "}
                          {formatAmount(
                            voucherCredit
                          )}
                        </td>

                        <td></td>

                      </tr>

                    </tfoot>

                  </table>

                </div>
              )}

            </div>

            <div className="modal-footer">

              <div>
                <span>Ledger Balance</span>

                <strong>
                  ₹{" "}
                  {formatAmount(
                    Math.abs(
                      voucherBalance
                    )
                  )}{" "}
                  {voucherBalance >= 0
                    ? "Dr"
                    : "Cr"}
                </strong>
              </div>

              <button
                className="modal-close-button"
                onClick={closeModal}
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

      <style>{`
        * {
          box-sizing: border-box;
        }

        .trial-page { min-height: 100vh; padding: 24px; background: #07111f; color: #e5edf5; font-family: Arial, sans-serif; position: relative; }

        .trial-background { position: fixed; inset: 0; pointer-events: none; background: radial-gradient(700px at 10% 0%, rgba(29, 126, 190, 0.12), transparent), radial-gradient(600px at 90% 100%, rgba(20, 184, 166, 0.06), transparent); }

        .trial-container { position: relative; width: 100%; max-width: 1180px; margin: 0 auto; }

        .trial-header { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 20px 22px; margin-bottom: 18px; background: #0b1b2d; border: 1px solid #1d496b; border-radius: 10px; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25); }

        .header-left { display: flex; align-items: center; gap: 14px; }

        .report-icon { width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; background: #19a9d6; color: #06121e; border-radius: 8px; font-size: 17px; font-weight: 900; }

        .trial-header h1 { margin: 0; color: #f1f7fc; font-size: 23px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }

        .trial-header p { margin: 5px 0 0; color: #7891a7; font-size: 12px; }

        .header-status { display: flex; align-items: stretch; gap: 9px; }

        .summary-card { min-width: 145px; padding: 10px 14px; background: #0d2236; border: 1px solid #244863; border-radius: 7px; }

        .summary-card span { display: block; margin-bottom: 4px; color: #71899f; font-size: 10px; font-weight: 700; text-transform: uppercase; }

        .summary-card strong { font-size: 15px; font-weight: 800; }

        .debit-card { border-color: #1c7198; }

        .debit-card strong { color: #48c9f3; }

        .credit-card { border-color: #177d7b; }

        .credit-card strong { color: #43d4c8; }

        .tally-status { min-width: 105px; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 0 14px; border-radius: 7px; font-size: 11px; font-weight: 900; }

        .tally-success { background: #0c392f; border: 1px solid #1b8c74; color: #65e5c4; }

        .tally-error { background: #3a181c; border: 1px solid #92313c; color: #ff8b96; }
 
        .error-message { display: flex; align-items: center; gap: 9px; padding: 12px 15px; margin-bottom: 18px; background: #351519; border: 1px solid #7d2d35; border-radius: 7px; color: #ff9ca5; font-size: 12px; font-weight: 700; }

        .error-message span { width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: #e0525e; color: white; }

        .report-info { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; align-items: center; gap: 20px; padding: 15px 20px; margin-bottom: 18px; background: #0b1b2d; border: 1px solid #173653; border-radius: 8px; }

        .report-info > div:not(.info-divider) { display: flex; align-items: center; justify-content: space-between; gap: 15px; }

        .info-label { color: #7189a0; font-size: 10px; font-weight: 700; text-transform: uppercase; }

        .report-info strong { color: #e4edf5; font-size: 13px; }

        .difference-ok,
        .status-ok { color: #55d8bd !important; }

        .difference-error,
        .status-error { color: #ff8791 !important; }

        .info-divider { width: 1px; height: 25px; background: #203d56; }

        .table-card { overflow: hidden; background: #0b1b2d; border: 1px solid #173653; border-radius: 10px; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2); }

        .table-heading { display: flex; align-items: center; justify-content: space-between; gap: 15px; padding: 18px 20px; border-bottom: 1px solid #173653; }

        .table-heading h2 { margin: 0; color: #eaf3fa; font-size: 17px; font-weight: 800; }

        .table-heading p { margin: 4px 0 0; color: #70869b; font-size: 11px; }

        .ledger-count { padding: 7px 12px; background: #0d2b42; border: 1px solid #1d6389; border-radius: 5px; color: #5bcaf1; font-size: 10px; font-weight: 800; }

        .table-wrapper { width: 100%; overflow-x: auto; }

        table { width: 100%; border-collapse: collapse; }

        thead { background: #102d45; }

        th { padding: 13px 18px; color: #76bfe2; border-bottom: 1px solid #1e4a68; font-size: 10px; font-weight: 800; text-align: left; text-transform: uppercase; letter-spacing: 0.7px; }

        th.amount-column { text-align: right; }

        .id-column { width: 70px; }

        .amount-column { width: 230px; }

        tbody tr { transition: background 0.15s ease, transform 0.15s ease; cursor: pointer; }

        tbody tr:hover { background: #102a40; }
        tbody tr:last-child td { border-bottom: none; }
        tbody td { padding: 15px 18px; border-bottom: 1px solid #162f46; font-size: 13px; }

        .ledger-index { color: #526b82; font-size: 11px !important; font-weight: 800; }

        .ledger-name { display: flex; align-items: center; gap: 9px; color: #e4edf5; font-size: 13px; font-weight: 700; }

        .ledger-dot { width: 6px; height: 6px; display: inline-block; border-radius: 50%; background: #287ca4; }

        .debit-value,
        .credit-value { color: #40576c; text-align: right; font-family: Consolas, monospace; font-size: 12px !important; font-weight: 700; }

        .debit-value.has-value { color: #48c9f3; }

        .credit-value.has-value { color: #43d4c8; }

        tfoot { background: #0a1726; }

        tfoot td { padding: 15px 18px; border-top: 1px solid #285b78; color: #74c8e9; font-size: 12px; }

        .total-count { margin-left: 8px; color: #526b80; font-size: 10px; font-weight: 500; }

        .total-debit { color: #48c9f3 !important; text-align: right; font-family: Consolas, monospace; font-weight: 900; }

        .total-credit { color: #43d4c8 !important; text-align: right; font-family: Consolas, monospace; font-weight: 900; }

        .bottom-status { display: flex; align-items: center; justify-content: center; gap: 10px; width: fit-content; margin: 16px auto 0; padding: 9px 18px; border-radius: 6px; }

        .bottom-success { background: #0b3029; border: 1px solid #1a7966; color: #61d9bd; }

        .bottom-error { background: #38171b; border: 1px solid #87303a; color: #ff8994; }

        .status-icon { width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 12px; font-weight: 900; background: rgba(255, 255, 255, 0.08); }

         .bottom-status strong { display: block; font-size: 11px; }

        .bottom-status span { display: block; margin-top: 2px; font-size: 9px; opacity: 0.75; }

         .empty-state { min-height: 250px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #61788d; }

         .empty-state p { margin: 7px 0 0; font-size: 11px; }

        .empty-state h3 { margin: 10px 0 0; color: #b5c6d5; font-size: 14px; }

        .empty-icon { width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; border: 1px solid #29506b; border-radius: 8px; color: #4b9fc4; font-size: 12px; font-weight: 900; }

        .loader { width: 27px; height: 27px; border: 3px solid #173a52; border-top-color: #2ca7d5; border-radius: 50%; animation: spin 0.8s linear infinite; }

        @keyframes spin { to { transform: rotate(360deg); } }

        .modal-overlay { position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px; background: rgba(2, 8, 16, 0.88); backdrop-filter: blur(8px); }

        .voucher-modal { width: 96%; max-width: 1100px; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; background: #0a1827; border: 1px solid #24749b; border-radius: 10px; box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6); }

        .modal-header { display: flex; align-items: center; justify-content: space-between; gap: 15px; padding: 17px 20px; background: #0d2438; border-bottom: 1px solid #1a425c; }

        .modal-title { display: flex; align-items: center; gap: 11px; }

        .modal-icon { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: #159ac7; color: #06131f; border-radius: 6px; font-size: 12px; font-weight: 900; }

        .modal-title h2 { margin: 0; color: #e8f3fa; font-size: 16px; }

.modal-title p { margin: 3px 0 0; color: #71899e; font-size: 10px; }

.close-button { width: 32px; height: 32px; border: 1px solid #36536a; border-radius: 5px; background: #102536; color: #a8bac9; font-size: 21px; cursor: pointer; }

.close-button:hover { background: #3b1c20; border-color: #8c3841; color: #ff8c96; }

.modal-summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; padding: 12px 18px; background: #081522; border-bottom: 1px solid #17364d; }

.modal-summary > div { padding: 10px 12px; background: #0b1d2e; border: 1px solid #193d56; border-radius: 5px; }

.modal-summary span { display: block; color: #647d92; font-size: 9px; font-weight: 700; text-transform: uppercase; }

.modal-summary strong { display: block; margin-top: 4px; color: #dce8f1; font-size: 13px; font-family: Consolas, monospace; }

.modal-debit { color: #48c9f3 !important; }

.modal-credit { color: #43d4c8 !important; }

.modal-balance { color: #f5bd58 !important; }

.modal-body { min-height: 180px; max-height: 52vh; overflow: auto; }

.voucher-table th { position: sticky; top: 0; z-index: 2; background: #0c2236; padding: 12px 14px; }

.voucher-table td { padding: 13px 14px; border-bottom: 1px solid #142f45; color: #bacbd8; font-size: 11px; }

.voucher-table tbody tr { cursor: default; }

.voucher-table tbody tr:hover { background: #0d2336; }

.voucher-table .right { text-align: right; }

.voucher-number { color: #4cc9f1; font-family: Consolas, monospace; font-weight: 800; }

.narration { color: #d5e1ea !important; }

.voucher-debit { color: #48c9f3 !important; font-family: Consolas, monospace; font-weight: 700; }

.voucher-credit { color: #43d4c8 !important; font-family: Consolas, monospace; font-weight: 700; }

.open-button { padding: 6px 10px; border: 1px solid #277da4; border-radius: 4px; background: #0b293d; color: #5bcaf0; font-size: 9px; font-weight: 800; cursor: pointer; }

.open-button:hover { background: #124360; }

.voucher-table tfoot td { padding: 13px 14px; background: #081522; border-top: 1px solid #285b78; }

.footer-total { color: #b9cbd9 !important; text-align: right; font-weight: 800; }

.modal-footer { display: flex; align-items: center; justify-content: space-between; gap: 15px; padding: 12px 18px; background: #081522; border-top: 1px solid #17364d; }

.modal-footer > div span { display: block; color: #657d91; font-size: 9px; text-transform: uppercase; font-weight: 700; }

.modal-footer > div strong { display: block; margin-top: 3px; color: #f2bf5a; font-size: 14px; font-family: Consolas, monospace; }

.modal-close-button { min-width: 85px; padding: 8px 15px; border: 1px solid #286f91; border-radius: 5px; background: #12344a; color: #66ccef; font-size: 10px; font-weight: 800; cursor: pointer; }

        .modal-close-button:hover { background: #174b68; }

@media (max-width: 950px) { .trial-header { align-items: stretch; flex-direction: column; } .header-status { width: 100%; } .summary-card { flex: 1; } .tally-status { min-height: 54px; } .stock-grid { grid-template-columns: 1fr 1fr; } }

@media (max-width: 700px) { .trial-page { padding: 14px; } .header-status { display: grid; grid-template-columns: 1fr 1fr; } .tally-status { grid-column: span 2; } .report-info { grid-template-columns: 1fr; gap: 10px; } .info-divider { display: none; } .report-info > div:not(.info-divider) { padding-bottom: 9px; border-bottom: 1px solid #17364d; } .report-info > div:last-child { padding-bottom: 0; border-bottom: none; } .table-heading { align-items: flex-start; flex-direction: column; } th, tbody td, tfoot td { padding: 12px; } .amount-column { width: 170px; } .modal-summary { grid-template-columns: 1fr 1fr; } .modal-body { max-height: 48vh; } }

@media (max-width: 480px) { .trial-page { padding: 10px; } .trial-header { padding: 15px; } .header-left { align-items: flex-start; } .report-icon { width: 42px; height: 42px; } .trial-header h1 { font-size: 18px; } .header-status { grid-template-columns: 1fr; } .tally-status { grid-column: span 1; } .summary-card { min-width: 0; } .bottom-status { width: 100%; } .modal-overlay { padding: 8px; } .voucher-modal { width: 100%; } .modal-summary { grid-template-columns: 1fr 1fr; } .modal-header { padding: 13px; } }
      `}</style>
    </div>
  );
}