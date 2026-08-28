"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { getLedgers } from "../../store/slices/ledgerSlice";
import {
  createJournalVoucher,
  fetchJournalVouchers,
} from "../../store/slices/journalSlice";

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
  ).padStart(2, "0")}-${String(date.getDate()).padStart(
    2,
    "0"
  )}`;
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
  const [voucherDate, setVoucherDate] = useState(getToday);
  const [narration, setNarration] = useState("");
  const [entries, setEntries] = useState([
    createEmptyEntry(1),
    createEmptyEntry(2),
  ]);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    dispatch(getLedgers());
    dispatch(fetchJournalVouchers());
  }, [dispatch]);

useEffect(() => {
  if (!journals || journals.length === 0) {
    setVoucherNumber("JV-00001");
    return;
  }

  const voucherNumbers = journals
    .map((journal) => {
      const voucherNumber = journal?.voucher_number;

      if (!voucherNumber) {
        return 0;
      }

      const number = parseInt(
        String(voucherNumber).replace("JV-", ""),
        10
      );

      return Number.isNaN(number) ? 0 : number;
    });

  const highestVoucherNumber = Math.max(...voucherNumbers);

  const nextVoucherNumber = highestVoucherNumber + 1;

  setVoucherNumber(
    `JV-${String(nextVoucherNumber).padStart(5, "0")}`
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
      currentEntries.filter((entry) => entry.id !== id)
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
      console.error("Journal creation failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <div className="mb-5 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
              <span className="text-xl font-bold">JV</span>
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800">
                Journal Voucher
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Record debit and credit transactions
              </p>
            </div>
          </div>

          <div className="min-w-[210px] rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Voucher Number
            </p>

            <p className="mt-1 text-2xl font-bold tracking-wide text-slate-800">
              {voucherNumber}
            </p>
          </div>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            ✓ {successMessage}
          </div>
        )}

        {journalError && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {journalError}
          </div>
        )}

        {/* Voucher Information */}
        <div className="mb-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Voucher Date
              </label>

              <input
                type="date"
                value={voucherDate}
                onChange={(e) =>
                  setVoucherDate(e.target.value)
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Voucher Status
              </label>

              <div
                className={`flex h-[42px] items-center rounded-lg border px-4 text-sm font-bold ${
                  isBalanced
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-amber-200 bg-amber-50 text-amber-700"
                }`}
              >
                {isBalanced
                  ? "✓ Balanced"
                  : "⚠ Not Balanced"}
              </div>
            </div>
          </div>
        </div>

        {/* Journal Entries */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Journal Entries
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select To / By and enter the transaction amount
              </p>
            </div>

            <button
              type="button"
              onClick={addRow}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-black shadow-sm transition hover:bg-blue-700"
            >
              + Add Row
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="w-16 border-b border-slate-200 px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-600">
                    #
                  </th>

                  <th className="w-28 border-b border-slate-200 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                    Type
                  </th>

                  <th className="border-b border-slate-200 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                    Ledger Account
                  </th>

                  <th className="w-44 border-b border-slate-200 px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-600">
                    Debit (₹)
                  </th>

                  <th className="w-44 border-b border-slate-200 px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-600">
                    Credit (₹)
                  </th>

                  <th className="w-24 border-b border-slate-200 px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-600">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {entries.map((entry, index) => (
                  <tr
                    key={entry.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="border-b border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-500">
                      {index + 1}
                    </td>

                    <td className="border-b border-slate-200 px-3 py-3">
                      <select
                        value={entry.type}
                        onChange={(e) =>
                          updateEntry(
                            entry.id,
                            "type",
                            e.target.value
                          )
                        }
                        className={`w-full rounded-lg border px-2.5 py-2 text-sm font-bold outline-none focus:border-blue-500 ${
                          entry.type === "to"
                            ? "border-blue-200 bg-blue-50 text-blue-700"
                            : entry.type === "by"
                            ? "border-purple-200 bg-purple-50 text-purple-700"
                            : "border-slate-300 bg-white text-slate-500"
                        }`}
                      >
                        <option value="">Select</option>
                        <option value="to">To</option>
                        <option value="by">By</option>
                      </select>
                    </td>

                    <td className="border-b border-slate-200 px-3 py-3">
                      <select
                        value={entry.ledgerId}
                        onChange={(e) =>
                          updateEntry(
                            entry.id,
                            "ledgerId",
                            e.target.value
                          )
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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

                    <td className="border-b border-slate-200 px-3 py-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={entry.debit}
                        disabled={entry.type === "to"}
                        onChange={(e) =>
                          updateEntry(
                            entry.id,
                            "debit",
                            e.target.value
                          )
                        }
                        placeholder="0.00"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-right text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-400"
                      />
                    </td>

                    <td className="border-b border-slate-200 px-3 py-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={entry.credit}
                        disabled={entry.type === "by"}
                        onChange={(e) =>
                          updateEntry(
                            entry.id,
                            "credit",
                            e.target.value
                          )
                        }
                        placeholder="0.00"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-right text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-400"
                      />
                    </td>

                    <td className="border-b border-slate-200 px-3 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(entry.id)}
                        disabled={entries.length <= 2}
                        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr className="bg-slate-50">
                  <td
                    colSpan="3"
                    className="border-t border-slate-200 px-4 py-4 text-right text-sm font-bold text-slate-700"
                  >
                    Total
                  </td>

                  <td className="border-t border-slate-200 px-4 py-4 text-right text-base font-bold text-slate-800">
                    ₹ {totalDebit.toFixed(2)}
                  </td>

                  <td className="border-t border-slate-200 px-4 py-4 text-right text-base font-bold text-slate-800">
                    ₹ {totalCredit.toFixed(2)}
                  </td>

                  <td className="border-t border-slate-200" />
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Balance */}
          <div className="border-t border-slate-200 p-5">
            <div
              className={`flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
                isBalanced
                  ? "border-green-200 bg-green-50"
                  : "border-amber-200 bg-amber-50"
              }`}
            >
              <div>
                <p
                  className={`text-sm font-bold ${
                    isBalanced
                      ? "text-green-700"
                      : "text-amber-700"
                  }`}
                >
                  {isBalanced
                    ? "✓ Journal is balanced"
                    : "⚠ Journal is not balanced"}
                </p>

                {!isBalanced && (
                  <p className="mt-1 text-xs text-slate-600">
                    Debit and Credit must be equal before saving.
                  </p>
                )}
              </div>

              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Difference
                </p>

                <p
                  className={`text-lg font-bold ${
                    isBalanced
                      ? "text-green-700"
                      : "text-amber-700"
                  }`}
                >
                  ₹ {difference.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Narration */}
        <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Narration
          </label>

          <textarea
            value={narration}
            onChange={(e) => setNarration(e.target.value)}
            rows={3}
            placeholder="Enter reason or description for this journal voucher..."
            className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Actions */}
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={clearForm}
            className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={journalLoading || !isBalanced}
            className="rounded-lg bg-green-600 px-7 py-3 text-sm font-bold text-black shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {journalLoading
              ? "Saving..."
              : "Save Journal Voucher"}
          </button>
        </div>

        <div className="h-6" />
      </div>
    </div>
  );
}