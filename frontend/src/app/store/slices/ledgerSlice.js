import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import {
  createLedgerApi,
} from "../api/ledgerApi";


const initialState = {
  ledgers: [],
  loading: false,
  error: null,
};


/*
|--------------------------------------------------------------------------
| Create Ledger
|--------------------------------------------------------------------------
*/

export const createLedger = createAsyncThunk(
  "ledgers/createLedger",

  async (data, { rejectWithValue }) => {
    try {

      const result = await createLedgerApi(data);

      return result;

    } catch (error) {

      return rejectWithValue(
        error.message || "Unable to create ledger"
      );

    }
  }
);


/*
|--------------------------------------------------------------------------
| Ledger Slice
|--------------------------------------------------------------------------
*/

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

    /*
    |--------------------------------------------------------------------------
    | Create Ledger - Loading
    |--------------------------------------------------------------------------
    */

    builder.addCase(
      createLedger.pending,
      (state) => {

        state.loading = true;
        state.error = null;

      }
    );


    /*
    |--------------------------------------------------------------------------
    | Create Ledger - Success
    |--------------------------------------------------------------------------
    */

    builder.addCase(
      createLedger.fulfilled,
      (state, action) => {

        state.loading = false;
        state.error = null;

        // Add newly created ledger
        state.ledgers.push(action.payload);

      }
    );


    /*
    |--------------------------------------------------------------------------
    | Create Ledger - Error
    |--------------------------------------------------------------------------
    */

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


/*
|--------------------------------------------------------------------------
| Actions
|--------------------------------------------------------------------------
*/

export const {
  clearLedgerError,
  setLedgerError,
} = ledgerSlice.actions;


/*
|--------------------------------------------------------------------------
| Reducer
|--------------------------------------------------------------------------
*/

export default ledgerSlice.reducer;