import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getStocksApi,
  getNextItemCodeApi,
  createStockApi,
  updateStockApi,
  deleteStockApi,
} from "../api/stockApi";

export const fetchStocks = createAsyncThunk(
  "stock/fetchStocks",
  async (_, { rejectWithValue }) => {
    try {
      return await getStocksApi();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchNextItemCode = createAsyncThunk(
  "stock/fetchNextItemCode",
  async (_, { rejectWithValue }) => {
    try {
      return await getNextItemCodeApi();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createStock = createAsyncThunk(
  "stock/createStock",
  async (stock, { rejectWithValue }) => {
    try {
      return await createStockApi(stock);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateStock = createAsyncThunk(
  "stock/updateStock",
  async ({ id, stock }, { rejectWithValue }) => {
    try {
      return await updateStockApi(id, stock);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteStock = createAsyncThunk(
  "stock/deleteStock",
  async (id, { rejectWithValue }) => {
    try {
      await deleteStockApi(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  stocks: [],
  nextItemCode: "",
  loading: false,
  error: null,
};

const stockSlice = createSlice({
  name: "stock",
  initialState,
  reducers: {
    clearStockError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStocks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStocks.fulfilled, (state, action) => {
        state.loading = false;
        state.stocks = action.payload;
      })
      .addCase(fetchStocks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchNextItemCode.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchNextItemCode.fulfilled, (state, action) => {
      state.nextItemCode = action.payload;
      })
      .addCase(fetchNextItemCode.rejected, (state, action) => {
      state.error = action.payload;
      })

      .addCase(createStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStock.fulfilled, (state, action) => {
        state.loading = false;
        state.stocks.unshift(action.payload);
      })
      .addCase(createStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStock.fulfilled, (state, action) => {
        state.loading = false;

        const index = state.stocks.findIndex(
          (stock) => stock.id === action.payload.id
        );

        if (index !== -1) {
          state.stocks[index] = action.payload;
        }
      })
      .addCase(updateStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStock.fulfilled, (state, action) => {
        state.loading = false;

        state.stocks = state.stocks.filter(
          (stock) => stock.id !== action.payload
        );
      })
      .addCase(deleteStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearStockError } = stockSlice.actions;

export default stockSlice.reducer;