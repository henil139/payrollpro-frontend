"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import { fetchEmployeeById } from "@/lib/features/employees/employeeSlice"
import Navigation from "@/components/Navigation"
import Link from "next/link"

export default function EmployeeDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { id } = params
  const dispatch = useDispatch()

  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const { currentEmployee, loading, error } = useSelector((state) => state.employees)

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

    dispatch(fetchEmployeeById(id))
  }, [isAuthenticated, user, router, dispatch, id])

  if (loading || !currentEmployee) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navigation />

        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Employee Details</h1>
          </div>
        </header>

        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="text-center py-4">
              <svg
                className="animate-spin h-8 w-8 text-blue-600 mx-auto"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navigation />

        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Employee Details</h1>
          </div>
        </header>

        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="bg-red-50 p-4 rounded-md">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error loading employee</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />

      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Employee Details</h1>
        </div>
      </header>

      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">{currentEmployee.name}</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">Employee ID: {currentEmployee.id}</p>
                </div>
                <div className="flex space-x-3">
                  {user?.role === "HR Manager" && (
                    <Link
                      href={`/employees/edit/${currentEmployee.id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Edit
                    </Link>
                  )}
                  <Link
                    href="/employees"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Back to Employees
                  </Link>
                </div>
              </div>

              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Personal Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Personal Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Full Name</p>
                        <p className="mt-1 text-sm text-gray-900">{currentEmployee.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="mt-1 text-sm text-gray-900">{currentEmployee.email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Phone</p>
                        <p className="mt-1 text-sm text-gray-900">{currentEmployee.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">PAN</p>
                        <p className="mt-1 text-sm text-gray-900">{currentEmployee.pan}</p>
                      </div>
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Bank Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Account Number</p>
                        <p className="mt-1 text-sm text-gray-900">{currentEmployee.bankDetails.accountNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">IFSC Code</p>
                        <p className="mt-1 text-sm text-gray-900">{currentEmployee.bankDetails.ifscCode}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Bank Name</p>
                        <p className="mt-1 text-sm text-gray-900">{currentEmployee.bankDetails.bankName}</p>
                      </div>
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Professional Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Designation</p>
                        <p className="mt-1 text-sm text-gray-900">{currentEmployee.designation}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Department</p>
                        <p className="mt-1 text-sm text-gray-900">{currentEmployee.department}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Joining Date</p>
                        <p className="mt-1 text-sm text-gray-900">{currentEmployee.joiningDate}</p>
                      </div>
                    </div>
                  </div>

                  {/* Salary Details */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Salary Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Basic Salary</p>
                        <p className="mt-1 text-sm text-gray-900">
                          ₹{currentEmployee.salary.basic.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">HRA</p>
                        <p className="mt-1 text-sm text-gray-900">
                          ₹{currentEmployee.salary.hra.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Conveyance Allowance</p>
                        <p className="mt-1 text-sm text-gray-900">
                          ₹{currentEmployee.salary.conveyanceAllowance.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Special Allowance</p>
                        <p className="mt-1 text-sm text-gray-900">
                          ₹{currentEmployee.salary.specialAllowance.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Medical Allowance</p>
                        <p className="mt-1 text-sm text-gray-900">
                          ₹{currentEmployee.salary.medicalAllowance.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Gross Salary</p>
                        <p className="mt-1 text-sm font-bold text-gray-900">
                          ₹
                          {(
                            currentEmployee.salary.basic +
                            currentEmployee.salary.hra +
                            currentEmployee.salary.conveyanceAllowance +
                            currentEmployee.salary.specialAllowance +
                            currentEmployee.salary.medicalAllowance
                          ).toLocaleString("en-IN")}
                        </p>
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

