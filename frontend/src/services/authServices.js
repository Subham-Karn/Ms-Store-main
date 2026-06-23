import api from "../axios/api.js";

const AUTH_PREFIX = "/auth";

export const LoginUser = async (data) => {
  try {
    const response = await api.post(`${AUTH_PREFIX}/login`, {
      email: data.email,
      password: data.password,
    });
    return response.data;
  } catch (error) {
     throw error.response.data.message;
  }
};

export const createUser = async (data) => {
  try {
    const response = await api.post(`${AUTH_PREFIX}/create/user`, {
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      phoneNumber: data.phoneNumber,
      role: data.role,
    });
    return response.data;
  } catch (error) {
     throw error.response.data.message;
  }
};

export const getAllUsers = async () => {
  try {
    const response = await api.get(`${AUTH_PREFIX}/users`);
    return response.data;
  } catch (error) {
    throw error.response.data.message;
  }
};

export const manageUsers = async (userId, action, role) => {
  try {
    const response = await api.post(`${AUTH_PREFIX}/users/${userId}/manage`, {
      role,
      action,
    });
    return response.data;
  } catch (error) {
     throw error.response.data.message;
  }
};