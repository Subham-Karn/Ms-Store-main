import api from "../axios/api.js";

const ADDRESS_PREFIX = "/address";

export const getAddressByUserId = async (user_id) => {
  try {
    const response = await api.get(`${ADDRESS_PREFIX}/${user_id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const createAddress = async (addressData, userid) => {
  try {
    const response = await api.post(`${ADDRESS_PREFIX}`, {
      user_id: userid,
      street: addressData.street,
      city: addressData.city,
      state: addressData.state,
      pincode: addressData.pincode,
      fullName: addressData.fullName,
      phoneNumber: addressData.phoneNumber,
      landmark: addressData.landmark,
      email: addressData.email,
      setDefault: addressData.isdefault,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateAddress = async (addressId, addressData, userid) => {
  try {
    const response = await api.put(`${ADDRESS_PREFIX}/${addressId}`, {
      user_id: userid,
      street: addressData.street,
      city: addressData.city,
      state: addressData.state,
      pincode: addressData.pincode,
      landmark: addressData.landmark,
      fullName: addressData.fullName,
      phoneNumber: addressData.phoneNumber,
      email: addressData.email,
      setDefault: addressData.isdefault,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteAddress = async (address_id, user_id) => {
  try {
    const response = await api.delete(`${ADDRESS_PREFIX}/delete/${user_id}/${address_id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const changeAddressDefault = async (user_id, address_id, setDefault) => {
  try {
    const response = await api.put(`${ADDRESS_PREFIX}/default/${user_id}/${address_id}`, {
      setDefault,
    });
    return response;
  } catch (error) {
    throw error;
  }
};