import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getGroups, createGroupApi } from "../api/groupApi";

const initialState = {
  groups: [],
  loading: false,
  error: null,
};

export const fetchGroups = createAsyncThunk("groups/fetchGroups",async (_, { rejectWithValue }) => {
    try {
      const result = await getGroups();
      return result;
    } 
    catch (error) {
      return rejectWithValue(error.message || "Unable to load groups");
    }
  }
);

export const createGroup = createAsyncThunk("groups/createGroup",async (data, { rejectWithValue }) => {
    try {
      const result = await createGroupApi(data);
      return result;
    } 
    catch (error) {
      return rejectWithValue(error.message || "Unable to create group");
    }
  }
);

const groupSlice = createSlice({
  name: "groups",

  initialState,

  reducers: {
    clearGroupError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    //fetchgroup
    builder.addCase(fetchGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = action.payload;
      })

      .addCase(fetchGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Group
      .addCase(createGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(createGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.groups.push(action.payload);
      })

      .addCase(createGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearGroupError } = groupSlice.actions;

export default groupSlice.reducer;