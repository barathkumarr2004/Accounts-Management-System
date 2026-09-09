"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { getLedgers } from "../../store/slices/ledgerSlice";
import {createJournalVoucher,fetchJournalVouchers} from "../../store/slices/journalSlice";

const createEmptyEntry = (id) => ({
  id,
  type: "",
  ledgerId: "",
  debit: "",
  credit: "",
});

const getToday = () => {
  const date = new Date();

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2,"0")}`;
};

export default function JournalPage() {
  const dispatch = useDispatch();

  const { ledgers = [] } = useSelector(
    (state) => state.ledgers
  );

  const {
    journals = [],
    loading: journalLoading,
    error: journalError,
  } = useSelector((state) => state.journals);

  const [voucherNumber, setVoucherNumber] =
    useState("JV-00001");

  const [voucherDate, setVoucherDate] =
    useState(getToday);

  const [narration, setNarration] = useState("");

  const [entries, setEntries] = useState([
    createEmptyEntry(1),
    createEmptyEntry(2),
  ]);

  const [successMessage, setSuccessMessage] =
    useState("");

  useEffect(() => {
    dispatch(getLedgers());
    dispatch(fetchJournalVouchers());
  }, [dispatch]);

  useEffect(() => {
    if (!journals || journals.length === 0) {
      setVoucherNumber("JV-00001");
      return;
    }

    const voucherNumbers = journals.map((journal) => {
      const number = journal?.voucher_number;

      if (!number) return 0;

      const parsed = parseInt(
        String(number).replace("JV-", ""),
        10
      );

      return Number.isNaN(parsed) ? 0 : parsed;
    });

    const highestVoucherNumber = Math.max(
      ...voucherNumbers
    );

    setVoucherNumber(
      `JV-${String(
        highestVoucherNumber + 1
      ).padStart(5, "0")}`
    );
  }, [journals]);

  const addRow = () => {
    setEntries((currentEntries) => [
      ...currentEntries,
      createEmptyEntry(Date.now()),
    ]);
  };

  const removeRow = (id) => {
    if (entries.length <= 2) return;

    setEntries((currentEntries) =>
      currentEntries.filter(
        (entry) => entry.id !== id
      )
    );
  };

  const updateEntry = (id, field, value) => {
    setEntries((currentEntries) =>
      currentEntries.map((entry) => {
        if (entry.id !== id) return entry;

        const updatedEntry = {
          ...entry,
          [field]: value,
        };

        if (field === "type") {
          updatedEntry.debit = "";
          updatedEntry.credit = "";
        }

        if (field === "debit") {
          updatedEntry.credit = "";
        }

        if (field === "credit") {
          updatedEntry.debit = "";
        }

        return updatedEntry;
      })
    );
  };

  const totalDebit = entries.reduce(
    (total, entry) =>
      total + Number(entry.debit || 0),
    0
  );

  const totalCredit = entries.reduce(
    (total, entry) =>
      total + Number(entry.credit || 0),
    0
  );

  const difference = Math.abs(
    totalDebit - totalCredit
  );

  const isBalanced =
    totalDebit > 0 &&
    totalCredit > 0 &&
    totalDebit === totalCredit;

  const clearForm = () => {
    setVoucherDate(getToday());
    setNarration("");
    setEntries([
      createEmptyEntry(1),
      createEmptyEntry(2),
    ]);
    setSuccessMessage("");
  };

  const handleSave = async () => {
    setSuccessMessage("");

    if (!voucherDate) {
      alert("Voucher date is required.");
      return;
    }

    for (const entry of entries) {
      if (!entry.ledgerId) {
        alert("Please select a ledger for every row.");
        return;
      }

      if (!entry.type) {
        alert("Please select To or By for every row.");
        return;
      }
    }

    if (!isBalanced) {
      alert(
        "Journal is not balanced. Total Debit and Credit must be equal."
      );
      return;
    }

    const data = {
      voucherDate,
      narration,
      entries: entries.map((entry) => ({
        ledgerId: Number(entry.ledgerId),
        debit: Number(entry.debit || 0),
        credit: Number(entry.credit || 0),
      })),
    };

    try {
      const result = await dispatch(
        createJournalVoucher(data)
      ).unwrap();

      setSuccessMessage(
        result?.message ||
          "Journal voucher created successfully."
      );

      clearForm();

      await dispatch(fetchJournalVouchers());
    } catch (error) {
      console.error(
        "Journal creation failed:",
        error
      );
    }
  };

  return (
    <div className="journal-page">
      <div className="journal-container">

        <div className="page-header">
          <div>
            <div className="page-title-row">
              <div className="voucher-icon">
                JV
              </div>

              <div>
                <h1>Journal Voucher</h1>

                <p>
                  Record debit and credit transactions
                </p>
              </div>
            </div>
          </div>

          <div className="voucher-number-box">
            <span>Voucher Number</span>

            <strong>{voucherNumber}</strong>
          </div>
        </div>

        {successMessage && (
          <div className="message success-message">
            <span>✓</span>
            {successMessage}
          </div>
        )}

        {journalError && (
          <div className="message error-message">
            <span>!</span>
            {journalError}
          </div>
        )}

        <div className="info-card">
          <div className="form-grid">

            <div className="form-group">
              <label>Voucher Date</label>

              <input
                type="date"
                value={voucherDate}
                onChange={(e) =>
                  setVoucherDate(e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Voucher Status</label>

              <div
                className={`status-box ${
                  isBalanced
                    ? "status-balanced"
                    : "status-pending"
                }`}
              >
                {isBalanced
                  ? "✓ Balanced"
                  : "⚠ Not Balanced"}
              </div>
            </div>

          </div>
        </div>

        <div className="entries-card">

          <div className="card-header">
            <div>
              <h2>Journal Entries</h2>

              <p>
                Select To / By and enter the
                transaction amount
              </p>
            </div>

            <button
              type="button"
              className="add-button"
              onClick={addRow}
            >
              + Add Row
            </button>
          </div>

          <div className="table-wrapper">
            <table className="entries-table">
              <thead>
                <tr>
                  <th className="number-column">
                    #
                  </th>

                  <th className="type-column">
                    Type
                  </th>

                  <th>
                    Ledger Account
                  </th>

                  <th className="amount-column">
                    Debit (₹)
                  </th>

                  <th className="amount-column">
                    Credit (₹)
                  </th>

                  <th className="action-column">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {entries.map((entry, index) => (
                  <tr key={entry.id}>

                    <td className="row-number">
                      {index + 1}
                    </td>

                    <td>
                      <select
                        value={entry.type}
                        onChange={(e) =>
                          updateEntry(
                            entry.id,
                            "type",
                            e.target.value
                          )
                        }
                        className={
                          entry.type === "to"
                            ? "type-to"
                            : entry.type === "by"
                            ? "type-by"
                            : ""
                        }
                      >
                        <option value="">
                          Select
                        </option>

                        <option value="to">
                          To
                        </option>

                        <option value="by">
                          By
                        </option>
                      </select>
                    </td>

                    <td>
                      <select
                        value={entry.ledgerId}
                        onChange={(e) =>
                          updateEntry(
                            entry.id,
                            "ledgerId",
                            e.target.value
                          )
                        }
                      >
                        <option value="">
                          Select Ledger Account
                        </option>

                        {ledgers.map((ledger) => (
                          <option
                            key={ledger.id}
                            value={ledger.id}
                          >
                            {ledger.code
                              ? `${ledger.code} - ${ledger.name}`
                              : ledger.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={entry.debit}
                        disabled={
                          entry.type === "to"
                        }
                        onChange={(e) =>
                          updateEntry(
                            entry.id,
                            "debit",
                            e.target.value
                          )
                        }
                        placeholder="0.00"
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={entry.credit}
                        disabled={
                          entry.type === "by"
                        }
                        onChange={(e) =>
                          updateEntry(
                            entry.id,
                            "credit",
                            e.target.value
                          )
                        }
                        placeholder="0.00"
                      />
                    </td>

                    <td className="action-cell">
                      <button
                        type="button"
                        className="remove-button"
                        onClick={() =>
                          removeRow(entry.id)
                        }
                        disabled={entries.length <= 2}
                      >
                        Remove
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr>
                  <td
                    colSpan="3"
                    className="total-label"
                  >
                    Total
                  </td>

                  <td className="total-amount">
                    ₹ {totalDebit.toFixed(2)}
                  </td>

                  <td className="total-amount">
                    ₹ {totalCredit.toFixed(2)}
                  </td>

                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="balance-section">
            <div
              className={`balance-box ${
                isBalanced
                  ? "balance-success"
                  : "balance-warning"
              }`}
            >
              <div>
                <strong>
                  {isBalanced
                    ? "✓ Journal is balanced"
                    : "⚠ Journal is not balanced"}
                </strong>

                {!isBalanced && (
                  <p>
                    Debit and Credit must be equal
                    before saving.
                  </p>
                )}
              </div>

              <div className="difference">
                <span>Difference</span>

                <strong>
                  ₹ {difference.toFixed(2)}
                </strong>
              </div>
            </div>
          </div>
        </div>

        <div className="narration-card">
          <label>Narration</label>

          <textarea
            value={narration}
            onChange={(e) =>
              setNarration(e.target.value)
            }
            rows={3}
            placeholder="Enter reason or description for this journal voucher..."
          />
        </div>

        <div className="action-buttons">

          <button
            type="button"
            className="clear-button"
            onClick={clearForm}
          >
            Clear
          </button>

          <button
            type="button"
            className="save-button"
            onClick={handleSave}
            disabled={
              journalLoading || !isBalanced
            }
          >
            {journalLoading
              ? "Saving..."
              : "Save Journal Voucher"}
          </button>

        </div>

      </div>

      <style>{`
        * {
          box-sizing: border-box;
        }

        .journal-page {
          min-height: 100vh;
          padding: 28px;
          background: #07111f;
          color: #f8fafc;
          font-family: Arial, sans-serif;
        }

        .journal-container {
          width: 100%;
          max-width: 1250px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 18px;
          padding: 20px 22px;
          background: #0b1b2d;
          border: 1px solid #173653;
          border-radius: 10px;
        }

        .page-title-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .voucher-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: #126fc4;
          color: #fff;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .page-header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 800;
        }

        .page-header p {
          margin: 6px 0 0;
          color: #7890a8;
          font-size: 13px;
        }

        .voucher-number-box {
          min-width: 220px;
          padding: 13px 17px;
          border: 1px solid #1d5683;
          border-radius: 8px;
          background: #0d2237;
        }

        .voucher-number-box span {
          display: block;
          margin-bottom: 5px;
          color: #49b8ff;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .voucher-number-box strong {
          color: #f8fafc;
          font-size: 21px;
          letter-spacing: 1px;
        }

        .message {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 18px;
          padding: 12px 15px;
          border-radius: 7px;
          font-size: 13px;
          font-weight: 600;
        }

        .success-message {
          background: #08251c;
          border: 1px solid #176a4b;
          color: #67e8b1;
        }

        .error-message {
          background: #2b1215;
          border: 1px solid #7f2630;
          color: #ff8994;
        }

        .info-card,
        .entries-card,
        .narration-card {
          margin-bottom: 18px;
          background: #0b1b2d;
          border: 1px solid #173653;
          border-radius: 10px;
        }

        .info-card {
          padding: 20px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .form-group label,
        .narration-card label {
          display: block;
          margin-bottom: 8px;
          color: #a7bad0;
          font-size: 12px;
          font-weight: 700;
        }

        input,
        select,
        textarea {
          width: 100%;
          border: 1px solid #29445e;
          border-radius: 6px;
          outline: none;
          background: #091725;
          color: #f8fafc;
          font-family: Arial, sans-serif;
          font-size: 13px;
          transition: border-color 0.2s ease;
        }

        input,
        select {
          height: 42px;
          padding: 0 12px;
        }

        textarea {
          padding: 12px;
          resize: vertical;
        }

        input:focus,
        select:focus,
        textarea:focus {
          border-color: #2095e8;
        }

        input:disabled {
          background: #121e2b;
          color: #536579;
          cursor: not-allowed;
        }

        option {
          background: #0b1b2d;
          color: #fff;
        }

        .status-box {
          height: 42px;
          display: flex;
          align-items: center;
          padding: 0 13px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 700;
        }

        .status-balanced {
          background: #08251c;
          border: 1px solid #176a4b;
          color: #67e8b1;
        }

        .status-pending {
          background: #2c2110;
          border: 1px solid #76531a;
          color: #f5c65d;
        }

        .entries-card {
          overflow: hidden;
        }

        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 20px;
          border-bottom: 1px solid #173653;
        }

        .card-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 800;
        }

        .card-header p {
          margin: 5px 0 0;
          color: #7188a0;
          font-size: 12px;
        }

        button {
          font-family: Arial, sans-serif;
          cursor: pointer;
        }

        .add-button {
          padding: 10px 15px;
          border: 1px solid #218ddd;
          border-radius: 6px;
          background: #126fc4;
          color: #fff;
          font-size: 12px;
          font-weight: 700;
        }

        .add-button:hover {
          background: #1682dc;
        }

        .table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .entries-table {
          width: 100%;
          min-width: 850px;
          border-collapse: collapse;
        }

        .entries-table th {
          padding: 12px;
          background: #0e2a43;
          border-bottom: 1px solid #214866;
          color: #8db1d1;
          font-size: 10px;
          font-weight: 700;
          text-align: left;
          text-transform: uppercase;
          letter-spacing: 0.7px;
        }

        .entries-table td {
          padding: 12px;
          border-bottom: 1px solid #142d44;
          background: #0b1b2d;
          vertical-align: middle;
        }

        .entries-table tbody tr:hover td {
          background: #0e2439;
        }

        .entries-table td input,
        .entries-table td select {
          height: 38px;
        }

        .number-column {
          width: 55px;
          text-align: center !important;
        }

        .type-column {
          width: 110px;
        }

        .amount-column {
          width: 160px;
          text-align: right !important;
        }

        .action-column {
          width: 100px;
          text-align: center !important;
        }

        .row-number {
          color: #7188a0;
          text-align: center;
          font-size: 12px;
          font-weight: 700;
        }

        .type-to {
          border-color: #2379b7;
          background: #0b2941;
          color: #55baff;
          font-weight: 700;
        }

        .type-by {
          border-color: #6b4b9c;
          background: #251a3b;
          color: #c39aff;
          font-weight: 700;
        }

        .action-cell {
          text-align: center;
        }

        .remove-button {
          padding: 8px 10px;
          border: 1px solid #69313a;
          border-radius: 5px;
          background: #29151a;
          color: #ff8994;
          font-size: 11px;
          font-weight: 700;
        }

        .remove-button:hover {
          background: #3a1a20;
        }

        .remove-button:disabled {
          opacity: 0.25;
          cursor: not-allowed;
        }

        .entries-table tfoot td {
          background: #091522;
          border-top: 1px solid #214866;
          border-bottom: none;
        }

        .total-label {
          padding: 15px !important;
          color: #c3d2e2;
          text-align: right;
          font-size: 13px;
          font-weight: 800;
        }

        .total-amount {
          padding: 15px !important;
          color: #5fd1ff;
          text-align: right;
          font-size: 14px;
          font-weight: 800;
        }

        .balance-section {
          padding: 18px 20px;
        }

        .balance-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 13px 15px;
          border-radius: 7px;
        }

        .balance-success {
          background: #08251c;
          border: 1px solid #176a4b;
        }

        .balance-warning {
          background: #2c2110;
          border: 1px solid #76531a;
        }

        .balance-box strong {
          font-size: 13px;
        }

        .balance-success strong {
          color: #67e8b1;
        }

        .balance-warning strong {
          color: #f5c65d;
        }

        .balance-box p {
          margin: 5px 0 0;
          color: #7e92a8;
          font-size: 11px;
        }

        .difference {
          text-align: right;
        }

        .difference span {
          display: block;
          margin-bottom: 3px;
          color: #7188a0;
          font-size: 10px;
          text-transform: uppercase;
        }

        .difference strong {
          font-size: 17px;
        }

        .narration-card {
          padding: 20px;
        }

        .narration-card textarea {
          min-height: 85px;
        }

        .action-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 4px;
        }

        .clear-button,
        .save-button {
          padding: 11px 20px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
        }

        .clear-button {
          border: 1px solid #344b61;
          background: #101f2e;
          color: #c3d2e2;
        }

        .clear-button:hover {
          background: #172b3e;
        }

        .save-button {
          border: 1px solid #20864f;
          background: #128047;
          color: #fff;
        }

        .save-button:hover {
          background: #159653;
        }

        .save-button:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        @media (max-width: 800px) {
          .journal-page {
            padding: 15px;
          }

          .page-header {
            align-items: stretch;
            flex-direction: column;
          }

          .voucher-number-box {
            width: 100%;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .card-header {
            align-items: stretch;
            flex-direction: column;
          }

          .add-button {
            width: 100%;
          }

          .balance-box {
            align-items: flex-start;
            flex-direction: column;
          }

          .difference {
            text-align: left;
          }

          .action-buttons {
            flex-direction: column-reverse;
          }

          .clear-button,
          .save-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}