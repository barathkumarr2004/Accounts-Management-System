const db = require("../config/db");

const getAllStocks = async () => {
  const [rows] = await db.query(`
    SELECT
      sm.id,
      sm.item_code,
      sm.item_name,
      sm.category,
      sm.unit,
      sm.opening_qty,
      sm.opening_rate,
      sm.purchase_rate,
      sm.sales_rate,
      sm.reorder_level,
      sm.is_active,
      sm.created_at,
      sm.updated_at,
      sm.opening_qty
      + COALESCE(
          (
            SELECT SUM(
              CASE
                WHEN st.transaction_type = 'IN'
                  THEN st.quantity
                WHEN st.transaction_type = 'OUT'
                  THEN -st.quantity
                ELSE 0
              END
            )
            FROM stock_transactions st
            WHERE st.stock_id = sm.id
          ),
          0
        ) AS current_qty
    FROM stock_master sm
    ORDER BY sm.id DESC
  `);

  return rows;
};

const getStockById = async (id) => {
  const [rows] = await db.query(
    `
    SELECT
      sm.id,
      sm.item_code,
      sm.item_name,
      sm.category,
      sm.unit,
      sm.opening_qty,
      sm.opening_rate,
      sm.purchase_rate,
      sm.sales_rate,
      sm.reorder_level,
      sm.is_active,
      sm.created_at,
      sm.updated_at,
      sm.opening_qty
      + COALESCE(
          (
            SELECT SUM(
              CASE
                WHEN st.transaction_type = 'IN'
                  THEN st.quantity
                WHEN st.transaction_type = 'OUT'
                  THEN -st.quantity
                ELSE 0
              END
            )
            FROM stock_transactions st
            WHERE st.stock_id = sm.id
          ),
          0
        ) AS current_qty
    FROM stock_master sm
    WHERE sm.id = ?
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

  if (!result.affectedRows) return null;

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