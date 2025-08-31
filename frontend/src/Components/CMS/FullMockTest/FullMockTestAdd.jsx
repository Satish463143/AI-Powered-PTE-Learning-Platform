import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import FullMockTestForm from './FullMockTestForm';

const FullMockTestAdd = () => {
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    // Placeholder submit function - will be replaced with API call later
    console.log('Form data to be sent:', formData);
    toast.success('Mock test created successfully');
    navigate('/admin/cms/mock-test');
  };

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold'>Add New Mock Test</h1>
      </div>
      <FullMockTestForm onSubmit={handleSubmit} />
    </div>
  );
};

export default FullMockTestAdd; 