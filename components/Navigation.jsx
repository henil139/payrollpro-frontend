"use client"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import { logout } from "@/lib/features/auth/authSlice"

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  const handleLogout = () => {
    dispatch(logout())
  }

  if (!isAuthenticated) return null

  const isActive = (path) => {
    return pathname === path ? "bg-blue-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
  }

  return (
    <nav className="bg-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="text-white font-bold text-xl">
                PayrollPro
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive("/dashboard")}`}
                >
                  Dashboard
                </Link>
                {(user?.role === "HR Manager" || user?.role === "Finance Team") && (
                  <Link
                    href="/employees"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${isActive("/employees")}`}
                  >
                    Employees
                  </Link>
                )}
                {(user?.role === "HR Manager" || user?.role === "Finance Team") && (
                  <Link href="/payroll" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive("/payroll")}`}>
                    Payroll
                  </Link>
                )}
                {(user?.role === "HR Manager" || user?.role === "Finance Team") && (
                  <Link href="/config" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive("/config")}`}>
                    Configuration
                  </Link>
                )}
                {user?.role === "Employee" && (
                  <Link
                    href="/self-service"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${isActive("/self-service")}`}
                  >
                    Self Service
                  </Link>
                )}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <div className="ml-3 relative">
                <div className="flex items-center">
                  <span className="text-white mr-4">{user?.name}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-blue-700 p-2 rounded-md text-white hover:bg-blue-600 focus:outline-none"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="bg-blue-700 inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-600 focus:outline-none"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/dashboard"
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive("/dashboard")}`}
            >
              Dashboard
            </Link>
            {(user?.role === "HR Manager" || user?.role === "Finance Team") && (
              <Link
                href="/employees"
                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive("/employees")}`}
              >
                Employees
              </Link>
            )}
            {(user?.role === "HR Manager" || user?.role === "Finance Team") && (
              <Link
                href="/payroll"
                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive("/payroll")}`}
              >
                Payroll
              </Link>
            )}
            {(user?.role === "HR Manager" || user?.role === "Finance Team") && (
              <Link
                href="/config"
                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive("/config")}`}
              >
                Configuration
              </Link>
            )}
            {user?.role === "Employee" && (
              <Link
                href="/self-service"
                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive("/self-service")}`}
              >
                Self Service
              </Link>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-700">
            <div className="flex items-center px-5">
              <div className="ml-3">
                <div className="text-base font-medium leading-none text-white">{user?.name}</div>
                <div className="text-sm font-medium leading-none text-gray-300 mt-1">{user?.role}</div>
              </div>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

