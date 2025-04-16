import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_URL } from "../../api/api";
import axios from "../../api/axiosConfig";
import { AxiosError } from "axios";

// Define initial state
interface AuthState {
  user: null | object;
  token: null | string;
  isLoggedIn: boolean;
  loading: boolean;
  error: null | string;
}
 
const initialState: AuthState = {
  user: null,
  token: null,
  isLoggedIn: false,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (
    loginData: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, loginData);

      const { token, user } = response.data; // Adjusted to match backend response
      // localStorage.setItem("userToken", token); // Store the token in localStorage
      return { user, token };
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>; // Type the error
      const errorMessage =
        axiosError.response?.data?.message || "An unexpected error occurred.";
      return rejectWithValue(errorMessage);
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await axios.post(`${API_URL}/auth/logout`);

    console.log("Logout successful");
    return "Logout successful";
  } catch (error) {
    console.error("Logout failed:", error);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isLoggedIn = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.error = null;
        state.loading = false;
        state.isLoggedIn = false;
      })
      .addCase(logout.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

// export const { logout } = authSlice.actions;
export default authSlice.reducer;
