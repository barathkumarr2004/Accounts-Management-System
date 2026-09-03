const API_URL = "http://localhost:5000/api/sales";

export const createSalesApi = async (sales) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sales),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Failed to create sales voucher"
    );
  }

  return result.data;
};