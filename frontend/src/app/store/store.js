import { configureStore } from "@reduxjs/toolkit";

import groupReducer from "./slices/groupSlice";
import ledgerReducer from "./slices/ledgerSlice";
import journalReducer from "./slices/journalSlice";
import profitLossReducer from "./slices/profitLossSlice";

import { chartOfAccountsApi } from "./api/chartOfAccountsApi";

const store = configureStore({
  reducer: {
    groups: groupReducer,
    ledgers: ledgerReducer,
    journals: journalReducer,
    profitLoss: profitLossReducer,

    [chartOfAccountsApi.reducerPath]: chartOfAccountsApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(chartOfAccountsApi.middleware),
});

export default store;