"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";

import { getLedgers } from "../store/slices/ledgerSlice";
import { createJournalVoucher } from "../store/slices/journalSlice";

const getCurrentDate = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const createEmptyRow = (id) => ({
  id,
  ledgerId: "",
  type: "debit",
  amount: "",
});

export default function JournalPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const ledgerState = useSelector(
    (state) => state?.ledgers || {}
  );

  const journalState = useSelector(
    (state) => state?.journals || {}
  );

  const ledgers = ledgerState.ledgers || [];
  const ledgerLoading = ledgerState.loading || false;

  const journalLoading = journalState.loading || false;
  const journalError = journalState.error || null;

  const [voucherDate, setVoucherDate] = useState(
    getCurrentDate()
  );

  const [narration, setNarration] = useState("");

  const [entries, setEntries] = useState([
    createEmptyRow(1),
    createEmptyRow(2),
  ]);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    dispatch(getLedgers());

    const timer = setInterval(() => {
      setVoucherDate((currentDate) => {
        const today = getCurrentDate();

        return currentDate === today
          ? currentDate
          : today;
      });
    }, 60000);

    return () => clearInterval(timer);
  }, [dispatch]);

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

    setError("");
    setMessage("");
  };

  const addRow = () => {
    setEntries((currentEntries) => [
      ...currentEntries,
      createEmptyRow(Date.now()),
    ]);

    setError("");
  };

  const removeRow = (id) => {
    if (entries.length <= 2) {
      return;
    }

    setEntries((currentEntries) =>
      currentEntries.filter(
        (entry) => entry.id !== id
      )
    );
  };

  const totalDebit = entries.reduce(
    (total, entry) =>
      entry.type === "debit"
        ? total + Number(entry.amount || 0)
        : total,
    0
  );

  const totalCredit = entries.reduce(
    (total, entry) =>
      entry.type === "credit"
        ? total + Number(entry.amount || 0)
        : total,
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
    setVoucherDate(getCurrentDate());
    setNarration("");

    setEntries([
      createEmptyRow(1),
      createEmptyRow(2),
    ]);

    setError("");
    setMessage("");
  };

  const handleSave = async () => {
    setError("");
    setMessage("");

    try {
      if (!voucherDate) {
        setError("Voucher date is required");
        return;
      }

      if (entries.length < 2) {
        setError(
          "At least two journal entries are required"
        );
        return;
      }

      const invalidLedger = entries.some(
        (entry) => !entry.ledgerId
      );

      if (invalidLedger) {
        setError(
          "Please select a ledger for every row"
        );
        return;
      }

      const invalidAmount = entries.some(
        (entry) =>
          !entry.amount ||
          Number(entry.amount) <= 0
      );

      if (invalidAmount) {
        setError(
          "Every entry must have an amount greater than 0"
        );
        return;
      }

      if (totalDebit === 0) {
        setError(
          "At least one Debit entry is required"
        );
        return;
      }

      if (totalCredit === 0) {
        setError(
          "At least one Credit entry is required"
        );
        return;
      }

      if (!isBalanced) {
        setError(
          `Journal is not balanced. Difference: ₹ ${difference.toFixed(
            2
          )}`
        );
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

      await dispatch(
        createJournalVoucher(data)
      ).unwrap();

      setMessage(
        "Journal Voucher saved successfully"
      );

      setTimeout(() => {
        router.push("/daybook");
      }, 700);
    } catch (error) {
      setError(
        error?.message ||
          journalError ||
          "Unable to save journal voucher"
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Journal Voucher
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Record debit and credit transactions
            </p>
          </div>

          <div className="rounded-lg border bg-white px-5 py-3 text-right shadow-sm">
            <p className="text-xs text-slate-500">
              Voucher Number
            </p>

            <p className="font-semibold text-slate-800">
              Auto Generate
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

          {/* Voucher Details */}
          <div className="border-b bg-slate-50 p-5">

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Voucher Date
                </label>

                <input
                  type="date"
                  value={voucherDate}
                  onChange={(e) =>
                    setVoucherDate(e.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Voucher Status
                </label>

                <div
                  className={`flex h-[42px] items-center rounded-lg border px-3 text-sm font-medium ${
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

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Narration
                </label>

                <input
                  type="text"
                  value={narration}
                  onChange={(e) =>
                    setNarration(e.target.value)
                  }
                  placeholder="Enter narration"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

            </div>
          </div>

          {/* Entries */}
          <div className="p-5">

            <div className="mb-4 flex items-center justify-between">

              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Journal Entries
                </h2>

                <p className="text-xs text-slate-500">
                  Select ledger and enter debit or credit
                </p>
              </div>

              <button
                type="button"
                onClick={addRow}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                + Add Row
              </button>

            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border">

              <table className="w-full min-w-[750px] border-collapse">

                <thead>
                  <tr className="bg-slate-100 text-left text-sm text-slate-700">

                    <th className="border-b px-4 py-3">
                      #
                    </th>

                    <th className="border-b px-4 py-3">
                      Ledger Account
                    </th>

                    <th className="border-b px-4 py-3">
                      Type
                    </th>

                    <th className="border-b px-4 py-3 text-right">
                      Amount
                    </th>

                    <th className="border-b px-4 py-3 text-center">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {entries.map((entry, index) => (
                    <tr
                      key={entry.id}
                      className="hover:bg-slate-50"
                    >

                      <td className="border-b px-4 py-3 text-sm font-medium text-slate-500">
                        {index + 1}
                      </td>

                      <td className="border-b px-4 py-3">

                        <select
                          value={entry.ledgerId}
                          onChange={(e) =>
                            updateEntry(
                              entry.id,
                              "ledgerId",
                              e.target.value
                            )
                          }
                          disabled={ledgerLoading}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                        >

                          <option value="">
                            {ledgerLoading
                              ? "Loading ledgers..."
                              : "Select Ledger"}
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

                      <td className="border-b px-4 py-3">

                        <select
                          value={entry.type}
                          onChange={(e) =>
                            updateEntry(
                              entry.id,
                              "type",
                              e.target.value
                            )
                          }
                          className={`w-full rounded-lg border px-3 py-2.5 text-sm font-medium ${
                            entry.type === "debit"
                              ? "border-blue-200 bg-blue-50 text-blue-700"
                              : "border-purple-200 bg-purple-50 text-purple-700"
                          }`}
                        >

                          <option value="debit">
                            Debit
                          </option>

                          <option value="credit">
                            Credit
                          </option>

                        </select>

                      </td>

                      <td className="border-b px-4 py-3">

                        <div className="relative">

                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                            ₹
                          </span>

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={entry.amount}
                            onChange={(e) =>
                              updateEntry(
                                entry.id,
                                "amount",
                                e.target.value
                              )
                            }
                            placeholder="0.00"
                            className="w-full rounded-lg border border-slate-300 py-2.5 pl-8 pr-3 text-right text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />

                        </div>

                      </td>

                      <td className="border-b px-4 py-3 text-center">

                        <button
                          type="button"
                          onClick={() =>
                            removeRow(entry.id)
                          }
                          disabled={entries.length <= 2}
                          className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          Remove
                        </button>

                      </td>

                    </tr>
                  ))}

                </tbody>

                <tfoot>

                  <tr className="bg-slate-50 font-semibold">

                    <td
                      colSpan="3"
                      className="border-t px-4 py-4 text-right text-sm"
                    >
                      Total
                    </td>

                    <td className="border-t px-4 py-4">

                      <div className="flex justify-between gap-6 text-sm">

                        <span className="text-blue-700">
                          Dr ₹ {totalDebit.toFixed(2)}
                        </span>

                        <span className="text-purple-700">
                          Cr ₹ {totalCredit.toFixed(2)}
                        </span>

                      </div>

                    </td>

                    <td className="border-t"></td>

                  </tr>

                </tfoot>

              </table>

            </div>

            {/* Balance */}
            <div
              className={`mt-4 flex items-center justify-between rounded-lg border px-4 py-3 text-sm ${
                isBalanced
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-amber-200 bg-amber-50 text-amber-700"
              }`}
            >

              <span>
                {isBalanced
                  ? "✓ Journal is balanced"
                  : "⚠ Debit and Credit must be equal"}
              </span>

              <span className="font-semibold">
                Difference: ₹{" "}
                {difference.toFixed(2)}
              </span>

            </div>

            {/* Error */}
            {(error || journalError) && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error || journalError}
              </div>
            )}

            {/* Success */}
            {message && (
              <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                ✓ {message}
              </div>
            )}

            {/* Buttons */}
            <div className="mt-5 flex justify-end gap-3">

              <button
                type="button"
                onClick={clearForm}
                disabled={journalLoading}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={
                  journalLoading ||
                  !isBalanced
                }
                className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {journalLoading
                  ? "Saving..."
                  : "Save Journal"}
              </button>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}