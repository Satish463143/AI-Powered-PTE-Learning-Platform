import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';

import './Fullmocktest.css'; // Custom styles

const FullMockTestList = () => {
  const [selectedSection, setSelectedSection] = useState(null);
  const [questions, setQuestions] = useState([
    { _id: 1, type: 'Read Aloud', section: 'reading', text: 'Sample question 1', audio: 'audio1.mp3' },
    { _id: 2, type: 'Retell Lecture', section: 'reading', text: 'Sample question 2', audio: 'audio2.mp3' },
    { _id: 3, type: 'Summarize Written Text', section: 'writing', text: 'Sample question 3', audio: 'audio3.mp3' },
  ]);
  const navigate = useNavigate();

  const sections = [
    { id: 'reading', name: 'Reading' },
    { id: 'writing', name: 'Writing' },
    { id: 'speaking', name: 'Speaking' },
    { id: 'listening', name: 'Listening' },
  ];

  const handleEdit = (questionId) => {
    navigate(`/admin/full-mocktest/edit/${questionId}`);
  };

  const handleDelete = (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      setQuestions((prev) => prev.filter((q) => q._id !== questionId));
    }
  };

  const handleAddQuestion = () => {
    if (!selectedSection) {
      alert('Please select a section first');
      return;
    }
    navigate(`/admin/full-mocktest/${selectedSection}/add`);
  };

  return (
    <div className="fullmock-wrapper px-6 md:px-10">
      <h1 className="text-3xl font-bold mb-6">Full Mock Test Management</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setSelectedSection(section.id)}
            className={`section-button ${
              selectedSection === section.id ? 'active' : 'inactive'
            }`}
          >
            {section.name}
          </button>
        ))}
      </div>

      {selectedSection && (
        <>
          <div className=" add-section flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold capitalize">{selectedSection} Questions</h2>
            <button
              onClick={handleAddQuestion}
              className=" add-question-button bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg shadow-md transition-all duration-150"
            >
              + Add Question
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-x-auto">
            <table className="question-table min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th>Question Type</th>
                  <th>Text</th>
                  <th>Audio</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.filter((q) => q.section === selectedSection).length > 0 ? (
                  questions
                    .filter((q) => q.section === selectedSection)
                    .map((question) => (
                      <tr key={question._id}>
                        <td>{question.type}</td>
                        <td>{question.text}</td>
                        <td>{question.audio}</td>
                        <td>
                          <div className="table-actions">
                            <button
                              onClick={() => handleEdit(question._id)}
                              className="text-blue-600 hover:text-blue-800 transition"
                              title="Edit"
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(question._id)}
                              className="text-red-600 hover:text-red-800 transition"
                              title="Delete"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan="4" className="no-data-cell">
                      No questions found for this section.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default FullMockTestList;
