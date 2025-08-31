import React, { useState, useEffect } from 'react'
import './mockTest.css'
import Swal from 'sweetalert2'
import 'sweetalert2/src/sweetalert2.scss'
import { useStartMockTestMutation, useGetMockTestReportsQuery, useGetMockTestStatsQuery } from '../../api/mockTest.api'

const ProgressBar = ({progressPercentage})=>{
  return(
    <div>
      <div className="mockTest_progress_line">
          <div className="mockTest_progress_line_bar" style={{width: `${progressPercentage}%`}}></div>
      </div>
    </div>
  )
}

const MockTestQuestionsSet = ({handleMenuBar,toggleMockResult,loggedInUser}) => {
  const [startTest, { isLoading: isStarting }] = useStartMockTestMutation();
  
  // Only fetch data if user is logged in
  const { data: mockTestReports, isLoading: isLoadingReports } = useGetMockTestReportsQuery(undefined, {
    skip: !loggedInUser
  });
  const { data: mockTestStats, isLoading: isLoadingStats } = useGetMockTestStatsQuery(undefined, {
    skip: !loggedInUser
  });

  const RA = mockTestStats?.result?.[0]?.readAloud || 67;
  const RS = mockTestStats?.result?.[0]?.repeatSentence || 78;
  const DI = mockTestStats?.result?.[0]?.describeImage || 89;
  const RL = mockTestStats?.result?.[0]?.retellLecture || 90;
  const WE = mockTestStats?.result?.[0]?.writeEssay || 61;
  const SWT = mockTestStats?.result?.[0]?.summarizeWrittenText || 62;
  const FIB_RW = mockTestStats?.result?.[0]?.fillInTheBlanks_reading || 73;
  const FIB_R = mockTestStats?.result?.[0]?.reading_fillInTheBlanks || 54;
  const RO = mockTestStats?.result?.[0]?.reorderParagraph || 65;
  const WFD = mockTestStats?.result?.[0]?.writeFromDictation || 66;
  const SST = mockTestStats?.result?.[0]?.summarizeSpokenText || 87;
  const FIB_L = mockTestStats?.result?.[0]?.fillInTheBlanks_listening || 67;
  const HIW = mockTestStats?.result?.[0]?.highlightIncorrectWords || 59;

  const currentXP = mockTestStats?.result?.[0]?.overallScore || 4;
  const xpPercentage = (currentXP / 10) * 100

  const [section, setSection] = useState('RA')
  const sections = ['RA', 'RS', 'DI', 'RL','WE','SWT', 'FIB-RW','FIB-R', 'RO', 'WFD','SST','FIB-L', 'HIW']
   
  // Combined function that returns time, percentage and content based on section
  const getSectionData = (sectionName) => {
    switch(sectionName) {
      case 'RA':
        return {
          time: '35 Min',
          percentage: (RA / 90) * 100,
          content: 'Read Aloud'
        };
      case 'RS':
        return {
          time: '35 Min',
          percentage: (RS / 90) * 100,
          content: 'Repeat Sentence'
        };
      case 'DI':
        return {
          time: '35 Min',
          percentage: (DI / 90) * 100,
          content: 'Describe Image'
        };
      case 'RL':
        return {
          time: '35 Min',
          percentage: (RL / 90) * 100,
          content: 'Re-tell Lecture'
        };
      case 'WE':
        return {
          time: '20 Min',
          percentage: (WE / 90) * 100,
          content: 'Write Essay'
        };
      case 'SWT':
        return {
          time: '10 Min',
          percentage: (SWT / 90) * 100,
          content: 'Summarize Written Text'
        };
      case 'FIB-RW':
        return {
          time: '35 Min',
          percentage: (FIB_RW / 90) * 100,
          content: 'Reading & Writing：Fill in the blanks'
        };
      case 'FIB-R':
        return {
          time: '30 Min',
          percentage: (FIB_R / 90) * 100,
          content: 'Reading：Fill in the Blanks'
        };
      case 'RO':
        return {
          time: '41 Min',
          percentage: (RO / 90) * 100,
          content: 'Re-order Paragraphs'
        };
      case 'WFD':
        return {
          time: '10 Min',
          percentage: (WFD / 90) * 100,
          content: 'Write from Dictation'
        };
      case 'SST':
        return {
          time: '10 Min',
          percentage: (SST / 90) * 100,
          content: 'Summarize Spoken Text'
        };
      case 'FIB-L':
        return {
          time: '35 Min',
          percentage: (FIB_L / 90) * 100,
          content: 'Listening: Fill in the Blanks'
        };
      case 'HIW':
        return {
          time: '35 Min',
          percentage: (HIW / 90) * 100,
          content: 'Highlight Incorrect Words'
        };
      default:
        case 'RA':
        return {
            time: '35 Min',
            percentage: (RA / 90) * 100,
            content: 'Read Aloud'
        };
    }
  }

  const handleSection = (item) => {
    setSection(item)
  }

  // Get section data for current section
  const sectionData = getSectionData(section);

  const handleNavigate = async () => {
    // Check if user is logged in
    if (!loggedInUser) {
      Swal.fire({
        title: 'Login Required',
        text: 'Please login to start the test',
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

    try {
      // Confirm test start
      const confirmResult = await Swal.fire({
        title: 'Start Test?',
        text: `Are you ready to start the ${section} test?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Start',
        cancelButtonText: 'Cancel',
      });

      if (!confirmResult.isConfirmed) {
        return;
      }

      // Map section codes to question types
      const sectionToQuestionType = {
        'RA': { section: 'Speaking', type: 'readAloud' },
        'RS': { section: 'Speaking', type: 'repeatSentence' },
        'DI': { section: 'Speaking', type: 'describeImage' },
        'RL': { section: 'Speaking', type: 'respondToASituation' },
        'WE': { section: 'Writing', type: 'writeEssay' },
        'SWT': { section: 'Writing', type: 'summarizeWrittenText' },
        'FIB-RW': { section: 'Reading', type: 'fillInTheBlanks_reading' },
        'FIB-R': { section: 'Reading', type: 'reading_fillInTheBlanks' },
        'RO': { section: 'Reading', type: 'reorderParagraph' },
        'WFD': { section: 'Listening', type: 'writeFromDictation' },
        'SST': { section: 'Listening', type: 'summarizeSpokenText' },
        'FIB-L': { section: 'Listening', type: 'fillInTheBlanks_listening' },
        'HIW': { section: 'Listening', type: 'highlightIncorrectWords' }
      };

      // Get question info for selected section
      const questionInfo = sectionToQuestionType[section];
      if (!questionInfo) {
        throw new Error(`Invalid section type: ${section}`);
      }

      // Step 1: Create new test
      console.log('Creating new test...');
      const createResponse = await startTest({
        actionType: 'next',
        mockTestType: 'question_set',
        testInfo: {
          type: 'question_set',
          sections: [{
            name: questionInfo.section,
            questionTypes: [{
              type: questionInfo.type
            }]
          }]
        }
      }).unwrap();

      console.log('Create test response:', createResponse);
      if (!createResponse?.result?.mockTestId) {
        console.error('Invalid response structure:', createResponse);
        throw new Error('Failed to get mock test ID from server');
      }

      // Step 2: Generate first question
      console.log('Generating first question...');
      const generateResponse = await startTest({
        actionType: 'generate_question',
        mockTestId: createResponse.result.mockTestId,
        mockTestType: 'question_set',
        question: {
          section: questionInfo.section,
          questionType: questionInfo.type,
          sectionType: questionInfo.section,
          type: questionInfo.type,
          testType: 'question_set'
        }
      }).unwrap();

      console.log('Generate question response:', generateResponse);
      if (!generateResponse?.result?.question) {
        console.error('Invalid question response:', generateResponse);
        throw new Error('Failed to generate question');
      }

      // Navigate to test page
      window.location.href = `/mockTest/questionSet/${section}?id=${createResponse.result.mockTestId}`;

    } catch (error) {
      console.error('Error in handleNavigate:', error);
      
      // Show user-friendly error message
      Swal.fire({
        title: 'Error',
        text: error.data?.message || error.message || 'Failed to start test. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };
  
  return (
    <div className='container'>
      <div className={`progress_bar ${handleMenuBar ? 'progress_bar_active' : ''}`}>
        <div className="mockTest_section">
          <strong className='text-center'>Question Set Mock Test</strong>
          <div className="mockTest_question_item" >
          {sections.map((item, index) => (
              <p key={index} onClick={() => handleSection(item)} className={section === item ? 'activeSections' : ''}>{item}</p>
          ))}
          </div>
        </div>   
        <div className="mockTest_section_content">
        <div className="mockTest_section_content_header">
              <p style={{marginBottom: '10px'}}>हजुरको {section} Mock test progress</p>
              <ProgressBar progressPercentage={sectionData.percentage}/>
          </div> 
          <div className="xp_bar_container" style={{maxWidth:'500px'}}>
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
          <div className="mockTest_pdf">
            <p style={{display:'inline-block', textAlign:'center'}}>Individual Preparation plan</p>            
            <a href='' download="Individual_Preparation_Plan.pdf">
              <span style={{background:'none'}}>
                <svg data-name="Layer 1" id="Layer_1" height='60' width='60' viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <style>
                      {`.cls-1{fill:#f44336}.cls-2{fill:#ff8a80}.cls-3{fill:#ffebee}`}
                    </style>
                  </defs>
                  <title/>
                  <path className="cls-1" d="M16.5,22h-9a3,3,0,0,1-3-3V5a3,3,0,0,1,3-3h6.59a1,1,0,0,1,.7.29l4.42,4.42a1,1,0,0,1,.29.7V19A3,3,0,0,1,16.5,22Z"/>
                  <path className="cls-2" d="M18.8,7.74H15.2a1.5,1.5,0,0,1-1.5-1.5V2.64a.55.55,0,0,1,.94-.39L19.19,6.8A.55.55,0,0,1,18.8,7.74Z"/>
                  <path className="cls-3" d="M7.89,19.13a.45.45,0,0,1-.51-.51V15.69a.45.45,0,0,1,.5-.51.45.45,0,0,1,.5.43.78.78,0,0,1,.35-.32,1.07,1.07,0,0,1,.51-.12,1.17,1.17,0,0,1,.64.18,1.2,1.2,0,0,1,.43.51,2,2,0,0,1,0,1.57A1.2,1.2,0,0,1,8.75,18a.86.86,0,0,1-.35-.3v.91a.5.5,0,0,1-.13.38A.52.52,0,0,1,7.89,19.13Zm1-1.76a.48.48,0,0,0,.38-.18.81.81,0,0,0,.14-.55.82.82,0,0,0-.14-.55.5.5,0,0,0-.38-.17.51.51,0,0,0-.39.17.89.89,0,0,0-.14.55.87.87,0,0,0,.14.55A.48.48,0,0,0,8.92,17.37Z"/>
                  <path className="cls-3" d="M12.17,18.11a1.1,1.1,0,0,1-.63-.17,1.22,1.22,0,0,1-.44-.51,2,2,0,0,1,0-1.57,1.22,1.22,0,0,1,.44-.51,1.11,1.11,0,0,1,.63-.18,1.06,1.06,0,0,1,.5.12.91.91,0,0,1,.35.28V14.48a.45.45,0,0,1,.51-.51.49.49,0,0,1,.37.13.5.5,0,0,1,.13.38v3.11a.5.5,0,0,1-1,.08.76.76,0,0,1-.34.32A1.14,1.14,0,0,1,12.17,18.11Zm.33-.74a.48.48,0,0,0,.38-.18.8.8,0,0,0,.15-.55.82.82,0,0,0-.15-.55.5.5,0,0,0-.38-.17.49.49,0,0,0-.38.17.82.82,0,0,0-.15.55.8.8,0,0,0,.15.55A.46.46,0,0,0,12.5,17.37Z"/>
                  <path className="cls-3" d="M15.52,18.1a.46.46,0,0,1-.51-.51V16h-.15a.34.34,0,0,1-.39-.38c0-.25.13-.37.39-.37H15a1.2,1.2,0,0,1,.34-.87,1.52,1.52,0,0,1,.92-.36h.17a.39.39,0,0,1,.29,0,.35.35,0,0,1,.15.17.55.55,0,0,1,0,.22.38.38,0,0,1-.09.19.27.27,0,0,1-.18.1h-.08a.66.66,0,0,0-.41.12.41.41,0,0,0-.11.31v.09h.32c.26,0,.39.12.39.37a.34.34,0,0,1-.39.38H16v1.6A.45.45,0,0,1,15.52,18.1Z"/>
                </svg>
              </span>
              <svg 
                className="icon" 
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
            </a>
          </div>
          <div style={{marginTop: '25px',textAlign:'center'}}>
            <span>Average PTE {section} Overall</span> <strong style={{ background:'var(--semi_blue)', borderRadius:'50%', padding:'10px 12px'}}>
              {section === 'RA' ? RA : 
              section === 'RS' ? RS : 
              section === 'DI' ? DI : 
              section === 'RL' ? RL :
              section === 'WE' ? WE :
              section === 'SWT' ? SWT :
              section === 'FIB-RW' ? FIB_RW :
              section === 'FIB-R' ? FIB_R :
              section === 'RO' ? RO :
              section === 'WFD' ? WFD :
              section === 'SST' ? SST :
              section === 'FIB-L' ? FIB_L :
              section === 'HIW' ? HIW : ''}
            </strong>
          </div>
          <div className="mocktest_content">
            <p style={{fontSize: '30px', fontWeight: '500',marginTop:'-18px',width:'100%'}}>{`${sectionData.content} mock Test`}</p>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px', justifyContent:'center'}}>
              <span>
                <svg 
                  className="icon" 
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
              <p style={{fontSize: '20px', fontWeight: '500'}}>{sectionData.time}</p>
            </div>          
          </div>

          <div className="mockTest_section_content_item">
            <p>Question types :</p>
            <div className="question_types">
              <p>{sectionData.content}</p>
            </div>          
          </div>
          <div className="mockTest_button text-center" >
            <p style={{display:'inline-block', cursor: 'pointer'}} onClick={handleNavigate}>
              {isStarting || isLoadingStats || isLoadingReports ? 'Loading...' : 'Start test'}
            </p>
          </div>        
        </div>
        </div>
        <div className="fullMocktest_result">
          <h2>Question Set Mock Test Result</h2>
          {isLoadingReports ? (
            <p>Loading test results...</p>
          ) : mockTestReports?.result?.map((test, index) => (
            <div key={index} className='test_result_item'>
              <div className="test_details">
                <div className="test_name">
                  <p style={{fontSize: '18px', fontWeight: '500'}}>[VIP {section} Mock Test] Mock Test {index + 1}</p>              
                </div>
                <div className="test_time">
                  <p>Submitted on {new Date(test.submittedAt).toLocaleString()}</p>              
                </div>
              </div>
              <div className="result_button">
                <button onClick={() => toggleMockResult(test._id)}>View Result</button>
              </div>
            </div>
          ))}
        </div>
    </div>
  )
}

export default MockTestQuestionsSet