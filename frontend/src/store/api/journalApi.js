const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const createJournalVoucherApi = async (data) => {
  try {
    console.log("Sending Journal Data:", data);

    const response = await fetch(`${API_URL}/journals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Unable to create journal voucher"
      );
    }

    return result;
  } catch (error) {
    throw new Error(
      error.message || "Unable to connect to server"
    );
  }
};

export const getJournalsApi = async () => {
  try {
    const response = await fetch(`${API_URL}/journals`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Unable to fetch journals"
      );
    }

    return result;
  } catch (error) {
    throw new Error(
      error.message || "Unable to connect to server"
    );
  }
};

export const getJournalByIdApi = async (id) => {
  try {
    const response = await fetch(`${API_URL}/journals/${id}`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Unable to fetch journal voucher"
      );
    }

    return result;
  } catch (error) {
    throw new Error(
      error.message || "Unable to connect to server"
    );
  }
};

