"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { createSales } from "../../store/slices/salesSlice";
import { fetchStocks } from "../../store/slices/stockSlice";

const emptyItem = {
  stockId: "",
  quantity: "",
  rate: "",
};

export default function SalesPage() {
  const dispatch = useDispatch();

  const {
    stocks,
    loading: stockLoading,
  } = useSelector((state) => state.stock);

  const {
    loading: salesLoading,
    error: salesError,
    sales,
  } = useSelector((state) => state.sales);

  const [ledgers, setLedgers] = useState([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  const [voucherDate, setVoucherDate] =
    useState(
      new Date().toISOString().split("T")[0]
    );

  const [partyLedgerId, setPartyLedgerId] =
    useState("");

  const [salesLedgerId, setSalesLedgerId] =
    useState("");

  const [narration, setNarration] =
    useState("");

  const [item, setItem] =
    useState(emptyItem);

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

  const selectedStock = useMemo(() => {
    return stocks.find(
      (stock) =>
        Number(stock.id) === Number(item.stockId)
    );
  }, [stocks, item.stockId]);

  const amount = useMemo(() => {
    const quantity = Number(item.quantity || 0);
    const rate = Number(item.rate || 0);

    return quantity * rate;
  }, [item.quantity, item.rate]);

  const handleItemChange = (e) => {
    const { name, value } = e.target;

    setItem((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "stockId") {
      const stock = stocks.find(
        (row) => Number(row.id) === Number(value)
      );

      if (stock) {
        setItem((prev) => ({
          ...prev,
          stockId: value,
          rate: stock.sales_rate || "",
        }));
      }
    }
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
      setMessage(
        "Quantity must be greater than zero"
      );
      return;
    }

    if (!Number.isFinite(rate) || rate < 0) {
      setMessage("Rate cannot be negative");
      return;
    }

    if (selectedStock && quantity > Number(selectedStock.current_qty)) {
        setMessage(`Insufficient stock. Available: ${selectedStock.current_qty} ${selectedStock.unit || ""}`);
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

  const partyLedgers = ledgers;

  const salesLedgers = ledgers;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            Sales Voucher
          </h1>

          <p style={styles.subtitle}>
            Create sales and automatically reduce stock
          </p>
        </div>

        {sales?.voucher_number && (
          <div style={styles.voucherBadge}>
            {sales.voucher_number}
          </div>
        )}
      </div>

      {(message || salesError) && (
        <div
          style={
            salesError
              ? styles.error
              : styles.success
          }
        >
          {salesError || message}
        </div>
      )}

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
                value={voucherDate}
                onChange={(e) =>
                  setVoucherDate(e.target.value)
                }
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Party Ledger
              </label>

              <select
                value={partyLedgerId}
                onChange={(e) =>
                  setPartyLedgerId(e.target.value)
                }
                style={styles.input}
                disabled={ledgerLoading}
              >
                <option value="">
                  Select Party
                </option>

                {partyLedgers.map((ledger) => (
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
                Sales Ledger
              </label>

              <select
                value={salesLedgerId}
                onChange={(e) =>
                  setSalesLedgerId(e.target.value)
                }
                style={styles.input}
                disabled={ledgerLoading}
              >
                <option value="">
                  Select Sales Ledger
                </option>

                {salesLedgers.map((ledger) => (
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
                Narration
              </label>

              <input
                type="text"
                value={narration}
                onChange={(e) =>
                  setNarration(e.target.value)
                }
                placeholder="Sales narration"
                style={styles.input}
              />
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>
            Stock Item
          </h2>

          <div style={styles.itemGrid}>
            <div style={styles.field}>
              <label style={styles.label}>
                Item
              </label>

              <select
                name="stockId"
                value={item.stockId}
                onChange={handleItemChange}
                style={styles.input}
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

            <div style={styles.stockInfo}>
              <span style={styles.infoLabel}>
                Unit
              </span>

              <strong>
                {selectedStock?.unit || "-"}
              </strong>
            </div>

            <div style={styles.stockInfo}>
              <span style={styles.infoLabel}>
                Available
              </span>

              <strong>
               {selectedStock?.current_qty ?? "-"}
              </strong>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Quantity
              </label>

              <input
                type="number"
                name="quantity"
                min="0"
                step="0.001"
                value={item.quantity}
                onChange={handleItemChange}
                style={styles.input}
                placeholder="0"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Rate
              </label>

              <input
                type="number"
                name="rate"
                min="0"
                step="0.01"
                value={item.rate}
                onChange={handleItemChange}
                style={styles.input}
                placeholder="0.00"
              />
            </div>

            <div style={styles.amountBox}>
              <span style={styles.infoLabel}>
                Amount
              </span>

              <strong>
                ₹{amount.toFixed(2)}
              </strong>
            </div>
          </div>
        </div>

        <div style={styles.totalCard}>
          <span>Total Sales Amount</span>

          <strong>
            ₹{amount.toFixed(2)}
          </strong>
        </div>

        <div style={styles.actions}>
          <button
            type="submit"
            style={styles.saveButton}
            disabled={salesLoading}
          >
            {salesLoading
              ? "Saving..."
              : "Save Sales"}
          </button>

          <button
            type="button"
            style={styles.resetButton}
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#0b122e",
    color: "white",
    padding: "20px",
    fontFamily: "Arial",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background:
      "linear-gradient(90deg, #0b122e, #1e3a8a)",
    border: "1px solid #60a5fa",
    borderRadius: "10px",
    padding: "20px",
    marginBottom: "20px",
  },

  title: {
    margin: 0,
    fontSize: "28px",
  },

  subtitle: {
    margin: "6px 0 0",
    color: "#bfdbfe",
  },

  voucherBadge: {
    background: "#06b6d4",
    padding: "10px 16px",
    borderRadius: "6px",
    fontWeight: "bold",
  },

  success: {
    background: "#14532d",
    border: "1px solid #22c55e",
    padding: "12px",
    borderRadius: "6px",
    marginBottom: "15px",
  },

  error: {
    background: "#7f1d1d",
    border: "1px solid #ef4444",
    padding: "12px",
    borderRadius: "6px",
    marginBottom: "15px",
  },

  card: {
    background: "#131d42",
    border: "1px solid #60a5fa",
    borderRadius: "10px",
    padding: "20px",
    marginBottom: "20px",
  },

  sectionTitle: {
    marginTop: 0,
    color: "#93c5fd",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "15px",
  },

  itemGrid: {
    display: "grid",
    gridTemplateColumns:
      "2fr 1fr 1fr 1fr 1fr 1fr",
    gap: "15px",
    alignItems: "end",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  label: {
    color: "#bfdbfe",
    fontSize: "14px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    background: "#0b122e",
    color: "white",
    border: "1px solid #475569",
    borderRadius: "5px",
    padding: "10px",
    outline: "none",
  },

  stockInfo: {
    background: "#0b122e",
    border: "1px solid #334155",
    borderRadius: "5px",
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    minHeight: "42px",
  },

  infoLabel: {
    color: "#94a3b8",
    fontSize: "12px",
  },

  amountBox: {
    background: "#172554",
    border: "1px solid #22d3ee",
    borderRadius: "5px",
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    minHeight: "42px",
  },

  totalCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#1e3a8a",
    border: "1px solid #60a5fa",
    borderRadius: "8px",
    padding: "16px 20px",
    fontSize: "18px",
    marginBottom: "20px",
  },

  actions: {
    display: "flex",
    gap: "10px",
  },

  saveButton: {
    background: "#06b6d4",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "11px 22px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  resetButton: {
    background: "#475569",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "11px 22px",
    cursor: "pointer",
  },
};