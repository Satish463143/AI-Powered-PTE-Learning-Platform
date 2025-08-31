import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome } from "react-icons/fa";
import { MdQuiz } from "react-icons/md";
import { FaUsers } from "react-icons/fa";
import { IoStatsChart } from "react-icons/io5";

const MobileNav = () => {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (path === '/admin') {
      setActiveMenu('dashboard');
    } else if (path.includes('/admin/cms/mock-tests')) {
      setActiveMenu('mock-tests');
    } else if (path.includes('/admin/cms/users')) {
      setActiveMenu('users');
    } else if (path.includes('/admin/cms/analytics')) {
      setActiveMenu('analytics');
    }
  }, [location]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  };

  const handleNavClick = (menu) => {
    setActiveMenu(menu);
    toggleMenu();
  };

  return (
    <div className="md:hidden">
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="fixed top-4 right-4 z-50 p-2 rounded-lg bg-white shadow-md"
      >
        <div className={`w-6 h-0.5 bg-gray-600 transition-all ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
        <div className={`w-6 h-0.5 bg-gray-600 my-1 ${isOpen ? 'opacity-0' : ''}`} />
        <div className={`w-6 h-0.5 bg-gray-600 transition-all ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
      </button>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleMenu}
      />

      <div
        className={`fixed top-0 left-0 w-64 h-full bg-white z-40 transform transition-transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 pt-16">
          <nav>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/admin"
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    activeMenu === 'dashboard'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => handleNavClick('dashboard')}
                >
                  <FaHome className="w-5 h-5 mr-3" />
                  <span>Dashboard</span>
                </Link>
              </li>

              <li>
                <Link
                  to="/admin/cms/mock-tests"
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    activeMenu === 'mock-tests'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => handleNavClick('mock-tests')}
                >
                  <MdQuiz className="w-5 h-5 mr-3" />
                  <span>Mock Tests</span>
                </Link>
              </li>

              <li>
                <Link
                  to="/admin/cms/users"
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    activeMenu === 'users'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => handleNavClick('users')}
                >
                  <FaUsers className="w-5 h-5 mr-3" />
                  <span>Users</span>
                </Link>
              </li>

              <li>
                <Link
                  to="/admin/cms/analytics"
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    activeMenu === 'analytics'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => handleNavClick('analytics')}
                >
                  <IoStatsChart className="w-5 h-5 mr-3" />
                  <span>Analytics</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default MobileNav;