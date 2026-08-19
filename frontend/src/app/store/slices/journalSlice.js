import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import {
  createJournalApi,
} from "../api/journalApi";


const initialState = {
  journals: [],
  loading: false,
  error: null,
  success: false,
};


export const createJournal = createAsyncThunk(
  "journals/createJournal",

  async (data, { rejectWithValue }) => {
    try {

      const result =
        await createJournalApi(data);

      return result;

    } catch (error) {

      return rejectWithValue(
        error.message ||
        "Unable to create journal"
      );

    }
  }
);


const journalSlice = createSlice({

  name: "journals",

  initialState,

  reducers: {

    clearJournalError: (state) => {
      state.error = null;
    },

    clearJournalSuccess: (state) => {
      state.success = false;
    },

  },

  extraReducers: (builder) => {

    // Pending

    builder.addCase(
      createJournal.pending,
      (state) => {

        state.loading = true;
        state.error = null;
        state.success = false;

      }
    );


    // Success

    builder.addCase(
      createJournal.fulfilled,
      (state, action) => {

        state.loading = false;
        state.error = null;
        state.success = true;

        state.journals.push(
          action.payload
        );

      }
    );


    // Error

    builder.addCase(
      createJournal.rejected,
      (state, action) => {

        state.loading = false;

        state.error =
          action.payload ||
          "Unable to create journal";

        state.success = false;

      }
    );

  },

});


export const {
  clearJournalError,
  clearJournalSuccess,
} = journalSlice.actions;


export default journalSlice.reducer;