import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import  { AxiosError } from "axios";
import { API_URL } from "../../api/api";
import axios from "../../api/axiosConfig";

interface UserState {
  user: object | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
  successMessage: null,
};

export const registerUser = createAsyncThunk(
  "users/registering",
  async (userData: object, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/users/registering`,
        userData
      );
      return response.data; // Assuming the response contains a success message and token
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>; // Type the error
      const errorMessage =
        axiosError.response?.data?.message || "An unexpected error occurred.";
      
      console.log(errorMessage)
      return rejectWithValue( errorMessage);
    }
  }
);
export const activateUser = async (token: string) => {
  try {
    const response = await axios.post(`${API_URL}/users/activate/${token}`)
    return response.data
  } catch (error) {
    console.log(error)
  }
}
// Async thunk for password reset (example for forgot password)
// export const forgotPassword = createAsyncThunk(
//   'user/forgotPassword',
//   async (email: string, { rejectWithValue }) => {
//     try {
//       const response = await Axios.post('YOUR_BACKEND_URL/forgot-password', { email });
//       return response.data; // Assuming the response contains a success message
//     } catch (error) {
//       return rejectWithValue(error.response?.data.message || 'Something went wrong');
//     }
//   }
// );

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // Register user
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user; // Assuming the response contains the user data
        state.successMessage = action.payload.message;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string; 
      });

    // Forgot password
    // builder
    //   .addCase(forgotPassword.pending, (state) => {
    //     state.loading = true;
    //     state.error = null;
    //   })
    //   .addCase(forgotPassword.fulfilled, (state, action: PayloadAction<any>) => {
    //     state.loading = false;
    //     state.successMessage = action.payload.message;
    //   })
    //   .addCase(forgotPassword.rejected, (state, action: PayloadAction) => {
    //     state.loading = false;
    //     state.error = action.payload;
    //   });
  },
});

export const { clearError, clearSuccessMessage } = userSlice.actions;

export default userSlice.reducer;
