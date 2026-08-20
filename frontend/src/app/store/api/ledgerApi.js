const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getLedgers = async () => {
try{
  const response =await fetch(`${API_URL}/ledgers`);

  const result = await response.json();

  if (!response.ok) {
    throw new Error( result.message || "Unable to load ledgers");

  }

  return result.data;
}
catch (error) {
  throw error;
  }
};

export const createLedgerApi = async (data) => {
try{
  const response =await fetch(`${API_URL}/ledgers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),

    });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message ||"Unable to create ledger"
    );

  }
  return result.data;
}
  catch (error) {
  throw error;
  }
};