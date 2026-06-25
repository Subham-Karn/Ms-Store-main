import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { addCatalog, deleteCatalog, getAllCatalog } from "../../services/catalogService.js";
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


export const fetchCatalogs = createAsyncThunk(
  "app/fetchCatalogs",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getAllCatalog();

      console.log("Catalog API Response:", res);

      return Array.isArray(res?.data) ? res.data : [];
    } catch (error) {
      console.log("Fetch Catalog Error:", error);

      return rejectWithValue(
        error?.message || "Failed to fetch catalogs"
      );
    }
  }
);

export const createNewCatalog = createAsyncThunk(
  "app/addCatalog",
  async ({ catalogData, userId }, { rejectWithValue }) => {
    try {
      return await addCatalog(catalogData, userId);
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
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
  }
);


export const fetchCategories = createAsyncThunk(
  "app/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getAllCategories();
      const rawCategories = res.data || [];
      return rawCategories;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const createNewCategory = createAsyncThunk(
  "app/createCategory",
  async ({ category, userId  , parentId}, { rejectWithValue }) => {
    try {
      return await createCategory(category, userId , parentId);
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const modifyCategory = createAsyncThunk(
  "app/updateCategory",
  async ({ category, userId }, { rejectWithValue }) => {
    try {
      return await updateCategory(category, userId);
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const removeCategory = createAsyncThunk(
  "app/deleteCategory",
  async ({ category, userId }, { rejectWithValue }) => {
    try {
      return await deleteCategory(category, userId);
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);


export const fetchComments = createAsyncThunk(
  "app/fetchComments",
  async (pid, { rejectWithValue }) => {
    try {
      const res = await getAllComments(pid);
      const targetComments = res?.data || res || [];
      return Array.isArray(targetComments) ? targetComments : [];
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
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
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const removeComment = createAsyncThunk(
  "app/deleteComment",
  async ({ id, pid }, { rejectWithValue }) => {
    try {
      return await deleteComment(id, pid);
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
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
      return rejectWithValue(error.response.data.message);
    }
  }
);


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

      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.catalogs = state.catalogs.filter(
          (item) => item.pid !== action.payload 
        );
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false; // Set to false, not true
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

export const { setLoading, setIsLogin, clearAppErrors } = appSlice.actions;
export default appSlice.reducer;