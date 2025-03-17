"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import { fetchPayslips } from "@/lib/features/payroll/payrollSlice"
import Navigation from "@/components/Navigation"
import Link from "next/link"
import { jsPDF } from "jspdf"
import "jspdf-autotable"

export default function PayslipDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { id } = params
  const dispatch = useDispatch()

  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const { payslips, loading, error } = useSelector((state) => state.payroll)

  const [payslip, setPayslip] = useState(null)
  const [pdfGenerating, setPdfGenerating] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
      return
    }

    dispatch(fetchPayslips())
  }, [isAuthenticated, router, dispatch])

  useEffect(() => {
    if (payslips.length > 0) {
      const foundPayslip = payslips.find((p) => p.id === id)
      if (foundPayslip) {
        setPayslip(foundPayslip)
      } else {
        router.push("/payroll")
      }
    }
  }, [payslips, id, router])

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const generatePDF = () => {
    if (!payslip) return

    setPdfGenerating(true)

    try {
      const doc = new jsPDF()

      // Add company header
      doc.setFontSize(20)
      doc.setTextColor(0, 0, 128)
      doc.text("PayrollPro", 105, 20, { align: "center" })

      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      doc.text("123 Business Street, Tech Park", 105, 30, { align: "center" })
      doc.text("Bangalore, Karnataka - 560001", 105, 35, { align: "center" })

      // Add payslip title
      doc.setFontSize(16)
      doc.setTextColor(0, 0, 128)
      doc.text(`Salary Slip - ${months[payslip.month - 1]} ${payslip.year}`, 105, 45, { align: "center" })

      // Add employee details
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)

      doc.text(`Employee ID: ${payslip.employeeId}`, 20, 60)
      doc.text(`Employee Name: ${payslip.employeeName}`, 20, 70)
      doc.text(`Pay Period: ${months[payslip.month - 1]} ${payslip.year}`, 20, 80)
      doc.text(`Tax Regime: ${payslip.taxRegime === "old" ? "Old Regime" : "New Regime"}`, 20, 90)

      // Add earnings table
      doc.setFontSize(14)
      doc.text("Earnings", 20, 110)

      const earningsData = [
        ["Component", "Amount (₹)"],
        ["Basic Salary", payslip.earnings.basic.toLocaleString("en-IN")],
        ["HRA", payslip.earnings.hra.toLocaleString("en-IN")],
        ["Conveyance Allowance", payslip.earnings.conveyanceAllowance.toLocaleString("en-IN")],
        ["Special Allowance", payslip.earnings.specialAllowance.toLocaleString("en-IN")],
        ["Medical Allowance", payslip.earnings.medicalAllowance.toLocaleString("en-IN")],
        ["Gross Salary", payslip.earnings.grossSalary.toLocaleString("en-IN")],
      ]

      doc.autoTable({
        startY: 115,
        head: [earningsData[0]],
        body: earningsData.slice(1),
        theme: "grid",
        headStyles: { fillColor: [0, 0, 128], textColor: [255, 255, 255] },
        styles: { halign: "left" },
        columnStyles: { 1: { halign: "right" } },
      })

      // Add deductions table
      const deductionsStartY = doc.autoTable.previous.finalY + 15
      doc.setFontSize(14)
      doc.text("Deductions", 20, deductionsStartY)

      const deductionsData = [
        ["Component", "Amount (₹)"],
        ["Provident Fund (PF)", payslip.deductions.pf.toLocaleString("en-IN")],
        ["Employee State Insurance (ESI)", payslip.deductions.esi.toLocaleString("en-IN")],
        ["Professional Tax", payslip.deductions.professionalTax.toLocaleString("en-IN")],
        ["Tax Deducted at Source (TDS)", payslip.deductions.tds.toLocaleString("en-IN")],
        ["Total Deductions", payslip.deductions.totalDeductions.toLocaleString("en-IN")],
      ]

      doc.autoTable({
        startY: deductionsStartY + 5,
        head: [deductionsData[0]],
        body: deductionsData.slice(1),
        theme: "grid",
        headStyles: { fillColor: [0, 0, 128], textColor: [255, 255, 255] },
        styles: { halign: "left" },
        columnStyles: { 1: { halign: "right" } },
      })

      // Add net salary
      const netSalaryStartY = doc.autoTable.previous.finalY + 15
      doc.setFontSize(14)
      doc.setTextColor(0, 0, 128)
      doc.text("Net Salary", 20, netSalaryStartY)
      doc.text(`₹${payslip.netSalary.toLocaleString("en-IN")}`, 190, netSalaryStartY, { align: "right" })

      // Add footer
      doc.setFontSize(10)
      doc.setTextColor(128, 128, 128)
      doc.text("This is a computer-generated document. No signature is required.", 105, 280, { align: "center" })

      // Save the PDF
      doc.save(`Payslip_${payslip.employeeId}_${months[payslip.month - 1]}_${payslip.year}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF. Please try again.")
    } finally {
      setPdfGenerating(false)
    }
  }

  if (loading || !payslip) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navigation />

        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Payslip Details</h1>
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
            <h1 className="text-3xl font-bold text-gray-900">Payslip Details</h1>
          </div>
        </header>

        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="bg-red-50 p-4 rounded-md">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error loading payslip</h3>
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
          <h1 className="text-3xl font-bold text-gray-900">Payslip Details</h1>
        </div>
      </header>

      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Payslip for {months[payslip.month - 1]} {payslip.year}
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Employee: {payslip.employeeName} ({payslip.employeeId})
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={generatePDF}
                    disabled={pdfGenerating}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {pdfGenerating ? "Generating..." : "Download PDF"}
                  </button>
                  <Link
                    href="/payroll"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Back to Payroll
                  </Link>
                </div>
              </div>

              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Employee Details */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Employee Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Employee ID</p>
                        <p className="mt-1 text-sm text-gray-900">{payslip.employeeId}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Employee Name</p>
                        <p className="mt-1 text-sm text-gray-900">{payslip.employeeName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Pay Period</p>
                        <p className="mt-1 text-sm text-gray-900">
                          {months[payslip.month - 1]} {payslip.year}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Tax Regime</p>
                        <p className="mt-1 text-sm text-gray-900">
                          {payslip.taxRegime === "old" ? "Old Regime" : "New Regime"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Processed Date</p>
                        <p className="mt-1 text-sm text-gray-900">
                          {new Date(payslip.processedDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Status</p>
                        <p className="mt-1 text-sm text-gray-900">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {payslip.status}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Salary Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Salary Summary</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b pb-2">
                        <p className="text-sm font-medium text-gray-500">Gross Salary</p>
                        <p className="text-sm font-medium text-gray-900">
                          ₹{payslip.earnings.grossSalary.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div className="flex justify-between items-center border-b pb-2">
                        <p className="text-sm font-medium text-gray-500">Total Deductions</p>
                        <p className="text-sm font-medium text-gray-900">
                          ₹{payslip.deductions.totalDeductions.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <p className="text-md font-bold text-gray-900">Net Salary</p>
                        <p className="text-md font-bold text-blue-600">₹{payslip.netSalary.toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                  </div>

                  {/* Earnings */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Earnings</h4>
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Component
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Amount (₹)
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Basic Salary</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {payslip.earnings.basic.toLocaleString("en-IN")}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">HRA</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {payslip.earnings.hra.toLocaleString("en-IN")}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Conveyance Allowance</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {payslip.earnings.conveyanceAllowance.toLocaleString("en-IN")}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Special Allowance</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {payslip.earnings.specialAllowance.toLocaleString("en-IN")}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Medical Allowance</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {payslip.earnings.medicalAllowance.toLocaleString("en-IN")}
                            </td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Gross Salary
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                              {payslip.earnings.grossSalary.toLocaleString("en-IN")}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Deductions</h4>
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Component
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Amount (₹)
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Provident Fund (PF)</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {payslip.deductions.pf.toLocaleString("en-IN")}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              Employee State Insurance (ESI)
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {payslip.deductions.esi.toLocaleString("en-IN")}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Professional Tax</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {payslip.deductions.professionalTax.toLocaleString("en-IN")}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              Tax Deducted at Source (TDS)
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {payslip.deductions.tds.toLocaleString("en-IN")}
                            </td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Total Deductions
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                              {payslip.deductions.totalDeductions.toLocaleString("en-IN")}
                            </td>
                          </tr>
                        </tbody>
                      </table>
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

