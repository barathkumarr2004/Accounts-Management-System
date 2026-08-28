import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getProfitLossApi,
  getLedgerVouchersApi,
} from "../api/profitLossApi";

const getError = (error, message) =>
  error.response?.data?.message || error.message || message;

export const fetchProfitLoss = createAsyncThunk(
  "profitLoss/fetchProfitLoss",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getProfitLossApi();
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(
        getError(error, "Unable to fetch Profit & Loss")
      );
    }
  }
);

export const fetchLedgerVouchers = createAsyncThunk(
  "profitLoss/fetchLedgerVouchers",
  async (ledgerId, { rejectWithValue }) => {
    try {
      const response = await getLedgerVouchersApi(ledgerId);
      return response.data?.data || response.data || [];
    } catch (error) {
      return rejectWithValue(
        getError(error, "Unable to fetch ledger vouchers")
      );
    }
  }
);


const initialState = {
  data: null,
  ledgerVouchers: [],
  voucherDetail: null,
  loading: false,
  ledgerVouchersLoading: false,
  voucherDetailLoading: false,
  error: null,
  ledgerVouchersError: null,
  voucherDetailError: null,
};

const profitLossSlice = createSlice({
  name: "profitLoss",
  initialState,

  reducers: {
    clearProfitLossError: (state) => {
      state.error = null;
    },

    clearLedgerVouchers: (state) => {
      state.ledgerVouchers = [];
      state.ledgerVouchersError = null;
      state.ledgerVouchersLoading = false;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchProfitLoss.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfitLoss.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.data = action.payload;
      })
      .addCase(fetchProfitLoss.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Unable to fetch Profit & Loss";
      })

      .addCase(fetchLedgerVouchers.pending, (state) => {
        state.ledgerVouchersLoading = true;
        state.ledgerVouchersError = null;
      })
      .addCase(fetchLedgerVouchers.fulfilled, (state, action) => {
        state.ledgerVouchersLoading = false;
        state.ledgerVouchersError = null;
        state.ledgerVouchers = Array.isArray(action.payload)
          ? action.payload
          : [];
      })
      .addCase(fetchLedgerVouchers.rejected, (state, action) => {
        state.ledgerVouchersLoading = false;
        state.ledgerVouchersError =
          action.payload || "Unable to fetch ledger vouchers";
      })
  },
});

export const {
  clearProfitLossError,
  clearLedgerVouchers,
} = profitLossSlice.actions;

export default profitLossSlice.reducer;