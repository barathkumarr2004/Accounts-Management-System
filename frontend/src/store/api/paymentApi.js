const API_URL = "http://localhost:5000/api/payments";

export const createPaymentApi = async (data) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Unable to create payment voucher"
    );
  }

  return result;
};