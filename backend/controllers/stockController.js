const stockModel = require("../models/stockModel");

const getStocks = async (req, res) => {
  try {
    const stocks = await stockModel.getAllStocks();

    res.status(200).json({
      success: true,
      data: stocks,
    });
  } catch (error) {
    console.error("Get stocks error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch stocks",
    });
  }
};

const getStock = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid stock ID is required",
      });
    }

    const stock = await stockModel.getStockById(id);

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: "Stock not found",
      });
    }

    res.status(200).json({
      success: true,
      data: stock,
    });
  } catch (error) {
    console.error("Get stock error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch stock",
    });
  }
};

const getNextItemCode = async (req, res) => {
  try {
    const itemCode = await stockModel.getNextItemCode();

    res.status(200).json({
      success: true,
      data: {
        item_code: itemCode,
      },
    });
  } catch (error) {
    console.error("Get next item code error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate item code",
    });
  }
};

const createStock = async (req, res) => {
  try {
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
    } = req.body;

    if (!item_code || !item_name) {
      return res.status(400).json({
        success: false,
        message: "Item code and item name are required",
      });
    }

    const stock = await stockModel.createStock({
      item_code,
      item_name,
      category,
      unit,
      opening_qty,
      opening_rate,
      purchase_rate,
      sales_rate,
      reorder_level,
    });

    res.status(201).json({
      success: true,
      message: "Stock created successfully",
      data: stock,
    });
  } catch (error) {
    console.error("Create stock error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Item code already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create stock",
    });
  }
};

const updateStock = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid stock ID is required",
      });
    }

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
    } = req.body;

    if (!item_code || !item_name) {
      return res.status(400).json({
        success: false,
        message: "Item code and item name are required",
      });
    }

    const stock = await stockModel.updateStock(id, {
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
    });

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: "Stock not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      data: stock,
    });
  } catch (error) {
    console.error("Update stock error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Item code already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update stock",
    });
  }
};

const deleteStock = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid stock ID is required",
      });
    }

    const deleted = await stockModel.deleteStock(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Stock not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Stock deleted successfully",
    });
  } catch (error) {
    console.error("Delete stock error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete stock",
    });
  }
};

module.exports = {
  getStocks,
  getStock,
  getNextItemCode,
  createStock,
  updateStock,
  deleteStock,
};