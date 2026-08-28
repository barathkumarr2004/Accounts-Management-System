"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";

import {
  fetchProfitLoss,
  fetchLedgerVouchers,
  clearLedgerVouchers,
} from "../store/slices/profitLossSlice";

const ProfitLoss = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const {
    data,
    loading,
    error,
    ledgerVouchers,
    ledgerVouchersLoading,
    ledgerVouchersError,
  } = useSelector((state) => state.profitLoss);

  const [showModal, setShowModal] = useState(false);
  const [selectedLedger, setSelectedLedger] = useState(null);

  useEffect(() => {
    dispatch(fetchProfitLoss());
  }, [dispatch]);

  const directIncome = data?.directIncome || [];
  const indirectIncome = data?.indirectIncome || [];
  const directExpense = data?.directExpense || [];
  const indirectExpense = data?.indirectExpense || [];

  const incomeLedgers = useMemo(
    () => [...directIncome, ...indirectIncome],
    [directIncome, indirectIncome]
  );

  const expenseLedgers = useMemo(
    () => [...directExpense, ...indirectExpense],
    [directExpense, indirectExpense]
  );

  const totalIncome = Number(data?.totalIncome || 0);
  const totalExpense = Number(data?.totalExpense || 0);
  const netProfitLoss = Number(data?.netProfitLoss || 0);
  const resultAmount = Number(data?.resultAmount || 0);

  const isProfit = data?.resultType === "Profit";
  const isLoss = data?.resultType === "Loss";

  const handleLedgerClick = (ledger) => {
    setSelectedLedger(ledger);
    dispatch(clearLedgerVouchers());
    dispatch(fetchLedgerVouchers(ledger.id));
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedLedger(null);
    dispatch(clearLedgerVouchers());
  };

  const handleVoucherView = (voucher) => {
    if (!voucher?.voucher_id) return;

    closeModal();
    router.push(`/journal/${voucher.voucher_id}`);
  };

  const formatAmount = (amount) =>
    Number(amount || 0).toFixed(2);

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  const voucherTotalDebit = ledgerVouchers.reduce(
    (total, voucher) =>
      total + Number(voucher.debit || 0),
    0
  );

  const voucherTotalCredit = ledgerVouchers.reduce(
    (total, voucher) =>
      total + Number(voucher.credit || 0),
    0
  );

  const pageStyle = {
    minHeight: "100vh",
    background: "#0b122e",
    color: "white",
    padding: "15px",
    fontFamily: "Arial",
  };

  const boxStyle = {
    border: "1.5px solid",
    borderRadius: "10px",
    padding: "25px",
    textAlign: "center",
    background: "#131d42",
  };

  if (loading && !data) {
    return (
      <div style={pageStyle}>
        <div
          style={{
            ...boxStyle,
            borderColor: "#60a5fa",
          }}
        >
          Loading Profit & Loss...
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div style={pageStyle}>
        <div
          style={{
            ...boxStyle,
            borderColor: "#f87171",
          }}
        >
          <div
            style={{
              color: "#fca5a5",
              fontWeight: "bold",
              marginBottom: "15px",
            }}
          >
            {error}
          </div>

          <button
            onClick={() => dispatch(fetchProfitLoss())}
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "8px 18px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b122e",
        color: "white",
        padding: "15px",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          border:
            isProfit
              ? "2px solid #34d399"
              : isLoss
              ? "2px solid #f87171"
              : "2px solid #60a5fa",
          borderRadius: "8px",
          padding: "12px 20px",
          background: "linear-gradient(90deg, #0b122e, #1e3a8a)",
          marginBottom: "12px",
          gap: "15px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "22px",
              fontWeight: "900",
            }}
          >
            PROFIT & LOSS A/C
          </h1>
        </div>
      </div>

      <div
        style={{
          border:
            isProfit
              ? "1.5px solid #34d399"
              : "1.5px solid #f87171",
          borderRadius: "12px",
          overflow: "hidden",
          background: "#131d42",
        }}
      >
      
        <div
          style={{
            display: "flex",
            gap: "12px",
            padding: "12px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              flex: 1,
              minWidth: "320px",
              border: "1.5px solid #60a5fa",
              borderRadius: "10px",
              overflow: "hidden",
              background: "#131d42",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 15px",
                background: "#1e3a8a",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              <span>INCOME</span>

              <span style={{ color: "#22d3ee" }}>
                ₹ {formatAmount(totalIncome)}
              </span>
            </div>

            <div style={{ minHeight: "420px" }}>
              {incomeLedgers.length === 0 ? (
                <div
                  style={{
                    padding: "30px 15px",
                    textAlign: "center",
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "13px",
                  }}
                >
                  No income found
                </div>
              ) : (
                <>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "50px 1fr 130px",
                      padding: "9px 15px",
                      background: "rgba(255,255,255,0.04)",
                      borderBottom:
                        "1px solid rgba(255,255,255,0.1)",
                      fontSize: "11px",
                      color: "rgba(255,255,255,0.65)",
                      fontWeight: "bold",
                    }}
                  >
                    <span>#</span>
                    <span>Ledger Account</span>
                    <span style={{ textAlign: "right" }}>
                      Amount
                    </span>
                  </div>

                  {incomeLedgers.map((ledger, index) => (
                    <div
                      key={`income-${ledger.id}-${ledger.code}-${index}`}
                      onClick={() => handleLedgerClick(ledger)}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "50px 1fr 130px",
                        alignItems: "center",
                        padding: "12px 15px",
                        borderBottom:
                          "1px solid rgba(255,255,255,0.08)",
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      <span
                        style={{
                          color: "rgba(255,255,255,0.55)",
                        }}
                      >
                        {index + 1}
                      </span>

                      <div>
                        <div
                          style={{
                            color: "white",
                            fontWeight: "bold",
                          }}
                        >
                          {ledger.name}
                        </div>
                      </div>

                      <span
                        style={{
                          textAlign: "right",
                          color: "#22d3ee",
                          fontWeight: "bold",
                        }}
                      >
                        ₹ {formatAmount(ledger.amount)}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px 15px",
                background: "rgba(0,0,0,0.6)",
                borderTop: "1px solid #60a5fa",
                fontWeight: "bold",
              }}
            >
              <span>Total Income</span>

              <span style={{ color: "#22d3ee" }}>
                ₹ {formatAmount(totalIncome)}
              </span>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              minWidth: "320px",
              border: "1.5px solid #f87171",
              borderRadius: "10px",
              overflow: "hidden",
              background: "#131d42",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 15px",
                background: "#3f1d2e",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              <span>EXPENSES</span>

              <span style={{ color: "#f87171" }}>
                ₹ {formatAmount(totalExpense)}
              </span>
            </div>

            <div style={{ minHeight: "420px" }}>
              {expenseLedgers.length === 0 ? (
                <div
                  style={{
                    padding: "30px 15px",
                    textAlign: "center",
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "13px",
                  }}
                >
                  No expenses found
                </div>
              ) : (
                <>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "50px 1fr 130px",
                      padding: "9px 15px",
                      background: "rgba(255,255,255,0.04)",
                      borderBottom:
                        "1px solid rgba(255,255,255,0.1)",
                      fontSize: "11px",
                      color: "rgba(255,255,255,0.65)",
                      fontWeight: "bold",
                    }}
                  >
                    <span>#</span>
                    <span>Ledger Account</span>
                    <span style={{ textAlign: "right" }}>
                      Amount
                    </span>
                  </div>

                  {expenseLedgers.map((ledger, index) => (
                    <div
                      key={`expense-${ledger.id}-${ledger.code}-${index}`}
                      onClick={() => handleLedgerClick(ledger)}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "50px 1fr 130px",
                        alignItems: "center",
                        padding: "12px 15px",
                        borderBottom:
                          "1px solid rgba(255,255,255,0.08)",
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      <span
                        style={{
                          color: "rgba(255,255,255,0.55)",
                        }}
                      >
                        {index + 1}
                      </span>

                      <div>
                        <div
                          style={{
                            color: "white",
                            fontWeight: "bold",
                          }}
                        >
                          {ledger.name}
                        </div>

                        
                      </div>

                      <span
                        style={{
                          textAlign: "right",
                          color: "#f87171",
                          fontWeight: "bold",
                        }}
                      >
                        ₹ {formatAmount(ledger.amount)}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px 15px",
                background: "rgba(0,0,0,0.6)",
                borderTop: "1px solid #f87171",
                fontWeight: "bold",
              }}
            >
              <span>Total Expense</span>

              <span style={{ color: "#f87171" }}>
                ₹ {formatAmount(totalExpense)}
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            margin: "0 12px 12px",
            padding: "12px 15px",
            border:
              isProfit
                ? "1px solid rgba(52,211,153,0.5)"
                : "1px solid rgba(248,113,113,0.5)",
            borderRadius: "8px",
            background:
              isProfit
                ? "rgba(52,211,153,0.08)"
                : "rgba(248,113,113,0.08)",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.55)",
              marginBottom: "5px",
            }}
          >
            Tally Formula
          </div>

          <div
            style={{
              fontSize: "13px",
              fontWeight: "bold",
            }}
          >
            Net Profit / Loss = (Direct Income + Indirect
            Income) - (Direct Expense + Indirect Expense)
          </div>

          <div
            style={{
              marginTop: "7px",
              fontSize: "12px",
              color: "rgba(255,255,255,0.65)",
            }}
          >
            = ₹ {formatAmount(totalIncome)} - ₹{" "}
            {formatAmount(totalExpense)} ={" "}
            <span
              style={{
                color: isProfit ? "#6ee7b7" : "#f87171",
                fontWeight: "bold",
              }}
            >
              {isProfit ? "Profit" : "Loss"} ₹{" "}
              {formatAmount(resultAmount)}
            </span>
          </div>
        </div>

        <div
          style={{
            margin: "0 12px 12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 15px",
            border:
              isProfit
                ? "1.5px solid #34d399"
                : "1.5px solid #f87171",
            borderRadius: "8px",
            background:
              isProfit
                ? "rgba(52,211,153,0.08)"
                : "rgba(248,113,113,0.08)",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.55)",
              }}
            >
              Net Result
            </div>

            <div
              style={{
                fontSize: "15px",
                fontWeight: "bold",
                marginTop: "3px",
              }}
            >
              Net {isProfit ? "Profit" : "Loss"}
            </div>
          </div>

          <div
            style={{
              fontSize: "20px",
              fontWeight: "900",
              color: isProfit ? "#6ee7b7" : "#f87171",
            }}
          >
            ₹ {formatAmount(resultAmount)}
          </div>
        </div>
      </div>

      {showModal && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              background: "#131d42",
              border: "1.5px solid #60a5fa",
              borderRadius: "12px",
              width: "95%",
              maxWidth: "1000px",
              maxHeight: "85vh",
              overflow: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "15px 20px",
                borderBottom:
                  "1px solid rgba(255,255,255,0.12)",
                background: "#172554",
                position: "sticky",
                top: 0,
                zIndex: 2,
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,
                    color: "#22d3ee",
                    fontSize: "18px",
                  }}
                >
                  Ledger Transactions
                </h3>

                <div
                  style={{
                    marginTop: "4px",
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  {selectedLedger?.name}{" "}
                  {selectedLedger?.code
                    ? `(${selectedLedger.code})`
                    : ""}
                </div>
              </div>

              <button
                onClick={closeModal}
                style={{
                  background: "#f87171",
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Close
              </button>
            </div>

            <div style={{ padding: "20px" }}>
              {ledgerVouchersLoading ? (
                <div
                  style={{
                    padding: "40px 15px",
                    textAlign: "center",
                    color: "rgba(255,255,255,0.65)",
                  }}
                >
                  Loading voucher transactions...
                </div>
              ) : ledgerVouchersError ? (
                <div
                  style={{
                    padding: "40px 15px",
                    textAlign: "center",
                    color: "#fca5a5",
                  }}
                >
                  {ledgerVouchersError}
                </div>
              ) : ledgerVouchers.length === 0 ? (
                <div
                  style={{
                    padding: "40px 15px",
                    textAlign: "center",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  No voucher transactions found.
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "13px",
                      minWidth: "750px",
                    }}
                  >
                    <thead>
                      <tr style={{ background: "#1e3a8a" }}>
                        <th
                          style={{
                            padding: "10px",
                            textAlign: "left",
                          }}
                        >
                          Voucher No
                        </th>

                        <th
                          style={{
                            padding: "10px",
                            textAlign: "left",
                          }}
                        >
                          Date
                        </th>

                        <th
                          style={{
                            padding: "10px",
                            textAlign: "left",
                          }}
                        >
                          Narration
                        </th>

                        <th
                          style={{
                            padding: "10px",
                            textAlign: "right",
                          }}
                        >
                          Debit
                        </th>

                        <th
                          style={{
                            padding: "10px",
                            textAlign: "right",
                          }}
                        >
                          Credit
                        </th>

                        <th
                          style={{
                            padding: "10px",
                            textAlign: "center",
                          }}
                        >
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {ledgerVouchers.map((voucher, index) => (
                        <tr
                          key={`${voucher.voucher_id}-${voucher.id}-${index}`}
                          style={{
                            borderBottom:
                              "1px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          <td style={{ padding: "10px" }}>
                            {voucher.voucher_number || "-"}
                          </td>

                          <td style={{ padding: "10px" }}>
                            {formatDate(voucher.voucher_date)}
                          </td>

                          <td
                            style={{
                              padding: "10px",
                              opacity: 0.8,
                            }}
                          >
                            {voucher.narration || "-"}
                          </td>

                          <td
                            style={{
                              padding: "10px",
                              textAlign: "right",
                              color: "#fbbf24",
                            }}
                          >
                            {formatAmount(voucher.debit)}
                          </td>

                          <td
                            style={{
                              padding: "10px",
                              textAlign: "right",
                              color: "#6ee7b7",
                            }}
                          >
                            {formatAmount(voucher.credit)}
                          </td>

                          <td
                            style={{
                              padding: "10px",
                              textAlign: "center",
                            }}
                          >
                            <button
                              onClick={() =>
                                handleVoucherView(voucher)
                              }
                              style={{
                                background: "#22d3ee",
                                color: "#0b122e",
                                border: "none",
                                padding: "5px 12px",
                                borderRadius: "5px",
                                fontWeight: "bold",
                                cursor: "pointer",
                              }}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}

                      <tr
                        style={{
                          background: "rgba(0,0,0,0.5)",
                          fontWeight: "bold",
                          borderTop: "2px solid #60a5fa",
                        }}
                      >
                        <td
                          colSpan={2}
                          style={{ padding: "10px" }}
                        ></td>

                        <td
                          style={{
                            padding: "10px",
                            textAlign: "right",
                          }}
                        >
                          Total:
                        </td>

                        <td
                          style={{
                            padding: "10px",
                            textAlign: "right",
                            color: "#fbbf24",
                          }}
                        >
                          {formatAmount(voucherTotalDebit)}
                        </td>

                        <td
                          style={{
                            padding: "10px",
                            textAlign: "right",
                            color: "#6ee7b7",
                          }}
                        >
                          {formatAmount(voucherTotalCredit)}
                        </td>

                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfitLoss;