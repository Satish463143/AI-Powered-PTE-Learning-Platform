import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import FullMockTestForm from './FullMockTestForm';
import LoadingComponent from '../../../Middlewares/Loading/Loading.component';

const FullMockTestEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Placeholder data - will be replaced with API data later
  const mockTest = {
    _id: id,
    title: 'Sample Mock Test',
    duration: 180,
    totalQuestions: 20,
    status: 'active',
    sections: {
      speaking: true,
      writing: true,
      reading: true,
      listening: true
    }
  };

  const handleSubmit = async (formData) => {
    // Placeholder submit function - will be replaced with API call later
    console.log('Form data to be sent:', formData);
    toast.success('Mock test updated successfully');
    navigate('/admin/cms/mock-test');
  };

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold'>Edit Mock Test</h1>
      </div>
      <FullMockTestForm 
        onSubmit={handleSubmit}
        initialData={mockTest}
        isEdit={true}
      />
    </div>
  );
};

export default FullMockTestEdit; 