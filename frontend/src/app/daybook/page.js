"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { fetchJournalVouchers } from "../store/slices/journalSlice";

export default function DayBookPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const {
    journals = [],
    loading,
    error,
  } = useSelector((state) => state.journals);

  const [search, setSearch] = useState("");

  useEffect(() => {
    try {
      dispatch(fetchJournalVouchers());
    } catch (error) {
      console.error("DAY BOOK ERROR:", error);
    }
  }, [dispatch]);

  const filteredJournals = journals.filter((journal) => {
    const searchValue = search.toLowerCase();

    return (
      String(journal.voucher_number || "")
        .toLowerCase()
        .includes(searchValue) ||
      String(journal.narration || "")
        .toLowerCase()
        .includes(searchValue) ||
      journal.entries?.some((entry) =>
        String(entry.ledger_name || "")
          .toLowerCase()
          .includes(searchValue)
      )
    );
  });

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Day Book
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View all journal transactions
            </p>
          </div>

          <Link
            href="/journal"
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-700"
          >
            + New Journal
          </Link>

        </div>

        {/* Main Card */}
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-b bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">

            <div>
              <h2 className="font-semibold text-slate-800">
                Journal Transactions
              </h2>

              <p className="text-xs text-slate-500">
                {filteredJournals.length} voucher(s)
              </p>
            </div>

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search voucher, ledger..."
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 md:w-80"
            />

          </div>

          {/* Loading */}
          {loading && (
            <div className="p-10 text-center text-sm text-slate-500">
              Loading Day Book...
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="m-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Empty */}
          {!loading &&
            !error &&
            filteredJournals.length === 0 && (
              <div className="p-12 text-center">

                <div className="mb-3 text-4xl">
                  📒
                </div>

                <h3 className="font-semibold text-slate-700">
                  No Journal Transactions
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Create a Journal Voucher to see it here.
                </p>

                <Link
                  href="/journal"
                  className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white"
                >
                  Create Journal
                </Link>

              </div>
            )}

          {/* Day Book */}
          {!loading &&
            filteredJournals.length > 0 && (
              <div className="overflow-x-auto">

                <table className="w-full min-w-[950px] border-collapse">

                  <thead>
                    <tr className="bg-slate-100 text-left text-sm text-slate-700">

                      <th className="border-b px-4 py-3">
                        #
                      </th>

                      <th className="border-b px-4 py-3">
                        Date
                      </th>

                      <th className="border-b px-4 py-3">
                        Voucher No
                      </th>

                      <th className="border-b px-4 py-3">
                        Particulars
                      </th>

                      <th className="border-b px-4 py-3 text-right">
                        Debit
                      </th>

                      <th className="border-b px-4 py-3 text-right">
                        Credit
                      </th>

                      <th className="border-b px-4 py-3 text-center">
                        Action
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {filteredJournals.map(
                      (journal, journalIndex) => (

                        <tr
                          key={journal.id}
                          className="hover:bg-slate-50"
                        >

                          {/* Number */}
                          <td className="border-b px-4 py-4 align-top text-sm text-slate-500">
                            {journalIndex + 1}
                          </td>

                          {/* Date */}
                          <td className="border-b px-4 py-4 align-top text-sm text-slate-700">

                            {journal.voucher_date
                              ? new Date(
                                  journal.voucher_date
                                ).toLocaleDateString(
                                  "en-IN"
                                )
                              : "-"}

                          </td>

                          {/* Voucher */}
                          <td className="border-b px-4 py-4 align-top">

                            <span className="rounded-md bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
                              {journal.voucher_number}
                            </span>

                          </td>

                          {/* Entries */}
                          <td className="border-b px-4 py-4 align-top">

                            <div className="space-y-2">

                              {journal.entries?.map(
                                (entry) => (
                                  <div
                                    key={entry.id}
                                    className="text-sm"
                                  >
                                    {entry.ledger_name}
                                  </div>
                                )
                              )}

                              {journal.narration && (
                                <div className="pt-1 text-xs text-slate-400">
                                  {journal.narration}
                                </div>
                              )}

                            </div>

                          </td>

                          {/* Debit */}
                          <td className="border-b px-4 py-4 text-right align-top">

                            <div className="space-y-2">

                              {journal.entries?.map(
                                (entry) => (
                                  <div
                                    key={entry.id}
                                    className="text-sm font-medium text-blue-700"
                                  >
                                    {entry.debit > 0
                                      ? `₹ ${entry.debit.toFixed(2)}`
                                      : "-"}
                                  </div>
                                )
                              )}

                              <div className="border-t pt-2 text-sm font-bold text-blue-800">
                                ₹{" "}
                                {Number(
                                  journal.total_debit || 0
                                ).toFixed(2)}
                              </div>

                            </div>

                          </td>

                          {/* Credit */}
                          <td className="border-b px-4 py-4 text-right align-top">

                            <div className="space-y-2">

                              {journal.entries?.map(
                                (entry) => (
                                  <div
                                    key={entry.id}
                                    className="text-sm font-medium text-purple-700"
                                  >
                                    {entry.credit > 0
                                      ? `₹ ${entry.credit.toFixed(2)}`
                                      : "-"}
                                  </div>
                                )
                              )}

                              <div className="border-t pt-2 text-sm font-bold text-purple-800">
                                ₹{" "}
                                {Number(
                                  journal.total_credit || 0
                                ).toFixed(2)}
                              </div>

                            </div>

                          </td>

                          {/* Action */}
                          <td className="border-b px-4 py-4 text-center align-top">

                            <button
  type="button"
  onClick={() => router.push(`/journal/${journal.id}`)}
  className="rounded-md border px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
>
  View
</button>

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>
            )}

        </div>

      </div>
    </div>
  );
}