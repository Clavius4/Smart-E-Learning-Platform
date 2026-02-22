// assessmentSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "./assessmentDetailsApi";

// Thunks
export const fetchAssessments = createAsyncThunk(
  "assessments/fetchAll",
  async (token, { rejectWithValue }) => {
    try {
      const data = await api.getAllAssessmentsByInstructor(token);
      return data; // Expecting an array of assessments
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createNewAssessment = createAsyncThunk(
  "assessments/create",
  async ({ token, data }, { rejectWithValue }) => {
    try {
      const newAssessment = await api.createAssessment(token, data);
      return newAssessment;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateExistingAssessment = createAsyncThunk(
  "assessments/update",
  async ({ assessmentId, token, data }, { rejectWithValue }) => {
    try {
      const updated = await api.updateAssessment(assessmentId, token, data);
      return updated;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteExistingAssessment = createAsyncThunk(
  "assessments/delete",
  async ({ assessmentId, token }, { rejectWithValue }) => {
    try {
      await api.deleteAssessment(assessmentId, token);
      return assessmentId;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Initial state with separate loading & error flags per action
const initialState = {
  items: [],
  loadingFetch: false,
  loadingCreate: false,
  loadingUpdate: false,
  loadingDelete: false,
  errorFetch: null,
  errorCreate: null,
  errorUpdate: null,
  errorDelete: null,
};

const assessmentSlice = createSlice({
  name: "assessments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // FETCH assessments
      .addCase(fetchAssessments.pending, (state) => {
        state.loadingFetch = true;
        state.errorFetch = null;
      })
      .addCase(fetchAssessments.fulfilled, (state, action) => {
        state.loadingFetch = false;
        state.items = action.payload;
        state.errorFetch = null;
      })
      .addCase(fetchAssessments.rejected, (state, action) => {
        state.loadingFetch = false;
        state.errorFetch = action.payload || action.error.message;
      })

      // CREATE assessment
      .addCase(createNewAssessment.pending, (state) => {
        state.loadingCreate = true;
        state.errorCreate = null;
      })
      .addCase(createNewAssessment.fulfilled, (state, action) => {
        state.loadingCreate = false;
        state.items.push(action.payload);
        state.errorCreate = null;
      })
      .addCase(createNewAssessment.rejected, (state, action) => {
        state.loadingCreate = false;
        state.errorCreate = action.payload || action.error.message;
      })

      // UPDATE assessment
      .addCase(updateExistingAssessment.pending, (state) => {
        state.loadingUpdate = true;
        state.errorUpdate = null;
      })
      .addCase(updateExistingAssessment.fulfilled, (state, action) => {
        state.loadingUpdate = false;
        const idx = state.items.findIndex(a => a._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
        state.errorUpdate = null;
      })
      .addCase(updateExistingAssessment.rejected, (state, action) => {
        state.loadingUpdate = false;
        state.errorUpdate = action.payload || action.error.message;
      })

      // DELETE assessment
      .addCase(deleteExistingAssessment.pending, (state) => {
        state.loadingDelete = true;
        state.errorDelete = null;
      })
      .addCase(deleteExistingAssessment.fulfilled, (state, action) => {
        state.loadingDelete = false;
        state.items = state.items.filter(a => a._id !== action.payload);
        state.errorDelete = null;
      })
      .addCase(deleteExistingAssessment.rejected, (state, action) => {
        state.loadingDelete = false;
        state.errorDelete = action.payload || action.error.message;
      });
  },
});

export default assessmentSlice.reducer;
