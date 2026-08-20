import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import {
  getLedgersApi,
  createLedgerApi,
} from "../api/ledgerApi";

const initialState = {
  ledgers: [],
  loading: false,
  error: null,
};

// Get Ledgers
export const getLedgers = createAsyncThunk(
  "ledgers/getLedgers",
  async (_, { rejectWithValue }) => {
    try {
      const result = await getLedgersApi();

      return result.data || [];
    } catch (error) {
      return rejectWithValue(
        error.message || "Unable to load ledgers"
      );
    }
  }
);

// Create Ledger
export const createLedger = createAsyncThunk(
  "ledgers/createLedger",
  async (data, { rejectWithValue }) => {
    try {
      const result = await createLedgerApi(data);

      return result.data;
    } catch (error) {
      return rejectWithValue(
        error.message || "Unable to create ledger"
      );
    }
  }
);

const ledgerSlice = createSlice({
  name: "ledgers",
  initialState,

  reducers: {
    clearLedgerError: (state) => {
      state.error = null;
    },

    setLedgerError: (state, action) => {
      state.error = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder.addCase(
      getLedgers.pending,
      (state) => {
        state.loading = true;
        state.error = null;
      }
    );

    builder.addCase(
      getLedgers.fulfilled,
      (state, action) => {
        state.loading = false;
        state.error = null;
        state.ledgers = action.payload;
      }
    );

    builder.addCase(
      getLedgers.rejected,
      (state, action) => {
        state.loading = false;
        state.error =
          action.payload ||
          "Unable to load ledgers";
      }
    );

    builder.addCase(
      createLedger.pending,
      (state) => {
        state.loading = true;
        state.error = null;
      }
    );

    builder.addCase(
      createLedger.fulfilled,
      (state, action) => {
        state.loading = false;
        state.error = null;

        if (action.payload) {
          state.ledgers.push(action.payload);
        }
      }
    );

    builder.addCase(
      createLedger.rejected,
      (state, action) => {
        state.loading = false;
        state.error =
          action.payload ||
          "Unable to create ledger";
      }
    );
  },
});

export const {
  clearLedgerError,
  setLedgerError,
} = ledgerSlice.actions;

export default ledgerSlice.reducer;