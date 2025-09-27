import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";

const Layout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">📍</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                CheckIn App
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link
                to="/"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-1"
              >
                <span>🏠</span>
                <span>Check-In</span>
              </Link>
              <Link
                to="/plan"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-1"
              >
                <span>📋</span>
                <span>Plan</span>
              </Link>
              <Link
                to="/manage"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-1"
              >
                <span>⚙️</span>
                <span>Locations</span>
              </Link>
              <Link
                to="/overview"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-1"
              >
                <span>📅</span>
                <span>Overview</span>
              </Link>
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <nav className="flex flex-col space-y-2">
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  <span>🏠</span>
                  <span>Check-In</span>
                </Link>
                <Link
                  to="/plan"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  <span>📋</span>
                  <span>Plan</span>
                </Link>
                <Link
                  to="/manage"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  <span>⚙️</span>
                  <span>Locations</span>
                </Link>
                <Link
                  to="/overview"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  <span>📅</span>
                  <span>Overview</span>
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
