import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
//import adminMockTestApi from '../../../api/admin.mockTest.api';
import LoadingComponent from '../../../Middlewares/Loading/Loading.component';

const FullMockTestForm = () => {
  const { section, id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    text: '',
    audio: null,
    section: section || '',
  });

  const questionTypes = {
    reading: ['Read Aloud', 'Retell Lecture', 'Answer Short Question'],
    writing: ['Summarize Written Text', 'Write Essay'],
    speaking: ['Read Aloud', 'Repeat Sentence', 'Describe Image', 'Retell Lecture', 'Answer Short Question'],
    listening: ['Summarize Spoken Text', 'Multiple Choice', 'Fill in the Blanks', 'Highlight Correct Summary', 'Select Missing Word', 'Highlight Incorrect Words', 'Write from Dictation']
  };

  useEffect(() => {
    if (id) {
      fetchQuestion();
    }
  }, [id]);

  const fetchQuestion = async () => {
    try {
      setIsLoading(true);
      const data = await adminMockTestApi.getFullMockTestQuestions(id);
      setFormData({
        type: data.type,
        text: data.text,
        section: data.section,
        audio: null // Audio needs to be uploaded again
      });
    } catch (error) {
      toast.error('Failed to fetch question details');
      console.error('Error fetching question:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'audio') {
      setFormData(prev => ({
        ...prev,
        audio: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.type || !formData.text || (!id && !formData.audio)) {
      toast.warning('Please fill in all required fields');
      return;
    }

    const submitData = new FormData();
    submitData.append('type', formData.type);
    submitData.append('text', formData.text);
    submitData.append('section', formData.section);
    if (formData.audio) {
      submitData.append('audio', formData.audio);
    }

    try {
      setIsLoading(true);
      if (id) {
        await adminMockTestApi.updateFullMockTestQuestion(id, submitData);
        toast.success('Question updated successfully');
      } else {
        await adminMockTestApi.addFullMockTestQuestion(submitData);
        toast.success('Question added successfully');
      }
      navigate('/admin/cms/full-mocktest');
    } catch (error) {
      toast.error(id ? 'Failed to update question' : 'Failed to add question');
      console.error('Error submitting question:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingComponent />;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        {id ? 'Edit Question' : 'Add New Question'}
      </h1>

      <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Question Type *
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            required
          >
            <option value="">Select Question Type</option>
            {questionTypes[formData.section]?.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Question Text *
          </label>
          <textarea
            name="text"
            value={formData.text}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            rows="4"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Audio File {!id && '*'}
          </label>
          <input
            type="file"
            name="audio"
            onChange={handleInputChange}
            accept="audio/*"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            required={!id}
          />
          <p className="mt-1 text-sm text-gray-500">
            {id ? 'Upload new audio file only if you want to change the existing one' : 'Upload an audio file'}
          </p>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            disabled={isLoading}
          >
            {id ? 'Update Question' : 'Add Question'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/cms/full-mocktest')}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default FullMockTestForm; 