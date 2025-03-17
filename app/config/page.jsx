"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import { fetchExemptions, addExemption, updateExemption, deleteExemption } from "@/lib/features/config/configSlice"
import Navigation from "@/components/Navigation"

export default function ConfigPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const { exemptions, loading, error } = useSelector((state) => state.config)

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingExemption, setEditingExemption] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    maxLimit: "",
    applicable: "both",
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

    dispatch(fetchExemptions())
  }, [isAuthenticated, user, router, dispatch])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
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

  const validateForm = () => {
    const errors = {}

    if (!formData.name.trim()) {
      errors.name = "Name is required"
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required"
    }

    if (
      formData.maxLimit !== null &&
      formData.maxLimit !== "" &&
      (isNaN(formData.maxLimit) || Number(formData.maxLimit) < 0)
    ) {
      errors.maxLimit = "Max limit must be a non-negative number or empty"
    }

    if (!formData.applicable) {
      errors.applicable = "Applicable tax regime is required"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      const exemptionData = {
        ...formData,
        maxLimit: formData.maxLimit === "" ? null : Number(formData.maxLimit),
      }

      if (editingExemption) {
        dispatch(updateExemption({ ...exemptionData, id: editingExemption.id }))
          .unwrap()
          .then(() => {
            resetForm()
          })
          .catch((err) => {
            console.error("Failed to update exemption:", err)
          })
      } else {
        dispatch(addExemption(exemptionData))
          .unwrap()
          .then(() => {
            resetForm()
          })
          .catch((err) => {
            console.error("Failed to add exemption:", err)
          })
      }
    }
  }

  const handleEdit = (exemption) => {
    setEditingExemption(exemption)
    setFormData({
      name: exemption.name,
      description: exemption.description,
      maxLimit: exemption.maxLimit === null ? "" : exemption.maxLimit,
      applicable: exemption.applicable,
    })
    setShowAddForm(true)
  }

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this exemption?")) {
      dispatch(deleteExemption(id))
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      maxLimit: "",
      applicable: "both",
    })
    setFormErrors({})
    setEditingExemption(null)
    setShowAddForm(false)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />

      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Configuration</h1>
        </div>
      </header>

      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 md:mb-0">Tax Exemptions & Deductions</h2>

              <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary">
                {showAddForm ? "Cancel" : "Add New Exemption"}
              </button>
            </div>

            {showAddForm && (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {editingExemption ? "Edit Exemption" : "Add New Exemption"}
                  </h3>
                  <form onSubmit={handleSubmit} className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {/* Name */}
                    <div>
                      <label htmlFor="name" className="form-label">
                        Name <span className="text-red-500">*</span>
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

                    {/* Description */}
                    <div>
                      <label htmlFor="description" className="form-label">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="description"
                        name="description"
                        className={`form-input ${formErrors.description ? "border-red-300" : ""}`}
                        value={formData.description}
                        onChange={handleChange}
                      />
                      {formErrors.description && <p className="form-error">{formErrors.description}</p>}
                    </div>

                    {/* Max Limit */}
                    <div>
                      <label htmlFor="maxLimit" className="form-label">
                        Max Limit (₹)
                      </label>
                      <input
                        type="number"
                        id="maxLimit"
                        name="maxLimit"
                        className={`form-input ${formErrors.maxLimit ? "border-red-300" : ""}`}
                        value={formData.maxLimit}
                        onChange={handleChange}
                        placeholder="Leave empty if no limit"
                      />
                      {formErrors.maxLimit && <p className="form-error">{formErrors.maxLimit}</p>}
                    </div>

                    {/* Applicable */}
                    <div>
                      <label htmlFor="applicable" className="form-label">
                        Applicable Tax Regime <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="applicable"
                        name="applicable"
                        className={`form-input ${formErrors.applicable ? "border-red-300" : ""}`}
                        value={formData.applicable}
                        onChange={handleChange}
                      >
                        <option value="both">Both Regimes</option>
                        <option value="old">Old Regime Only</option>
                        <option value="new">New Regime Only</option>
                      </select>
                      {formErrors.applicable && <p className="form-error">{formErrors.applicable}</p>}
                    </div>

                    <div className="sm:col-span-2 mt-4">
                      <button type="submit" disabled={loading} className="btn-primary mr-3">
                        {loading ? "Saving..." : editingExemption ? "Update" : "Save"}
                      </button>
                      <button type="button" onClick={resetForm} className="btn-secondary">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {loading && !showAddForm ? (
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
            ) : error ? (
              <div className="bg-red-50 p-4 rounded-md">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error loading exemptions</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Description
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Max Limit
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Applicable
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
                    {exemptions.length > 0 ? (
                      exemptions.map((exemption) => (
                        <tr key={exemption.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {exemption.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exemption.description}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {exemption.maxLimit ? `₹${exemption.maxLimit.toLocaleString("en-IN")}` : "No Limit"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {exemption.applicable === "both"
                              ? "Both Regimes"
                              : exemption.applicable === "old"
                                ? "Old Regime Only"
                                : "New Regime Only"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleEdit(exemption)}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(exemption.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                          No exemptions found. Add a new exemption to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}