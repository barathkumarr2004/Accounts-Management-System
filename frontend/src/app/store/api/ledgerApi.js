const API_URL = process.env.NEXT_PUBLIC_API_URL;


export const getLedgers = async () => {

  const response =
    await fetch(`${API_URL}/ledgers`);

  const result =
    await response.json();

  if (!response.ok) {

    throw new Error(
      result.message ||
      "Unable to load ledgers"
    );

  }

  return result.data;
};


export const createLedgerApi = async (data) => {

  const response =
    await fetch(`${API_URL}/ledgers`, {

      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(data),

    });


  const result =
    await response.json();


  if (!response.ok) {

    throw new Error(
      result.message ||
      "Unable to create ledger"
    );

  }


  return result.data;
};