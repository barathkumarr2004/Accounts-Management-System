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
    dispatch(fetchJournalVouchers());
  }, [dispatch]);

  const filteredJournals = journals.filter((journal) => {
    const value = search.toLowerCase();

    return (
      String(journal.voucher_number || "")
        .toLowerCase()
        .includes(value) ||
      String(journal.narration || "")
        .toLowerCase()
        .includes(value) ||
      journal.entries?.some((entry) =>
        String(entry.ledger_name || "")
          .toLowerCase()
          .includes(value)
      )
    );
  });

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">

        {/* =====================================================
            HEADER
        ====================================================== */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="relative px-6 py-6 md:px-8">

            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-blue-100/50 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-20 w-20 rounded-full bg-indigo-100/40 blur-2xl" />

            <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-2xl text-white shadow-lg shadow-blue-200">
                  📒
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                      Day Book
                    </h1>

                    <span className="hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 sm:inline-flex">
                      Transactions
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    View and manage all journal transactions
                  </p>
                </div>

              </div>

              <Link
                href="/journal"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 transition duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg"
              >
                <span className="text-lg leading-none">+</span>
                New Journal
              </Link>

            </div>
          </div>
        </div>

        {/* =====================================================
            SUMMARY CARDS
        ====================================================== */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">

          {/* Total Vouchers */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Vouchers
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {journals.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Journal transactions
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl transition group-hover:bg-blue-100">
                📋
              </div>

            </div>
          </div>

        </div>

        {/* =====================================================
            MAIN DAY BOOK CARD
        ====================================================== */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Toolbar */}
          <div className="border-b border-slate-200 bg-white px-5 py-5 md:px-6">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div>
                <div className="flex items-center gap-3">

                  <h2 className="text-lg font-bold text-slate-900">
                    Journal Transactions
                  </h2>

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                    {filteredJournals.length}
                  </span>

                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Complete record of your journal vouchers
                </p>
              </div>

              {/* Search */}
              <div className="relative w-full lg:w-96">

                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  🔍
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search voucher, ledger, narration..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-10 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    ✕
                  </button>
                )}

              </div>

            </div>
          </div>

          {/* =====================================================
              LOADING
          ====================================================== */}
          {loading && (
            <div className="flex min-h-[400px] flex-col items-center justify-center">

              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

              <p className="mt-4 text-sm font-semibold text-slate-700">
                Loading Day Book...
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Please wait while transactions are loaded
              </p>

            </div>
          )}

          {/* =====================================================
              ERROR
          ====================================================== */}
          {!loading && error && (
            <div className="p-6">

              <div className="rounded-xl border border-red-200 bg-red-50 p-5">

                <div className="flex gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-lg">
                    ⚠️
                  </div>

                  <div>
                    <h3 className="font-semibold text-red-800">
                      Unable to load transactions
                    </h3>

                    <p className="mt-1 text-sm text-red-600">
                      {error}
                    </p>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* =====================================================
              EMPTY STATE
          ====================================================== */}
          {!loading &&
            !error &&
            filteredJournals.length === 0 && (
              <div className="flex min-h-[400px] flex-col items-center justify-center px-5 text-center">

                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 text-4xl shadow-inner">
                  {search ? "🔍" : "📒"}
                </div>

                <h3 className="mt-5 text-xl font-bold text-slate-800">
                  {search
                    ? "No transactions found"
                    : "No Journal Transactions"}
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {search
                    ? "No voucher, ledger or narration matches your search."
                    : "Create a Journal Voucher to start recording your accounting transactions."}
                </p>

                {search ? (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="mt-5 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                  >
                    Clear Search
                  </button>
                ) : (
                  <Link
                    href="/journal"
                    className="mt-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:from-blue-700 hover:to-indigo-700"
                  >
                    + Create Journal
                  </Link>
                )}

              </div>
            )}

          {/* =====================================================
              TABLE
          ====================================================== */}
          {!loading &&
            !error &&
            filteredJournals.length > 0 && (
              <div className="overflow-x-auto">

                <table className="w-full min-w-[1050px] border-collapse">

                  {/* Table Header */}
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">

                      <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        #
                      </th>

                      <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Date
                      </th>

                      <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Voucher No
                      </th>

                      <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Particulars
                      </th>

                      <th className="px-5 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-blue-600">
                        Debit
                      </th>

                      <th className="px-5 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-purple-600">
                        Credit
                      </th>

                      <th className="px-5 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Action
                      </th>

                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody className="divide-y divide-slate-100">

                    {filteredJournals.map((journal, index) => (

                      <tr
                        key={journal.id}
                        className="group transition duration-150 hover:bg-blue-50/40"
                      >

                        {/* # */}
                        <td className="px-5 py-5 align-top">

                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600">
                            {index + 1}
                          </div>

                        </td>

                        {/* Date */}
                        <td className="px-5 py-5 align-top">

                          <div className="text-sm font-semibold text-slate-700">
                            {formatDate(journal.voucher_date)}
                          </div>

                          <div className="mt-1 text-[11px] text-slate-400">
                            Voucher date
                          </div>

                        </td>

                        {/* Voucher Number */}
                        <td className="px-5 py-5 align-top">

                          <span className="inline-flex rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700">
                            {journal.voucher_number || "-"}
                          </span>

                        </td>

                        {/* Particulars */}
                        <td className="max-w-[360px] px-5 py-5 align-top">

                          <div className="space-y-2">

                            {journal.entries?.map((entry) => (

                              <div
                                key={entry.id}
                                className="flex items-center gap-2"
                              >

                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />

                                <span className="text-sm font-medium text-slate-700">
                                  {entry.ledger_name || "-"}
                                </span>

                              </div>

                            ))}

                            {journal.narration && (
                              <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2">

                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  Narration
                                </div>

                                <div className="mt-1 text-xs italic text-slate-500">
                                  {journal.narration}
                                </div>

                              </div>
                            )}

                          </div>

                        </td>

                        {/* Debit */}
                        <td className="px-5 py-5 text-right align-top">

                          <div className="space-y-2">

                            {journal.entries?.map((entry) => (

                              <div
                                key={entry.id}
                                className="text-sm font-semibold text-blue-700"
                              >
                                {Number(entry.debit || 0) > 0
                                  ? `₹ ${formatAmount(entry.debit)}`
                                  : "—"}
                              </div>

                            ))}

                          </div>

                        </td>

                        {/* Credit */}
                        <td className="px-5 py-5 text-right align-top">

                          <div className="space-y-2">

                            {journal.entries?.map((entry) => (

                              <div
                                key={entry.id}
                                className="text-sm font-semibold text-purple-700"
                              >
                                {Number(entry.credit || 0) > 0
                                  ? `₹ ${formatAmount(entry.credit)}`
                                  : "—"}
                              </div>

                            ))}

                          </div>

                        </td>

                        {/* Action */}
                        <td className="px-5 py-5 text-center align-top">

                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                `/journal/${journal.id}`
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-blue-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:shadow"
                          >
                            View

                            <span className="text-base">
                              →
                            </span>

                          </button>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>
            )}

        </div>

        {/* =====================================================
            FOOTER INFO
        ====================================================== */}
        {!loading &&
          !error &&
          filteredJournals.length > 0 && (

            <div className="flex flex-col gap-2 px-1 py-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">

              <p>
                Showing{" "}
                <span className="font-semibold text-slate-600">
                  {filteredJournals.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-600">
                  {journals.length}
                </span>{" "}
                vouchers
              </p>

              <p className="font-medium">
                Day Book • Journal Transactions
              </p>

            </div>
          )}

      </div>
    </div>
  );
}