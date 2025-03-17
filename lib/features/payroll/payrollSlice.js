"use client"

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

// Helper functions for payroll calculations
const calculatePF = (basicSalary) => {
  // 12% of basic salary (employee contribution)
  return Math.min(basicSalary * 0.12, 1800) // Capped at 1800 for basic > 15000
}

const calculateESI = (grossSalary) => {
  // 0.75% of gross salary if gross salary is <= 21000
  return grossSalary <= 21000 ? grossSalary * 0.0075 : 0
}

const calculateProfessionalTax = (grossSalary) => {
  // Professional tax varies by state, using a simple slab for demonstration
  if (grossSalary <= 10000) return 0
  if (grossSalary <= 15000) return 150
  if (grossSalary <= 20000) return 200
  return 300
}

const calculateTDS = (annualSalary, exemptions, taxRegime) => {
  // Simplified TDS calculation based on tax regime
  const taxableIncome = annualSalary - exemptions

  if (taxRegime === "old") {
    // Old tax regime slabs (simplified)
    if (taxableIncome <= 250000) return 0
    if (taxableIncome <= 500000) return (taxableIncome - 250000) * 0.05
    if (taxableIncome <= 1000000) return 12500 + (taxableIncome - 500000) * 0.2
    return 112500 + (taxableIncome - 1000000) * 0.3
  } else {
    // New tax regime slabs (simplified)
    if (taxableIncome <= 300000) return 0
    if (taxableIncome <= 600000) return (taxableIncome - 300000) * 0.05
    if (taxableIncome <= 900000) return 15000 + (taxableIncome - 600000) * 0.1
    if (taxableIncome <= 1200000) return 45000 + (taxableIncome - 900000) * 0.15
    if (taxableIncome <= 1500000) return 90000 + (taxableIncome - 1200000) * 0.2
    return 150000 + (taxableIncome - 1500000) * 0.3
  }
}

// Async thunks for payroll operations
export const processPayroll = createAsyncThunk(
  "payroll/processPayroll",
  async ({ employeeId, month, year, taxRegime, exemptions }, { getState, rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const { employees } = getState().employees
      const employee = employees.find((emp) => emp.id === employeeId)

      if (!employee) {
        return rejectWithValue("Employee not found")
      }

      // Calculate salary components
      const { basic, hra, conveyanceAllowance, specialAllowance, medicalAllowance } = employee.salary
      const grossSalary = basic + hra + conveyanceAllowance + specialAllowance + medicalAllowance

      // Calculate deductions
      const pf = calculatePF(basic)
      const esi = calculateESI(grossSalary)
      const professionalTax = calculateProfessionalTax(grossSalary)

      // Calculate annual salary for TDS
      const annualGrossSalary = grossSalary * 12
      const monthlyTDS = calculateTDS(annualGrossSalary, exemptions, taxRegime) / 12

      // Calculate net salary
      const totalDeductions = pf + esi + professionalTax + monthlyTDS
      const netSalary = grossSalary - totalDeductions

      // Create payslip
      const payslip = {
        id: `PAY-${employeeId}-${month}-${year}`,
        employeeId,
        employeeName: employee.name,
        month,
        year,
        earnings: {
          basic,
          hra,
          conveyanceAllowance,
          specialAllowance,
          medicalAllowance,
          grossSalary,
        },
        deductions: {
          pf,
          esi,
          professionalTax,
          tds: monthlyTDS,
          totalDeductions,
        },
        netSalary,
        taxRegime,
        processedDate: new Date().toISOString(),
        status: "Processed",
      }

      return payslip
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const fetchPayslips = createAsyncThunk("payroll/fetchPayslips", async (_, { rejectWithValue }) => {
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Return empty array initially, will be populated as payslips are processed
    return []
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const fetchPayslipsByEmployee = createAsyncThunk(
  "payroll/fetchPayslipsByEmployee",
  async (employeeId, { getState, rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const { payslips } = getState().payroll
      return payslips.filter((payslip) => payslip.employeeId === employeeId)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

const initialState = {
  payslips: [],
  currentPayslip: null,
  loading: false,
  error: null,
}

const payrollSlice = createSlice({
  name: "payroll",
  initialState,
  reducers: {
    clearCurrentPayslip: (state) => {
      state.currentPayslip = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Process payroll
      .addCase(processPayroll.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(processPayroll.fulfilled, (state, action) => {
        state.loading = false
        state.payslips.push(action.payload)
        state.currentPayslip = action.payload
      })
      .addCase(processPayroll.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Fetch all payslips
      .addCase(fetchPayslips.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPayslips.fulfilled, (state, action) => {
        state.loading = false
        // Only replace if we get data, otherwise keep existing data
        if (action.payload.length > 0) {
          state.payslips = action.payload
        }
      })
      .addCase(fetchPayslips.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Fetch payslips by employee
      .addCase(fetchPayslipsByEmployee.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPayslipsByEmployee.fulfilled, (state, action) => {
        state.loading = false
        // We don't update the main payslips array here, just return filtered results
      })
      .addCase(fetchPayslipsByEmployee.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearCurrentPayslip, clearError } = payrollSlice.actions
export default payrollSlice.reducer

