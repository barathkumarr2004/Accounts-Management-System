const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getProfitLossApi = async () => {
  try {
    const response = await fetch(
      `${API_URL}/profit-loss`
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Unable to load Profit & Loss"
      );
    }

    return result;
  } catch (error) {
    console.error(
      "GET PROFIT LOSS API ERROR:",
      error
    );

    throw new Error(
      error.message || "Unable to load Profit & Loss"
    );
  }
};