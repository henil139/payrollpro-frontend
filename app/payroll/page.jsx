"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import { fetchEmployees } from "@/lib/features/employees/employeeSlice"
import { fetchPayslips, processPayroll } from "@/lib/features/payroll/payrollSlice"
import { fetchExemptions } from "@/lib/features/config/configSlice"
import Navigation from "@/components/Navigation"
import Link from "next/link"

export default function PayrollPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const { employees } = useSelector((state) => state.employees)
  const { payslips, loading, error } = useSelector((state) => state.payroll)
  const { exemptions } = useSelector((state) => state.config)

  const [searchTerm, setSearchTerm] = useState("")
  const [showProcessForm, setShowProcessForm] = useState(false)
  const [processFormData, setProcessFormData] = useState({
    employeeId: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    taxRegime: "old",
    exemptions: 0,
  })
  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
      return
    }

    // Check if user has permission to access this page
    if (user?.role !== "HR Manager" && user?.role !== "Finance Team") {
      router.push("/dashboard")
      return
    }

    dispatch(fetchEmployees())
    dispatch(fetchPayslips())
    dispatch(fetchExemptions())
  }, [isAuthenticated, user, router, dispatch])

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const filteredPayslips = payslips.filter(
    (payslip) =>
      payslip.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payslip.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${payslip.month}/${payslip.year}`.includes(searchTerm),
  )

  const handleProcessFormChange = (e) => {
    const { name, value } = e.target
    setProcessFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateProcessForm = () => {
    const errors = {}

    if (!processFormData.employeeId) {
      errors.employeeId = "Please select an employee"
    }

    if (!processFormData.month) {
      errors.month = "Month is required"
    }

    if (!processFormData.year) {
      errors.year = "Year is required"
    }

    if (!processFormData.taxRegime) {
      errors.taxRegime = "Tax regime is required"
    }

    if (processFormData.exemptions === "" || isNaN(processFormData.exemptions)) {
      errors.exemptions = "Exemptions must be a number"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleProcessPayroll = (e) => {
    e.preventDefault()

    if (validateProcessForm()) {
      dispatch(
        processPayroll({
          ...processFormData,
          exemptions: Number(processFormData.exemptions),
        }),
      )
        .unwrap()
        .then(() => {
          setShowProcessForm(false)
          setProcessFormData({
            employeeId: "",
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            taxRegime: "old",
            exemptions: 0,
          })
        })
        .catch((err) => {
          console.error("Failed to process payroll:", err)
        })
    }
  }

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />

      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
        </div>
      </header>

      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div className="mb-4 md:mb-0">
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="text"
                    className="form-input block w-full sm:text-sm"
                    placeholder="Search payslips..."
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
              </div>

              <button onClick={() => setShowProcessForm(!showProcessForm)} className="btn-primary">
                {showProcessForm ? "Cancel" : "Process New Payroll"}
              </button>
            </div>

            {showProcessForm && (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Process Payroll</h3>
                  <form onSubmit={handleProcessPayroll} className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {/* Employee */}
                    <div>
                      <label htmlFor="employeeId" className="form-label">
                        Employee <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="employeeId"
                        name="employeeId"
                        className={`form-input ${formErrors.employeeId ? "border-red-300" : ""}`}
                        value={processFormData.employeeId}
                        onChange={handleProcessFormChange}
                      >
                        <option value="">Select Employee</option>
                        {employees.map((employee) => (
                          <option key={employee.id} value={employee.id}>
                            {employee.name} ({employee.id})
                          </option>
                        ))}
                      </select>
                      {formErrors.employeeId && <p className="form-error">{formErrors.employeeId}</p>}
                    </div>

                    {/* Month */}
                    <div>
                      <label htmlFor="month" className="form-label">
                        Month <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="month"
                        name="month"
                        className={`form-input ${formErrors.month ? "border-red-300" : ""}`}
                        value={processFormData.month}
                        onChange={handleProcessFormChange}
                      >
                        {months.map((month) => (
                          <option key={month.value} value={month.value}>
                            {month.label}
                          </option>
                        ))}
                      </select>
                      {formErrors.month && <p className="form-error">{formErrors.month}</p>}
                    </div>

                    {/* Year */}
                    <div>
                      <label htmlFor="year" className="form-label">
                        Year <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="year"
                        name="year"
                        className={`form-input ${formErrors.year ? "border-red-300" : ""}`}
                        value={processFormData.year}
                        onChange={handleProcessFormChange}
                        min="2020"
                        max="2030"
                      />
                      {formErrors.year && <p className="form-error">{formErrors.year}</p>}
                    </div>

                    {/* Tax Regime */}
                    <div>
                      <label htmlFor="taxRegime" className="form-label">
                        Tax Regime <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="taxRegime"
                        name="taxRegime"
                        className={`form-input ${formErrors.taxRegime ? "border-red-300" : ""}`}
                        value={processFormData.taxRegime}
                        onChange={handleProcessFormChange}
                      >
                        <option value="old">Old Regime</option>
                        <option value="new">New Regime</option>
                      </select>
                      {formErrors.taxRegime && <p className="form-error">{formErrors.taxRegime}</p>}
                    </div>

                    {/* Exemptions */}
                    <div className="sm:col-span-2">
                      <label htmlFor="exemptions" className="form-label">
                        Total Exemptions (₹)
                      </label>
                      <input
                        type="number"
                        id="exemptions"
                        name="exemptions"
                        className={`form-input ${formErrors.exemptions ? "border-red-300" : ""}`}
                        value={processFormData.exemptions}
                        onChange={handleProcessFormChange}
                        min="0"
                      />
                      {formErrors.exemptions && <p className="form-error">{formErrors.exemptions}</p>}
                      <p className="mt-2 text-sm text-gray-500">
                        Enter the total amount of exemptions applicable for this employee (e.g., 80C, 80D, HRA, etc.)
                      </p>
                    </div>

                    <div className="sm:col-span-2 mt-4">
                      <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? "Processing..." : "Process Payroll"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Processed Payslips</h3>
              </div>

              {loading && !showProcessForm ? (
                <div className="text-center py-4">
                  <svg
                    className="animate-spin h-8 w-8 text-blue-600 mx-auto"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
              ) : error ? (
                <div className="bg-red-50 p-4 rounded-md">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error loading payslips</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {filteredPayslips.length > 0 ? (
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
                            Total Deductions
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
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredPayslips.map((payslip) => (
                          <tr key={payslip.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {payslip.employeeName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {months.find((m) => m.value === payslip.month)?.label}/{payslip.year}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ₹{payslip.earnings.grossSalary.toLocaleString("en-IN")}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ₹{payslip.deductions.totalDeductions.toLocaleString("en-IN")}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ₹{payslip.netSalary.toLocaleString("en-IN")}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {payslip.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Link href={`/payroll/${payslip.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="px-6 py-4 text-center text-sm text-gray-500">
                      No payslips found matching your search.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

