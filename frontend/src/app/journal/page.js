"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";

import {
  getLedgers,
} from "../store/slices/ledgerSlice";

import {
  createJournalVoucher,
  clearJournalError,
} from "../store/slices/journalSlice";

export default function JournalPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  // =========================================================
  // REDUX
  // =========================================================

  const ledgers = useSelector(
    (state) => state.ledgers?.ledgers || []
  );

  const journalLoading = useSelector(
    (state) => state.journals?.loading || false
  );

  const journalError = useSelector(
    (state) => state.journals?.error || null
  );

  // =========================================================
  // DATE
  // =========================================================

  const getToday = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // =========================================================
  // STATE
  // =========================================================

  const [voucherDate, setVoucherDate] = useState(getToday());

  const [voucherNumber, setVoucherNumber] =
    useState("JV-00001");

  const [narration, setNarration] = useState("");

  const [rows, setRows] = useState([
    {
      id: 1,
      ledgerId: "",
      type: "",
      debit: "",
      credit: "",
    },
    {
      id: 2,
      ledgerId: "",
      type: "",
      debit: "",
      credit: "",
    },
  ]);

  const [successMessage, setSuccessMessage] =
    useState("");

  // =========================================================
  // LOAD LEDGERS
  // =========================================================

  useEffect(() => {
    dispatch(getLedgers());
  }, [dispatch]);

  // =========================================================
  // CLEAR ERROR
  // =========================================================

  useEffect(() => {
    return () => {
      dispatch(clearJournalError());
    };
  }, [dispatch]);

  // =========================================================
  // GENERATE PREVIEW VOUCHER NUMBER
  // =========================================================

  useEffect(() => {
    try {
      const journals =
        JSON.parse(
          localStorage.getItem("journalVouchers") || "[]"
        );

      if (journals.length > 0) {
        const numbers = journals
          .map((item) => {
            const value = String(
              item.voucher_number || ""
            ).replace("JV-", "");

            return Number(value);
          })
          .filter((number) => !Number.isNaN(number));

        if (numbers.length > 0) {
          const maxNumber = Math.max(...numbers);

          setVoucherNumber(
            `JV-${String(maxNumber + 1).padStart(5, "0")}`
          );
        }
      }
    } catch (error) {
      console.error(
        "Voucher number preview error:",
        error
      );
    }
  }, []);

  // =========================================================
  // TOTAL DEBIT
  // =========================================================

  const totalDebit = useMemo(() => {
    return rows.reduce(
      (total, row) =>
        total + Number(row.debit || 0),
      0
    );
  }, [rows]);

  // =========================================================
  // TOTAL CREDIT
  // =========================================================

  const totalCredit = useMemo(() => {
    return rows.reduce(
      (total, row) =>
        total + Number(row.credit || 0),
      0
    );
  }, [rows]);

  // =========================================================
  // DIFFERENCE
  // =========================================================

  const difference = Math.abs(
    totalDebit - totalCredit
  );

  // =========================================================
  // BALANCED
  // =========================================================

  const isBalanced =
    totalDebit > 0 &&
    totalCredit > 0 &&
    Math.abs(totalDebit - totalCredit) < 0.001;

  // =========================================================
  // UPDATE ROW
  // =========================================================

  const updateRow = (id, field, value) => {
    setRows((currentRows) =>
      currentRows.map((row) => {
        if (row.id !== id) {
          return row;
        }

        // -----------------------------------------------
        // TYPE
        // -----------------------------------------------

        if (field === "type") {
          if (value === "By") {
            return {
              ...row,
              type: value,
              debit: row.debit || "",
              credit: "",
            };
          }

          if (value === "To") {
            return {
              ...row,
              type: value,
              debit: "",
              credit: row.credit || "",
            };
          }

          return {
            ...row,
            type: value,
            debit: "",
            credit: "",
          };
        }

        // -----------------------------------------------
        // DEBIT
        // -----------------------------------------------

        if (field === "debit") {
          return {
            ...row,
            debit: value,
            credit: "",
            type: "By",
          };
        }

        // -----------------------------------------------
        // CREDIT
        // -----------------------------------------------

        if (field === "credit") {
          return {
            ...row,
            credit: value,
            debit: "",
            type: "To",
          };
        }

        return {
          ...row,
          [field]: value,
        };
      })
    );
  };

  // =========================================================
  // ADD ROW
  // =========================================================

  const addRow = () => {
    setRows((currentRows) => [
      ...currentRows,
      {
        id: Date.now(),
        ledgerId: "",
        type: "",
        debit: "",
        credit: "",
      },
    ]);
  };

  // =========================================================
  // REMOVE ROW
  // =========================================================

  const removeRow = (id) => {
    if (rows.length <= 2) {
      return;
    }

    setRows((currentRows) =>
      currentRows.filter(
        (row) => row.id !== id
      )
    );
  };

  // =========================================================
  // CLEAR FORM
  // =========================================================

  const clearForm = () => {
    setVoucherDate(getToday());

    setNarration("");

    setSuccessMessage("");

    setRows([
      {
        id: 1,
        ledgerId: "",
        type: "",
        debit: "",
        credit: "",
      },
      {
        id: 2,
        ledgerId: "",
        type: "",
        debit: "",
        credit: "",
      },
    ]);

    dispatch(clearJournalError());
  };

  // =========================================================
  // SAVE JOURNAL
  // =========================================================

  const handleSave = async () => {
    setSuccessMessage("");

    // -----------------------------------------------
    // DATE VALIDATION
    // -----------------------------------------------

    if (!voucherDate) {
      alert("Please select voucher date.");
      return;
    }

    // -----------------------------------------------
    // REMOVE EMPTY ROWS
    // -----------------------------------------------

    const validRows = rows.filter(
      (row) =>
        row.ledgerId ||
        Number(row.debit || 0) > 0 ||
        Number(row.credit || 0) > 0
    );

    // -----------------------------------------------
    // MINIMUM TWO ENTRIES
    // -----------------------------------------------

    if (validRows.length < 2) {
      alert(
        "At least two journal entries are required."
      );
      return;
    }

    // -----------------------------------------------
    // VALIDATE EACH ROW
    // -----------------------------------------------

    for (const row of validRows) {
      if (!row.ledgerId) {
        alert(
          "Please select ledger for every entry."
        );
        return;
      }

      const debit = Number(row.debit || 0);
      const credit = Number(row.credit || 0);

      if (debit === 0 && credit === 0) {
        alert(
          "Every entry must have Debit or Credit amount."
        );
        return;
      }

      if (debit > 0 && credit > 0) {
        alert(
          "One entry cannot have both Debit and Credit."
        );
        return;
      }
    }

    // -----------------------------------------------
    // BALANCE VALIDATION
    // -----------------------------------------------

    if (!isBalanced) {
      alert(
        "Debit and Credit must be equal before saving."
      );
      return;
    }

    // -----------------------------------------------
    // API PAYLOAD
    // -----------------------------------------------

    const entries = validRows.map((row) => ({
      ledgerId: Number(row.ledgerId),
      debit: Number(row.debit || 0),
      credit: Number(row.credit || 0),
    }));

    try {
      const result = await dispatch(
        createJournalVoucher({
          voucherDate,
          narration: narration.trim(),
          entries,
        })
      ).unwrap();

      // -----------------------------------------------
      // SUCCESS
      // -----------------------------------------------

      setSuccessMessage(
        "Journal voucher saved successfully."
      );

      // -----------------------------------------------
      // LOCAL PREVIEW STORAGE
      // -----------------------------------------------

      try {
        const oldData =
          JSON.parse(
            localStorage.getItem(
              "journalVouchers"
            ) || "[]"
          );

        oldData.push(
          result?.data || {
            voucher_number: voucherNumber,
          }
        );

        localStorage.setItem(
          "journalVouchers",
          JSON.stringify(oldData)
        );
      } catch (error) {
        console.error(
          "Local storage error:",
          error
        );
      }

      // -----------------------------------------------
      // RESET
      // -----------------------------------------------

      setRows([
        {
          id: Date.now(),
          ledgerId: "",
          type: "",
          debit: "",
          credit: "",
        },
        {
          id: Date.now() + 1,
          ledgerId: "",
          type: "",
          debit: "",
          credit: "",
        },
      ]);

      setNarration("");

      setVoucherDate(getToday());

      // -----------------------------------------------
      // GO DAY BOOK
      // -----------------------------------------------

      setTimeout(() => {
        router.push("/daybook");
      }, 800);
    } catch (error) {
      console.error(
        "CREATE JOURNAL ERROR:",
        error
      );
    }
  };

  // =========================================================
  // FORMAT MONEY
  // =========================================================

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "28px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* ================================================= */}
        {/* PAGE HEADER */}
        {/* ================================================= */}

        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "22px 26px",
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "10px",
                background: "#2563eb",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "800",
                fontSize: "17px",
              }}
            >
              JV
            </div>

            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "26px",
                  fontWeight: "800",
                  color: "#0f172a",
                }}
              >
                Journal Voucher
              </h1>

              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "14px",
                  color: "#64748b",
                }}
              >
                Record debit and credit transactions
              </p>
            </div>
          </div>

          {/* VOUCHER NUMBER */}

          <div
            style={{
              minWidth: "180px",
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: "10px",
              padding: "12px 16px",
              textAlign: "right",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: "800",
                color: "#2563eb",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Voucher Number
            </div>

            <div
              style={{
                marginTop: "4px",
                fontSize: "20px",
                fontWeight: "800",
                color: "#0f172a",
              }}
            >
              {voucherNumber}
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* BASIC DETAILS */}
        {/* ================================================= */}

        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "20px 24px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "18px",
            }}
          >
            {/* DATE */}

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "7px",
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#334155",
                }}
              >
                Voucher Date
              </label>

              <input
                type="date"
                value={voucherDate}
                onChange={(e) =>
                  setVoucherDate(e.target.value)
                }
                style={{
                  width: "100%",
                  height: "42px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  padding: "0 12px",
                  fontSize: "14px",
                  color: "#0f172a",
                  outline: "none",
                }}
              />
            </div>

            {/* STATUS */}

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "7px",
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#334155",
                }}
              >
                Voucher Status
              </label>

              <div
                style={{
                  height: "42px",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 12px",
                  borderRadius: "8px",
                  border: `1px solid ${
                    isBalanced
                      ? "#bbf7d0"
                      : "#fed7aa"
                  }`,
                  background:
                    isBalanced
                      ? "#f0fdf4"
                      : "#fff7ed",
                  color:
                    isBalanced
                      ? "#15803d"
                      : "#c2410c",
                  fontWeight: "700",
                  fontSize: "14px",
                }}
              >
                {isBalanced
                  ? "✓ Balanced"
                  : "⚠ Not Balanced"}
              </div>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* JOURNAL ENTRIES */}
        {/* ================================================= */}

        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            overflow: "hidden",
            marginBottom: "20px",
          }}
        >
          {/* SECTION HEADER */}

          <div
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "15px",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "20px",
                  fontWeight: "800",
                  color: "#0f172a",
                }}
              >
                Journal Entries
              </h2>

              <p
                style={{
                  margin: "5px 0 0",
                  fontSize: "13px",
                  color: "#64748b",
                }}
              >
                Select ledger and enter To / By amount
              </p>
            </div>

            <button
              type="button"
              onClick={addRow}
              style={{
                border: "none",
                background: "#2563eb",
                color: "#ffffff",
                padding: "10px 16px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              + Add Row
            </button>
          </div>

          {/* ================================================= */}
          {/* TABLE */}
          {/* ================================================= */}

          <div
            style={{
              overflowX: "auto",
              width: "100%",
            }}
          >
            <table
              style={{
                width: "100%",
                minWidth: "900px",
                borderCollapse: "collapse",
                tableLayout: "fixed",
              }}
            >
              {/* ================================================= */}
              {/* COLUMN HEADERS */}
              {/* ================================================= */}

              <thead>
                <tr
                  style={{
                    background: "#f1f5f9",
                  }}
                >
                  <th
                    style={{
                      width: "55px",
                      padding: "14px 10px",
                      borderBottom:
                        "2px solid #cbd5e1",
                      color: "#334155",
                      fontSize: "13px",
                      fontWeight: "800",
                      textAlign: "center",
                    }}
                  >
                    #
                  </th>

                  <th
                    style={{
                      width: "28%",
                      padding: "14px 12px",
                      borderBottom:
                        "2px solid #cbd5e1",
                      color: "#334155",
                      fontSize: "13px",
                      fontWeight: "800",
                      textAlign: "left",
                    }}
                  >
                    Ledger Account
                  </th>

                  <th
                    style={{
                      width: "130px",
                      padding: "14px 12px",
                      borderBottom:
                        "2px solid #cbd5e1",
                      color: "#334155",
                      fontSize: "13px",
                      fontWeight: "800",
                      textAlign: "center",
                    }}
                  >
                    To / By
                  </th>

                  <th
                    style={{
                      width: "170px",
                      padding: "14px 12px",
                      borderBottom:
                        "2px solid #cbd5e1",
                      color: "#334155",
                      fontSize: "13px",
                      fontWeight: "800",
                      textAlign: "right",
                    }}
                  >
                    Debit
                  </th>

                  <th
                    style={{
                      width: "170px",
                      padding: "14px 12px",
                      borderBottom:
                        "2px solid #cbd5e1",
                      color: "#334155",
                      fontSize: "13px",
                      fontWeight: "800",
                      textAlign: "right",
                    }}
                  >
                    Credit
                  </th>

                  <th
                    style={{
                      width: "110px",
                      padding: "14px 12px",
                      borderBottom:
                        "2px solid #cbd5e1",
                      color: "#334155",
                      fontSize: "13px",
                      fontWeight: "800",
                      textAlign: "center",
                    }}
                  >
                    Action
                  </th>
                </tr>
              </thead>

              {/* ================================================= */}
              {/* TABLE BODY */}
              {/* ================================================= */}

              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.id}>
                    {/* NUMBER */}

                    <td
                      style={{
                        padding: "13px 10px",
                        borderBottom:
                          "1px solid #e2e8f0",
                        textAlign: "center",
                        fontWeight: "700",
                        color: "#64748b",
                      }}
                    >
                      {index + 1}
                    </td>

                    {/* LEDGER */}

                    <td
                      style={{
                        padding: "13px 12px",
                        borderBottom:
                          "1px solid #e2e8f0",
                      }}
                    >
                      <select
                        value={row.ledgerId}
                        onChange={(e) =>
                          updateRow(
                            row.id,
                            "ledgerId",
                            e.target.value
                          )
                        }
                        style={{
                          width: "100%",
                          height: "40px",
                          border:
                            "1px solid #cbd5e1",
                          borderRadius: "7px",
                          padding: "0 10px",
                          background: "#ffffff",
                          color: "#0f172a",
                          fontSize: "13px",
                        }}
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

                    {/* TO / BY */}

                    <td
                      style={{
                        padding: "13px 12px",
                        borderBottom:
                          "1px solid #e2e8f0",
                      }}
                    >
                      <select
                        value={row.type}
                        onChange={(e) =>
                          updateRow(
                            row.id,
                            "type",
                            e.target.value
                          )
                        }
                        style={{
                          width: "100%",
                          height: "40px",
                          border:
                            "1px solid #cbd5e1",
                          borderRadius: "7px",
                          padding: "0 8px",
                          background: "#ffffff",
                          color: "#0f172a",
                          fontSize: "13px",
                          fontWeight: "600",
                        }}
                      >
                        <option value="">
                          Select
                        </option>

                        <option value="To">
                          To
                        </option>

                        <option value="By">
                          By
                        </option>
                      </select>
                    </td>

                    {/* DEBIT */}

                    <td
                      style={{
                        padding: "13px 12px",
                        borderBottom:
                          "1px solid #e2e8f0",
                      }}
                    >
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.debit}
                        onChange={(e) =>
                          updateRow(
                            row.id,
                            "debit",
                            e.target.value
                          )
                        }
                        placeholder="0.00"
                        style={{
                          width: "100%",
                          height: "40px",
                          border:
                            "1px solid #cbd5e1",
                          borderRadius: "7px",
                          padding: "0 10px",
                          textAlign: "right",
                          fontSize: "13px",
                          color: "#0f172a",
                        }}
                      />
                    </td>

                    {/* CREDIT */}

                    <td
                      style={{
                        padding: "13px 12px",
                        borderBottom:
                          "1px solid #e2e8f0",
                      }}
                    >
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.credit}
                        onChange={(e) =>
                          updateRow(
                            row.id,
                            "credit",
                            e.target.value
                          )
                        }
                        placeholder="0.00"
                        style={{
                          width: "100%",
                          height: "40px",
                          border:
                            "1px solid #cbd5e1",
                          borderRadius: "7px",
                          padding: "0 10px",
                          textAlign: "right",
                          fontSize: "13px",
                          color: "#0f172a",
                        }}
                      />
                    </td>

                    {/* ACTION */}

                    <td
                      style={{
                        padding: "13px 12px",
                        borderBottom:
                          "1px solid #e2e8f0",
                        textAlign: "center",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          removeRow(row.id)
                        }
                        disabled={rows.length <= 2}
                        style={{
                          height: "38px",
                          padding: "0 12px",
                          borderRadius: "7px",
                          border: "1px solid #fecaca",
                          background:
                            rows.length <= 2
                              ? "#f8fafc"
                              : "#fef2f2",
                          color:
                            rows.length <= 2
                              ? "#94a3b8"
                              : "#dc2626",
                          fontSize: "12px",
                          fontWeight: "700",
                          cursor:
                            rows.length <= 2
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* ================================================= */}
              {/* TOTAL */}
              {/* ================================================= */}

              <tfoot>
                <tr
                  style={{
                    background: "#f8fafc",
                  }}
                >
                  <td
                    colSpan="3"
                    style={{
                      padding: "15px 12px",
                      textAlign: "right",
                      borderTop:
                        "2px solid #cbd5e1",
                      fontWeight: "800",
                      color: "#334155",
                    }}
                  >
                    Total
                  </td>

                  <td
                    style={{
                      padding: "15px 12px",
                      textAlign: "right",
                      borderTop:
                        "2px solid #cbd5e1",
                      fontWeight: "800",
                      color: "#0f172a",
                    }}
                  >
                    ₹ {formatMoney(totalDebit)}
                  </td>

                  <td
                    style={{
                      padding: "15px 12px",
                      textAlign: "right",
                      borderTop:
                        "2px solid #cbd5e1",
                      fontWeight: "800",
                      color: "#0f172a",
                    }}
                  >
                    ₹ {formatMoney(totalCredit)}
                  </td>

                  <td
                    style={{
                      borderTop:
                        "2px solid #cbd5e1",
                    }}
                  />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* ================================================= */}
        {/* BALANCE INFORMATION */}
        {/* ================================================= */}

        <div
          style={{
            background: isBalanced
              ? "#f0fdf4"
              : "#fff7ed",
            border: `1px solid ${
              isBalanced
                ? "#bbf7d0"
                : "#fed7aa"
            }`,
            borderRadius: "12px",
            padding: "16px 20px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "15px",
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: "800",
                  color: isBalanced
                    ? "#15803d"
                    : "#c2410c",
                  fontSize: "14px",
                }}
              >
                {isBalanced
                  ? "✓ Journal is balanced"
                  : "⚠ Journal is not balanced"}
              </div>

              <div
                style={{
                  marginTop: "4px",
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                Debit and Credit must be equal
              </div>
            </div>

            <div
              style={{
                textAlign: "right",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  fontWeight: "600",
                }}
              >
                Difference
              </div>

              <div
                style={{
                  marginTop: "3px",
                  fontSize: "18px",
                  fontWeight: "800",
                  color: isBalanced
                    ? "#15803d"
                    : "#dc2626",
                }}
              >
                ₹ {formatMoney(difference)}
              </div>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* NARRATION */}
        {/* ================================================= */}

        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "20px 24px",
            marginBottom: "20px",
          }}
        >
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "800",
              color: "#334155",
            }}
          >
            Narration
          </label>

          <textarea
            value={narration}
            onChange={(e) =>
              setNarration(e.target.value)
            }
            rows={3}
            placeholder="Enter reason / description for this journal voucher..."
            style={{
              width: "100%",
              resize: "vertical",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              padding: "12px",
              fontSize: "14px",
              color: "#0f172a",
              outline: "none",
            }}
          />
        </div>

        {/* ================================================= */}
        {/* SUCCESS */}
        {/* ================================================= */}

        {successMessage && (
          <div
            style={{
              marginBottom: "16px",
              padding: "13px 16px",
              borderRadius: "8px",
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              color: "#15803d",
              fontWeight: "700",
              fontSize: "14px",
            }}
          >
            ✓ {successMessage}
          </div>
        )}

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {journalError && (
          <div
            style={{
              marginBottom: "16px",
              padding: "13px 16px",
              borderRadius: "8px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              fontWeight: "700",
              fontSize: "14px",
            }}
          >
            ⚠ {journalError}
          </div>
        )}

        {/* ================================================= */}
        {/* ACTION BUTTONS */}
        {/* ================================================= */}

        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "18px 24px",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <button
            type="button"
            onClick={clearForm}
            disabled={journalLoading}
            style={{
              height: "44px",
              padding: "0 22px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              color: "#475569",
              fontSize: "14px",
              fontWeight: "800",
              cursor: "pointer",
            }}
          >
            Clear
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={
              journalLoading || !isBalanced
            }
            style={{
              height: "44px",
              padding: "0 28px",
              borderRadius: "8px",
              border: "none",
              background:
                journalLoading || !isBalanced
                  ? "#94a3b8"
                  : "#16a34a",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: "800",
              cursor:
                journalLoading || !isBalanced
                  ? "not-allowed"
                  : "pointer",
              boxShadow:
                journalLoading || !isBalanced
                  ? "none"
                  : "0 4px 10px rgba(22,163,74,0.2)",
            }}
          >
            {journalLoading
              ? "Saving..."
              : "Save Journal"}
          </button>
        </div>
      </div>
    </div>
  );
}