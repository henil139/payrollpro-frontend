"use client"

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

// Mock employee data
const initialEmployees = [
  {
    id: "EMP001",
    name: "Ankit Patel",
    email: "ankit.patel@example.com",
    phone: "9876543210",
    pan: "ABCDE1234F",
    bankDetails: {
      accountNumber: "1234567890",
      ifscCode: "HDFC0001234",
      bankName: "HDFC Bank",
    },
    designation: "Software Engineer",
    department: "Engineering",
    joiningDate: "2022-01-15",
    salary: {
      basic: 50000,
      hra: 20000,
      conveyanceAllowance: 5000,
      specialAllowance: 15000,
      medicalAllowance: 2000,
    },
  },
  {
    id: "EMP002",
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    phone: "9876543211",
    pan: "FGHIJ5678K",
    bankDetails: {
      accountNumber: "0987654321",
      ifscCode: "ICIC0001234",
      bankName: "ICICI Bank",
    },
    designation: "HR Manager",
    department: "Human Resources",
    joiningDate: "2021-05-10",
    salary: {
      basic: 60000,
      hra: 24000,
      conveyanceAllowance: 5000,
      specialAllowance: 20000,
      medicalAllowance: 2500,
    },
  },
  {
    id: "EMP003",
    name: "Rahul Verma",
    email: "rahul.verma@example.com",
    phone: "9876543212",
    pan: "LMNOP9012Q",
    bankDetails: {
      accountNumber: "5678901234",
      ifscCode: "SBIN0001234",
      bankName: "State Bank of India",
    },
    designation: "Finance Manager",
    department: "Finance",
    joiningDate: "2020-11-20",
    salary: {
      basic: 70000,
      hra: 28000,
      conveyanceAllowance: 5000,
      specialAllowance: 25000,
      medicalAllowance: 3000,
    },
  },
]

// Async thunks for CRUD operations
export const fetchEmployees = createAsyncThunk("employees/fetchEmployees", async (_, { rejectWithValue }) => {
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return initialEmployees
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const fetchEmployeeById = createAsyncThunk("employees/fetchEmployeeById", async (id, { rejectWithValue }) => {
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    const employee = initialEmployees.find((emp) => emp.id === id)

    if (!employee) {
      return rejectWithValue("Employee not found")
    }

    return employee
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const addEmployee = createAsyncThunk("employees/addEmployee", async (employeeData, { rejectWithValue }) => {
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Generate a new ID
    const newId = `EMP${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`

    return { ...employeeData, id: newId }
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const updateEmployee = createAsyncThunk(
  "employees/updateEmployee",
  async (employeeData, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return employeeData
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const deleteEmployee = createAsyncThunk("employees/deleteEmployee", async (id, { rejectWithValue }) => {
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return id
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

const initialState = {
  employees: [],
  currentEmployee: null,
  loading: false,
  error: null,
}

const employeeSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {
    clearCurrentEmployee: (state) => {
      state.currentEmployee = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all employees
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false
        state.employees = action.payload
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Fetch employee by ID
      .addCase(fetchEmployeeById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEmployeeById.fulfilled, (state, action) => {
        state.loading = false
        state.currentEmployee = action.payload
      })
      .addCase(fetchEmployeeById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Add employee
      .addCase(addEmployee.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addEmployee.fulfilled, (state, action) => {
        state.loading = false
        state.employees.push(action.payload)
      })
      .addCase(addEmployee.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Update employee
      .addCase(updateEmployee.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.loading = false
        const index = state.employees.findIndex((emp) => emp.id === action.payload.id)
        if (index !== -1) {
          state.employees[index] = action.payload
        }
        state.currentEmployee = action.payload
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Delete employee
      .addCase(deleteEmployee.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.loading = false
        state.employees = state.employees.filter((emp) => emp.id !== action.payload)
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearCurrentEmployee, clearError } = employeeSlice.actions
export default employeeSlice.reducer

