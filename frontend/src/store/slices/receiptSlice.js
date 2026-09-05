import {createAsyncThunk,createSlice,} from "@reduxjs/toolkit";
import { createReceiptApi } from "../api/receiptApi";

export const createReceipt = createAsyncThunk(
  "receipt/createReceipt",
  async (data, { rejectWithValue }) => {
    try {
      return await createReceiptApi(data);
    } catch (error) {
      return rejectWithValue(
        error.message ||
          "Unable to create receipt voucher"
      );
    }
  }
);

const initialState = {
  receipt: null,
  loading: false,
  error: null,
};

const receiptSlice = createSlice({
  name: "receipt",
  initialState,
  reducers: {
    clearReceiptError: (state) => {
      state.error = null;
    },
    clearReceipt: (state) => {
      state.receipt = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createReceipt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReceipt.fulfilled, (state, action) => {
        state.loading = false;
        state.receipt = action.payload;
      })
      .addCase(createReceipt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearReceiptError,
  clearReceipt,
} = receiptSlice.actions;

export default receiptSlice.reducer;