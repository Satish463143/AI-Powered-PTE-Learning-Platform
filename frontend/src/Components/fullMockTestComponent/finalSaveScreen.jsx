import React from 'react'

const FinalSaveScreen = () => {
  return (
    <div className="final-save-container">
      <h2>Test Completed</h2>
      <p>You have successfully completed all sections of the mock test.</p>
      <p>Your responses have been saved and will be processed for scoring.</p>
      <div className="save-actions">
        <button className="primary-btn">View Results</button>
        <button className="secondary-btn">Return to Dashboard</button>
      </div>
    </div>
  )
}

export default FinalSaveScreen