import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLogoutMutation } from '../../../api/auth.api';
import { setLoggedInUser } from '../../../reducer/userReducer';

import './TopNav.css';

const TopNav = ({ isMenuActive, toggleMenu }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();
  const loggedInUser = useSelector((root) => root.user.loggedInUser);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(setLoggedInUser(null));
      toast.success("You have been logged out successfully");
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error) {
      toast.error("Logout failed, please try again");
    }
  };

  return (
    <div className="topnav-container bg-white shadow-md">
      {/* Full-width top nav bar */}
      <div className="topnav-bar relative flex items-center h-16 px-4 sm:px-6 lg:px-8">

        {/* Left: Hamburger */}
        <div className="absolute left-4 flex items-center">
          <button
            onClick={toggleMenu}
            className={`hamburger-btn p-2 rounded-md focus:outline-none ${
              isMenuActive ? 'active' : ''
            }`}
            aria-label="Toggle menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>

        {/* Center: Welcome */}
        <div className="flex-1 flex justify-center">
          <span className="welcome-text text-gray-700 text-base font-medium">
            Hi, Welcome Back {loggedInUser?.name}
          </span>
        </div>

        {/* Right: Logout */}
        <div className="absolute right-4 flex items-center">
          <button
            onClick={handleLogout}
            className="logout-btn flex items-center px-2 py-2 text-white bg-red-600 rounded hover:bg-red-700 transition"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default TopNav;
