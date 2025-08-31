import React from 'react';
import { Routes, Route } from 'react-router-dom';
import FullMockTestList from './FullMockTest/FullMockTestList';
import FullMockTestForm from './FullMockTest/FullMockTestForm';
import QuestionMockTestList from './QuestionMockTest/QuestionMockTestList';
import SectionMockTestList from './SectionMockTest/SectionMockTestList';
import CheckPermission from '../../Middlewares/CheckPermission/CheckPermission';

const CmsRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<CheckPermission><AdminDashboard /></CheckPermission>} />
      
      {/* Full Mock Test Routes */}
      <Route path="/full-mocktest" element={<CheckPermission><FullMockTestList /></CheckPermission>} />
      <Route path="/full-mocktest/:section/add" element={<CheckPermission><FullMockTestForm /></CheckPermission>} />
      <Route path="/full-mocktest/edit/:id" element={<CheckPermission><FullMockTestForm /></CheckPermission>} />
      
      {/* Question Mock Test Routes */}
      <Route path="/question-mocktest" element={<CheckPermission><QuestionMockTestList /></CheckPermission>} />
      <Route path="/question-mocktest/:section/add" element={<CheckPermission><QuestionMockTestForm /></CheckPermission>} />
      <Route path="/question-mocktest/edit/:id" element={<CheckPermission><QuestionMockTestForm /></CheckPermission>} />
      
      {/* Section Mock Test Routes */}
      <Route path="/section-mocktest" element={<CheckPermission><SectionMockTestList /></CheckPermission>} />
      <Route path="/section-mocktest/:section/add" element={<CheckPermission><SectionMockTestForm /></CheckPermission>} />
      <Route path="/section-mocktest/edit/:id" element={<CheckPermission><SectionMockTestForm /></CheckPermission>} />
    </Routes>
  );
};

export default CmsRoutes; 