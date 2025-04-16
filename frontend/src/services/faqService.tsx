import {API_URL} from"../api/api"

const FAQ_API_URL = `${API_URL}/FAQs`;


export const fetchFAQs = async () => {
  try {
    const response = await fetch(FAQ_API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch FAQs");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
