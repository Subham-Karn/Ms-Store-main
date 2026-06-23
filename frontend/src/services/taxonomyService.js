import api from "../axios/api.js";

export const createTaxonomy = async (payload) => {
  try {
    let endpoint = payload.type === "categories" ? "/categories" : "/menu";
    let backendPayload = {};

    if (payload.type === "categories") {
      backendPayload = {
        c_title: payload.name,
        userId: payload.userId,
        parentId: payload.parentId || null,
      };
    } else {
      // Logic for Menus/Submenus
      if (payload.parentId) {
        endpoint = "/menu/submenu";
        backendPayload = {
          menu_id: payload.parentId,
          sub_menu_name: payload.name,
          sub_menu_slug: payload.name.toLowerCase().replace(/\s+/g, "-"),
        };
      } else {
        backendPayload = {
          menu_name: payload.name,
          menu_slug: payload.name.toLowerCase().replace(/\s+/g, "-"),
        };
      }
    }
    const response = await api.post(endpoint, backendPayload);
    return response.data;
  } catch (error) {
    console.error("Taxonomy Service Error:", error);
    throw error.response?.data || error;
  }
};

export const deleteTaxonomy = async (id, type) => {
  try {
    const endpoint = type === 'categories' ? `/categories/${id}` : `/menu/${id}`;
    const response = await api.delete(endpoint);
    return response.data;
  } catch (error) {
    console.error("Delete Taxonomy Error:", error);
    throw error.response?.data || error;
  }
};