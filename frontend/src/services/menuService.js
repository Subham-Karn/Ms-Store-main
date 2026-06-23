import api from "../axios/api.js";

const MENU_PREFIX = "/menu";

export const getAllMenuAndSubMenu = async () => {
  const response = await api.get(`${MENU_PREFIX}/combined`);
  return response.data;
};

export const createMenu = async (payload) => {
  const response = await api.post(`${MENU_PREFIX}`, payload);
  return response.data;
};

export const deleteMenu = async (id) => {
  const response = await api.delete(`${MENU_PREFIX}/${id}`);
  return response.data;
};