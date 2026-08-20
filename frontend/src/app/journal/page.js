"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { getLedgers } from "../store/slices/ledgerSlice";
import { createJournalVoucher } from "../store/slices/journalSlice";

const createEmptyEntry = (id) => ({
  id,
  ledgerId: "",
  type: "",
  amount: "",
});

const getToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function JournalPage() {
  const dispatch = useDispatch();

  const { ledgers = [] } = useSelector(
    (state) => state.ledgers || {}
  );

  const {
    loading: journalLoading,
    error: journalError,
  } = useSelector((state) => state.journals || {});

  const [voucherDate, setVoucherDate] = useState(getToday());
  const [narration, setNarration] = useState("");
  const [entries, setEntries] = useState([
    createEmptyEntry(1),
    createEmptyEntry(2),
  ]);
  const [successMessage, setSuccessMessage] = useState("");

  const voucherNumber = "JV-00007";

  useEffect(() => {
    dispatch(getLedgers());
  }, [dispatch]);

  const totalDebit = useMemo(() => {
    return entries.reduce((total, entry) => {
      return entry.type === "debit"
        ? total + Number(entry.amount || 0)
        : total;
    }, 0);
  }, [entries]);

  const totalCredit = useMemo(() => {
    return entries.reduce((total, entry) => {
      return entry.type === "credit"
        ? total + Number(entry.amount || 0)
        : total;
    }, 0);
  }, [entries]);

  const difference = Math.abs(totalDebit - totalCredit);

  const isBalanced =
    totalDebit > 0 &&
    totalCredit > 0 &&
    totalDebit === totalCredit;

  const updateEntry = (id, field, value) => {
    setEntries((currentEntries) =>
      currentEntries.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              [field]: value,
            }
          : entry
      )
    );
  };

  const addRow = () => {
    setEntries((currentEntries) => [
      ...currentEntries,
      createEmptyEntry(Date.now()),
    ]);
  };

  const removeRow = (id) => {
    if (entries.length <= 2) {
      return;
    }

    setEntries((currentEntries) =>
      currentEntries.filter((entry) => entry.id !== id)
    );
  };

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
      alert("Voucher date is required");
      return;
    }

    if (entries.length < 2) {
      alert("At least two journal entries are required");
      return;
    }

    for (const entry of entries) {
      if (!entry.ledgerId) {
        alert("Please select ledger for every entry");
        return;
      }

      if (!entry.type) {
        alert("Please select To or By for every entry");
        return;
      }

      if (
        !entry.amount ||
        Number(entry.amount) <= 0
      ) {
        alert("Please enter a valid amount for every entry");
        return;
      }
    }

    if (!isBalanced) {
      alert("Total Debit and Total Credit must be equal");
      return;
    }

    const data = {
      voucherDate,
      narration: narration.trim(),
      entries: entries.map((entry) => ({
        ledgerId: Number(entry.ledgerId),
        debit:
          entry.type === "debit"
            ? Number(entry.amount)
            : 0,
        credit:
          entry.type === "credit"
            ? Number(entry.amount)
            : 0,
      })),
    };

    try {
      await dispatch(
        createJournalVoucher(data)
      ).unwrap();

      setSuccessMessage(
        "Journal voucher saved successfully"
      );

      setEntries([
        createEmptyEntry(1),
        createEmptyEntry(2),
      ]);
      setNarration("");
      setVoucherDate(getToday());
    } catch (error) {
      console.error(
        "Journal creation failed:",
        error
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-6xl">

        <div className="mb-5 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
              <span className="text-xl font-bold">
                JV
              </span>
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

          <div className="min-w-[190px] rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Voucher Number
            </p>

            <p className="mt-1 text-lg font-bold text-slate-800">
              {voucherNumber}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Voucher Date
                </label>

                <input
                  type="date"
                  value={voucherDate}
                  onChange={(e) =>
                    setVoucherDate(e.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Voucher Status
                </label>

                <div
                  className={`flex items-center rounded-lg border px-3 py-2.5 text-sm font-semibold ${
                    isBalanced
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-amber-200 bg-amber-50 text-amber-700"
                  }`}
                >
                  <span className="mr-2">
                    {isBalanced ? "✓" : "⚠"}
                  </span>

                  {isBalanced
                    ? "Balanced"
                    : "Not Balanced"}
                </div>
              </div>

            </div>
          </div>

          <div className="p-5">

            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Journal Entries
                </h2>

                <p className="text-sm text-slate-500">
                  Select ledger and enter To / By amount
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

            <div className="overflow-x-auto rounded-lg border border-slate-200">

              <table className="w-full min-w-[800px] border-collapse">

                <thead>
                  <tr className="bg-slate-800 text-white">

                    <th className="w-14 px-4 py-3 text-center text-sm font-bold">
                      #
                    </th>

                    <th className="px-4 py-3 text-left text-sm font-bold">
                      Ledger Account
                    </th>

                    <th className="w-32 px-4 py-3 text-center text-sm font-bold">
                      Type
                    </th>

                    <th className="w-40 px-4 py-3 text-right text-sm font-bold">
                      Debit
                    </th>

                    <th className="w-40 px-4 py-3 text-right text-sm font-bold">
                      Credit
                    </th>

                    <th className="w-24 px-4 py-3 text-center text-sm font-bold">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody>
                  {entries.map((entry, index) => (
                    <tr
                      key={entry.id}
                      className="border-t border-slate-200 hover:bg-slate-50"
                    >

                      <td className="px-4 py-3 text-center text-sm font-semibold text-slate-600">
                        {index + 1}
                      </td>

                      <td className="px-4 py-3">
                        <select
                          value={entry.ledgerId}
                          onChange={(e) =>
                            updateEntry(
                              entry.id,
                              "ledgerId",
                              e.target.value
                            )
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                          <option value="">
                            Select Ledger Account
                          </option>

                          {ledgers.map((ledger) => (
                            <option
                              key={ledger.id}
                              value={ledger.id}
                            >
                              {ledger.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-4 py-3">
                        <select
                          value={entry.type}
                          onChange={(e) =>
                            updateEntry(
                              entry.id,
                              "type",
                              e.target.value
                            )
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:border-blue-500"
                        >
                          <option value="">
                            Select
                          </option>

                          <option value="debit">
                            By
                          </option>

                          <option value="credit">
                            To
                          </option>
                        </select>
                      </td>

                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            entry.type === "debit"
                              ? entry.amount
                              : ""
                          }
                          disabled={
                            entry.type !== "debit"
                          }
                          onChange={(e) =>
                            updateEntry(
                              entry.id,
                              "amount",
                              e.target.value
                            )
                          }
                          placeholder="0.00"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-right text-sm font-semibold outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
                        />
                      </td>

                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            entry.type === "credit"
                              ? entry.amount
                              : ""
                          }
                          disabled={
                            entry.type !== "credit"
                          }
                          onChange={(e) =>
                            updateEntry(
                              entry.id,
                              "amount",
                              e.target.value
                            )
                          }
                          placeholder="0.00"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-right text-sm font-semibold outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
                        />
                      </td>

                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            removeRow(entry.id)
                          }
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
                      className="px-4 py-4 text-right text-sm font-bold text-slate-700"
                    >
                      Total
                    </td>

                    <td className="px-4 py-4 text-right text-base font-bold text-slate-800">
                      ₹ {totalDebit.toFixed(2)}
                    </td>

                    <td className="px-4 py-4 text-right text-base font-bold text-slate-800">
                      ₹ {totalCredit.toFixed(2)}
                    </td>

                    <td></td>

                  </tr>
                </tfoot>

              </table>
            </div>

            <div
              className={`mt-4 flex items-center justify-between rounded-lg border px-4 py-3 ${
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
                    ? "Journal is balanced"
                    : "Journal is not balanced"}
                </p>

                <p className="text-xs text-slate-500">
                  Debit and Credit must be equal
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs font-semibold text-slate-500">
                  Difference
                </p>

                <p className="text-base font-bold text-slate-800">
                  ₹ {difference.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Narration
              </label>

              <textarea
                value={narration}
                onChange={(e) =>
                  setNarration(e.target.value)
                }
                rows={3}
                placeholder="Enter reason or description..."
                className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {successMessage && (
              <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                ✓ {successMessage}
              </div>
            )}

            {journalError && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {journalError}
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={clearForm}
                className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={
                  journalLoading || !isBalanced
                }
                className="rounded-lg bg-green-600 px-7 py-3 text-sm font-bold text-black shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {journalLoading
                  ? "Saving..."
                  : "Save Journal Voucher"}
              </button>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}