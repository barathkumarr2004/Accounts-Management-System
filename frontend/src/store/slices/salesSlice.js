import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";
import { createSalesApi } from "../api/salesApi";

export const createSales = createAsyncThunk(
  "sales/createSales",
  async (sales, { rejectWithValue }) => {
    try {
      return await createSalesApi(sales);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  sales: null,
  loading: false,
  error: null,
};

const salesSlice = createSlice({
  name: "sales",
  initialState,
  reducers: {
    clearSalesError: (state) => {
      state.error = null;
    },
    clearSales: (state) => {
      state.sales = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createSales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSales.fulfilled, (state, action) => {
        state.loading = false;
        state.sales = action.payload;
      })
      .addCase(createSales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearSalesError,
  clearSales,
} = salesSlice.actions;

export default salesSlice.reducer;