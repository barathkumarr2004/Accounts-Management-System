"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {clearPayment,createPayment} from "../../store/slices/paymentSlice";

export default function PaymentPage() {
  const dispatch = useDispatch();

  const {
    payment,
    loading,
    error,
  } = useSelector((state) => state.payment);

  const [ledgers, setLedgers] = useState([]);
  const [loadingLedgers, setLoadingLedgers] = useState(true);

  const [form, setForm] = useState({
    voucherDate: new Date()
      .toISOString()
      .split("T")[0],
    expenseLedgerId: "",
    bankLedgerId: "",
    amount: "",
    narration: "",
  });

  useEffect(() => {
    fetchLedgers();
  }, []);

  const fetchLedgers = async () => {
    try {
      setLoadingLedgers(true);

      const response = await fetch(
        "http://localhost:5000/api/ledgers"
      );

      const result = await response.json();

      if (result.success) {
        setLedgers(result.data || []);
      }
    } catch (error) {
      console.error(
        "Failed to fetch ledgers:",
        error
      );
    } finally {
      setLoadingLedgers(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.voucherDate) {
      return;
    }

    if (!form.expenseLedgerId) {
      return;
    }

    if (!form.bankLedgerId) {
      return;
    }

    if (
      !form.amount ||
      Number(form.amount) <= 0
    ) {
      return;
    }

    await dispatch(
      createPayment({
        voucherDate: form.voucherDate,
        narration: form.narration,
        expenseLedgerId: Number(
          form.expenseLedgerId
        ),
        bankLedgerId: Number(
          form.bankLedgerId
        ),
        amount: Number(form.amount),
      })
    );
  };

  const handleReset = () => {
    setForm({
      voucherDate: new Date()
        .toISOString()
        .split("T")[0],
      expenseLedgerId: "",
      bankLedgerId: "",
      amount: "",
      narration: "",
    });

    dispatch(clearPayment());
  };

  useEffect(() => {
    if (payment?.success) {
      setForm({
        voucherDate: new Date()
          .toISOString()
          .split("T")[0],
        expenseLedgerId: "",
        bankLedgerId: "",
        amount: "",
        narration: "",
      });

      const timer = setTimeout(() => {
        dispatch(clearPayment());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [payment, dispatch]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            Payment Voucher
          </h1>

          <p style={styles.subtitle}>
            Record payments made to parties or
            expenses
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>
              Voucher Details
            </h2>

            <div style={styles.grid}>
              <div style={styles.field}>
                <label style={styles.label}>
                  Voucher Date
                </label>

                <input
                  type="date"
                  name="voucherDate"
                  value={form.voucherDate}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Expense / Party Ledger
                </label>

                <select
                  name="expenseLedgerId"
                  value={form.expenseLedgerId}
                  onChange={handleChange}
                  style={styles.input}
                  disabled={loadingLedgers}
                >
                  <option value="">
                    Select Expense / Party Ledger
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
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Bank / Cash Ledger
                </label>

                <select
                  name="bankLedgerId"
                  value={form.bankLedgerId}
                  onChange={handleChange}
                  style={styles.input}
                  disabled={loadingLedgers}
                >
                  <option value="">
                    Select Bank / Cash Ledger
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
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Amount
                </label>

                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="Enter amount"
                  style={styles.input}
                />
              </div>

              <div
                style={{
                  ...styles.field,
                  gridColumn: "1 / -1",
                }}
              >
                <label style={styles.label}>
                  Narration
                </label>

                <input
                  type="text"
                  name="narration"
                  value={form.narration}
                  onChange={handleChange}
                  placeholder="Payment narration"
                  style={styles.input}
                />
              </div>
            </div>
          </div>

          <div style={styles.amountCard}>
            <span style={styles.amountLabel}>
              Payment Amount
            </span>

            <strong style={styles.amountValue}>
              ₹{Number(form.amount || 0).toFixed(2)}
            </strong>
          </div>

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          {payment?.success && (
            <div style={styles.success}>
              Payment Voucher{" "}
              <strong>
                {payment.data?.voucher_number}
              </strong>{" "}
              created successfully.
            </div>
          )}

          <div style={styles.buttons}>
            <button
              type="submit"
              disabled={loading}
              style={styles.saveButton}
            >
              {loading
                ? "Saving..."
                : "Save Payment"}
            </button>

            <button
              type="button"
              onClick={handleReset}
              style={styles.resetButton}
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0b122e",
    color: "#fff",
    padding: "30px",
  },

  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },

  header: {
    background:
      "linear-gradient(135deg, #172554, #1e3a8a)",
    border: "1px solid #60a5fa",
    borderRadius: "10px",
    padding: "25px",
    marginBottom: "18px",
  },

  title: {
    margin: 0,
    fontSize: "26px",
    fontWeight: "600",
  },

  subtitle: {
    margin: "8px 0 0",
    color: "#bfdbfe",
  },

  card: {
    background: "#131d42",
    border: "1px solid #3b82f6",
    borderRadius: "10px",
    padding: "25px",
  },

  sectionTitle: {
    margin: "0 0 20px",
    color: "#93c5fd",
    fontSize: "22px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "20px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  label: {
    fontSize: "14px",
    color: "#bfdbfe",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    background: "#080f2b",
    color: "#fff",
    border: "1px solid #475569",
    borderRadius: "5px",
    padding: "11px",
    outline: "none",
  },

  amountCard: {
    marginTop: "18px",
    background: "#1e3a8a",
    border: "1px solid #60a5fa",
    borderRadius: "8px",
    padding: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  amountLabel: {
    fontSize: "16px",
    fontWeight: "600",
  },

  amountValue: {
    fontSize: "20px",
  },

  buttons: {
    display: "flex",
    gap: "10px",
    marginTop: "18px",
  },

  saveButton: {
    border: "none",
    borderRadius: "6px",
    padding: "12px 22px",
    background: "#f59e0b",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
  },

  resetButton: {
    border: "none",
    borderRadius: "6px",
    padding: "12px 22px",
    background: "#475569",
    color: "#fff",
    cursor: "pointer",
  },

  success: {
    marginTop: "15px",
    padding: "12px",
    borderRadius: "6px",
    background: "#14532d",
    border: "1px solid #22c55e",
    color: "#bbf7d0",
  },

  error: {
    marginTop: "15px",
    padding: "12px",
    borderRadius: "6px",
    background: "#450a0a",
    border: "1px solid #ef4444",
    color: "#fecaca",
  },
};