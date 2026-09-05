import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";
import { createPurchaseApi } from "../api/purchaseApi";

export const createPurchase = createAsyncThunk(
  "purchase/createPurchase",
  async (purchase, { rejectWithValue }) => {
    try {
      return await createPurchaseApi(purchase);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  purchase: null,
  loading: false,
  error: null,
};

const purchaseSlice = createSlice({
  name: "purchase",
  initialState,
  reducers: {
    clearPurchaseError: (state) => {
      state.error = null;
    },
    clearPurchase: (state) => {
      state.purchase = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPurchase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPurchase.fulfilled, (state, action) => {
        state.loading = false;
        state.purchase = action.payload;
      })
      .addCase(createPurchase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearPurchaseError,
  clearPurchase,
} = purchaseSlice.actions;

export default purchaseSlice.reducer;