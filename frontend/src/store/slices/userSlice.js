import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../axios/api";
import { OAuthGoogle } from "../../firebase/firebaseConfig";

const AUTH_PREFIX = "/auth";

export const loginUser = createAsyncThunk(
  "user/loginUser",
  async (data, thunkApi) => {
    try {
      const response = await api.post(`${AUTH_PREFIX}/login`, {
        email: data.email,
        password: data.password,
      });
      return response.data;
    } catch (error) {
      return thunkApi.rejectWithValue({
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to Login User",
      });
    }
  }
);

export const signUpUser = createAsyncThunk(
  "user/signupUser",
  async (data, thunkApi) => {
    try {
      const response = await api.post(`${AUTH_PREFIX}/signup`, {
        email: data.email,
        password: data.password,
      });
      return response.data;
    } catch (error) {
      return thunkApi.rejectWithValue({
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to Sign Up User",
      });
    }
  }
);

export const googleOAuth = createAsyncThunk(
  "user/googleOAuth",
  async (data, thunkApi) => {
    try {
      const token = await OAuthGoogle();
      const response = await api.post(`${AUTH_PREFIX}/google-auth`, {
        idToken: token,
      });
      return response.data;
    } catch (error) {
      return thunkApi.rejectWithValue({
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to Authenticate with Google",
      });
    }
  }
);

export const fetchUser = createAsyncThunk("user/fetchUser",async (_ , thunkApi)=>{
    try {
         const response = await api.get(`${AUTH_PREFIX}/user`);
         return response.data;
    } catch (error) {
      return thunkApi.rejectWithValue({
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to Fetch User",
      });
    }
});

export const fetchAllUsers = createAsyncThunk("user/fetchAllUsers", async (_, thunkApi) => {
  try {
    const response = await api.get(`${AUTH_PREFIX}/users`);
    return response.data; 
  } catch (error) {
    return thunkApi.rejectWithValue(
      error.response?.data?.message || error.message || "Failed to fetch users"
    );
  }
});

export const logoutUser = createAsyncThunk("user/logoutUser" , async (_ , thunkApi)=>{
    try {
        const response = await api.post(`${AUTH_PREFIX}/logout`);
        return response.data;
    }catch (error) {
      return thunkApi.rejectWithValue({
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to Logout User",
      });
    }
})

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    users:[],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if(action.payload?.token){
            localStorage.setItem("token" , action.payload?.token);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || "Login failed";
      })
      
      .addCase(signUpUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if(action.payload?.token){
            localStorage.setItem("token" , action.payload?.token);
        }
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || "Signup failed";
      })

      .addCase(googleOAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(googleOAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        if(action.payload?.token){
            localStorage.setItem("token" , action.payload?.token);
        }
      })
      .addCase(googleOAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || "Google authentication failed";
      })
    .addCase(fetchUser.pending , (state, action)=>{
        state.isLoading =  true;
        state.error = null;
    })
    .addCase(fetchUser.fulfilled , (state , action)=>{
        state.isLoading = false;
        state.user = action.payload?.user;
    })
    .addCase(fetchUser.rejected , (state , action)=>{
        state.isLoading = false;
        state.error = action.payload?.error || "failed to Fetch User";
    })
    .addCase(fetchAllUsers.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(fetchAllUsers.fulfilled, (state, action) => {
      state.isLoading = false;
      state.users = action.payload|| []; 
    })
    .addCase(fetchAllUsers.rejected, (state, action) => {
      state.isLoading = false;
      // action.payload is now just the error string
      state.error = action.payload || "Failed to fetch users";
    })

    .addCase(logoutUser.pending , (state, action)=>{
        state.isLoading =  true;
        state.error = null;
    })
    .addCase(logoutUser.fulfilled , (state , action)=>{
        state.isLoading = false;
        state.user = null;
        state.error = null;
        localStorage.removeItem("token");
    })
    .addCase(logoutUser.rejected , (state , action)=>{
        state.isLoading = false;
        state.error = action.payload?.error || "failed to Logout User";
    });
  },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;