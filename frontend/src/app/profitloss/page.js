"use client";

import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api/profit-loss";

const formatAmount = (value) => {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export default function ProfitLossPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProfitLoss = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch Profit & Loss data");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Unable to load data");
      }

      setData(result.data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfitLoss();
  }, []);

  const expenseRows =
    data?.rows?.filter((row) => row.nature_name === "Expenses") || [];

  const incomeRows =
    data?.rows?.filter((row) => row.nature_name === "Income") || [];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-medium text-slate-500">
              Accounts Management
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Profit & Loss A/c
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Income and Expenses Statement
            </p>
          </div>

          <button
            type="button"
            onClick={fetchProfitLoss}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className={loading ? "animate-spin" : ""}>↻</span>
            Refresh
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />

            <p className="text-sm font-medium text-slate-600">
              Loading Profit & Loss...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="font-semibold text-red-700">
              Unable to load Profit & Loss
            </p>

            <p className="mt-1 text-sm text-red-600">{error}</p>

            <button
              type="button"
              onClick={fetchProfitLoss}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Main Content */}
        {!loading && !error && data && (
          <>
            {/* Statement */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
              {/* Statement Header */}
              <div className="border-b border-slate-200 bg-slate-900 px-6 py-5 text-center">
                <h2 className="text-xl font-bold text-white">
                  Profit & Loss Statement
                </h2>

                <p className="mt-1 text-xs text-slate-300">
                  Income and Expenses Summary
                </p>
              </div>

              {/* Two Column Tally Style */}
              <div className="grid grid-cols-1 divide-y divide-slate-200 md:grid-cols-2 md:divide-x md:divide-y-0">
                {/* Expenses */}
                <section className="min-w-0">
                  <div className="border-b border-slate-200 bg-red-50 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          Expenses
                        </h3>

                        <p className="text-xs font-medium text-red-600">
                          Debit
                        </p>
                      </div>

                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                        {expenseRows.length}{" "}
                        {expenseRows.length === 1 ? "Ledger" : "Ledgers"}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="overflow-hidden rounded-xl border border-slate-200">
                      <table className="w-full table-fixed">
                        <thead>
                          <tr className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-600">
                            <th className="w-[46%] px-4 py-3 font-bold">
                              Particulars
                            </th>

                            <th className="w-[27%] px-4 py-3 text-right font-bold">
                              Debit
                            </th>

                            <th className="w-[27%] px-4 py-3 text-right font-bold">
                              Credit
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                          {expenseRows.length > 0 ? (
                            expenseRows.map((row, index) => (
                              <tr
                                key={`${row.ledger_name}-${index}`}
                                className="hover:bg-slate-50"
                              >
                                <td className="break-words px-4 py-3 text-sm font-medium text-slate-800">
                                  {row.ledger_name}
                                </td>

                                <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-slate-700">
                                  {formatAmount(row.total_dr)}
                                </td>

                                <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-slate-700">
                                  {formatAmount(row.total_cr)}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan="3"
                                className="px-4 py-8 text-center text-sm text-slate-500"
                              >
                                No expense entries
                              </td>
                            </tr>
                          )}
                        </tbody>

                        <tfoot>
                          <tr className="border-t-2 border-slate-300 bg-slate-50">
                            <td className="px-4 py-4 text-sm font-bold text-slate-900">
                              Total Expenses
                            </td>

                            <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-bold text-slate-900">
                              {formatAmount(data.expenses)}
                            </td>

                            <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-bold text-slate-900">
                              {formatAmount(0)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </section>

                {/* Income */}
                <section className="min-w-0">
                  <div className="border-b border-slate-200 bg-emerald-50 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          Income
                        </h3>

                        <p className="text-xs font-medium text-emerald-600">
                          Credit
                        </p>
                      </div>

                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {incomeRows.length}{" "}
                        {incomeRows.length === 1 ? "Ledger" : "Ledgers"}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="overflow-hidden rounded-xl border border-slate-200">
                      <table className="w-full table-fixed">
                        <thead>
                          <tr className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-600">
                            <th className="w-[46%] px-4 py-3 font-bold">
                              Particulars
                            </th>

                            <th className="w-[27%] px-4 py-3 text-right font-bold">
                              Debit
                            </th>

                            <th className="w-[27%] px-4 py-3 text-right font-bold">
                              Credit
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                          {incomeRows.length > 0 ? (
                            incomeRows.map((row, index) => (
                              <tr
                                key={`${row.ledger_name}-${index}`}
                                className="hover:bg-slate-50"
                              >
                                <td className="break-words px-4 py-3 text-sm font-medium text-slate-800">
                                  {row.ledger_name}
                                </td>

                                <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-slate-700">
                                  {formatAmount(row.total_dr)}
                                </td>

                                <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-slate-700">
                                  {formatAmount(row.total_cr)}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan="3"
                                className="px-4 py-8 text-center text-sm text-slate-500"
                              >
                                No income entries
                              </td>
                            </tr>
                          )}
                        </tbody>

                        <tfoot>
                          <tr className="border-t-2 border-slate-300 bg-slate-50">
                            <td className="px-4 py-4 text-sm font-bold text-slate-900">
                              Total Income
                            </td>

                            <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-bold text-slate-900">
                              {formatAmount(0)}
                            </td>

                            <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-bold text-slate-900">
                              {formatAmount(data.income)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </section>
              </div>

              {/* Result */}
              <div className="border-t border-slate-200 bg-slate-50 p-6">
                <div className="mx-auto max-w-2xl">
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 text-center">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Final Result
                      </p>

                      {data.profit > 0 ? (
                        <>
                          <h3 className="mt-1 text-2xl font-bold text-emerald-600">
                            Net Profit
                          </h3>

                          <p className="mt-1 text-lg font-bold text-slate-900">
                            {formatAmount(data.profit)}
                          </p>
                        </>
                      ) : data.loss > 0 ? (
                        <>
                          <h3 className="mt-1 text-2xl font-bold text-red-600">
                            Net Loss
                          </h3>

                          <p className="mt-1 text-lg font-bold text-slate-900">
                            {formatAmount(data.loss)}
                          </p>
                        </>
                      ) : (
                        <>
                          <h3 className="mt-1 text-2xl font-bold text-slate-700">
                            No Profit / No Loss
                          </h3>

                          <p className="mt-1 text-lg font-bold text-slate-900">
                            ₹0.00
                          </p>
                        </>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 border-t border-slate-200 pt-4 sm:grid-cols-2">
        
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Calculation */}
            <div className="mt-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Calculation
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm font-semibold text-slate-700">
                <span className="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700">
                  Income {formatAmount(data.income)}
                </span>

                <span className="text-slate-400">−</span>

                <span className="rounded-lg bg-red-50 px-3 py-2 text-red-700">
                  Expenses {formatAmount(data.expenses)}
                </span>

                <span className="text-slate-400">=</span>

                {data.profit > 0 ? (
                  <span className="rounded-lg bg-emerald-100 px-3 py-2 text-emerald-700">
                    Profit {formatAmount(data.profit)}
                  </span>
                ) : data.loss > 0 ? (
                  <span className="rounded-lg bg-red-100 px-3 py-2 text-red-700">
                    Loss {formatAmount(data.loss)}
                  </span>
                ) : (
                  <span className="rounded-lg bg-slate-100 px-3 py-2 text-slate-700">
                    No Profit / No Loss
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}