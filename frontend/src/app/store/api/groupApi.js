const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getGroups = async () => {
  try {
    const response = await fetch(`${API_URL}/groups`);

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Unable to load groups"
      );
    }

    return result.data;
  } catch (error) {
    console.error("getGroups error:", error);

    throw error;
  }
};


export const createGroupApi = async (data) => {
  try {
    const response = await fetch(`${API_URL}/groups`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Unable to create group"
      );
    }

    return result.data;
  } catch (error) {
    console.error("createGroupApi error:", error);

    throw error;
  }
};