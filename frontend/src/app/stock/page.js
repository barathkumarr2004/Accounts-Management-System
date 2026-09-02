"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchStocks,
  fetchNextItemCode,
  createStock,
  updateStock,
  deleteStock,
} from "../../store/slices/stockSlice";

const emptyForm = {
  item_code: "",
  item_name: "",
  category: "",
  unit: "PCS",
  opening_qty: "",
  opening_rate: "",
  purchase_rate: "",
  sales_rate: "",
  reorder_level: "",
  is_active: 1,
};

export default function StockPage() {
  const dispatch = useDispatch();

  const {
    stocks,
    loading,
    error,
  } = useSelector((state) => state.stock);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    dispatch(fetchStocks());
  }, [dispatch]);

  const handleAdd = async () => {
  try {
    const itemCode = await dispatch(
      fetchNextItemCode()
    ).unwrap();

    setForm({
      item_code: itemCode,
      item_name: "",
      category: "",
      unit: "PCS",
      opening_qty: "",
      opening_rate: "",
      purchase_rate: "",
      sales_rate: "",
      reorder_level: "",
      is_active: 1,
    });

    setEditingId(null);
    setShowForm(true);
  } catch (error) {
    console.error(
      "Failed to generate item code:",
      error
    );
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

    if (!form.item_code || !form.item_name) {
      alert("Item code and item name are required");
      return;
    }

    try {
      if (editingId) {
        await dispatch(
          updateStock({
            id: editingId,
            data: form,
          })
        ).unwrap();
      } else {
        await dispatch(
          createStock(form)
        ).unwrap();
      }

      await dispatch(fetchStocks());
      resetForm();
    } catch (error) {
      console.error("Stock save failed:", error);
    }
  };

  const handleEdit = (stock) => {
    setForm({
      item_code: stock.item_code || "",
      item_name: stock.item_name || "",
      category: stock.category || "",
      unit: stock.unit || "PCS",
      opening_qty: stock.opening_qty ?? "",
      opening_rate: stock.opening_rate ?? "",
      purchase_rate: stock.purchase_rate ?? "",
      sales_rate: stock.sales_rate ?? "",
      reorder_level: stock.reorder_level ?? "",
      is_active: stock.is_active ?? 1,
    });

    setEditingId(stock.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this stock?"
    );

    if (!confirmDelete) return;

    try {
      await dispatch(deleteStock(id)).unwrap();
      await dispatch(fetchStocks());
    } catch (error) {
      console.error("Stock delete failed:", error);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Stock Master</h1>

          <p style={styles.subtitle}>
            Manage your inventory items
          </p>
        </div>

        <button
          style={styles.addButton}
          onClick={handleAdd}
        >
          + Add Stock
        </button>
      </div>

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      {showForm && (
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>
            {editingId ? "Edit Stock" : "Add Stock"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <Input
                label="Item Code"
                name="item_code"
                value={form.item_code}
                onChange={handleChange}
                readOnly
              />

              <Input
                label="Item Name"
                name="item_name"
                value={form.item_name}
                onChange={handleChange}
              />

              <Input
                label="Category"
                name="category"
                value={form.category}
                onChange={handleChange}
              />

              <Input
                label="Unit"
                name="unit"
                value={form.unit}
                onChange={handleChange}
              />

              <Input
                label="Opening Qty"
                name="opening_qty"
                type="number"
                value={form.opening_qty}
                onChange={handleChange}
              />

              <Input
                label="Opening Rate"
                name="opening_rate"
                type="number"
                value={form.opening_rate}
                onChange={handleChange}
              />

              <Input
                label="Purchase Rate"
                name="purchase_rate"
                type="number"
                value={form.purchase_rate}
                onChange={handleChange}
              />

              <Input
                label="Sales Rate"
                name="sales_rate"
                type="number"
                value={form.sales_rate}
                onChange={handleChange}
              />

              <Input
                label="Reorder Level"
                name="reorder_level"
                type="number"
                value={form.reorder_level}
                onChange={handleChange}
              />
            </div>

            <div style={styles.formActions}>
              <button
                type="submit"
                style={styles.saveButton}
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : editingId
                    ? "Update"
                    : "Save"}
              </button>

              <button
                type="button"
                style={styles.cancelButton}
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={styles.tableCard}>
        <h2 style={styles.tableTitle}>
          Stock Items
        </h2>

        {loading && stocks.length === 0 ? (
          <p style={styles.message}>
            Loading stocks...
          </p>
        ) : stocks.length === 0 ? (
          <p style={styles.message}>
            No stock items found.
          </p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Code</th>
                  <th style={styles.th}>Item Name</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Unit</th>
                  <th style={styles.th}>Opening Qty</th>
                  <th style={styles.th}>Purchase Rate</th>
                  <th style={styles.th}>Sales Rate</th>
                  <th style={styles.th}>Reorder</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {stocks.map((stock) => (
                  <tr key={stock.id}>
                    <td style={styles.td}>
                      {stock.item_code}
                    </td>

                    <td style={styles.td}>
                      {stock.item_name}
                    </td>

                    <td style={styles.td}>
                      {stock.category || "-"}
                    </td>

                    <td style={styles.td}>
                      {stock.unit}
                    </td>

                    <td style={styles.td}>
                      {stock.opening_qty}
                    </td>

                    <td style={styles.td}>
                      ₹
                      {Number(
                        stock.purchase_rate || 0
                      ).toFixed(2)}
                    </td>

                    <td style={styles.td}>
                      ₹
                      {Number(
                        stock.sales_rate || 0
                      ).toFixed(2)}
                    </td>

                    <td style={styles.td}>
                      {stock.reorder_level}
                    </td>

                    <td style={styles.td}>
                      {stock.is_active
                        ? "Active"
                        : "Inactive"}
                    </td>

                    <td style={styles.td}>
                      <button
                        style={styles.editButton}
                        onClick={() =>
                          handleEdit(stock)
                        }
                      >
                        Edit
                      </button>

                      <button
                        style={styles.deleteButton}
                        onClick={() =>
                          handleDelete(stock.id)
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
  readOnly = false,
}) {
  return (
    <div style={styles.inputGroup}>
      <label style={styles.label}>
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        style={{
          ...styles.input,
          ...(readOnly
            ? styles.readOnlyInput
            : {}),
        }}
      />
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
    padding: "20px",
    border: "1px solid #60a5fa",
    borderRadius: "10px",
    marginBottom: "20px",
  },

  title: {
    margin: 0,
    fontSize: "28px",
  },

  subtitle: {
    margin: "5px 0 0",
    color: "#bfdbfe",
  },

  addButton: {
    background: "#22c55e",
    color: "white",
    border: "none",
    padding: "11px 18px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  error: {
    background: "#7f1d1d",
    border: "1px solid #ef4444",
    padding: "12px",
    borderRadius: "6px",
    marginBottom: "15px",
  },

  formCard: {
    background: "#131d42",
    border: "1px solid #60a5fa",
    borderRadius: "10px",
    padding: "20px",
    marginBottom: "20px",
  },

  formTitle: {
    marginTop: 0,
    color: "#93c5fd",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  label: {
    fontSize: "14px",
    color: "#bfdbfe",
  },

  input: {
    background: "#0b122e",
    color: "white",
    border: "1px solid #475569",
    borderRadius: "5px",
    padding: "10px",
    outline: "none",
  },

  readOnlyInput: {
    background: "#1e293b",
    color: "#67e8f9",
    fontWeight: "bold",
    cursor: "not-allowed",
  },

  formActions: {
    marginTop: "20px",
    display: "flex",
    gap: "10px",
  },

  saveButton: {
    background: "#06b6d4",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  cancelButton: {
    background: "#475569",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
  },

  tableCard: {
    background: "#131d42",
    border: "1px solid #60a5fa",
    borderRadius: "10px",
    padding: "20px",
  },

  tableTitle: {
    marginTop: 0,
    color: "#93c5fd",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1000px",
  },

  th: {
    background: "#1e3a8a",
    padding: "12px",
    textAlign: "left",
    borderBottom: "1px solid #60a5fa",
  },

  td: {
    padding: "11px",
    borderBottom: "1px solid #334155",
  },

  editButton: {
    background: "#f59e0b",
    color: "white",
    border: "none",
    padding: "6px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    marginRight: "6px",
  },

  deleteButton: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "6px 10px",
    borderRadius: "4px",
    cursor: "pointer",
  },

  message: {
    color: "#cbd5e1",
    textAlign: "center",
    padding: "30px",
  },
};