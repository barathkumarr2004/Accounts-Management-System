const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const createJournalApi = async (data) => {
  const url = `${API_URL}/journals`;

  console.log("POST URL:", url);
  console.log("POST DATA:", data);

  try {
    const response = await fetch(url, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(data),
    });

    const text = await response.text();

    console.log("HTTP STATUS:", response.status);
    console.log("RAW RESPONSE:", text);

    let result = {};

    if (text) {
      try {
        result = JSON.parse(text);
      } catch {
        result = {
          message: text,
        };
      }
    }

    if (!response.ok) {
      const message =
        result.message ||
        result.sqlMessage ||
        result.error ||
        `Request failed with HTTP ${response.status}`;

      // Show the actual backend response
      console.error("BACKEND RESPONSE:", result);

      // This is only converting backend failure into a JS error
      throw new Error(message);
    }

    return result;

  } catch (error) {
    console.error("CREATE JOURNAL ERROR:", error.message);

    throw error;
  }
};