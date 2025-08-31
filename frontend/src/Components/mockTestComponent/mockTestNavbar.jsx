import React, { useState, useEffect } from 'react'
import './mockTest.css'
import pdf from '../../assets/image/Full PTE mock.pdf'
import Swal from 'sweetalert2'
import 'sweetalert2/src/sweetalert2.scss'
import { useStartMockTestMutation } from '../../api/mockTest.api'
import { useMeQuery } from '../../api/auth.api'

const mockTestNavbar = ({handleMenuBar,toggleMockResult,loggedInUser}) => {
  const [startTest] = useStartMockTestMutation()
  const { data: userData, isLoading: isUserLoading, isError: isUserError } = useMeQuery()
  const totalMockTestGiven = 5;
  const averagePTEOverall = 71;
  const [targetScore, setTargetScore] = useState(75); 
  const [progressPercentage, setProgressPercentage] = useState(0)

  const currentXP = 4;

  const xpPercentage = (currentXP / 10) * 100
  useEffect(() => {
      // Calculate progress percentage as a proportion of target score
      const percentage = (averagePTEOverall / targetScore) * 100
      setProgressPercentage(Math.min(percentage, 100)) // Cap at 100%
  }, [averagePTEOverall, targetScore])

  const handleNavigate = async () => {
    try {
      // Check if user is authenticated using me query result
      if (isUserError || !userData) {
        Swal.fire({
          title: 'Please Login to continue',
          text: 'You need to be logged in to start the test',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Login',
          cancelButtonText: 'Cancel',
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = '/login';
          }
        });
        return;
      }

      const result = await Swal.fire({
        title: 'Are you sure?',
        text: `You want to start the test? Your target score is ${targetScore}.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'OK',
        cancelButtonText: 'Return',
      });

      if (result.isConfirmed) {
        try {
          // Match the backend's expected structure
          const response = await startTest({
            actionType: 'next',
            question: null,
            userAnswer: null,
            mockTestId: null // This will create a new test
          }).unwrap();

          console.log('Test started:', response);
          
          // Get mockTestId from the response
          const mockTestId = response?.result?.mockTestId;
          window.location.href = mockTestId 
            ? `/mockTest/fullTest?id=${mockTestId}`
            : `/mockTest/fullTest`;
        } catch (error) {
          console.error('Failed to start test:', error);
          Swal.fire({
            title: 'Error',
            text: error.data?.message || 'Failed to start the test. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        title: 'Error',
        text: 'An unexpected error occurred. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };
  
  // Show loading state while checking user authentication
  if (isUserLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='container'>
      <div className={`progress_bar ${handleMenuBar ? 'progress_bar_active' : ''}`}>
        <div className="mockTestNavbar">
          <div className="mockTest_menus">
            <div className="mockTest_menu">
              <p>Total Mock test Given</p>
              <strong>{totalMockTestGiven}</strong>
            </div>
            <div className="mockTest_menu">
              <p>Average PTE Overall</p>
              <strong>
                <div style={{ display: 'inline-block', textAlign: 'center' }}>
                  <div>{averagePTEOverall}</div>
                  <div style={{ borderTop: '2px solid black' }}>90</div>
                </div>
              </strong>
            </div>
            
            <div className="mockTest_menu">
              <p>Your Target mock test score</p>
              <strong>
                {targetScore}
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  style={{ marginLeft: '4px', verticalAlign: 'middle' }}
                >
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </strong>
              <input 
                type="range" 
                min="50" 
                max="90" 
                value={targetScore}
                onChange={(e) => setTargetScore(e.target.value)}
                style={{ width: '90%', }}
              />
            </div>
          </div>
          <div className="mockTest_progress">
            <div className="mockTest_menu">
              <p>Time to Target score</p>
              <span>Est. 3 more tests to reach {targetScore}+"</span>
            </div>
            <div>
              <div className="mockTest_progress_line">
                  <div className="mockTest_progress_line_bar" style={{width: `${progressPercentage}%`}}></div>
              </div>
              <div className="xp_bar_container" style={{width:'100%'}}>
                <span>
                    <svg width='30px' height='30px'  viewBox="0 0 320 512" xmlns="http://www.w3.org/2000/svg"><path fill='var(--orange)' d="M296 160H180.6l42.6-129.8C227.2 15 215.7 0 200 0H56C44 0 33.8 8.9 32.2 20.8l-32 240C-1.7 275.2 9.5 288 24 288h118.7L96.6 482.5c-3.6 15.2 8 29.5 23.3 29.5 8.4 0 16.4-4.4 20.8-12l176-304c9.3-15.9-2.2-36-20.7-36z"/></svg>
                </span>
                <div style={{width: '100%'}}>   
                    <p style={{fontWeight:'500'	}}>हजुरको Mock test Xp points</p>                   
                    <div className="xp_bar">
                        <div className="xp_bar_fill" style={{width: `${xpPercentage}%`}}></div>
                        <div className="xp_bar_score">{currentXP}/10</div>
                    </div>
                </div>
              </div>
              <p className='text-center' style={{marginTop:'10px'}}>"हजुरको XP Bar <strong >7</strong> मा पुगेपछी मात्रै Test Book गर्नुस्"</p>
            </div>
            <div className="mockTest_pdf">
              <p>Individual Preparation plan</p>            
              <a href={pdf} download="Individual_Preparation_Plan.pdf">
                <span>
                  <svg 
                    data-name="Layer 1" 
                    id="Layer_1" 
                    height='60' 
                    width='60' 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <style>{`.cls-1{fill:#f44336;}.cls-2{fill:#ff8a80;}.cls-3{fill:#ffebee;}`}</style>
                    </defs>
                    <title>PDF Icon</title>
                    <path className="cls-1" d="M16.5,22h-9a3,3,0,0,1-3-3V5a3,3,0,0,1,3-3h6.59a1,1,0,0,1,.7.29l4.42,4.42a1,1,0,0,1,.29.7V19A3,3,0,0,1,16.5,22Z"/>
                    <path className="cls-2" d="M18.8,7.74H15.2a1.5,1.5,0,0,1-1.5-1.5V2.64a.55.55,0,0,1,.94-.39L19.19,6.8A.55.55,0,0,1,18.8,7.74Z"/>
                    <path className="cls-3" d="M7.89,19.13a.45.45,0,0,1-.51-.51V15.69a.45.45,0,0,1,.5-.51.45.45,0,0,1,.5.43.78.78,0,0,1,.35-.32,1.07,1.07,0,0,1,.51-.12,1.17,1.17,0,0,1,.64.18,1.2,1.2,0,0,1,.43.51,2,2,0,0,1,0,1.57A1.2,1.2,0,0,1,8.75,18a.86.86,0,0,1-.35-.3v.91a.5.5,0,0,1-.13.38A.52.52,0,0,1,7.89,19.13Zm1-1.76a.48.48,0,0,0,.38-.18.81.81,0,0,0,.14-.55.82.82,0,0,0-.14-.55.5.5,0,0,0-.38-.17.51.51,0,0,0-.39.17.89.89,0,0,0-.14.55.87.87,0,0,0,.14.55A.48.48,0,0,0,8.92,17.37Z"/>
                    <path className="cls-3" d="M12.17,18.11a1.1,1.1,0,0,1-.63-.17,1.22,1.22,0,0,1-.44-.51,2,2,0,0,1,0-1.57,1.22,1.22,0,0,1,.44-.51,1.11,1.11,0,0,1,.63-.18,1.06,1.06,0,0,1,.5.12.91.91,0,0,1,.35.28V14.48a.45.45,0,0,1,.51-.51.49.49,0,0,1,.37.13.5.5,0,0,1,.13.38v3.11a.5.5,0,0,1-1,.08.76.76,0,0,1-.34.32A1.14,1.14,0,0,1,12.17,18.11Zm.33-.74a.48.48,0,0,0,.38-.18.8.8,0,0,0,.15-.55.82.82,0,0,0-.15-.55.5.5,0,0,0-.38-.17.49.49,0,0,0-.38.17.82.82,0,0,0-.15.55.8.8,0,0,0,.15.55A.46.46,0,0,0,12.5,17.37Z"/>
                    <path className="cls-3" d="M15.52,18.1a.46.46,0,0,1-.51-.51V16h-.15a.34.34,0,0,1-.39-.38c0-.25.13-.37.39-.37H15a1.2,1.2,0,0,1,.34-.87,1.52,1.52,0,0,1,.92-.36h.17a.39.39,0,0,1,.29,0,.35.35,0,0,1,.15.17.55.55,0,0,1,0,.22.38.38,0,0,1-.09.19.27.27,0,0,1-.18.1h-.08a.66.66,0,0,0-.41.12.41.41,0,0,0-.11.31v.09h.32c.26,0,.39.12.39.37a.34.34,0,0,1-.39.38H16v1.6A.45.45,0,0,1,15.52,18.1Z"/>
                  </svg>
                </span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="36" 
                  height="36" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  style={{ marginRight: '4px', verticalAlign: 'middle' }}
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg> 
              </a>
            </div>
          </div>
        </div>
        <div className="mockTest_time">
          <div className="mockTest_time_item">
            <div className="mocktest_content">
              <p style={{fontSize: '30px', fontWeight: '500'}}>Full PTE mock Test</p>
              <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                <span>
                  <svg 
                    enableBackground="new 0 0 24 24" 
                    height="44px" 
                    id="Layer_1" 
                    version="1.1" 
                    viewBox="0 0 24 24" 
                    width="44px" 
                    xmlSpace="preserve" 
                    xmlns="http://www.w3.org/2000/svg" 
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                  >
                    <g>
                      <path d="M12,0C5.4,0,0,5.4,0,12s5.4,12,12,12s12-5.4,12-12S18.6,0,12,0z M12,22C6.5,22,2,17.5,2,12S6.5,2,12,2s10,4.5,10,10   S17.5,22,12,22z"/>
                      <path d="M13.9,12.5c0-0.2,0.1-0.3,0.1-0.5c0-0.7-0.4-1.4-1-1.7V4c0-0.6-0.4-1-1-1s-1,0.4-1,1v6.3c-0.6,0.3-1,1-1,1.7   c0,1.1,0.9,2,2,2c0.2,0,0.3,0,0.5-0.1l1.8,1.8c0.4,0.4,1,0.4,1.4,0s0.4-1,0-1.4L13.9,12.5z M12,13c-0.6,0-1-0.4-1-1s0.4-1,1-1   s1,0.4,1,1S12.6,13,12,13z"/>
                      <circle cx="20" cy="12" r="1"/>
                      <circle cx="4" cy="12" r="1"/>
                      <circle cx="17.7" cy="17.7" r="1"/>
                      <circle cx="6.3" cy="6.3" r="1"/>
                      <circle cx="12" cy="20" r="1"/>
                      <circle cx="6.3" cy="17.7" r="1"/>
                      <circle cx="17.7" cy="6.3" r="1"/>
                    </g>
                  </svg>
                </span>
                <p style={{fontSize: '20px', fontWeight: '500'}}>2:00 Hrs</p>
              </div>          
            </div>
           
            <div className="mockTest_button">
              <p onClick={handleNavigate} style={{cursor: 'pointer'}}>            
                  Start test
              </p>
            </div>
          

          </div>
                    
        </div>
        <div className="fullMocktest_result">
          <h2>Full Mock Test Result</h2>
          <div className='test_result_item'>
            <div className="test_details">
              <div className="test_name">
                <p style={{fontSize: '18px', fontWeight: '500'}}>[Vip Full Mock Test] Mock Test 1</p>              
              </div>
              <div className="test_time">
                <p>Submitted on 2025-06-09 10:00:00</p>              
              </div>
            </div>
            <div className="result_button">
              <button onClick={toggleMockResult}>View Result</button>
            </div>
          </div> 
           
        </div>        
      </div>
    </div>
  )
}

export default mockTestNavbar