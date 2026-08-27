"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchProfitLoss,
  fetchLedgerVouchers,
  fetchVoucherDetail,
  clearLedgerVouchers,
  clearVoucherDetail,
} from "../store/slices/profitLossSlice";

export default function ProfitLossPage() {
  const dispatch = useDispatch();

  const {
    data,
    loading,
    error,
    ledgerVouchers,
    voucherDetail,
    ledgerVouchersLoading,
    voucherDetailLoading,
  } = useSelector((state) => state.profitLoss);

  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  const [selectedLedger, setSelectedLedger] = useState(null);

  useEffect(() => {
    dispatch(fetchProfitLoss());
  }, [dispatch]);

  const formatAmount = (amount) => {
    return Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const openLedgerVouchers = (ledger) => {
    setSelectedLedger(ledger);
    setShowLedgerModal(true);

    dispatch(clearLedgerVouchers());
    dispatch(fetchLedgerVouchers(ledger.id));
  };

  const closeLedgerModal = () => {
    setShowLedgerModal(false);
    setSelectedLedger(null);
    dispatch(clearLedgerVouchers());
  };

  const openVoucherDetail = (voucherId) => {
    setShowVoucherModal(true);

    dispatch(clearVoucherDetail());
    dispatch(fetchVoucherDetail(voucherId));
  };

  const closeVoucherModal = () => {
    setShowVoucherModal(false);
    dispatch(clearVoucherDetail());
  };

  const refreshProfitLoss = () => {
    dispatch(fetchProfitLoss());
  };

  const incomeTotal =
    Number(data?.totalDirectIncome || 0) +
    Number(data?.totalIndirectIncome || 0);

  const expenseTotal =
    Number(data?.totalDirectExpense || 0) +
    Number(data?.totalIndirectExpense || 0);

  const resultAmount = Number(data?.resultAmount || 0);

  const renderLedgerRows = (items = [], type) => {
    if (!items.length) {
      return (
        <tr>
          <td
            colSpan="3"
            style={{
              textAlign: "center",
              padding: "28px",
              color: "#6b7280",
            }}
          >
            No {type} found
          </td>
        </tr>
      );
    }

    return items.map((ledger, index) => (
      <tr key={ledger.id}>
        <td style={styles.numberCell}>{index + 1}</td>

        <td style={styles.ledgerCell}>
          <button
            type="button"
            onClick={() => openLedgerVouchers(ledger)}
            style={styles.ledgerButton}
          >
            <span style={styles.ledgerName}>
              {ledger.name}
            </span>

            {ledger.code && (
              <span style={styles.ledgerCode}>
                {ledger.code}
              </span>
            )}
          </button>
        </td>

        <td style={styles.amountCell}>
          ₹ {formatAmount(ledger.amount)}
        </td>
      </tr>
    ));
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingCard}>
          <div style={styles.spinner}>⟳</div>

          <h3 style={styles.loadingTitle}>
            Loading Profit & Loss...
          </h3>

          <p style={styles.loadingText}>
            Fetching income and expense details
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.errorCard}>
          <div style={styles.errorIcon}>!</div>

          <h2 style={styles.errorTitle}>
            Unable to Load Profit & Loss
          </h2>

          <p style={styles.errorText}>
            {error}
          </p>

          <button
            type="button"
            onClick={refreshProfitLoss}
            style={styles.primaryButton}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* HEADER */}

        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.iconBox}>
              ₹
            </div>

            <div>
              <h1 style={styles.title}>
                Profit & Loss A/c
              </h1>

              <p style={styles.subtitle}>
                Income and expense statement
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={refreshProfitLoss}
            style={styles.refreshButton}
          >
            ↻ Refresh
          </button>
        </div>

        {/* SUMMARY */}

        <div style={styles.summaryGrid}>

          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>
              ↑
            </div>

            <div>
              <p style={styles.summaryLabel}>
                Total Income
              </p>

              <h2 style={styles.incomeValue}>
                ₹ {formatAmount(incomeTotal)}
              </h2>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div style={styles.summaryIconExpense}>
              ↓
            </div>

            <div>
              <p style={styles.summaryLabel}>
                Total Expense
              </p>

              <h2 style={styles.expenseValue}>
                ₹ {formatAmount(expenseTotal)}
              </h2>
            </div>
          </div>

          <div
            style={{
              ...styles.summaryCard,
              ...(data?.resultType === "Profit"
                ? styles.profitCard
                : styles.lossCard),
            }}
          >
            <div style={styles.summaryResultIcon}>
              {data?.resultType === "Profit" ? "✓" : "!"}
            </div>

            <div>
              <p style={styles.summaryLabel}>
                Net {data?.resultType || "Profit / Loss"}
              </p>

              <h2
                style={
                  data?.resultType === "Profit"
                    ? styles.profitValue
                    : styles.lossValue
                }
              >
                ₹ {formatAmount(resultAmount)}
              </h2>
            </div>
          </div>

        </div>

        {/* MAIN P&L */}

        <div style={styles.statementCard}>

          <div style={styles.statementHeader}>
            <div>
              <h2 style={styles.statementTitle}>
                Profit & Loss Statement
              </h2>

              <p style={styles.statementSubtitle}>
                Click a ledger to view its voucher transactions
              </p>
            </div>

            <div
              style={
                data?.resultType === "Profit"
                  ? styles.profitBadge
                  : styles.lossBadge
              }
            >
              {data?.resultType || "Loss"}
            </div>
          </div>

          <div style={styles.columns}>

            {/* INCOME */}

            <div style={styles.column}>

              <div style={styles.sectionHeaderIncome}>
                <div>
                  <h3 style={styles.sectionTitle}>
                    Income
                  </h3>

                  <p style={styles.sectionSubtitle}>
                    Revenue earned
                  </p>
                </div>

                <span style={styles.sectionTotalIncome}>
                  ₹ {formatAmount(incomeTotal)}
                </span>
              </div>

              {/* DIRECT INCOME */}

              <div style={styles.subSection}>
                <div style={styles.subSectionHeader}>
                  <span>
                    Direct Income
                  </span>

                  <span>
                    ₹{" "}
                    {formatAmount(
                      data?.totalDirectIncome
                    )}
                  </span>
                </div>

                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.thSmall}>
                        #
                      </th>

                      <th style={styles.th}>
                        Ledger Account
                      </th>

                      <th style={styles.thAmount}>
                        Amount
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {renderLedgerRows(
                      data?.directIncome,
                      "direct income"
                    )}
                  </tbody>
                </table>
              </div>

              {/* INDIRECT INCOME */}

              <div style={styles.subSection}>
                <div style={styles.subSectionHeader}>
                  <span>
                    Indirect Income
                  </span>

                  <span>
                    ₹{" "}
                    {formatAmount(
                      data?.totalIndirectIncome
                    )}
                  </span>
                </div>

                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.thSmall}>
                        #
                      </th>

                      <th style={styles.th}>
                        Ledger Account
                      </th>

                      <th style={styles.thAmount}>
                        Amount
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {renderLedgerRows(
                      data?.indirectIncome,
                      "indirect income"
                    )}
                  </tbody>
                </table>
              </div>

              <div style={styles.totalIncomeRow}>
                <span>
                  Total Income
                </span>

                <strong>
                  ₹ {formatAmount(incomeTotal)}
                </strong>
              </div>

            </div>

            {/* EXPENSE */}

            <div style={styles.column}>

              <div style={styles.sectionHeaderExpense}>
                <div>
                  <h3 style={styles.sectionTitle}>
                    Expenses
                  </h3>

                  <p style={styles.sectionSubtitle}>
                    Costs incurred
                  </p>
                </div>

                <span style={styles.sectionTotalExpense}>
                  ₹ {formatAmount(expenseTotal)}
                </span>
              </div>

              {/* DIRECT EXPENSE */}

              <div style={styles.subSection}>
                <div style={styles.subSectionHeader}>
                  <span>
                    Direct Expense
                  </span>

                  <span>
                    ₹{" "}
                    {formatAmount(
                      data?.totalDirectExpense
                    )}
                  </span>
                </div>

                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.thSmall}>
                        #
                      </th>

                      <th style={styles.th}>
                        Ledger Account
                      </th>

                      <th style={styles.thAmount}>
                        Amount
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {renderLedgerRows(
                      data?.directExpense,
                      "direct expense"
                    )}
                  </tbody>
                </table>
              </div>

              {/* INDIRECT EXPENSE */}

              <div style={styles.subSection}>
                <div style={styles.subSectionHeader}>
                  <span>
                    Indirect Expense
                  </span>

                  <span>
                    ₹{" "}
                    {formatAmount(
                      data?.totalIndirectExpense
                    )}
                  </span>
                </div>

                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.thSmall}>
                        #
                      </th>

                      <th style={styles.th}>
                        Ledger Account
                      </th>

                      <th style={styles.thAmount}>
                        Amount
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {renderLedgerRows(
                      data?.indirectExpense,
                      "indirect expense"
                    )}
                  </tbody>
                </table>
              </div>

              <div style={styles.totalExpenseRow}>
                <span>
                  Total Expense
                </span>

                <strong>
                  ₹ {formatAmount(expenseTotal)}
                </strong>
              </div>

            </div>

          </div>

          {/* RESULT */}

          <div
            style={
              data?.resultType === "Profit"
                ? styles.resultProfit
                : styles.resultLoss
            }
          >
            <div>
              <p style={styles.resultSmall}>
                Net Result
              </p>

              <h2 style={styles.resultTitle}>
                {data?.resultType === "Profit"
                  ? "Net Profit"
                  : "Net Loss"}
              </h2>
            </div>

            <div style={styles.resultAmount}>
              ₹ {formatAmount(resultAmount)}
            </div>
          </div>

        </div>

      </div>

      {/* LEDGER VOUCHER MODAL */}

      {showLedgerModal && (
        <div
          style={styles.overlay}
          onClick={closeLedgerModal}
        >
          <div
            style={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >

            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>
                  Ledger Transactions
                </h2>

                <p style={styles.modalSubtitle}>
                  {selectedLedger?.name}
                  {selectedLedger?.code
                    ? ` (${selectedLedger.code})`
                    : ""}
                </p>
              </div>

              <button
                type="button"
                onClick={closeLedgerModal}
                style={styles.closeButton}
              >
                ×
              </button>
            </div>

            <div style={styles.modalBody}>

              {ledgerVouchersLoading ? (
                <div style={styles.modalLoading}>
                  Loading voucher transactions...
                </div>
              ) : !ledgerVouchers ||
                ledgerVouchers.length === 0 ? (
                <div style={styles.modalEmpty}>
                  No voucher transactions found.
                </div>
              ) : (
                <table style={styles.modalTable}>
                  <thead>
                    <tr>
                      <th style={styles.modalTh}>
                        Date
                      </th>

                      <th style={styles.modalTh}>
                        Voucher No
                      </th>

                      <th style={styles.modalTh}>
                        Narration
                      </th>

                      <th style={styles.modalThAmount}>
                        Debit
                      </th>

                      <th style={styles.modalThAmount}>
                        Credit
                      </th>

                      <th style={styles.modalTh}>
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {ledgerVouchers.map(
                      (voucher, index) => (
                        <tr key={voucher.id || index}>

                          <td style={styles.modalTd}>
                            {formatDate(
                              voucher.voucher_date
                            )}
                          </td>

                          <td style={styles.modalTd}>
                            <strong>
                              {voucher.voucher_number}
                            </strong>
                          </td>

                          <td style={styles.modalTd}>
                            {voucher.narration || "-"}
                          </td>

                          <td
                            style={
                              styles.modalAmountDebit
                            }
                          >
                            ₹{" "}
                            {formatAmount(
                              voucher.debit
                            )}
                          </td>

                          <td
                            style={
                              styles.modalAmountCredit
                            }
                          >
                            ₹{" "}
                            {formatAmount(
                              voucher.credit
                            )}
                          </td>

                          <td style={styles.modalTd}>
                            <button
                              type="button"
                              onClick={() =>
                                openVoucherDetail(
                                  voucher.voucher_id ||
                                    voucher.id
                                )
                              }
                              style={styles.viewButton}
                            >
                              View
                            </button>
                          </td>

                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              )}

            </div>

          </div>
        </div>
      )}

      {/* VOUCHER DETAIL MODAL */}

      {showVoucherModal && (
        <div
          style={styles.overlay}
          onClick={closeVoucherModal}
        >
          <div
            style={styles.detailModal}
            onClick={(e) => e.stopPropagation()}
          >

            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>
                  Journal Voucher
                </h2>

                <p style={styles.modalSubtitle}>
                  Voucher transaction details
                </p>
              </div>

              <button
                type="button"
                onClick={closeVoucherModal}
                style={styles.closeButton}
              >
                ×
              </button>
            </div>

            <div style={styles.modalBody}>

              {voucherDetailLoading ? (
                <div style={styles.modalLoading}>
                  Loading voucher details...
                </div>
              ) : !voucherDetail ? (
                <div style={styles.modalEmpty}>
                  Voucher details not found.
                </div>
              ) : (
                <>
                  <div style={styles.detailInfo}>

                    <div>
                      <span style={styles.infoLabel}>
                        Voucher Number
                      </span>

                      <strong>
                        {voucherDetail.voucher_number}
                      </strong>
                    </div>

                    <div>
                      <span style={styles.infoLabel}>
                        Date
                      </span>

                      <strong>
                        {formatDate(
                          voucherDetail.voucher_date
                        )}
                      </strong>
                    </div>

                  </div>

                  <table style={styles.modalTable}>
                    <thead>
                      <tr>
                        <th style={styles.modalTh}>
                          #
                        </th>

                        <th style={styles.modalTh}>
                          Ledger Account
                        </th>

                        <th style={styles.modalThAmount}>
                          Debit
                        </th>

                        <th style={styles.modalThAmount}>
                          Credit
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {voucherDetail.entries?.map(
                        (entry, index) => (
                          <tr key={entry.id || index}>

                            <td style={styles.modalTd}>
                              {index + 1}
                            </td>

                            <td style={styles.modalTd}>
                              <strong>
                                {entry.ledger_name}
                              </strong>

                              {entry.ledger_code && (
                                <small
                                  style={
                                    styles.ledgerCode
                                  }
                                >
                                  {entry.ledger_code}
                                </small>
                              )}
                            </td>

                            <td
                              style={
                                styles.modalAmountDebit
                              }
                            >
                              ₹{" "}
                              {formatAmount(
                                entry.debit
                              )}
                            </td>

                            <td
                              style={
                                styles.modalAmountCredit
                              }
                            >
                              ₹{" "}
                              {formatAmount(
                                entry.credit
                              )}
                            </td>

                          </tr>
                        )
                      )}
                    </tbody>
                  </table>

                  <div style={styles.narrationBox}>
                    <strong>
                      Narration
                    </strong>

                    <p>
                      {voucherDetail.narration ||
                        "No narration"}
                    </p>
                  </div>
                </>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}


/* ========================================================= */
/* STYLES */
/* ========================================================= */

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f6f9",
    padding: "24px",
    fontFamily:
      "Arial, Helvetica, sans-serif",
  },

  container: {
    maxWidth: "1400px",
    margin: "0 auto",
  },

  header: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "20px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  iconBox: {
    width: "48px",
    height: "48px",
    borderRadius: "10px",
    background: "#1d4ed8",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
    fontWeight: "700",
  },

  title: {
    margin: 0,
    fontSize: "25px",
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    margin: "5px 0 0",
    color: "#6b7280",
    fontSize: "14px",
  },

  refreshButton: {
    border: "1px solid #d1d5db",
    background: "#ffffff",
    borderRadius: "8px",
    padding: "9px 15px",
    cursor: "pointer",
    fontWeight: "600",
    color: "#374151",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: "16px",
    marginBottom: "20px",
  },

  summaryCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "18px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  profitCard: {
    borderColor: "#bbf7d0",
    background: "#f0fdf4",
  },

  lossCard: {
    borderColor: "#fecaca",
    background: "#fef2f2",
  },

  summaryIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "#dbeafe",
    color: "#1d4ed8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "18px",
  },

  summaryIconExpense: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "#fee2e2",
    color: "#dc2626",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "18px",
  },

  summaryResultIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "18px",
  },

  summaryLabel: {
    margin: 0,
    fontSize: "13px",
    color: "#6b7280",
  },

  incomeValue: {
    margin: "4px 0 0",
    color: "#2563eb",
    fontSize: "20px",
  },

  expenseValue: {
    margin: "4px 0 0",
    color: "#dc2626",
    fontSize: "20px",
  },

  profitValue: {
    margin: "4px 0 0",
    color: "#15803d",
    fontSize: "20px",
  },

  lossValue: {
    margin: "4px 0 0",
    color: "#dc2626",
    fontSize: "20px",
  },

  statementCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    overflow: "hidden",
  },

  statementHeader: {
    padding: "20px 24px",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  statementTitle: {
    margin: 0,
    fontSize: "19px",
    color: "#111827",
  },

  statementSubtitle: {
    margin: "5px 0 0",
    color: "#6b7280",
    fontSize: "13px",
  },

  profitBadge: {
    background: "#dcfce7",
    color: "#15803d",
    borderRadius: "20px",
    padding: "6px 14px",
    fontWeight: "700",
    fontSize: "13px",
  },

  lossBadge: {
    background: "#fee2e2",
    color: "#b91c1c",
    borderRadius: "20px",
    padding: "6px 14px",
    fontWeight: "700",
    fontSize: "13px",
  },

  columns: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
  },

  column: {
    minWidth: 0,
    padding: "20px",
  },

  sectionHeaderIncome: {
    border: "1px solid #bfdbfe",
    background: "#eff6ff",
    borderRadius: "10px",
    padding: "14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },

  sectionHeaderExpense: {
    border: "1px solid #fecaca",
    background: "#fef2f2",
    borderRadius: "10px",
    padding: "14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "17px",
    color: "#111827",
  },

  sectionSubtitle: {
    margin: "4px 0 0",
    fontSize: "12px",
    color: "#6b7280",
  },

  sectionTotalIncome: {
    fontWeight: "700",
    color: "#2563eb",
  },

  sectionTotalExpense: {
    fontWeight: "700",
    color: "#dc2626",
  },

  subSection: {
    border: "1px solid #e5e7eb",
    borderRadius: "9px",
    overflow: "hidden",
    marginBottom: "14px",
  },

  subSectionHeader: {
    background: "#f8fafc",
    borderBottom: "1px solid #e5e7eb",
    padding: "10px 13px",
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    fontWeight: "700",
    color: "#374151",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  thSmall: {
    width: "50px",
    textAlign: "center",
    padding: "10px",
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    color: "#6b7280",
    fontSize: "12px",
  },

  th: {
    textAlign: "left",
    padding: "10px",
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    color: "#6b7280",
    fontSize: "12px",
  },

  thAmount: {
    textAlign: "right",
    padding: "10px",
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    color: "#6b7280",
    fontSize: "12px",
  },

  numberCell: {
    width: "50px",
    textAlign: "center",
    padding: "11px 8px",
    borderBottom: "1px solid #f1f5f9",
    color: "#9ca3af",
    fontSize: "12px",
  },

  ledgerCell: {
    padding: "8px 10px",
    borderBottom: "1px solid #f1f5f9",
  },

  ledgerButton: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    textAlign: "left",
    padding: "3px 0",
  },

  ledgerName: {
    display: "block",
    color: "#2563eb",
    fontWeight: "600",
    fontSize: "13px",
  },

  ledgerCode: {
    display: "block",
    marginTop: "3px",
    color: "#9ca3af",
    fontSize: "11px",
  },

  amountCell: {
    textAlign: "right",
    padding: "11px 10px",
    borderBottom: "1px solid #f1f5f9",
    fontWeight: "600",
    color: "#374151",
    fontSize: "13px",
  },

  totalIncomeRow: {
    marginTop: "8px",
    padding: "13px 14px",
    background: "#eff6ff",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "space-between",
    color: "#1d4ed8",
    fontWeight: "700",
  },

  totalExpenseRow: {
    marginTop: "8px",
    padding: "13px 14px",
    background: "#fef2f2",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "space-between",
    color: "#b91c1c",
    fontWeight: "700",
  },

  resultProfit: {
    margin: "0 20px 20px",
    padding: "17px 20px",
    borderRadius: "10px",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  resultLoss: {
    margin: "0 20px 20px",
    padding: "17px 20px",
    borderRadius: "10px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  resultSmall: {
    margin: 0,
    color: "#6b7280",
    fontSize: "12px",
  },

  resultTitle: {
    margin: "3px 0 0",
    fontSize: "18px",
    color: "#111827",
  },

  resultAmount: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#111827",
  },

  primaryButton: {
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 18px",
    cursor: "pointer",
    fontWeight: "600",
  },

  loadingCard: {
    maxWidth: "500px",
    margin: "100px auto",
    textAlign: "center",
    background: "#ffffff",
    borderRadius: "12px",
    padding: "45px",
    border: "1px solid #e5e7eb",
  },

  spinner: {
    fontSize: "35px",
    color: "#2563eb",
  },

  loadingTitle: {
    margin: "12px 0 5px",
    color: "#111827",
  },

  loadingText: {
    margin: 0,
    color: "#6b7280",
  },

  errorCard: {
    maxWidth: "550px",
    margin: "100px auto",
    textAlign: "center",
    background: "#ffffff",
    borderRadius: "12px",
    padding: "40px",
    border: "1px solid #fecaca",
  },

  errorIcon: {
    margin: "0 auto 15px",
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    background: "#fee2e2",
    color: "#dc2626",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "22px",
  },

  errorTitle: {
    color: "#991b1b",
    marginBottom: "8px",
  },

  errorText: {
    color: "#6b7280",
    marginBottom: "20px",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 9999,
  },

  modal: {
    width: "100%",
    maxWidth: "1100px",
    maxHeight: "85vh",
    overflow: "hidden",
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
  },

  detailModal: {
    width: "100%",
    maxWidth: "850px",
    maxHeight: "85vh",
    overflow: "hidden",
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
  },

  modalHeader: {
    padding: "18px 20px",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  modalTitle: {
    margin: 0,
    fontSize: "19px",
    color: "#111827",
  },

  modalSubtitle: {
    margin: "4px 0 0",
    color: "#6b7280",
    fontSize: "13px",
  },

  closeButton: {
    border: "none",
    background: "#f3f4f6",
    width: "34px",
    height: "34px",
    borderRadius: "7px",
    cursor: "pointer",
    fontSize: "23px",
    color: "#374151",
  },

  modalBody: {
    padding: "20px",
    overflowY: "auto",
    maxHeight: "calc(85vh - 80px)",
  },

  modalLoading: {
    padding: "50px",
    textAlign: "center",
    color: "#6b7280",
  },

  modalEmpty: {
    padding: "50px",
    textAlign: "center",
    color: "#6b7280",
  },

  modalTable: {
    width: "100%",
    borderCollapse: "collapse",
  },

  modalTh: {
    textAlign: "left",
    padding: "11px 10px",
    background: "#f8fafc",
    borderBottom: "1px solid #e5e7eb",
    color: "#475569",
    fontSize: "12px",
    fontWeight: "700",
  },

  modalThAmount: {
    textAlign: "right",
    padding: "11px 10px",
    background: "#f8fafc",
    borderBottom: "1px solid #e5e7eb",
    color: "#475569",
    fontSize: "12px",
    fontWeight: "700",
  },

  modalTd: {
    padding: "12px 10px",
    borderBottom: "1px solid #f1f5f9",
    color: "#374151",
    fontSize: "13px",
  },

  modalAmountDebit: {
    padding: "12px 10px",
    textAlign: "right",
    borderBottom: "1px solid #f1f5f9",
    color: "#2563eb",
    fontWeight: "600",
    fontSize: "13px",
  },

  modalAmountCredit: {
    padding: "12px 10px",
    textAlign: "right",
    borderBottom: "1px solid #f1f5f9",
    color: "#7c3aed",
    fontWeight: "600",
    fontSize: "13px",
  },

  viewButton: {
    border: "1px solid #bfdbfe",
    background: "#eff6ff",
    color: "#1d4ed8",
    borderRadius: "6px",
    padding: "6px 12px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "12px",
  },

  detailInfo: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "15px",
    marginBottom: "18px",
  },

  infoLabel: {
    display: "block",
    color: "#6b7280",
    fontSize: "12px",
    marginBottom: "5px",
  },

  narrationBox: {
    marginTop: "18px",
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "14px",
    fontSize: "13px",
    color: "#374151",
  },
};