import {createAsyncThunk,createSlice} from "@reduxjs/toolkit";
import { createPaymentApi } from "../api/paymentApi";

export const createPayment = createAsyncThunk(
  "payment/createPayment",
  async (data, { rejectWithValue }) => {
    try {
      return await createPaymentApi(data);
    } catch (error) {
      return rejectWithValue(
        error.message ||
          "Unable to create payment voucher"
      );
    }
  }
);

const initialState = {
  payment: null,
  loading: false,
  error: null,
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    clearPaymentError: (state) => {
      state.error = null;
    },
    clearPayment: (state) => {
      state.payment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.payment = action.payload;
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearPaymentError,
  clearPayment,
} = paymentSlice.actions;

export default paymentSlice.reducer;