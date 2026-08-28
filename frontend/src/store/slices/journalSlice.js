import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  createJournalVoucherApi,
  getJournalsApi,
  getJournalByIdApi,
} from "../api/journalApi";

const initialState = {
  journals: [],
  selectedJournal: null,
  loading: false,
  error: null,
};

// Create Journal Voucher
export const createJournalVoucher = createAsyncThunk(
  "journals/createJournalVoucher",

  async (data, { rejectWithValue }) => {
    try {
      const result = await createJournalVoucherApi(data);

      return result.data;
    } catch (error) {
      return rejectWithValue(
        error.message || "Unable to create journal voucher"
      );
    }
  }
);

// Get Journal Vouchers
export const fetchJournalVouchers = createAsyncThunk(
  "journals/fetchJournalVouchers",

  async (_, { rejectWithValue }) => {
    try {
      const result = await getJournalsApi();

      return result.data;
    } catch (error) {
      return rejectWithValue(
        error.message || "Unable to fetch journal vouchers"
      );
    }
  }
);

// Get Journal Voucher By ID
export const fetchJournalVoucherById = createAsyncThunk(
  "journals/fetchJournalVoucherById",

  async (id, { rejectWithValue }) => {
    try {
      const result = await getJournalByIdApi(id);

      return result.data;
    } catch (error) {
      return rejectWithValue(
        error.message || "Unable to fetch journal voucher"
      );
    }
  }
);

// Journal Slice
const journalSlice = createSlice({
  name: "journals",

  initialState,

  reducers: {
    clearJournalError: (state) => {
      state.error = null;
    },

    setJournalError: (state, action) => {
      state.error = action.payload;
    },

    clearSelectedJournal: (state) => {
      state.selectedJournal = null;
    },
  },

  extraReducers: (builder) => {
    // Create Journal
    builder.addCase(
      createJournalVoucher.pending,
      (state) => {
        state.loading = true;
        state.error = null;
      }
    );

    builder.addCase(
      createJournalVoucher.fulfilled,
      (state, action) => {
        state.loading = false;
        state.error = null;
        state.journals.push(action.payload);
      }
    );

    builder.addCase(
      createJournalVoucher.rejected,
      (state, action) => {
        state.loading = false;
        state.error =
          action.payload ||
          "Unable to create journal voucher";
      }
    );

    // Fetch Journals
    builder.addCase(
      fetchJournalVouchers.pending,
      (state) => {
        state.loading = true;
        state.error = null;
      }
    );

    builder.addCase(
      fetchJournalVouchers.fulfilled,
      (state, action) => {
        state.loading = false;
        state.error = null;
        state.journals = action.payload;
      }
    );

    builder.addCase(
      fetchJournalVouchers.rejected,
      (state, action) => {
        state.loading = false;
        state.error =
          action.payload ||
          "Unable to fetch journal vouchers";
      }
    );

    // Fetch Journal By ID
    builder.addCase(
      fetchJournalVoucherById.pending,
      (state) => {
        state.loading = true;
        state.error = null;
      }
    );

    builder.addCase(
      fetchJournalVoucherById.fulfilled,
      (state, action) => {
        state.loading = false;
        state.error = null;
        state.selectedJournal = action.payload;
      }
    );

    builder.addCase(
      fetchJournalVoucherById.rejected,
      (state, action) => {
        state.loading = false;
        state.error =
          action.payload ||
          "Unable to fetch journal voucher";
      }
    );
  },
});

// Actions
export const {
  clearJournalError,
  setJournalError,
  clearSelectedJournal,
} = journalSlice.actions;

// Reducer
export default journalSlice.reducer;
