"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createPurchase } from "../../store/slices/purchaseSlice";
import { fetchStocks } from "../../store/slices/stockSlice";

const emptyItem = { stockId: "", quantity: "", rate: "" };

export default function PurchasePage() {
  const dispatch = useDispatch();

  const { stocks, loading: stockLoading } = useSelector(
    (state) => state.stock
  );

  const {
    loading: purchaseLoading,
    error: purchaseError,
    purchase,
  } = useSelector((state) => state.purchase);

  const [ledgers, setLedgers] = useState([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [voucherDate, setVoucherDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [supplierLedgerId, setSupplierLedgerId] = useState("");
  const [purchaseLedgerId, setPurchaseLedgerId] = useState("");
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
        rate: stock?.purchase_rate || "",
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

    if (!supplierLedgerId) {
      setMessage("Please select supplier ledger");
      return;
    }

    if (!purchaseLedgerId) {
      setMessage("Please select purchase ledger");
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
      setMessage("Purchase rate cannot be negative");
      return;
    }

    const purchaseData = {
      voucherDate,
      supplierLedgerId: Number(supplierLedgerId),
      purchaseLedgerId: Number(purchaseLedgerId),
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
      createPurchase(purchaseData)
    );

    if (createPurchase.fulfilled.match(result)) {
      setMessage(
        `Purchase voucher ${result.payload.voucher_number} created successfully`
      );

      setItem(emptyItem);
      setNarration("");
      dispatch(fetchStocks());
    }
  };

  const handleReset = () => {
    setSupplierLedgerId("");
    setPurchaseLedgerId("");
    setNarration("");
    setItem(emptyItem);
    setMessage("");
  };

  return (
    <div className="purchase-page">
      <div className="purchase-bg"></div>

      <main className="purchase-container">

        <header className="purchase-header">
          <div className="header-content">
            <div className="purchase-icon">PV</div>

            <div>
              <h1>Purchase Voucher</h1>
              <p>
                Create purchase voucher and automatically
                increase stock
              </p>
            </div>
          </div>

          {purchase?.voucher_number && (
            <div className="voucher-badge">
              {purchase.voucher_number}
            </div>
          )}
        </header>

        {(message || purchaseError) && (
          <div
            className={
              purchaseError
                ? "message error-message"
                : "message success-message"
            }
          >
            <span className="message-icon">
              {purchaseError ? "!" : "✓"}
            </span>

            <span>{purchaseError || message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <section className="section-card">

            <div className="section-heading">
              <div className="section-number">01</div>

              <div>
                <h2>Voucher Details</h2>
                <p>
                  Enter basic purchase transaction details
                </p>
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
                <label>Supplier Ledger</label>

                <select
                  value={supplierLedgerId}
                  onChange={(e) =>
                    setSupplierLedgerId(e.target.value)
                  }
                  disabled={ledgerLoading}
                >
                  <option value="">
                    Select Supplier
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
                <label>Purchase Ledger</label>

                <select
                  value={purchaseLedgerId}
                  onChange={(e) =>
                    setPurchaseLedgerId(e.target.value)
                  }
                  disabled={ledgerLoading}
                >
                  <option value="">
                    Select Purchase Ledger
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
                  placeholder="Purchase narration"
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
                  Select item and enter purchase quantity
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

              <div className="info-box current-box">
                <span>Current Stock</span>

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
                <label>Purchase Rate</label>

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
              <span>Total Purchase Amount</span>

              <small>
                Quantity × Purchase Rate
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
              disabled={purchaseLoading}
            >
              <span>
                {purchaseLoading ? "..." : "✓"}
              </span>

              {purchaseLoading
                ? "Saving Purchase..."
                : "Save Purchase"}
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

        .purchase-page { min-height: 100vh; padding: 24px; background: #07111f; color: #e8f1f7; font-family: Arial, sans-serif; position: relative; }

        .purchase-bg { position: fixed; inset: 0; pointer-events: none; background: radial-gradient(700px at 10% 0%, rgba(35, 126, 184, 0.12), transparent), radial-gradient(600px at 90% 100%, rgba(245, 158, 11, 0.06), transparent); }

        .purchase-container { position: relative; max-width: 1180px; width: 100%; margin: 0 auto; }

        .purchase-header { min-height: 96px; display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 20px 22px; margin-bottom: 18px; background: linear-gradient(100deg, #0c1c31, #183d82); border: 1px solid #3c83b7; border-radius: 10px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.28); }

        .header-content { display: flex; align-items: center; gap: 14px; }

        .purchase-icon { width: 52px; height: 52px; display: flex; align-items: center; justify-content: center; background: #f59e0b; color: #1c1303; border-radius: 8px; font-size: 16px; font-weight: 900; box-shadow: 0 5px 18px rgba(245, 158, 11, 0.18); }

        .purchase-header h1 { margin: 0; color: #f7fbff; font-size: 25px; font-weight: 800; }

        .purchase-header p { margin: 5px 0 0; color: #a9d0e7; font-size: 12px; }

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

        .current-box { border-color: #236a79; background: #09202b; }

        .current-box strong { color: #45d1c3; }

        .amount-box { border-color: #c27c08; background: #2a210e; }

        .amount-box strong { color: #ffc044; font-family: Consolas, monospace; font-size: 16px; }

        .total-card { min-height: 76px; display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 15px 20px; margin-bottom: 18px; background: linear-gradient(100deg, #123474, #1c438f); border: 1px solid #4b8bc0; border-radius: 8px; }

        .total-card span { display: block; color: #f0f7ff; font-size: 15px; font-weight: 700; }

        .total-card small { display: block; margin-top: 4px; color: #86acd0; font-size: 9px; }

        .total-card strong { color: #ffffff; font-family: Consolas, monospace; font-size: 19px; font-weight: 900; }

        .action-area { display: flex; align-items: center; gap: 9px; }

        .save-button, .reset-button { min-height: 43px; padding: 0 20px; border-radius: 6px; border: none; font-size: 12px; font-weight: 800; cursor: pointer; transition: 0.15s ease; }

        .save-button { display: flex; align-items: center; gap: 8px; background: #f59e0b; color: #211403; }

        .save-button:hover { background: #ffb51b; transform: translateY(-1px); }

        .save-button:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .save-button span { font-size: 12px; font-weight: 900; }

        .reset-button { background: #35475e; color: #d6e1eb; }

        .reset-button:hover { background: #465c75; }

        @media (max-width: 1050px) { .voucher-grid { grid-template-columns: repeat(2, 1fr); } .stock-grid { grid-template-columns: repeat(3, 1fr); } .item-field { grid-column: span 3; } }

        @media (max-width: 700px) { .purchase-page { padding: 14px; } .purchase-header { align-items: flex-start; flex-direction: column; } .voucher-badge { width: 100%; } .voucher-grid, .stock-grid { grid-template-columns: 1fr; } .item-field { grid-column: auto; } .section-card { padding: 15px; } .total-card { align-items: flex-start; flex-direction: column; } .total-card strong { font-size: 17px; } .action-area { width: 100%; } .save-button, .reset-button { flex: 1; } }

        @media (max-width: 450px) { .purchase-page { padding: 10px; } .purchase-header { padding: 15px; } .purchase-header h1 { font-size: 20px; } .purchase-icon { width: 44px; height: 44px; } .section-heading h2 { font-size: 17px; } }

      `}</style>
    </div>
  );
}