"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import { fetchEmployees } from "@/lib/features/employees/employeeSlice"
import { fetchPayslips } from "@/lib/features/payroll/payrollSlice"
import Navigation from "@/components/Navigation"

export default function DashboardPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const { employees } = useSelector((state) => state.employees)
  const { payslips } = useSelector((state) => state.payroll)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
      return
    }

    dispatch(fetchEmployees())
    dispatch(fetchPayslips())
  }, [isAuthenticated, router, dispatch])

  // Calculate total payroll expense
  const totalPayrollExpense = payslips.reduce((total, payslip) => total + payslip.netSalary, 0)

  // Get number of employees processed in payroll
  const employeesProcessed = new Set(payslips.map((payslip) => payslip.employeeId)).size

  // Get recent payslips (last 5)
  const recentPayslips = [...payslips].sort((a, b) => new Date(b.processedDate) - new Date(a.processedDate)).slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />

      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
      </header>

      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Dashboard metrics */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Total employees */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Employees</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">{employees.length}</dd>
                </dl>
              </div>
            </div>

            {/* Total payroll expense */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Payroll Expense</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    ₹{totalPayrollExpense.toLocaleString("en-IN")}
                  </dd>
                </dl>
              </div>
            </div>

            {/* Employees processed */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Employees Processed</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">{employeesProcessed}</dd>
                </dl>
              </div>
            </div>
          </div>

          {/* Recent payslips */}
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Payslips</h3>
              </div>
              <div className="overflow-x-auto">
                {recentPayslips.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Employee
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Month/Year
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Gross Salary
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Net Salary
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentPayslips.map((payslip) => (
                        <tr key={payslip.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {payslip.employeeName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {payslip.month}/{payslip.year}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ₹{payslip.earnings.grossSalary.toLocaleString("en-IN")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ₹{payslip.netSalary.toLocaleString("en-IN")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {payslip.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="px-6 py-4 text-center text-sm text-gray-500">No payslips processed yet.</div>
                )}
              </div>
            </div>
          </div>

          {/* Compliance alerts */}
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Compliance Alerts</h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="rounded-md bg-yellow-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-yellow-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">PF Compliance</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>PF contribution for the month of May 2023 is due in 5 days.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-md bg-blue-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-blue-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">TDS Filing</h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>Quarterly TDS return (Form 24Q) for Q1 FY 2023-24 is due by July 31, 2023.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

