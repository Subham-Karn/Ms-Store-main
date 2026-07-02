import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  addCatalog,
  deleteCatalog,
  getAllCatalog,
} from "../../services/catalogService.js";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
} from "../../services/categoriesService.js";
import {
  addComment,
  deleteComment,
  getAllComments,
} from "../../services/commentService.js";
import { getAllMenuAndSubMenu } from "../../services/menuService.js";
import api from "../../axios/api.js";

// --- Async Thunks ---

export const fetchCatalogs = createAsyncThunk(
  "app/fetchCatalogs",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getAllCatalog();
      return Array.isArray(res?.data) ? res.data : [];
    } catch (error) {
      console.error("Fetch Catalog Error:", error);
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch catalogs",
      );
    }
  },
);

export const deleteBulkProducts = createAsyncThunk(
  "app/deleteBulkProducts",
  async ({ selectedProducts }, { rejectWithValue }) => {
    try {
      const response = await api.delete("/products/bulk-delete", {
        data: { productIds: selectedProducts },
      });
      // Return both server response and the targeted IDs to filter local state safely
      return { data: response.data, removedIds: selectedProducts };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data ||
          error.message ||
          "Failed to Delete products",
      );
    }
  },
);

export const createNewCatalog = createAsyncThunk(
  "app/addCatalog",
  async ({ catalogData, userId }, { rejectWithValue }) => {
    try {
      return await addCatalog(catalogData, userId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add catalog",
      );
    }
  },
);

export const deleteProduct = createAsyncThunk(
  "app/deleteCatalog",
  async (catalogId, { rejectWithValue }) => {
    try {
      await deleteCatalog(catalogId);
      return catalogId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Delete failed");
    }
  },
);

export const fetchCategories = createAsyncThunk(
  "app/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getAllCategories();
      return res?.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch categories",
      );
    }
  },
);

export const createNewCategory = createAsyncThunk(
  "app/createCategory",
  async ({ category, userId, parentId }, { rejectWithValue }) => {
    try {
      return await createCategory(category, userId, parentId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create category",
      );
    }
  },
);

export const modifyCategory = createAsyncThunk(
  "app/updateCategory",
  async ({ category, userId }, { rejectWithValue }) => {
    try {
      return await updateCategory(category, userId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update category",
      );
    }
  },
);

export const removeCategory = createAsyncThunk(
  "app/deleteCategory",
  async ({ category, userId }, { rejectWithValue }) => {
    try {
      return await deleteCategory(category, userId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete category",
      );
    }
  },
);

export const fetchComments = createAsyncThunk(
  "app/fetchComments",
  async (pid, { rejectWithValue }) => {
    try {
      const res = await getAllComments(pid);
      const targetComments = res?.data || res || [];
      return Array.isArray(targetComments) ? targetComments : [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch comments",
      );
    }
  },
);

export const postComment = createAsyncThunk(
  "app/createComment",
  async (data, { rejectWithValue }) => {
    try {
      const payload = {
        pid: data.pid,
        userid: data.userid,
        comment: data.comment,
        rate: data.rate,
      };
      return await addComment(payload);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to post comment",
      );
    }
  },
);

export const removeComment = createAsyncThunk(
  "app/deleteComment",
  async ({ id, pid }, { rejectWithValue }) => {
    try {
      return await deleteComment(id, pid);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove comment",
      );
    }
  },
);

export const fetchMenus = createAsyncThunk(
  "app/fetchMenus",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getAllMenuAndSubMenu();
      if (res?.success === false) {
        throw new Error(res.message);
      }
      const menuData = res?.data || res || [];
      return Array.isArray(menuData) ? menuData : [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch menus",
      );
    }
  },
);

export const bulkProductAdd = createAsyncThunk(
  "app/bulkProductAdd",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post("/products/bulk", {
        userId: payload.userId,
        products: payload.products,
      });
      dispatch(fetchCatalogs());
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || error.message || "Failed to Add Bulk Product",
      );
    }
  },
);

// --- Slice Configuration ---

const appSlice = createSlice({
  name: "app",
  initialState: {
    catalogs: [],
    category: [],
    comments: [],
    menus: [],
    users: [],
    loading: false,
    menuLoading: false,
    error: null,
    deleteLoad: false,
  },
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    clearAppErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch Catalogs ---
      .addCase(fetchCatalogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCatalogs.fulfilled, (state, action) => {
        state.loading = false;
        state.catalogs = action.payload;
      })
      .addCase(fetchCatalogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Bulk Delete Products ---
      .addCase(deleteBulkProducts.pending, (state) => {
        state.deleteLoad = true;
        state.error = null;
      })
      .addCase(deleteBulkProducts.fulfilled, (state, action) => {
        state.deleteLoad = false;
        state.error = null;
        // ✅ FIX: Instead of wiping the array clear, filter out items that were just deleted
        const { removedIds } = action.payload;
        state.catalogs = state.catalogs.filter(
          (item) => !removedIds.includes(item.pid),
        );
      })
      .addCase(deleteBulkProducts.rejected, (state, action) => {
        state.deleteLoad = false;
        state.error = action.payload;
      })

      // --- Single Delete Product ---
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.catalogs = state.catalogs.filter(
          (item) => item.pid !== action.payload,
        );
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Fetch Categories ---
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.category = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Fetch Comments ---
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Fetch Menus ---
      .addCase(fetchMenus.pending, (state) => {
        state.menuLoading = true;
      })
      .addCase(fetchMenus.fulfilled, (state, action) => {
        state.menuLoading = false;
        state.menus = action.payload;
      })
      .addCase(fetchMenus.rejected, (state, action) => {
        state.menuLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setLoading, clearAppErrors } = appSlice.actions;
export default appSlice.reducer;
