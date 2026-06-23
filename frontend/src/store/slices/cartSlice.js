import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createAddress,
  deleteAddress as deleteAddressService,
  getAddressByUserId,
  updateAddress as updateAddressService,
} from "../../services/addressService.js";

export const fetchAddresses = createAsyncThunk(
  "cart/fetchAddresses",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await getAddressByUserId(userId);
      if (res?.success) {
        const targetData = res.data?.data || res.data || [];
        return Array.isArray(targetData) ? targetData : [targetData];
      }
      return rejectWithValue("Failed to fetch addresses");
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createNewAddress = createAsyncThunk(
  "cart/createAddress",
  async ({ addr, userId }, { rejectWithValue }) => {
    try {
      const res = await createAddress(addr, userId);
      if (res?.success) {
        const targetData = res.data?.data || res.data;
        return Array.isArray(targetData) ? targetData[0] : targetData;
      }
      return rejectWithValue("Failed to create address");
    } catch (error) {
      return rejectWithValue(error.response.data.message || error.message);
    }
  }
);

export const modifyAddress = createAsyncThunk(
  "cart/modifyAddress",
  async ({ addressId, addressData, userId }, { rejectWithValue }) => {
    try {
      const res = await updateAddressService(addressId, addressData, userId);
      if (res?.success) {
        const targetData = res.data?.data || res.data;
        return Array.isArray(targetData) ? targetData[0] : targetData;
      }
      return rejectWithValue("Failed to update address");
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeAddress = createAsyncThunk(
  "cart/removeAddress",
  async ({ addressId, userId }, { rejectWithValue }) => {
    try {
      const res = await deleteAddressService(addressId, userId);
      if (res?.success) {
        return addressId;
      }
      return rejectWithValue("Failed to delete address");
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cart: [],
    address: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      const existingItem = state.cart.find((item) => item.pid === product.pid);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.cart.push({ ...product, quantity });
      }
    },
    updateCartItem: (state, action) => {
      const { pid, quantity } = action.payload;
      const item = state.cart.find((item) => item.pid === pid);
      if (item) {
        item.quantity = Math.max(1, quantity);
      }
    },
    removeFromCart: (state, action) => {
      const pid = action.payload.pid;
      state.cart = state.cart.filter((item) => item.pid !== pid);
    },
    updateCartItemQuantity(state, action) {
      const { pid, quantity } = action.payload;
      const item = state.cart.find((i) => i.pid === pid);
      if (item) {
        item.quantity = quantity;
      }
    },
    updateCartItemShipping: (state, action) => {
      const { pid, shipping_charge } = action.payload;
      const existingItem = state.cart.find((item) => item.pid === pid);
      if (existingItem) {
        existingItem.shipping_charge = shipping_charge;
      }
    },
    clearCart: (state) => {
      state.cart = [];
    },
    clearCartErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.address = action.payload;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(createNewAddress.fulfilled, (state, action) => {
        const inserted = action.payload;
        if (!inserted) return;

        if (inserted.isdefault) {
          state.address.forEach((addr) => {
            addr.isdefault = false;
          });
        }
        state.address.push(inserted);
      })

      .addCase(modifyAddress.fulfilled, (state, action) => {
        const updated = action.payload;
        if (!updated) return;

        if (updated.isdefault) {
          state.address.forEach((addr) => {
            addr.isdefault = false;
          });
        }

        const index = state.address.findIndex((addr) => addr.add_id === updated.add_id);
        if (index !== -1) {
          state.address[index] = updated;
        }
      })

      .addCase(removeAddress.fulfilled, (state, action) => {
        const addressId = action.payload;
        state.address = state.address.filter((addr) => addr.add_id !== addressId);
      });
  },
});

export const { addToCart, updateCartItem, removeFromCart, clearCart, clearCartErrors , updateCartItemQuantity , updateCartItemShipping } = cartSlice.actions;
export default cartSlice.reducer;