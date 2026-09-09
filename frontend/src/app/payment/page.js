"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearPayment, createPayment } from "../../store/slices/paymentSlice";

export default function PaymentPage() {
  const dispatch = useDispatch();

  const { payment, loading, error } = useSelector(
    (state) => state.payment
  );

  const [ledgers, setLedgers] = useState([]);
  const [loadingLedgers, setLoadingLedgers] = useState(true);

  const [form, setForm] = useState({
    voucherDate: new Date().toISOString().split("T")[0],
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

      const response = await fetch("http://localhost:5000/api/ledgers");
      const result = await response.json();

      if (result.success) {
        setLedgers(result.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch ledgers:", error);
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

    if (!form.voucherDate) return;
    if (!form.expenseLedgerId) return;
    if (!form.bankLedgerId) return;
    if (!form.amount || Number(form.amount) <= 0) return;

    await dispatch(
      createPayment({
        voucherDate: form.voucherDate,
        narration: form.narration,
        expenseLedgerId: Number(form.expenseLedgerId),
        bankLedgerId: Number(form.bankLedgerId),
        amount: Number(form.amount),
      })
    );
  };

  const handleReset = () => {
    setForm({
      voucherDate: new Date().toISOString().split("T")[0],
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
        voucherDate: new Date().toISOString().split("T")[0],
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
    <div className="payment-page">
      <div className="payment-container">

        <header className="payment-header">
          <div className="header-content">
            <div className="payment-icon">PM</div>

            <div>
              <h1>Payment Voucher</h1>
              <p>Record payments made to parties or expenses</p>
            </div>
          </div>

          {payment?.data?.voucher_number && (
            <div className="voucher-badge">
              {payment.data.voucher_number}
            </div>
          )}
        </header>

        {error && (
          <div className="message error-message">
            <span className="message-icon">!</span>
            <span>{error}</span>
          </div>
        )}

        {payment?.success && (
          <div className="message success-message">
            <span className="message-icon">✓</span>
            <span>
              Payment Voucher{" "}
              <strong>{payment.data?.voucher_number}</strong>{" "}
              created successfully.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <section className="section-card">

            <div className="section-heading">
              <div className="section-number">01</div>

              <div>
                <h2>Voucher Details</h2>
                <p>Enter payment transaction details</p>
              </div>
            </div>

            <div className="voucher-grid">

              <div className="field">
                <label>Voucher Date</label>

                <input
                  type="date"
                  name="voucherDate"
                  value={form.voucherDate}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label>Expense / Party Ledger</label>

                <select
                  name="expenseLedgerId"
                  value={form.expenseLedgerId}
                  onChange={handleChange}
                  disabled={loadingLedgers}
                >
                  <option value="">
                    Select Expense / Party Ledger
                  </option>

                  {ledgers.map((ledger) => (
                    <option key={ledger.id} value={ledger.id}>
                      {ledger.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Bank / Cash Ledger</label>

                <select
                  name="bankLedgerId"
                  value={form.bankLedgerId}
                  onChange={handleChange}
                  disabled={loadingLedgers}
                >
                  <option value="">
                    Select Bank / Cash Ledger
                  </option>

                  {ledgers.map((ledger) => (
                    <option key={ledger.id} value={ledger.id}>
                      {ledger.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Amount</label>

                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="Enter amount"
                />
              </div>

            </div>

            <div className="narration-field">
              <div className="field">
                <label>Narration</label>

                <input
                  type="text"
                  name="narration"
                  value={form.narration}
                  onChange={handleChange}
                  placeholder="Payment narration"
                />
              </div>
            </div>

          </section>

          <section className="amount-card">

            <div className="amount-content">
              <div className="amount-icon">₹</div>

              <div>
                <span>Payment Amount</span>
                <small>Amount paid to party or expense</small>
              </div>
            </div>

            <strong>
              ₹ {Number(form.amount || 0).toFixed(2)}
            </strong>

          </section>

          <div className="action-area">

            <button
              type="submit"
              className="save-button"
              disabled={loading}
            >
              <span>{loading ? "..." : "✓"}</span>
              {loading ? "Saving Payment..." : "Save Payment"}
            </button>

            <button
              type="button"
              className="reset-button"
              onClick={handleReset}
            >
              Reset
            </button>

          </div>

        </form>

      </div>

      <style>{`

        * { box-sizing: border-box; }

        .payment-page { min-height: 100vh; padding: 24px; background: #07111f; color: #e8f1f7; font-family: Arial, sans-serif; }

        .payment-container { max-width: 1180px; width: 100%; margin: 0 auto; }

        .payment-header { min-height: 96px; display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 20px 22px; margin-bottom: 18px; background: linear-gradient(100deg, #0c1c31, #183d82); border: 1px solid #3c83b7; border-radius: 10px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.28); }

        .header-content { display: flex; align-items: center; gap: 14px; }

        .payment-icon { width: 52px; height: 52px; display: flex; align-items: center; justify-content: center; background: #f59e0b; color: #211403; border-radius: 8px; font-size: 14px; font-weight: 900; box-shadow: 0 5px 18px rgba(245, 158, 11, 0.18); }

        .payment-header h1 { margin: 0; color: #f7fbff; font-size: 25px; font-weight: 800; }

        .payment-header p { margin: 5px 0 0; color: #a9d0e7; font-size: 12px; }

        .voucher-badge { padding: 10px 16px; background: #30220a; border: 1px solid #d18b0a; border-radius: 6px; color: #ffc44d; font-family: Consolas, monospace; font-size: 13px; font-weight: 900; }

        .message { display: flex; align-items: center; gap: 10px; padding: 12px 15px; margin-bottom: 18px; border-radius: 7px; font-size: 12px; font-weight: 700; }

        .success-message { background: #0a3028; border: 1px solid #19826b; color: #63ddc0; }

        .error-message { background: #39171c; border: 1px solid #8d333e; color: #ff919b; }

        .message-icon { width: 21px; height: 21px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border-radius: 50%; background: rgba(255, 255, 255, 0.08); font-size: 11px; }

        .section-card { padding: 20px; margin-bottom: 18px; background: #0d1c35; border: 1px solid #285a82; border-radius: 10px; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2); }

        .section-heading { display: flex; align-items: center; gap: 11px; margin-bottom: 18px; }

        .section-number { width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; background: #123d63; border: 1px solid #267ba7; border-radius: 6px; color: #53c8ee; font-family: Consolas, monospace; font-size: 10px; font-weight: 900; }

        .section-heading h2 { margin: 0; color: #a8d2ff; font-size: 20px; font-weight: 700; }

        .section-heading p { margin: 3px 0 0; color: #668199; font-size: 10px; }

        .voucher-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }

        .narration-field { margin-top: 14px; }

        .field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }

        .field label { color: #86a6c0; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; }

        .field input, .field select { width: 100%; height: 43px; padding: 0 12px; background: #081329; color: #e7f0f7; border: 1px solid #304964; border-radius: 5px; outline: none; font-size: 12px; font-family: Arial, sans-serif; }

        .field input::placeholder { color: #40556a; }

        .field input:focus, .field select:focus { border-color: #29a9d4; box-shadow: 0 0 0 2px rgba(41, 169, 212, 0.08); }

        .field select option { background: #0b172a; color: white; }

        .field input:disabled, .field select:disabled { opacity: 0.55; cursor: not-allowed; }

        .amount-card { min-height: 82px; display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 15px 20px; margin-bottom: 18px; background: linear-gradient(100deg, #123474, #1c438f); border: 1px solid #4b8bc0; border-radius: 8px; }

        .amount-content { display: flex; align-items: center; gap: 12px; }

        .amount-icon { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: #f59e0b; color: #211403; border-radius: 6px; font-size: 17px; font-weight: 900; }

        .amount-content span { display: block; color: #f0f7ff; font-size: 15px; font-weight: 700; }

        .amount-content small { display: block; margin-top: 4px; color: #86acd0; font-size: 9px; }

        .amount-card > strong { color: #ffffff; font-family: Consolas, monospace; font-size: 20px; font-weight: 900; }

        .action-area { display: flex; align-items: center; gap: 9px; }

        .save-button, .reset-button { min-height: 43px; padding: 0 20px; border-radius: 6px; border: none; font-size: 12px; font-weight: 800; cursor: pointer; transition: 0.15s ease; }

        .save-button { display: flex; align-items: center; gap: 8px; background: #f59e0b; color: #211403; }

        .save-button:hover { background: #ffb51b; transform: translateY(-1px); }

        .save-button:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .reset-button { background: #35475e; color: #d6e1eb; }

        .reset-button:hover { background: #465c75; }

        @media (max-width: 900px) { .voucher-grid { grid-template-columns: repeat(2, 1fr); } }

        @media (max-width: 650px) { .payment-page { padding: 14px; } .payment-header { align-items: flex-start; flex-direction: column; } .voucher-badge { width: 100%; } .voucher-grid { grid-template-columns: 1fr; } .section-card { padding: 15px; } .amount-card { align-items: flex-start; flex-direction: column; } .action-area { width: 100%; } .save-button, .reset-button { flex: 1; } }

        @media (max-width: 420px) { .payment-page { padding: 10px; } .payment-header { padding: 15px; } .payment-header h1 { font-size: 20px; } .payment-icon { width: 44px; height: 44px; } .section-heading h2 { font-size: 17px; } }

      `}</style>
    </div>
  );
}