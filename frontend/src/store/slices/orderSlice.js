import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersByUserId,
} from "../../services/ordersServices";


export const createNewOrder = createAsyncThunk(
  "orders/createNewOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/orders`, {
        method: "POST",
        body: orderData 
      });
      const responseData = await res.json();
      if (!res.ok) {
        throw new Error(responseData.message || "Failed to create order");
      }
      const payload = responseData?.data ?? responseData;
      const order   = payload?.order ?? payload;
      
      if (!order) throw new Error("Invalid response from server");
      
      return order; 
      
    } catch (error) {
      return rejectWithValue(error.message || "Something went wrong");
    }
  }
);

export const  fetchOrderById = createAsyncThunk("orders/fetchOrderById" , async (data , thunkApi)=>{
   try {
      const response = await getOrderById(data?.orderId);
      return response.data;
   } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
   }
})

export const fetchUserOrders = createAsyncThunk(
  "orders/fetchUserOrders",
  async (userId, { rejectWithValue }) => {
    try {
      const res        = await getOrdersByUserId(userId);
      const payload    = res?.data ?? res;
      const orders     = Array.isArray(payload) ? payload : payload?.orders ?? [];
      return orders;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  }
);

export const fetchAllOrdersAdmin = createAsyncThunk(
  "orders/fetchAllOrdersAdmin",
  async (isAdmin = false, { rejectWithValue }) => {
    try {
      if (!isAdmin) {
        return rejectWithValue("Unauthorized");
      }
      const res     = await getAllOrders();
      const payload = res?.data ?? res;
      return Array.isArray(payload) ? payload : payload?.orders ?? [];
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  }
);


const orderSlice = createSlice({
  name: "orders",
  initialState: {
    orders:    [],
    isLoading: false, 
    error:     null,
  },
  reducers: {
    clearOrderErrors: (state) => {
      state.error = null;
    },
    clearOrders: (state) => {
      state.orders = [];
    },
  },
  extraReducers: (builder) => {
    // ── createNewOrder ──────────────────────────────
    builder
      .addCase(createNewOrder.pending, (state) => {
        state.isLoading = true;
        state.error     = null;
      })
      .addCase(createNewOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.orders.push(action.payload); // add new order to local list
        }
      })
      .addCase(createNewOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error     = action.payload;
      });

    // ── fetchUserOrders ─────────────────────────────
    builder
      .addCase(fetchUserOrders.pending, (state) => {
        state.isLoading = true;
        state.error     = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders    = action.payload;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error     = action.payload;
      });

    // ── fetchAllOrdersAdmin ─────────────────────────
    builder
      .addCase(fetchAllOrdersAdmin.pending, (state) => {
        state.isLoading = true;
        state.error     = null;
      })
      .addCase(fetchAllOrdersAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders    = action.payload;
      })
      .addCase(fetchAllOrdersAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error     = action.payload;
      });
  },
});

export const { clearOrderErrors, clearOrders } = orderSlice.actions;
export default orderSlice.reducer;