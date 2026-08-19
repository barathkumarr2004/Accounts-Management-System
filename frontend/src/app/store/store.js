import { configureStore } from "@reduxjs/toolkit";

import groupReducer from "./slices/groupSlice";
import ledgerReducer from "./slices/ledgerSlice";
import journalReducer from "./slices/journalSlice";


const store = configureStore({

  reducer: {

    groups: groupReducer,

    ledgers: ledgerReducer,

    journals: journalReducer,

  },

});


export default store;