"use client"

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

// Initial tax exemptions and deductions
const initialExemptions = [
  {
    id: "80c",
    name: "Section 80C",
    description: "Investments in PPF, ELSS, etc.",
    maxLimit: 150000,
    applicable: "old",
  },
  { id: "80d", name: "Section 80D", description: "Medical Insurance Premium", maxLimit: 25000, applicable: "old" },
  { id: "hra", name: "HRA Exemption", description: "House Rent Allowance", maxLimit: null, applicable: "old" },
  { id: "lta", name: "LTA Exemption", description: "Leave Travel Allowance", maxLimit: null, applicable: "old" },
  {
    id: "std",
    name: "Standard Deduction",
    description: "Fixed deduction for salaried employees",
    maxLimit: 50000,
    applicable: "both",
  },
]

// Async thunks for configuration operations
export const fetchExemptions = createAsyncThunk("config/fetchExemptions", async (_, { rejectWithValue }) => {
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return initialExemptions
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const addExemption = createAsyncThunk("config/addExemption", async (exemptionData, { rejectWithValue }) => {
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Generate a new ID
    const newId = `exemption-${Date.now()}`

    return { ...exemptionData, id: newId }
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const updateExemption = createAsyncThunk(
  "config/updateExemption",
  async (exemptionData, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return exemptionData
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const deleteExemption = createAsyncThunk("config/deleteExemption", async (id, { rejectWithValue }) => {
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return id
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

const initialState = {
  exemptions: [],
  loading: false,
  error: null,
}

const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch exemptions
      .addCase(fetchExemptions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchExemptions.fulfilled, (state, action) => {
        state.loading = false
        state.exemptions = action.payload
      })
      .addCase(fetchExemptions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Add exemption
      .addCase(addExemption.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addExemption.fulfilled, (state, action) => {
        state.loading = false
        state.exemptions.push(action.payload)
      })
      .addCase(addExemption.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Update exemption
      .addCase(updateExemption.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateExemption.fulfilled, (state, action) => {
        state.loading = false
        const index = state.exemptions.findIndex((ex) => ex.id === action.payload.id)
        if (index !== -1) {
          state.exemptions[index] = action.payload
        }
      })
      .addCase(updateExemption.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Delete exemption
      .addCase(deleteExemption.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteExemption.fulfilled, (state, action) => {
        state.loading = false
        state.exemptions = state.exemptions.filter((ex) => ex.id !== action.payload)
      })
      .addCase(deleteExemption.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError } = configSlice.actions
export default configSlice.reducer

