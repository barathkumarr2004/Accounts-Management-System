const API_URL = "http://localhost:5000/api/stocks";

export const getStocksApi = async () => {
  const response = await fetch(API_URL);
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to fetch stocks");
  }

  return result.data;
};

export const getNextItemCodeApi = async () => {
  const response = await fetch(`${API_URL}/next-code`);
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Failed to generate item code"
    );
  }

  return result.data.item_code;
};

export const createStockApi = async (stock) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(stock),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to create stock");
  }

  return result.data;
};

export const updateStockApi = async (id, stock) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(stock),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to update stock");
  }

  return result.data;
};

export const deleteStockApi = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to delete stock");
  }

  return result;
};