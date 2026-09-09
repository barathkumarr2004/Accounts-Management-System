"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStocks, fetchNextItemCode, createStock, updateStock, deleteStock } from "../../store/slices/stockSlice";

const emptyForm = { item_code: "", item_name: "", category: "", unit: "PCS", opening_qty: "", opening_rate: "", purchase_rate: "", sales_rate: "", reorder_level: "", is_active: 1 };

export default function StockPage() {
  const dispatch = useDispatch();
  const { stocks, loading, error } = useSelector((state) => state.stock);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    dispatch(fetchStocks());
  }, [dispatch]);

  const handleAdd = async () => {
    try {
      const itemCode = await dispatch(fetchNextItemCode()).unwrap();

      setForm({ item_code: itemCode, item_name: "", category: "", unit: "PCS", opening_qty: "", opening_rate: "", purchase_rate: "", sales_rate: "", reorder_level: "", is_active: 1 });
      setEditingId(null);
      setShowForm(true);
    } catch (error) {
      console.error("Failed to generate item code:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.item_code || !form.item_name) {
      alert("Item code and item name are required");
      return;
    }

    try {
      if (editingId) {
        await dispatch(updateStock({ id: editingId, stock: form })).unwrap();
      } else {
        await dispatch(createStock(form)).unwrap();
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
    const confirmDelete = window.confirm("Are you sure you want to delete this stock?");

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
    <div className="stock-page">
      <div className="stock-container">

        <header className="stock-header">
          <div className="header-content">
            <div className="stock-icon">ST</div>

            <div>
              <h1>Stock Master</h1>
              <p>Manage your inventory items</p>
            </div>
          </div>

          <button className="add-button" onClick={handleAdd}>
            + Add Stock
          </button>
        </header>

        {error && (
          <div className="message error-message">
            <span className="message-icon">!</span>
            <span>{error}</span>
          </div>
        )}

        {showForm && (
          <section className="form-card">

            <div className="section-heading">
              <div className="section-number">01</div>

              <div>
                <h2>{editingId ? "Edit Stock" : "Add Stock"}</h2>
                <p>{editingId ? "Update inventory item details" : "Create a new inventory item"}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="form-grid">

                <Input label="Item Code" name="item_code" value={form.item_code} onChange={handleChange} readOnly />
                <Input label="Item Name" name="item_name" value={form.item_name} onChange={handleChange} />
                <Input label="Category" name="category" value={form.category} onChange={handleChange} />
                <Input label="Unit" name="unit" value={form.unit} onChange={handleChange} />
                <Input label="Opening Qty" name="opening_qty" type="number" value={form.opening_qty} onChange={handleChange} />
                <Input label="Opening Rate" name="opening_rate" type="number" value={form.opening_rate} onChange={handleChange} />
                <Input label="Purchase Rate" name="purchase_rate" type="number" value={form.purchase_rate} onChange={handleChange} />
                <Input label="Sales Rate" name="sales_rate" type="number" value={form.sales_rate} onChange={handleChange} />
                <Input label="Reorder Level" name="reorder_level" type="number" value={form.reorder_level} onChange={handleChange} />

              </div>

              <div className="form-actions">

                <button type="submit" className="save-button" disabled={loading}>
                  {loading ? "Saving..." : editingId ? "Update Stock" : "Save Stock"}
                </button>

                <button type="button" className="cancel-button" onClick={resetForm}>
                  Cancel
                </button>

              </div>

            </form>
          </section>
        )}

        <section className="table-card">

          <div className="table-heading">
            <div>
              <h2>Stock Items</h2>
              <p>{stocks.length} inventory items available</p>
            </div>

            <div className="count-badge">
              {stocks.length} ITEMS
            </div>
          </div>

          {loading && stocks.length === 0 ? (
            <div className="empty-state">
              <div className="loading-icon">...</div>
              <p>Loading stock items...</p>
            </div>
          ) : stocks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">ST</div>
              <h3>No Stock Items</h3>
              <p>Add your first inventory item to get started.</p>
              <button className="empty-add-button" onClick={handleAdd}>
                + Add Stock
              </button>
            </div>
          ) : (
            <div className="table-wrapper">

              <table className="stock-table">

                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Item Name</th>
                    <th>Category</th>
                    <th>Unit</th>
                    <th>Opening Qty</th>
                    <th>Purchase Rate</th>
                    <th>Sales Rate</th>
                    <th>Reorder</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {stocks.map((stock) => (
                    <tr key={stock.id}>

                      <td>
                        <span className="item-code">
                          {stock.item_code}
                        </span>
                      </td>

                      <td>
                        <strong className="item-name">
                          {stock.item_name}
                        </strong>
                      </td>

                      <td>
                        <span className="category-text">
                          {stock.category || "-"}
                        </span>
                      </td>

                      <td>
                        <span className="unit-badge">
                          {stock.unit}
                        </span>
                      </td>

                      <td>
                        {Number(stock.opening_qty || 0).toFixed(3)}
                      </td>

                      <td>
                        <span className="purchase-rate">
                          ₹{Number(stock.purchase_rate || 0).toFixed(2)}
                        </span>
                      </td>

                      <td>
                        <span className="sales-rate">
                          ₹{Number(stock.sales_rate || 0).toFixed(2)}
                        </span>
                      </td>

                      <td>
                        {Number(stock.reorder_level || 0).toFixed(3)}
                      </td>

                      <td>
                        <span className={stock.is_active ? "status active" : "status inactive"}>
                          {stock.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td>
                        <div className="action-buttons">

                          <button className="edit-button" onClick={() => handleEdit(stock)}>
                            Edit
                          </button>

                          <button className="delete-button" onClick={() => handleDelete(stock.id)}>
                            Delete
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>

            </div>
          )}

        </section>

      </div>

      <style>{`

        * { box-sizing: border-box; }

        .stock-page { min-height: 100vh; padding: 24px; background: #07111f; color: #e8f1f7; font-family: Arial, sans-serif; }

        .stock-container { width: 100%; max-width: 1240px; margin: 0 auto; }

        .stock-header { min-height: 96px; display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 20px 22px; margin-bottom: 18px; background: linear-gradient(100deg, #0c1c31, #183d82); border: 1px solid #3c83b7; border-radius: 10px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.28); }

        .header-content { display: flex; align-items: center; gap: 14px; }

        .stock-icon { width: 52px; height: 52px; display: flex; align-items: center; justify-content: center; background: #0ea5e9; color: #ffffff; border-radius: 8px; font-size: 13px; font-weight: 900; box-shadow: 0 5px 18px rgba(14, 165, 233, 0.2); }

        .stock-header h1 { margin: 0; color: #f7fbff; font-size: 25px; font-weight: 800; }

        .stock-header p { margin: 5px 0 0; color: #a9d0e7; font-size: 12px; }

        .add-button { min-height: 43px; padding: 0 18px; border: none; border-radius: 6px; background: #16a34a; color: #ffffff; font-size: 12px; font-weight: 800; cursor: pointer; transition: 0.15s ease; }

        .add-button:hover { background: #20bd59; transform: translateY(-1px); }

        .message { display: flex; align-items: center; gap: 10px; padding: 12px 15px; margin-bottom: 18px; border-radius: 7px; font-size: 12px; font-weight: 700; }

        .error-message { background: #39171c; border: 1px solid #8d333e; color: #ff919b; }

        .message-icon { width: 21px; height: 21px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border-radius: 50%; background: rgba(255, 255, 255, 0.08); font-size: 11px; }

        .form-card, .table-card { padding: 20px; margin-bottom: 18px; background: #0d1c35; border: 1px solid #285a82; border-radius: 10px; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2); }

        .section-heading { display: flex; align-items: center; gap: 11px; margin-bottom: 20px; }

        .section-number { width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; background: #123d63; border: 1px solid #267ba7; border-radius: 6px; color: #53c8ee; font-family: Consolas, monospace; font-size: 10px; font-weight: 900; }

        .section-heading h2, .table-heading h2 { margin: 0; color: #a8d2ff; font-size: 20px; font-weight: 700; }

        .section-heading p, .table-heading p { margin: 4px 0 0; color: #668199; font-size: 10px; }

        .form-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }

        .input-group { display: flex; flex-direction: column; gap: 6px; }

        .input-group label { color: #86a6c0; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; }

        .stock-input { width: 100%; height: 43px; padding: 0 12px; background: #081329; color: #e7f0f7; border: 1px solid #304964; border-radius: 5px; outline: none; font-size: 12px; }

        .stock-input::placeholder { color: #40556a; }

        .stock-input:focus { border-color: #29a9d4; box-shadow: 0 0 0 2px rgba(41, 169, 212, 0.08); }

        .readonly-input { background: #17253a; color: #55c9ee; font-family: Consolas, monospace; font-weight: 800; cursor: not-allowed; }

        .form-actions { display: flex; gap: 9px; margin-top: 20px; }

        .save-button, .cancel-button { min-height: 43px; padding: 0 20px; border: none; border-radius: 6px; font-size: 12px; font-weight: 800; cursor: pointer; }

        .save-button { background: #0ea5c9; color: #ffffff; }

        .save-button:hover { background: #18badf; }

        .save-button:disabled { opacity: 0.55; cursor: not-allowed; }

        .cancel-button { background: #35475e; color: #d6e1eb; }

        .cancel-button:hover { background: #465c75; }

        .table-heading { display: flex; align-items: center; justify-content: space-between; gap: 15px; margin-bottom: 17px; }

        .count-badge { padding: 8px 12px; background: #102b49; border: 1px solid #26688f; border-radius: 5px; color: #58c9ee; font-family: Consolas, monospace; font-size: 10px; font-weight: 800; }

        .table-wrapper { width: 100%; overflow-x: auto; border: 1px solid #1d3955; border-radius: 6px; }

        .stock-table { width: 100%; min-width: 1050px; border-collapse: collapse; }

        .stock-table th { padding: 13px 12px; background: #123974; border-bottom: 1px solid #3d79a6; color: #e3f1ff; font-size: 10px; font-weight: 800; text-align: left; text-transform: uppercase; letter-spacing: 0.3px; white-space: nowrap; }

        .stock-table td { padding: 13px 12px; border-bottom: 1px solid #1d3048; color: #d8e4ee; font-size: 11px; white-space: nowrap; }

        .stock-table tbody tr { background: #0b1930; transition: 0.12s ease; }

        .stock-table tbody tr:nth-child(even) { background: #0d1d35; }

        .stock-table tbody tr:hover { background: #122947; }

        .stock-table tbody tr:last-child td { border-bottom: none; }

        .item-code { color: #55c9ee; font-family: Consolas, monospace; font-size: 11px; font-weight: 800; }

        .item-name { color: #f1f7fc; font-size: 12px; }

        .category-text { color: #a9bfd1; }

        .unit-badge { display: inline-block; padding: 4px 7px; background: #172c43; border: 1px solid #2e4b65; border-radius: 4px; color: #a8c9df; font-size: 9px; font-weight: 800; }

        .purchase-rate { color: #f6c55c; font-family: Consolas, monospace; font-weight: 700; }

        .sales-rate { color: #55d6b5; font-family: Consolas, monospace; font-weight: 700; }

        .status { display: inline-block; min-width: 58px; padding: 5px 8px; border-radius: 4px; text-align: center; font-size: 9px; font-weight: 800; }

        .status.active { background: #0c332b; border: 1px solid #177a65; color: #5ee2c2; }

        .status.inactive { background: #351a1e; border: 1px solid #803943; color: #ff929d; }

        .action-buttons { display: flex; align-items: center; gap: 6px; }

        .edit-button, .delete-button { min-height: 31px; padding: 0 10px; border: none; border-radius: 4px; color: #ffffff; font-size: 10px; font-weight: 800; cursor: pointer; }

        .edit-button { background: #d98b08; }

        .edit-button:hover { background: #f0a30d; }

        .delete-button { background: #dc3545; }

        .delete-button:hover { background: #f04756; }

        .empty-state { display: flex; align-items: center; justify-content: center; flex-direction: column; min-height: 250px; padding: 30px; border: 1px dashed #2b4965; border-radius: 7px; background: #09172b; text-align: center; }

        .empty-icon, .loading-icon { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; background: #123d63; border: 1px solid #267ba7; border-radius: 8px; color: #53c8ee; font-size: 12px; font-weight: 900; }

        .empty-state h3 { margin: 0 0 5px; color: #dceaf5; font-size: 15px; }

        .empty-state p { margin: 0 0 15px; color: #668199; font-size: 11px; }

        .empty-add-button { min-height: 38px; padding: 0 15px; border: none; border-radius: 5px; background: #16a34a; color: #ffffff; font-size: 11px; font-weight: 800; cursor: pointer; }

        @media (max-width: 900px) { .form-grid { grid-template-columns: repeat(2, 1fr); } }

        @media (max-width: 650px) { .stock-page { padding: 14px; } .stock-header { align-items: flex-start; flex-direction: column; padding: 16px; } .add-button { width: 100%; } .form-grid { grid-template-columns: 1fr; } .form-card, .table-card { padding: 15px; } .table-heading { align-items: flex-start; flex-direction: column; } .count-badge { align-self: flex-start; } .form-actions { width: 100%; } .save-button, .cancel-button { flex: 1; } }

      `}</style>
    </div>
  );
}

function Input({ label, name, value, onChange, type = "text", readOnly = false }) {
  return (
    <div className="input-group">
      <label>{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} readOnly={readOnly} className={`stock-input ${readOnly ? "readonly-input" : ""}`} />
    </div>
  );
}