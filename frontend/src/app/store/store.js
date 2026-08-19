import { configureStore } from "@reduxjs/toolkit";

import groupReducer from "./slices/groupSlice";
import ledgerReducer from "./slices/ledgerSlice";

const store = configureStore({
  reducer: {
    groups: groupReducer,
    ledgers: ledgerReducer,
  },
});

export default store;
