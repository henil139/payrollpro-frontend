"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import { fetchEmployeeById, updateEmployee } from "@/lib/features/employees/employeeSlice"
import Navigation from "@/components/Navigation"
import Link from "next/link"

export default function EditEmployeePage() {
  const router = useRouter()
  const params = useParams()
  const { id } = params
  const dispatch = useDispatch()

  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const { currentEmployee, loading, error } = useSelector((state) => state.employees)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    pan: "",
    bankDetails: {
      accountNumber: "",
      ifscCode: "",
      bankName: "",
    },
    designation: "",
    department: "",
    joiningDate: "",
    salary: {
      basic: "",
      hra: "",
      conveyanceAllowance: "",
      specialAllowance: "",
      medicalAllowance: "",
    },
  })

  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
      return
    }

    // Check if user has permission to access this page
    if (user?.role !== "HR Manager") {
      router.push("/employees")
      return
    }

    dispatch(fetchEmployeeById(id))
  }, [isAuthenticated, user, router, dispatch, id])

  useEffect(() => {
    if (currentEmployee) {
      setFormData({
        name: currentEmployee.name,
        email: currentEmployee.email,
        phone: currentEmployee.phone,
        pan: currentEmployee.pan,
        bankDetails: {
          accountNumber: currentEmployee.bankDetails.accountNumber,
          ifscCode: currentEmployee.bankDetails.ifscCode,
          bankName: currentEmployee.bankDetails.bankName,
        },
        designation: currentEmployee.designation,
        department: currentEmployee.department,
        joiningDate: currentEmployee.joiningDate,
        salary: {
          basic: currentEmployee.salary.basic,
          hra: currentEmployee.salary.hra,
          conveyanceAllowance: currentEmployee.salary.conveyanceAllowance,
          specialAllowance: currentEmployee.salary.specialAllowance,
          medicalAllowance: currentEmployee.salary.medicalAllowance,
        },
      })
    }
  }, [currentEmployee])

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }

    // Clear error for this field
    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      if (formErrors[parent]?.[child]) {
        setFormErrors((prev) => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: "",
          },
        }))
      }
    } else if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = () => {
    const errors = {}

    // Personal details validation
    if (!formData.name.trim()) {
      errors.name = "Name is required"
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid"
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required"
    } else if (!/^\d{10}$/.test(formData.phone)) {
      errors.phone = "Phone number must be 10 digits"
    }

    if (!formData.pan.trim()) {
      errors.pan = "PAN is required"
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan)) {
      errors.pan = "PAN format is invalid (e.g., ABCDE1234F)"
    }

    // Bank details validation
    if (!formData.bankDetails.accountNumber.trim()) {
      errors.bankDetails = { ...errors.bankDetails, accountNumber: "Account number is required" }
    }

    if (!formData.bankDetails.ifscCode.trim()) {
      errors.bankDetails = { ...errors.bankDetails, ifscCode: "IFSC code is required" }
    }

    if (!formData.bankDetails.bankName.trim()) {
      errors.bankDetails = { ...errors.bankDetails, bankName: "Bank name is required" }
    }

    // Professional details validation
    if (!formData.designation.trim()) {
      errors.designation = "Designation is required"
    }

    if (!formData.department.trim()) {
      errors.department = "Department is required"
    }

    if (!formData.joiningDate) {
      errors.joiningDate = "Joining date is required"
    }

    // Salary validation
    if (!formData.salary.basic) {
      errors.salary = { ...errors.salary, basic: "Basic salary is required" }
    } else if (isNaN(formData.salary.basic) || Number(formData.salary.basic) <= 0) {
      errors.salary = { ...errors.salary, basic: "Basic salary must be a positive number" }
    }

    if (!formData.salary.hra) {
      errors.salary = { ...errors.salary, hra: "HRA is required" }
    } else if (isNaN(formData.salary.hra) || Number(formData.salary.hra) < 0) {
      errors.salary = { ...errors.salary, hra: "HRA must be a non-negative number" }
    }

    if (!formData.salary.conveyanceAllowance) {
      errors.salary = { ...errors.salary, conveyanceAllowance: "Conveyance allowance is required" }
    } else if (isNaN(formData.salary.conveyanceAllowance) || Number(formData.salary.conveyanceAllowance) < 0) {
      errors.salary = { ...errors.salary, conveyanceAllowance: "Conveyance allowance must be a non-negative number" }
    }

    if (!formData.salary.specialAllowance) {
      errors.salary = { ...errors.salary, specialAllowance: "Special allowance is required" }
    } else if (isNaN(formData.salary.specialAllowance) || Number(formData.salary.specialAllowance) < 0) {
      errors.salary = { ...errors.salary, specialAllowance: "Special allowance must be a non-negative number" }
    }

    if (!formData.salary.medicalAllowance) {
      errors.salary = { ...errors.salary, medicalAllowance: "Medical allowance is required" }
    } else if (isNaN(formData.salary.medicalAllowance) || Number(formData.salary.medicalAllowance) < 0) {
      errors.salary = { ...errors.salary, medicalAllowance: "Medical allowance must be a non-negative number" }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      // Convert salary values to numbers
      const employeeData = {
        ...currentEmployee,
        ...formData,
        salary: {
          basic: Number(formData.salary.basic),
          hra: Number(formData.salary.hra),
          conveyanceAllowance: Number(formData.salary.conveyanceAllowance),
          specialAllowance: Number(formData.salary.specialAllowance),
          medicalAllowance: Number(formData.salary.medicalAllowance),
        },
      }

      dispatch(updateEmployee(employeeData))
        .unwrap()
        .then(() => {
          router.push(`/employees/${id}`)
        })
        .catch((err) => {
          console.error("Failed to update employee:", err)
        })
    }
  }

  if (loading || !currentEmployee) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navigation />

        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Edit Employee</h1>
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
            <h1 className="text-3xl font-bold text-gray-900">Edit Employee</h1>
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
          <h1 className="text-3xl font-bold text-gray-900">Edit Employee</h1>
        </div>
      </header>

      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <form onSubmit={handleSubmit}>
                <div className="px-4 py-5 sm:p-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 col-span-full">Personal Information</h3>

                    {/* Name */}
                    <div>
                      <label htmlFor="name" className="form-label">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className={`form-input ${formErrors.name ? "border-red-300" : ""}`}
                        value={formData.name}
                        onChange={handleChange}
                      />
                      {formErrors.name && <p className="form-error">{formErrors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="form-label">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className={`form-input ${formErrors.email ? "border-red-300" : ""}`}
                        value={formData.email}
                        onChange={handleChange}
                      />
                      {formErrors.email && <p className="form-error">{formErrors.email}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                      <label htmlFor="phone" className="form-label">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="phone"
                        name="phone"
                        className={`form-input ${formErrors.phone ? "border-red-300" : ""}`}
                        value={formData.phone}
                        onChange={handleChange}
                      />
                      {formErrors.phone && <p className="form-error">{formErrors.phone}</p>}
                    </div>

                    {/* PAN */}
                    <div>
                      <label htmlFor="pan" className="form-label">
                        PAN <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="pan"
                        name="pan"
                        className={`form-input ${formErrors.pan ? "border-red-300" : ""}`}
                        value={formData.pan}
                        onChange={handleChange}
                      />
                      {formErrors.pan && <p className="form-error">{formErrors.pan}</p>}
                    </div>

                    <h3 className="text-lg font-medium leading-6 text-gray-900 col-span-full mt-6">Bank Details</h3>

                    {/* Account Number */}
                    <div>
                      <label htmlFor="bankDetails.accountNumber" className="form-label">
                        Account Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="bankDetails.accountNumber"
                        name="bankDetails.accountNumber"
                        className={`form-input ${formErrors.bankDetails?.accountNumber ? "border-red-300" : ""}`}
                        value={formData.bankDetails.accountNumber}
                        onChange={handleChange}
                      />
                      {formErrors.bankDetails?.accountNumber && (
                        <p className="form-error">{formErrors.bankDetails.accountNumber}</p>
                      )}
                    </div>

                    {/* IFSC Code */}
                    <div>
                      <label htmlFor="bankDetails.ifscCode" className="form-label">
                        IFSC Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="bankDetails.ifscCode"
                        name="bankDetails.ifscCode"
                        className={`form-input ${formErrors.bankDetails?.ifscCode ? "border-red-300" : ""}`}
                        value={formData.bankDetails.ifscCode}
                        onChange={handleChange}
                      />
                      {formErrors.bankDetails?.ifscCode && (
                        <p className="form-error">{formErrors.bankDetails.ifscCode}</p>
                      )}
                    </div>

                    {/* Bank Name */}
                    <div>
                      <label htmlFor="bankDetails.bankName" className="form-label">
                        Bank Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="bankDetails.bankName"
                        name="bankDetails.bankName"
                        className={`form-input ${formErrors.bankDetails?.bankName ? "border-red-300" : ""}`}
                        value={formData.bankDetails.bankName}
                        onChange={handleChange}
                      />
                      {formErrors.bankDetails?.bankName && (
                        <p className="form-error">{formErrors.bankDetails.bankName}</p>
                      )}
                    </div>

                    <h3 className="text-lg font-medium leading-6 text-gray-900 col-span-full mt-6">
                      Professional Information
                    </h3>

                    {/* Designation */}
                    <div>
                      <label htmlFor="designation" className="form-label">
                        Designation <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="designation"
                        name="designation"
                        className={`form-input ${formErrors.designation ? "border-red-300" : ""}`}
                        value={formData.designation}
                        onChange={handleChange}
                      />
                      {formErrors.designation && <p className="form-error">{formErrors.designation}</p>}
                    </div>

                    {/* Department */}
                    <div>
                      <label htmlFor="department" className="form-label">
                        Department <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="department"
                        name="department"
                        className={`form-input ${formErrors.department ? "border-red-300" : ""}`}
                        value={formData.department}
                        onChange={handleChange}
                      />
                      {formErrors.department && <p className="form-error">{formErrors.department}</p>}
                    </div>

                    {/* Joining Date */}
                    <div>
                      <label htmlFor="joiningDate" className="form-label">
                        Joining Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        id="joiningDate"
                        name="joiningDate"
                        className={`form-input ${formErrors.joiningDate ? "border-red-300" : ""}`}
                        value={formData.joiningDate}
                        onChange={handleChange}
                      />
                      {formErrors.joiningDate && <p className="form-error">{formErrors.joiningDate}</p>}
                    </div>

                    <h3 className="text-lg font-medium leading-6 text-gray-900 col-span-full mt-6">Salary Details</h3>

                    {/* Basic Salary */}
                    <div>
                      <label htmlFor="salary.basic" className="form-label">
                        Basic Salary <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="salary.basic"
                        name="salary.basic"
                        className={`form-input ${formErrors.salary?.basic ? "border-red-300" : ""}`}
                        value={formData.salary.basic}
                        onChange={handleChange}
                      />
                      {formErrors.salary?.basic && <p className="form-error">{formErrors.salary.basic}</p>}
                    </div>

                    {/* HRA */}
                    <div>
                      <label htmlFor="salary.hra" className="form-label">
                        HRA <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="salary.hra"
                        name="salary.hra"
                        className={`form-input ${formErrors.salary?.hra ? "border-red-300" : ""}`}
                        value={formData.salary.hra}
                        onChange={handleChange}
                      />
                      {formErrors.salary?.hra && <p className="form-error">{formErrors.salary.hra}</p>}
                    </div>

                    {/* Conveyance Allowance */}
                    <div>
                      <label htmlFor="salary.conveyanceAllowance" className="form-label">
                        Conveyance Allowance <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="salary.conveyanceAllowance"
                        name="salary.conveyanceAllowance"
                        className={`form-input ${formErrors.salary?.conveyanceAllowance ? "border-red-300" : ""}`}
                        value={formData.salary.conveyanceAllowance}
                        onChange={handleChange}
                      />
                      {formErrors.salary?.conveyanceAllowance && (
                        <p className="form-error">{formErrors.salary.conveyanceAllowance}</p>
                      )}
                    </div>

                    {/* Special Allowance */}
                    <div>
                      <label htmlFor="salary.specialAllowance" className="form-label">
                        Special Allowance <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="salary.specialAllowance"
                        name="salary.specialAllowance"
                        className={`form-input ${formErrors.salary?.specialAllowance ? "border-red-300" : ""}`}
                        value={formData.salary.specialAllowance}
                        onChange={handleChange}
                      />
                      {formErrors.salary?.specialAllowance && (
                        <p className="form-error">{formErrors.salary.specialAllowance}</p>
                      )}
                    </div>

                    {/* Medical Allowance */}
                    <div>
                      <label htmlFor="salary.medicalAllowance" className="form-label">
                        Medical Allowance <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="salary.medicalAllowance"
                        name="salary.medicalAllowance"
                        className={`form-input ${formErrors.salary?.medicalAllowance ? "border-red-300" : ""}`}
                        value={formData.salary.medicalAllowance}
                        onChange={handleChange}
                      />
                      {formErrors.salary?.medicalAllowance && (
                        <p className="form-error">{formErrors.salary.medicalAllowance}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                  <Link href={`/employees/${id}`} className="btn-secondary mr-3">
                    Cancel
                  </Link>
                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

