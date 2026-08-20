"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";

import { fetchJournalVouchers } from "../store/slices/journalSlice";

export default function DayBookPage() {
  const dispatch = useDispatch();

  const {
    journals = [],
    loading,
    error,
  } = useSelector((state) => state.journals);

  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchJournalVouchers());
  }, [dispatch]);

  /* =========================================================
     FORMAT DATE
  ========================================================= */

  const formatDate = (date) => {
    if (!date) return "-";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return "-";
    }

    return value.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  /* =========================================================
     FORMAT MONEY
  ========================================================= */

  const formatMoney = (amount) => {
    return Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredJournals = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return journals;
    }

    return journals.filter((journal) => {
      const voucherNumber = String(
        journal.voucher_number || ""
      ).toLowerCase();

      const narration = String(
        journal.narration || ""
      ).toLowerCase();

      const ledgerNames =
        journal.entries
          ?.map((entry) => entry.ledger_name || "")
          .join(" ")
          .toLowerCase() || "";

      return (
        voucherNumber.includes(value) ||
        narration.includes(value) ||
        ledgerNames.includes(value)
      );
    });
  }, [journals, search]);

  /* =========================================================
     TOTALS
  ========================================================= */

  const totalVouchers = journals.length;

  const totalDebit = journals.reduce(
    (total, journal) =>
      total + Number(journal.total_debit || 0),
    0
  );

  const totalCredit = journals.reduce(
    (total, journal) =>
      total + Number(journal.total_credit || 0),
    0
  );

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
              <span className="text-xl">📒</span>
            </div>

            <h2 className="text-lg font-semibold text-slate-800">
              Loading Day Book
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Fetching journal transactions...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                !
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Unable to load Day Book
                </h2>

                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    dispatch(fetchJournalVouchers())
                  }
                  className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-7">
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <span className="text-xl font-bold">
                DB
              </span>
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                Day Book
              </h1>

              <p className="mt-0.5 text-sm text-slate-500">
                View and manage all journal transactions
              </p>
            </div>

          </div>

          <Link
            href="/journal"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <span className="text-lg leading-none">
              +
            </span>

            New Journal
          </Link>

        </div>

        {/* =====================================================
            SUMMARY CARDS
        ===================================================== */}

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">

          {/* Total Vouchers */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Vouchers
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {totalVouchers}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Journal entries recorded
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                📒
              </div>

            </div>

          </div>

          {/* Total Debit */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Debit
                </p>

                <p className="mt-2 text-2xl font-bold text-blue-700">
                  ₹ {formatMoney(totalDebit)}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Total debit amount
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                ↓
              </div>

            </div>

          </div>

          {/* Total Credit */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Credit
                </p>

                <p className="mt-2 text-2xl font-bold text-emerald-700">
                  ₹ {formatMoney(totalCredit)}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Total credit amount
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                ↑
              </div>

            </div>

          </div>

        </div>

        {/* =====================================================
            MAIN DAY BOOK CARD
        ===================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* ===================================================
              TABLE HEADER / TOOLBAR
          =================================================== */}

          <div className="border-b border-slate-200 px-5 py-5">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div>
                <div className="flex items-center gap-2">

                  <h2 className="text-xl font-bold text-slate-900">
                    Journal Transactions
                  </h2>

                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    {filteredJournals.length}
                  </span>

                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Complete list of recorded journal vouchers
                </p>
              </div>

              {/* Search */}

              <div className="relative w-full lg:w-80">

                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  🔍
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search voucher or ledger..."
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

            </div>

          </div>

          {/* ===================================================
              EMPTY STATE
          =================================================== */}

          {filteredJournals.length === 0 && (

            <div className="px-6 py-16 text-center">

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
                📒
              </div>

              <h3 className="text-lg font-semibold text-slate-800">
                No journal transactions found
              </h3>

              <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                {search
                  ? "No vouchers match your search."
                  : "Create your first journal voucher to see it here."}
              </p>

              {!search && (
                <Link
                  href="/journal"
                  className="mt-5 inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Create Journal
                </Link>
              )}

            </div>

          )}

          {/* ===================================================
              TABLE
          =================================================== */}

          {filteredJournals.length > 0 && (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1100px] border-collapse">

                {/* TABLE HEAD */}

                <thead>

                  <tr className="border-b border-slate-200 bg-slate-50">

                    <th className="w-14 px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      #
                    </th>

                    <th className="w-32 px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Date
                    </th>

                    <th className="w-36 px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Voucher No
                    </th>

                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Particulars
                    </th>

                    <th className="w-40 px-4 py-4 text-right text-xs font-bold uppercase tracking-wide text-blue-600">
                      Debit
                    </th>

                    <th className="w-40 px-4 py-4 text-right text-xs font-bold uppercase tracking-wide text-emerald-600">
                      Credit
                    </th>

                    <th className="w-28 px-5 py-4 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                      Action
                    </th>

                  </tr>

                </thead>

                {/* TABLE BODY */}

                <tbody>

                  {filteredJournals.map(
                    (journal, index) => {

                      const entries =
                        journal.entries || [];

                      const isBalanced =
                        Number(
                          journal.total_debit || 0
                        ) ===
                        Number(
                          journal.total_credit || 0
                        );

                      return (

                        <tr
                          key={journal.id}
                          className="border-b border-slate-100 transition hover:bg-blue-50/30"
                        >

                          {/* NUMBER */}

                          <td className="px-5 py-5 align-top text-sm font-medium text-slate-400">
                            {index + 1}
                          </td>

                          {/* DATE */}

                          <td className="px-4 py-5 align-top">

                            <div className="text-sm font-medium text-slate-700">
                              {formatDate(
                                journal.voucher_date
                              )}
                            </div>

                          </td>

                          {/* VOUCHER */}

                          <td className="px-4 py-5 align-top">

                            <span className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700">
                              {journal.voucher_number}
                            </span>

                            <div className="mt-2">

                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                  isBalanced
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-red-50 text-red-700"
                                }`}
                              >
                                <span>
                                  {isBalanced
                                    ? "●"
                                    : "●"}
                                </span>

                                {isBalanced
                                  ? "Balanced"
                                  : "Not Balanced"}
                              </span>

                            </div>

                          </td>

                          {/* PARTICULARS */}

                          <td className="px-4 py-5 align-top">

                            <div className="min-w-[260px] space-y-2">

                              {entries.map(
                                (entry) => {

                                  const isDebit =
                                    Number(
                                      entry.debit || 0
                                    ) > 0;

                                  return (

                                    <div
                                      key={entry.id}
                                      className="flex items-center gap-2"
                                    >

                                      <span
                                        className={`inline-flex min-w-[38px] justify-center rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                          isDebit
                                            ? "bg-blue-50 text-blue-700"
                                            : "bg-emerald-50 text-emerald-700"
                                        }`}
                                      >
                                        {isDebit
                                          ? "To"
                                          : "By"}
                                      </span>

                                      <span className="text-sm font-medium text-slate-700">
                                        {entry.ledger_name ||
                                          "Unknown Ledger"}
                                      </span>

                                    </div>

                                  );
                                }
                              )}

                              {journal.narration && (

                                <div className="mt-3 rounded-md bg-slate-50 px-3 py-2">

                                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                    Narration
                                  </p>

                                  <p className="mt-0.5 text-xs text-slate-600">
                                    {journal.narration}
                                  </p>

                                </div>

                              )}

                            </div>

                          </td>

                          {/* DEBIT */}

                          <td className="px-4 py-5 text-right align-top">

                            <div className="space-y-2">

                              {entries.map(
                                (entry) => (

                                  <div
                                    key={entry.id}
                                    className="min-h-[24px] text-sm"
                                  >

                                    {Number(
                                      entry.debit || 0
                                    ) > 0 ? (
                                      <span className="font-semibold text-blue-700">
                                        ₹{" "}
                                        {formatMoney(
                                          entry.debit
                                        )}
                                      </span>
                                    ) : (
                                      <span className="text-slate-300">
                                        —
                                      </span>
                                    )}

                                  </div>

                                )
                              )}

                              <div className="mt-3 border-t border-slate-200 pt-3">

                                <span className="text-sm font-bold text-blue-800">
                                  ₹{" "}
                                  {formatMoney(
                                    journal.total_debit
                                  )}
                                </span>

                              </div>

                            </div>

                          </td>

                          {/* CREDIT */}

                          <td className="px-4 py-5 text-right align-top">

                            <div className="space-y-2">

                              {entries.map(
                                (entry) => (

                                  <div
                                    key={entry.id}
                                    className="min-h-[24px] text-sm"
                                  >

                                    {Number(
                                      entry.credit || 0
                                    ) > 0 ? (
                                      <span className="font-semibold text-emerald-700">
                                        ₹{" "}
                                        {formatMoney(
                                          entry.credit
                                        )}
                                      </span>
                                    ) : (
                                      <span className="text-slate-300">
                                        —
                                      </span>
                                    )}

                                  </div>

                                )
                              )}

                              <div className="mt-3 border-t border-slate-200 pt-3">

                                <span className="text-sm font-bold text-emerald-800">
                                  ₹{" "}
                                  {formatMoney(
                                    journal.total_credit
                                  )}
                                </span>

                              </div>

                            </div>

                          </td>

                          {/* ACTION */}

                          <td className="px-5 py-5 text-center align-top">

                            <Link
                              href={`/journal/${journal.id}`}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                            >
                              View
                              <span className="text-xs">
                                →
                              </span>
                            </Link>

                          </td>

                        </tr>

                      );
                    }
                  )}

                </tbody>

                {/* =================================================
                    TABLE FOOTER
                ================================================= */}

                <tfoot>

                  <tr className="bg-slate-50">

                    <td
                      colSpan="4"
                      className="px-5 py-4 text-right text-sm font-bold text-slate-700"
                    >
                      Grand Total
                    </td>

                    <td className="px-4 py-4 text-right">

                      <span className="text-sm font-bold text-blue-800">
                        ₹ {formatMoney(totalDebit)}
                      </span>

                    </td>

                    <td className="px-4 py-4 text-right">

                      <span className="text-sm font-bold text-emerald-800">
                        ₹ {formatMoney(totalCredit)}
                      </span>

                    </td>

                    <td className="px-5 py-4" />

                  </tr>

                </tfoot>

              </table>

            </div>

          )}

        </div>

        {/* =====================================================
            FOOTER INFO
        ===================================================== */}

        {filteredJournals.length > 0 && (

          <div className="mt-4 flex flex-col gap-2 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">

            <p>
              Showing {filteredJournals.length} of{" "}
              {journals.length} voucher(s)
            </p>

            <p>
              Debit = To &nbsp; • &nbsp; Credit = By
            </p>

          </div>

        )}

      </div>
    </div>
  );
}