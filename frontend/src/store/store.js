import { configureStore } from "@reduxjs/toolkit";

import groupReducer from "./slices/groupSlice";
import ledgerReducer from "./slices/ledgerSlice";
import journalReducer from "./slices/journalSlice";
import profitLossReducer from "./slices/profitLossSlice";
import stockReducer from "./slices/stockSlice";
import salesReducer from "./slices/salesSlice";
import purchaseReducer from "./slices/purchaseSlice";
import { chartOfAccountsApi } from "./api/chartOfAccountsApi";


const store = configureStore({
  reducer: {
    groups: groupReducer,
    ledgers: ledgerReducer,
    journals: journalReducer,
    profitLoss: profitLossReducer,
    stock: stockReducer,
    sales: salesReducer,
    purchase: purchaseReducer,

    [chartOfAccountsApi.reducerPath]: chartOfAccountsApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(chartOfAccountsApi.middleware),
});

export default store;