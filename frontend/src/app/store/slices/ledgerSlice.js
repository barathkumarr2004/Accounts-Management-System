import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import {
  getLedgers,
  createLedgerApi,
} from "../api/ledgerApi";


const initialState = {

  ledgers: [],

  loading: false,

  error: null,

};


/*
|--------------------------------------------------------------------------
| Fetch Ledgers
|--------------------------------------------------------------------------
*/

export const fetchLedgers = createAsyncThunk(

  "ledgers/fetchLedgers",

  async (_, { rejectWithValue }) => {

    try {

      const result =
        await getLedgers();

      return result;

    } catch (error) {

      return rejectWithValue(
        error.message ||
        "Unable to load ledgers"
      );

    }

  }

);


/*
|--------------------------------------------------------------------------
| Create Ledger
|--------------------------------------------------------------------------
*/

export const createLedger = createAsyncThunk(

  "ledgers/createLedger",

  async (data, { rejectWithValue }) => {

    try {

      const result =
        await createLedgerApi(data);

      return result;

    } catch (error) {

      return rejectWithValue(
        error.message ||
        "Unable to create ledger"
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


    /*
    |--------------------------------------------------------------------------
    | Fetch
    |--------------------------------------------------------------------------
    */

    builder

      .addCase(
        fetchLedgers.pending,
        (state) => {

          state.loading = true;
          state.error = null;

        }
      )

      .addCase(
        fetchLedgers.fulfilled,
        (state, action) => {

          state.loading = false;

          state.ledgers =
            action.payload;

        }
      )

      .addCase(
        fetchLedgers.rejected,
        (state, action) => {

          state.loading = false;

          state.error =
            action.payload;

        }
      );


    /*
    |--------------------------------------------------------------------------
    | Create
    |--------------------------------------------------------------------------
    */

    builder

      .addCase(
        createLedger.pending,
        (state) => {

          state.loading = true;
          state.error = null;

        }
      )

      .addCase(
        createLedger.fulfilled,
        (state, action) => {

          state.loading = false;
          state.error = null;

          state.ledgers.push(
            action.payload
          );

        }
      )

      .addCase(
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