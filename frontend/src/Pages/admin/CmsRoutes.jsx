import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import CheckPermission from '../../config/checkPermission.config.jsx';
import FullMockTestList from '../../Components/CMS/FullMockTest/FullMockTestList';
import FullMockTestAdd from '../../Components/CMS/FullMockTest/FullMockTestAdd';
import FullMockTestEdit from '../../Components/CMS/FullMockTest/FullMockTestEdit';
import Navbar from '../../Components/CMS/Navbar/Navbar';
import MobileNav from '../../Components/cms/MobileNav/MobileNav';
import TopNav from '../../Components/CMS/TopNav/TopNav';

const CmsRoutes = () => {
  const [isMenuActive, setIsMenuActive] = useState(false);

  const toggleMenu = () => {
    setIsMenuActive(!isMenuActive);
  };

  return (
    <CheckPermission allowedBy="admin">
      <div className="min-h-screen bg-gray-100">
        <TopNav isMenuActive={isMenuActive} toggleMenu={toggleMenu} />
        <div className="flex">
          <Navbar />
          <MobileNav />
          <div className="flex-1 p-6">
            <Routes>
              {/* Mock Test Routes */}
              <Route path="full-mocktest" element={<FullMockTestList />} />
              <Route path="full-mocktest/add" element={<FullMockTestAdd />} />
              <Route path="full-mocktest/edit/:id" element={<FullMockTestEdit />} />
              
              
            </Routes>
          </div>
        </div>
      </div>
    </CheckPermission>
  );
};

export default CmsRoutes; 