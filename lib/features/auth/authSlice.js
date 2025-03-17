"use client"

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

// Mock user data
const users = [
  { id: 1, username: "hrmanager", password: "password", role: "HR Manager", name: "Priya Sharma" },
  { id: 2, username: "finance", password: "password", role: "Finance Team", name: "Rahul Verma" },
  { id: 3, username: "employee", password: "password", role: "Employee", name: "Ankit Patel", employeeId: "EMP001" },
]

export const loginUser = createAsyncThunk("auth/login", async ({ username, password }, { rejectWithValue }) => {
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const user = users.find((user) => user.username === username && user.password === password)

    if (!user) {
      return rejectWithValue("Invalid credentials")
    }

    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer

