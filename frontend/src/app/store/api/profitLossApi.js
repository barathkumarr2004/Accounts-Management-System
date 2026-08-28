const API_URL = "http://localhost:5000/api/profitloss";

export const getProfitLossApi = async () => {
  const response = await fetch(API_URL);
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Unable to fetch Profit & Loss"
    );
  }

  return {
    data: result.data,
  };
};

export const getLedgerVouchersApi = async (ledgerId) => {
  const response = await fetch(
    `${API_URL}/ledgers/${ledgerId}/vouchers`
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Unable to fetch ledger vouchers"
    );
  }

  return {
    data: result.vouchers || result.data || [],
  };
};