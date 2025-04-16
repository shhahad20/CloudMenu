import axios from 'axios';

export const API_URL = 'http://localhost:5050';

// Fetch categories from the backend
export const getCategories = async () => {
  const response = await axios.get(`${API_URL}/menu/categories`);
  console.log(response.data);
  return response.data;
};

// Fetch menu items from the backend
export const getMenuItems = async () => {
  const response = await axios.get(`${API_URL}/menu/menu-items`);
  return response.data;
};

// Example for adding a category
export const addCategory = async (name: string) => {
  const response = await axios.post(`${API_URL}/menu/categories`, { name });
  return response.data;
};

// Example for updating a category
export const updateCategory = async (id: string, name: string) => {
  const response = await axios.put(`${API_URL}/menu/categories/${id}`, { name });
  return response.data;
};
