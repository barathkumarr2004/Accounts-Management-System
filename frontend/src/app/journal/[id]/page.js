"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchJournalVoucherById,
  clearSelectedJournal,
} from "../../../store/slices/journalSlice";

export default function ViewJournalPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const { selectedJournal, loading, error } = useSelector(
    (state) => state.journals
  );

  const id = params.id;

  useEffect(() => {
    if (id) {
      dispatch(fetchJournalVoucherById(id));
    }

    return () => {
      dispatch(clearSelectedJournal());
    };
  }, [id, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="mx-auto max-w-5xl rounded-xl bg-white p-8 shadow-sm">
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
              <p className="text-sm text-gray-500">
                Loading journal voucher...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="mx-auto max-w-5xl rounded-xl bg-white p-6 shadow-sm">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="font-medium text-red-700">
              Unable to load journal voucher
            </p>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.back()}
            className="mt-4 rounded-lg bg-gray-800 px-5 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Back to Day Book
          </button>
        </div>
      </div>
    );
  }

  if (!selectedJournal) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="mx-auto max-w-5xl rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-gray-500">
            Journal voucher not found.
          </p>

          <button
            type="button"
            onClick={() => router.back()}
            className="mt-4 rounded-lg bg-gray-800 px-5 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Back to Day Book
          </button>
        </div>
      </div>
    );
  }

  const entries = selectedJournal.entries || [];

  const totalDebit = entries.reduce(
    (total, entry) => total + Number(entry.debit || 0),
    0
  );

  const totalCredit = entries.reduce(
    (total, entry) => total + Number(entry.credit || 0),
    0
  );

  const difference = Math.abs(totalDebit - totalCredit);

  const isBalanced = difference < 0.01;

  const formatAmount = (amount) => {
    return Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const value = String(date).split("T")[0];
    const [year, month, day] = value.split("-");

    if (!year || !month || !day) {
      return date;
    }

    return `${day}-${month}-${year}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-5">

      <div className="mx-auto max-w-5xl rounded-xl border border-gray-200 bg-white shadow-sm">

        {/* Header */}

        <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 md:flex-row md:items-center md:justify-between">

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Accounts Management
            </p>

            <h1 className="mt-1 text-2xl font-bold text-gray-800">
              Journal Voucher
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              View transaction details
            </p>
          </div>

          <div className="flex gap-2">

            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              ← Back
            </button>

          </div>

        </div>

        {/* Voucher Information */}

        <div className="grid grid-cols-1 gap-4 border-b border-gray-200 bg-gray-50 px-5 py-4 md:grid-cols-3">

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Voucher Number
            </p>

            <div className="mt-1 inline-flex rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5">
              <span className="font-bold text-blue-700">
                {selectedJournal.voucher_number}
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Voucher Date
            </p>

            <p className="mt-2 font-semibold text-gray-800">
              {formatDate(selectedJournal.voucher_date)}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Voucher Status
            </p>

            <div
              className={`mt-1 inline-flex rounded-md px-3 py-1.5 text-sm font-semibold ${
                isBalanced
                  ? "border border-green-200 bg-green-50 text-green-700"
                  : "border border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {isBalanced ? "✓ Balanced" : "⚠ Not Balanced"}
            </div>
          </div>

        </div>

        {/* Journal Entries */}

        <div className="px-5 py-5">

          <div className="mb-3 flex items-center justify-between">

            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Journal Entries
              </h2>

              <p className="text-xs text-gray-500">
                Debit and credit details
              </p>
            </div>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              {entries.length} {entries.length === 1 ? "Entry" : "Entries"}
            </span>

          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200">

            <div className="overflow-x-auto">

              <table className="w-full border-collapse">

                <thead>

                  <tr className="bg-gray-100">

                    <th className="w-14 border-b border-gray-200 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600">
                      #
                    </th>

                    <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600">
                      Ledger Account
                    </th>

                    <th className="w-44 border-b border-gray-200 px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-gray-600">
                      Debit
                    </th>

                    <th className="w-44 border-b border-gray-200 px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-gray-600">
                      Credit
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {entries.map((entry, index) => (

                    <tr
                      key={entry.id}
                      className="hover:bg-gray-50"
                    >

                      <td className="border-b border-gray-100 px-4 py-3 text-sm text-gray-500">
                        {index + 1}
                      </td>

                      <td className="border-b border-gray-100 px-4 py-3">

                        <p className="font-medium text-gray-800">
                          {entry.ledger_name || "Unknown Ledger"}
                        </p>

                      </td>

                      <td className="border-b border-gray-100 px-4 py-3 text-right">

                        {Number(entry.debit || 0) > 0 ? (
                          <span className="font-medium text-gray-800">
                            ₹ {formatAmount(entry.debit)}
                          </span>
                        ) : (
                          <span className="text-gray-300">
                            —
                          </span>
                        )}

                      </td>

                      <td className="border-b border-gray-100 px-4 py-3 text-right">

                        {Number(entry.credit || 0) > 0 ? (
                          <span className="font-medium text-gray-800">
                            ₹ {formatAmount(entry.credit)}
                          </span>
                        ) : (
                          <span className="text-gray-300">
                            —
                          </span>
                        )}

                      </td>

                    </tr>

                  ))}

                </tbody>

                {/* Totals */}

                <tfoot>

                  <tr className="bg-gray-50">

                    <td
                      colSpan="2"
                      className="px-4 py-3 text-right text-sm font-bold text-gray-700"
                    >
                      Total
                    </td>

                    <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                      ₹ {formatAmount(totalDebit)}
                    </td>

                    <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                      ₹ {formatAmount(totalCredit)}
                    </td>

                  </tr>

                </tfoot>

              </table>

            </div>

          </div>

          {/* Balance Information */}

          <div
            className={`mt-4 flex flex-col gap-2 rounded-lg border px-4 py-3 md:flex-row md:items-center md:justify-between ${
              isBalanced
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}
          >

            <div>

              <p
                className={`text-sm font-semibold ${
                  isBalanced
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {isBalanced
                  ? "✓ Journal is balanced"
                  : "⚠ Journal is not balanced"}
              </p>

              <p
                className={`text-xs ${
                  isBalanced
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                Debit and credit totals must be equal.
              </p>

            </div>

            <div className="text-sm font-bold">

              Difference:

              <span
                className={`ml-2 ${
                  isBalanced
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                ₹ {formatAmount(difference)}
              </span>

            </div>

          </div>

          {/* Narration */}

          <div className="mt-5">

            <p className="mb-2 text-sm font-bold text-gray-700">
              Narration
            </p>

            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
              {selectedJournal.narration || "No narration provided."}
            </div>

          </div>

          {/* Bottom Actions */}

          <div className="mt-5 flex justify-end gap-2 border-t border-gray-200 pt-4">

            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}