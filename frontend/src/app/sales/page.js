"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSales } from "../../store/slices/salesSlice";
import { fetchStocks } from "../../store/slices/stockSlice";

const emptyItem = { stockId: "", quantity: "", rate: "" };

export default function SalesPage() {
  const dispatch = useDispatch();

  const { stocks, loading: stockLoading } = useSelector(
    (state) => state.stock
  );

  const {
    loading: salesLoading,
    error: salesError,
    sales,
  } = useSelector((state) => state.sales);

  const [ledgers, setLedgers] = useState([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [voucherDate, setVoucherDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [partyLedgerId, setPartyLedgerId] = useState("");
  const [salesLedgerId, setSalesLedgerId] = useState("");
  const [narration, setNarration] = useState("");
  const [item, setItem] = useState(emptyItem);
  const [message, setMessage] = useState("");

  useEffect(() => {
    dispatch(fetchStocks());
    fetchLedgers();
  }, [dispatch]);

  const fetchLedgers = async () => {
    try {
      setLedgerLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/ledgers"
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to fetch ledgers"
        );
      }

      setLedgers(result.data || []);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLedgerLoading(false);
    }
  };

  const selectedStock = useMemo(
    () =>
      stocks.find(
        (stock) =>
          Number(stock.id) === Number(item.stockId)
      ),
    [stocks, item.stockId]
  );

  const amount = useMemo(() => {
    const quantity = Number(item.quantity || 0);
    const rate = Number(item.rate || 0);
    return quantity * rate;
  }, [item.quantity, item.rate]);

  const handleItemChange = (e) => {
    const { name, value } = e.target;

    if (name === "stockId") {
      const stock = stocks.find(
        (row) => Number(row.id) === Number(value)
      );

      setItem({
        stockId: value,
        quantity: "",
        rate: stock?.sales_rate || "",
      });

      return;
    }

    setItem((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!voucherDate) {
      setMessage("Voucher date is required");
      return;
    }

    if (!partyLedgerId) {
      setMessage("Please select party ledger");
      return;
    }

    if (!salesLedgerId) {
      setMessage("Please select sales ledger");
      return;
    }

    if (!item.stockId) {
      setMessage("Please select a stock item");
      return;
    }

    const quantity = Number(item.quantity);
    const rate = Number(item.rate);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setMessage("Quantity must be greater than zero");
      return;
    }

    if (!Number.isFinite(rate) || rate < 0) {
      setMessage("Rate cannot be negative");
      return;
    }

    if (
      selectedStock &&
      quantity > Number(selectedStock.current_qty)
    ) {
      setMessage(
        `Insufficient stock. Available: ${selectedStock.current_qty} ${selectedStock.unit || ""}`
      );
      return;
    }

    const salesData = {
      voucherDate,
      partyLedgerId: Number(partyLedgerId),
      salesLedgerId: Number(salesLedgerId),
      narration,
      items: [
        {
          stockId: Number(item.stockId),
          quantity,
          rate,
        },
      ],
    };

    const result = await dispatch(
      createSales(salesData)
    );

    if (createSales.fulfilled.match(result)) {
      setMessage(
        `Sales voucher ${result.payload.voucher_number} created successfully`
      );

      setItem(emptyItem);
      setNarration("");
      dispatch(fetchStocks());
    }
  };

  const handleReset = () => {
    setPartyLedgerId("");
    setSalesLedgerId("");
    setNarration("");
    setItem(emptyItem);
    setMessage("");
  };

  return (
    <div className="sales-page">
      <div className="sales-bg"></div>

      <main className="sales-container">

        <header className="sales-header">
          <div className="header-content">
            <div className="sales-icon">SV</div>

            <div>
              <h1>Sales Voucher</h1>
              <p>
                Create sales voucher and automatically
                reduce stock
              </p>
            </div>
          </div>

          {sales?.voucher_number && (
            <div className="voucher-badge">
              {sales.voucher_number}
            </div>
          )}
        </header>

        {(message || salesError) && (
          <div
            className={
              salesError
                ? "message error-message"
                : "message success-message"
            }
          >
            <span className="message-icon">
              {salesError ? "!" : "✓"}
            </span>
            <span>{salesError || message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <section className="section-card">

            <div className="section-heading">
              <div className="section-number">01</div>

              <div>
                <h2>Voucher Details</h2>
                <p>Enter basic sales transaction details</p>
              </div>
            </div>

            <div className="voucher-grid">

              <div className="field">
                <label>Voucher Date</label>

                <input
                  type="date"
                  value={voucherDate}
                  onChange={(e) =>
                    setVoucherDate(e.target.value)
                  }
                />
              </div>

              <div className="field">
                <label>Party Ledger</label>

                <select
                  value={partyLedgerId}
                  onChange={(e) =>
                    setPartyLedgerId(e.target.value)
                  }
                  disabled={ledgerLoading}
                >
                  <option value="">
                    Select Party
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

              <div className="field">
                <label>Sales Ledger</label>

                <select
                  value={salesLedgerId}
                  onChange={(e) =>
                    setSalesLedgerId(e.target.value)
                  }
                  disabled={ledgerLoading}
                >
                  <option value="">
                    Select Sales Ledger
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

              <div className="field">
                <label>Narration</label>

                <input
                  type="text"
                  value={narration}
                  onChange={(e) =>
                    setNarration(e.target.value)
                  }
                  placeholder="Sales narration"
                />
              </div>

            </div>
          </section>

          <section className="section-card">

            <div className="section-heading">
              <div className="section-number">02</div>

              <div>
                <h2>Stock Item</h2>
                <p>
                  Select item and enter sales quantity
                </p>
              </div>
            </div>

            <div className="stock-grid">

              <div className="field item-field">
                <label>Stock Item</label>

                <select
                  name="stockId"
                  value={item.stockId}
                  onChange={handleItemChange}
                  disabled={stockLoading}
                >
                  <option value="">
                    Select Item
                  </option>

                  {stocks
                    .filter(
                      (stock) =>
                        Number(stock.is_active) === 1
                    )
                    .map((stock) => (
                      <option
                        key={stock.id}
                        value={stock.id}
                      >
                        {stock.item_code} -{" "}
                        {stock.item_name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="info-box">
                <span>Unit</span>
                <strong>
                  {selectedStock?.unit || "-"}
                </strong>
              </div>

              <div className="info-box available-box">
                <span>Available Stock</span>
                <strong>
                  {selectedStock?.current_qty ?? "-"}
                </strong>
              </div>

              <div className="field">
                <label>Quantity</label>

                <input
                  type="number"
                  name="quantity"
                  min="0"
                  step="0.001"
                  value={item.quantity}
                  onChange={handleItemChange}
                  placeholder="0"
                />
              </div>

              <div className="field">
                <label>Rate</label>

                <input
                  type="number"
                  name="rate"
                  min="0"
                  step="0.01"
                  value={item.rate}
                  onChange={handleItemChange}
                  placeholder="0.00"
                />
              </div>

              <div className="amount-box">
                <span>Amount</span>
                <strong>
                  ₹ {amount.toFixed(2)}
                </strong>
              </div>

            </div>

          </section>

          <section className="total-card">

            <div>
              <span>Total Sales Amount</span>
              <small>
                Quantity × Sales Rate
              </small>
            </div>

            <strong>
              ₹ {amount.toFixed(2)}
            </strong>

          </section>

          <div className="action-area">

            <button
              type="submit"
              className="save-button"
              disabled={salesLoading}
            >
              <span>
                {salesLoading ? "..." : "✓"}
              </span>

              {salesLoading
                ? "Saving Sales..."
                : "Save Sales"}
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

      </main>

      <style>{`

        * { box-sizing: border-box; }

        .sales-page { min-height: 100vh; padding: 24px; background: #07111f; color: #e8f1f7; font-family: Arial, sans-serif; position: relative; }

.sales-bg { position: fixed; inset: 0; pointer-events: none; background: radial-gradient(700px at 10% 0%, rgba(35, 126, 184, 0.12), transparent), radial-gradient(600px at 90% 100%, rgba(20, 184, 166, 0.06), transparent); }
.sales-container { position: relative; max-width: 1180px; width: 100%; margin: 0 auto; }
.sales-header { min-height: 96px; display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 20px 22px; margin-bottom: 18px; background: linear-gradient(100deg, #0c1c31, #183d82); border: 1px solid #3c83b7; border-radius: 10px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.28); }
.header-content { display: flex; align-items: center; gap: 14px; }
.sales-icon { width: 52px; height: 52px; display: flex; align-items: center; justify-content: center; background: #19b6dc; color: #061522; border-radius: 8px; font-size: 16px; font-weight: 900; box-shadow: 0 5px 18px rgba(25, 182, 220, 0.2); }
.sales-header h1 { margin: 0; color: #f7fbff; font-size: 25px; font-weight: 800; }
.sales-header p { margin: 5px 0 0; color: #a9d0e7; font-size: 12px; }

.voucher-badge { padding: 10px 16px; background: #0d293d; border: 1px solid #35c1e8; border-radius: 6px; color: #55d2f4; font-family: Consolas, monospace; font-size: 13px; font-weight: 900; }

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

.stock-grid { display: grid; grid-template-columns: 2fr 0.8fr 1fr 0.9fr 0.9fr 1.1fr; gap: 12px; align-items: end; }

.field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }

.field label, .info-box span, .amount-box span { color: #86a6c0; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; }

.field input, .field select { width: 100%; height: 43px; padding: 0 12px; background: #081329; color: #e7f0f7; border: 1px solid #304964; border-radius: 5px; outline: none; font-size: 12px; font-family: Arial, sans-serif; }

.field input::placeholder { color: #40556a; }

.field input:focus, .field select:focus { border-color: #29a9d4; box-shadow: 0 0 0 2px rgba(41, 169, 212, 0.08); }

.field select option { background: #0b172a; color: white; }

.field input:disabled, .field select:disabled { opacity: 0.55; cursor: not-allowed; }

.info-box, .amount-box { min-width: 0; height: 69px; display: flex; flex-direction: column; justify-content: center; gap: 7px; padding: 10px 12px; background: #09172a; border: 1px solid #263e55; border-radius: 5px; }

.info-box strong { color: #d9e7f1; font-family: Consolas, monospace; font-size: 14px; }

.available-box { border-color: #236a79; background: #09202b; }

.available-box strong { color: #45d1c3; }

.amount-box { border-color: #2387a5; background: #0b2638; }

.amount-box strong { color: #51cdef; font-family: Consolas, monospace; font-size: 16px; }

.total-card { min-height: 76px; display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 15px 20px; margin-bottom: 18px; background: linear-gradient(100deg, #123474, #1c438f); border: 1px solid #4b8bc0; border-radius: 8px; }

        .total-card span { display: block; color: #f0f7ff; font-size: 15px; font-weight: 700; }

.total-card small { display: block; margin-top: 4px; color: #86acd0; font-size: 9px; }

.total-card strong { color: #ffffff; font-family: Consolas, monospace; font-size: 19px; font-weight: 900; }

.action-area { display: flex; align-items: center; gap: 9px; }

.save-button, .reset-button { min-height: 43px; padding: 0 20px; border-radius: 6px; border: none; font-size: 12px; font-weight: 800; cursor: pointer; transition: 0.15s ease; }

.save-button { display: flex; align-items: center; gap: 8px; background: #10afd1; color: #04131c; }

.save-button:hover { background: #25c3e4; transform: translateY(-1px); }

.save-button:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

.save-button span { font-size: 12px; font-weight: 900; }

.reset-button { background: #35475e; color: #d6e1eb; }

.reset-button:hover { background: #465c75; }

@media (max-width: 1050px) { .voucher-grid { grid-template-columns: repeat(2, 1fr); } .stock-grid { grid-template-columns: repeat(3, 1fr); } .item-field { grid-column: span 3; } }

@media (max-width: 700px) { .sales-page { padding: 14px; } .sales-header { align-items: flex-start; flex-direction: column; } .voucher-badge { width: 100%; } .voucher-grid, .stock-grid { grid-template-columns: 1fr; } .item-field { grid-column: auto; } .section-card { padding: 15px; } .total-card { align-items: flex-start; flex-direction: column; } .total-card strong { font-size: 17px; } .action-area { width: 100%; } .save-button, .reset-button { flex: 1; } }

@media (max-width: 450px) { .sales-page { padding: 10px; } .sales-header { padding: 15px; } .sales-header h1 { font-size: 20px; } .sales-icon { width: 44px; height: 44px; } .section-heading h2 { font-size: 17px; } }

      `}</style>
    </div>
  );
}