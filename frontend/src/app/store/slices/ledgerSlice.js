import {createAsyncThunk,createSlice,} from "@reduxjs/toolkit";
import {createLedgerApi,} from "../api/ledgerApi";

const initialState = {
  ledgers: [],
  loading: false,
  error: null,
};

//create ledger
export const createLedger = createAsyncThunk("ledgers/createLedger",async (data, { rejectWithValue }) => {
    try {
      const result = await createLedgerApi(data);
      return result;
    } 
    catch (error) {
      return rejectWithValue(error.message || "Unable to create ledger");
    }
  }
);

//ledger slice
const ledgerSlice = createSlice({
  name: "ledgers",

  initialState,

  reducers: {
    // Clear error message
    clearLedgerError: (state) => {
      state.error = null;
    },

    // Set manual error
    setLedgerError: (state, action) => {
      state.error = action.payload;
    },

  },

  extraReducers: (builder) => {
//create ledger
    builder.addCase(createLedger.pending,(state) => {
        state.loading = true;
        state.error = null;
      }
    );

    builder.addCase(createLedger.fulfilled,(state, action) => {
        state.loading = false;
        state.error = null;
        state.ledgers.push(action.payload);
      }
    );

    builder.addCase( createLedger.rejected,(state, action) => {
        state.loading = false;
        state.error = action.payload || "Unable to create ledger";
      }
    );

  },

});

//actions

export const { clearLedgerError, setLedgerError,} = ledgerSlice.actions;
export default ledgerSlice.reducer;