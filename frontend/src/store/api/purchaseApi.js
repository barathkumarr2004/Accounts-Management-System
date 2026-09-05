const API_URL = "http://localhost:5000/api/purchases";

export const createPurchaseApi = async (purchase) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(purchase),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Failed to create purchase voucher"
    );
  }

  return result.data;
};