import api from "../axios/api.js";

const PRODUCTS_PREFIX = "/products";

export const addCatalog = async (catalogData, userId) => {
  const formData = new FormData();
  
  // Basic Fields
  formData.append("userId", userId);
  formData.append("title", catalogData.title || "");
  formData.append("description", catalogData.description || "");
  formData.append("orignalprice", catalogData.orignalprice || 0);
  formData.append("discountprice", catalogData.discountprice || 0);
  formData.append("offer", catalogData.offer || 0);
  formData.append("stock", catalogData.stock || 0);
  formData.append("skuid", catalogData.skuid || "");
  formData.append("category", catalogData.category || "");
  formData.append("subcategory", catalogData.subcategory || "");
  formData.append("menu", catalogData.menu || "");
  formData.append("submenu", catalogData.submenu || "");
  formData.append("submenu_id", catalogData.submenu_id || 0);
  formData.append("shipping_charge", catalogData.shipping_charge || 0);
  formData.append("tags", JSON.stringify(catalogData.tags || []));

  // Images: Ensure these match the middleware config (name: "bunner", "thumbnails")
  if (catalogData.bunner instanceof File) {
    formData.append("bunner", catalogData.bunner);
  }
  
  // IMPORTANT: Backend controller uses "thumbinals" key
  catalogData.thumbnails?.forEach((img) => {
    if (img instanceof File) formData.append("thumbnails", img);
  });

  return await api.post(PRODUCTS_PREFIX, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};

export const updateCatalog = async (id, catalogData, userId) => {
  const formData = new FormData();
  
  formData.append("userid", userId);
  formData.append("title", catalogData.title || "");
  formData.append("description", catalogData.description || "");
  formData.append("orignalprice", catalogData.orignalprice || 0);
  formData.append("discountprice", catalogData.discountprice || 0);
  formData.append("offer", catalogData.offer || 0);
  formData.append("stock", catalogData.stock || 0);
  formData.append("skuid", catalogData.skuid || "");
  formData.append("category", catalogData.category || "");
  formData.append("subcategory", catalogData.subcategory || "");
  formData.append("menu", catalogData.menu || "");
  formData.append("submenu", catalogData.submenu || "");
  formData.append("submenu_id", catalogData.submenu_id || 0);
  formData.append("shipping_charge", catalogData.shipping_charge || 0);
  formData.append("tags", JSON.stringify(catalogData.tags || []));

  // If a new banner is selected, append it
  if (catalogData.bunner instanceof File) {
    formData.append("bunner", catalogData.bunner);
  }

  // If new thumbnails are selected, append them
  catalogData.thumbnails?.forEach((img) => {
    if (img instanceof File) formData.append("thumbnails", img);
  });

  return await api.put(`${PRODUCTS_PREFIX}/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};

export const getAllCatalog = async () => {
  try {
    const response = await api.get(`${PRODUCTS_PREFIX}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getCatalogById = async (id) => {
  try {
    const response = await api.get(`${PRODUCTS_PREFIX}/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateStock = async (id, stock) => {
  try {
    const response = await api.put(`${PRODUCTS_PREFIX}/update-stock/${id}`, {
      stock,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateSkuId = async (id, newSkuID) => {
  try {
    const response = await api.put(`${PRODUCTS_PREFIX}/update-sku/${id}`, {
      skuId: newSkuID,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteCatalog = async (id) => {
  try {
    const response = await api.delete(`${PRODUCTS_PREFIX}/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};