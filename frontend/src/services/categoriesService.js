import api from "../axios/api.js";

const CATEGORIES_PREFIX = "/categories";

export const createCategory = async (category, userId ,parentId) => {
  try {
    const response = await api.post(`${CATEGORIES_PREFIX}`, {
      userId: userId,
      c_title: category,
      parentId: parentId || null
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateCategory = async (category, userId , parentId) => {
  try {
    const response = await api.put(`${CATEGORIES_PREFIX}`, {
      userId: userId,
      c_title: category,
      parentId: parentId
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteCategory = async (categoryId) => {
  try {

    const response = await api.delete(`${CATEGORIES_PREFIX}/${categoryId}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getAllCategories = async () => {
  try {
    const response = await api.get(`${CATEGORIES_PREFIX}`);
    return response;
  } catch (error) {
    throw error;
  }
};