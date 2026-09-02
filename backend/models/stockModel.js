const db = require("../config/db");

const getAllStocks = async () => {
  const [rows] = await db.query(`
    SELECT
      id,
      item_code,
      item_name,
      category,
      unit,
      opening_qty,
      opening_rate,
      purchase_rate,
      sales_rate,
      reorder_level,
      is_active,
      created_at,
      updated_at
    FROM stock_master
    ORDER BY id DESC
  `);

  return rows;
};

const getStockById = async (id) => {
  const [rows] = await db.query(
    `
    SELECT
      id,
      item_code,
      item_name,
      category,
      unit,
      opening_qty,
      opening_rate,
      purchase_rate,
      sales_rate,
      reorder_level,
      is_active,
      created_at,
      updated_at
    FROM stock_master
    WHERE id = ?
    `,
    [id]
  );

  return rows[0];
};

const getNextItemCode = async () => {
  const [rows] = await db.query(`
    SELECT MAX(
      CAST(SUBSTRING(item_code, 5) AS UNSIGNED)
    ) AS max_number
    FROM stock_master
    WHERE item_code REGEXP '^ITEM[0-9]+$'
  `);

  const nextNumber = (rows[0].max_number || 0) + 1;

  return `ITEM${String(nextNumber).padStart(3, "0")}`;
};

const createStock = async (stock) => {
  const {
    item_code,
    item_name,
    category,
    unit,
    opening_qty,
    opening_rate,
    purchase_rate,
    sales_rate,
    reorder_level,
  } = stock;

  const [result] = await db.query(
    `
    INSERT INTO stock_master
    (
      item_code,
      item_name,
      category,
      unit,
      opening_qty,
      opening_rate,
      purchase_rate,
      sales_rate,
      reorder_level
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      item_code,
      item_name,
      category || null,
      unit || "PCS",
      opening_qty || 0,
      opening_rate || 0,
      purchase_rate || 0,
      sales_rate || 0,
      reorder_level || 0,
    ]
  );

  return getStockById(result.insertId);
};

const updateStock = async (id, stock) => {
  const {
    item_code,
    item_name,
    category,
    unit,
    opening_qty,
    opening_rate,
    purchase_rate,
    sales_rate,
    reorder_level,
    is_active,
  } = stock;

  const [result] = await db.query(
    `
    UPDATE stock_master
    SET
      item_code = ?,
      item_name = ?,
      category = ?,
      unit = ?,
      opening_qty = ?,
      opening_rate = ?,
      purchase_rate = ?,
      sales_rate = ?,
      reorder_level = ?,
      is_active = ?
    WHERE id = ?
    `,
    [
      item_code,
      item_name,
      category || null,
      unit || "PCS",
      opening_qty || 0,
      opening_rate || 0,
      purchase_rate || 0,
      sales_rate || 0,
      reorder_level || 0,
      is_active ?? 1,
      id,
    ]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return getStockById(id);
};

const deleteStock = async (id) => {
  const [result] = await db.query(
    "DELETE FROM stock_master WHERE id = ?",
    [id]
  );

  return result.affectedRows > 0;
};

module.exports = {
  getAllStocks,
  getStockById,
  getNextItemCode,
  createStock,
  updateStock,
  deleteStock,
};