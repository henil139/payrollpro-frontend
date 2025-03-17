"use client"

import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./features/auth/authSlice"
import employeeReducer from "./features/employees/employeeSlice"
import payrollReducer from "./features/payroll/payrollSlice"
import configReducer from "./features/config/configSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    employees: employeeReducer,
    payroll: payrollReducer,
    config: configReducer,
  },
})

