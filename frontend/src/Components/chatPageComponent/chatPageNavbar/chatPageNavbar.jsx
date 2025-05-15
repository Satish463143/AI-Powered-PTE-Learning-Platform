import React, { useState } from 'react'
import './chatPageNavbar.css'
import { Link } from 'react-router-dom'
import profile from '../../../assets/image/user.png'

const chatPageNavbar = ({ handleMenuBar, onSoundToggle, onScoreSelect }) => {
    const [selectedScore, setSelectScore] = useState(null)
    const [login, setLogin] = useState(false)
    const [checked, setChecked] = useState(true)
    const [activeTab, setActiveTab] = useState("Reading");
    const [selectedContent, setSelectedContent] = useState(null);
    const [toggleMeter, setToggleMeter] = useState(false)

    const handleToggleMeter = () => {
        setToggleMeter(!toggleMeter)
    }

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        setSelectedContent(null);
    };

    const handleContentClick = (content) => {
        setSelectedContent(content);
    };

    const handleChange = (e) => {
        const isChecked = e.target.checked;
        setChecked(isChecked);
        onSoundToggle(isChecked);
    }

    const handleSelectScore = (score) => {
        setSelectScore(score);
    }

    const handleReadyClick = () => {
        if (selectedScore && selectedContent) {
            onScoreSelect(selectedScore, selectedContent);
            setToggleMeter(false); // Close the meter details
        }
    }

    const tabs = [
        { tab: 'Reading' },
        { tab: 'Writing' },
        { tab: 'Speaking' },
        { tab: 'Listening' },
    ]
    const renderContent = () => {
        switch (activeTab) {
          case 'Reading':
            return <>
                <p 
                    className={`content-item ${selectedContent === 'Reading & Writing：Fill in the blanks' ? 'selected' : ''}`}
                    onClick={() => handleContentClick('Reading & Writing：Fill in the blanks')}
                >Reading & Writing：Fill in the blanks</p>
                <p 
                    className={`content-item ${selectedContent === 'Multiple Choice (Multiple)' ? 'selected' : ''}`}
                    onClick={() => handleContentClick('Multiple Choice (Multiple)')}
                >Multiple Choice (Multiple)</p>
                <p 
                    className={`content-item ${selectedContent === 'Re-order Paragraphs' ? 'selected' : ''}`}
                    onClick={() => handleContentClick('Re-order Paragraphs')}
                >Re-order Paragraphs</p>
                <p 
                    className={`content-item ${selectedContent === 'Reading：Fill in the Blanks' ? 'selected' : ''}`}
                    onClick={() => handleContentClick('Reading：Fill in the Blanks')}
                >Reading：Fill in the Blanks</p>
                <p 
                    className={`content-item ${selectedContent === 'Multiple Choice (Single)' ? 'selected' : ''}`}
                    onClick={() => handleContentClick('Multiple Choice (Single)')}
                >Multiple Choice (Single)</p>
            </>;
          case 'Writing':
            return <>
                <p 
                    className={`content-item ${selectedContent === 'Summarize Written Text' ? 'selected' : ''}`}
                    onClick={() => handleContentClick('Summarize Written Text')}
                >Summarize Written Text</p>
                <p 
                    className={`content-item ${selectedContent === 'Write Essay' ? 'selected' : ''}`}
                    onClick={() => handleContentClick('Write Essay')}
                >Write Essay</p>
            </>;
          case 'Speaking':
            return <>
                <p 
                    className={`content-item ${selectedContent === 'Read Aloud' ? 'selected' : ''}`}
                    onClick={() => handleContentClick('Read Aloud')}
                >Read Aloud</p>
                <p 
                    className={`content-item ${selectedContent === 'Repeat Sentence' ? 'selected' : ''}`}
                    onClick={() => handleContentClick('Repeat Sentence')}
                >Repeat Sentence</p>
                <p 
                    className={`content-item ${selectedContent === 'Describe Image' ? 'selected' : ''}`}
                    onClick={() => handleContentClick('Describe Image')}
                >Describe Image</p>
                <p 
                    className={`content-item ${selectedContent === 'Respond to a situation' ? 'selected' : ''}`}
                    onClick={() => handleContentClick('Respond to a situation')}
                >Respond to a situation</p>
                <p 
                    className={`content-item ${selectedContent === 'Answer Short Question' ? 'selected' : ''}`}
                    onClick={() => handleContentClick('Answer Short Question')}
                >Answer Short Question</p>
            </>;
          case 'Listening':
            return <>
                <p 
                    className={`content-item ${selectedContent === 'Summarize Spoken Text' ? 'selected' : ''}`}
                    onClick={() => handleContentClick('Summarize Spoken Text')}
                >Summarize Spoken Text</p>
                <p 
                    className={`content-item ${selectedContent === 'Multiple Choice, Choose Multiple Answers' ? 'selected' : ''}`}
                    onClick={() => handleContentClick('Multiple Choice, Choose Multiple Answers')}
                >Multiple Choice, Choose Multiple Answers</p>
                <p 
                    className={`content-item ${selectedContent === 'Fill in the Blanks' ? 'selected' : ''}`}
                    onClick={() => handleContentClick('Fill in the Blanks')}
                >Fill in the Blanks</p>
                <p 
                    className={`content-item ${selectedContent === 'Highlight Incorrect Words' ? 'selected' : ''}`}
                    onClick={() => handleContentClick('Highlight Incorrect Words')}
                >Highlight Incorrect Words</p>
                <p 
                    className={`content-item ${selectedContent === 'Multiple Choice, Choose Single Answer' ? 'selected' : ''}`}
                    onClick={() => handleContentClick('Multiple Choice, Choose Single Answer')}
                >Multiple Choice, Choose Single Answer</p>
                <p 
                    className={`content-item ${selectedContent === 'Select Missing Word' ? 'selected' : ''}`}
                    onClick={() => handleContentClick('Select Missing Word')}
                >Select Missing Word</p>
                
                <p 
                    className={`content-item ${selectedContent === 'Write from Dictation' ? 'selected' : ''}`}
                    onClick={() => handleContentClick('Write from Dictation')}
                >Write from Dictation</p>
            </>;
          default:
            return <>
                <p 
                    className={`content-item ${selectedContent === 'Please select a section to see the question types' ? 'selected' : ''}`}
                    onClick={() => handleContentClick('Please select a section to see the question types')}
                >Please select a section to see the question types</p>
            </>;
        }
      };

  return (
    <div style={{backgroundColor: 'var(--white)',padding: '25px 0 20px 0'}} >
        <div className='container'>
            <div className='chatPageNavbar'>
                <div className={`chatPageNavbar_sound ${handleMenuBar ? 'chatPageNavbar_active' : ''}`}>
                    <p>‘AI’ आवाज</p>
                    <input
                        type="checkbox"
                        id='check'
                        className='sound_toggle_btn'
                        onChange={handleChange}
                        checked={checked}        
                    />
                    <label htmlFor="check"></label>
                </div>
                <div className='chatPageNavbar_video_tutor'>
                    <p>Ai Video tutor</p>
                    <span>
                        <svg data-name="Layer 1" height="30" id="Layer_1" viewBox="0 0 200 200" width="30" xmlns="http://www.w3.org/2000/svg"><title/><path d="M132.72,78.75l-56.5-56.5a9.67,9.67,0,0,0-14,0,9.67,9.67,0,0,0,0,14l56.5,56.5a9.67,9.67,0,0,1,0,14l-57,57a9.9,9.9,0,0,0,14,14l56.5-56.5C144.22,109.25,144.22,90.25,132.72,78.75Z"/></svg>
                    </span>
                </div>
                <div className='chatPageNavbar_profile_section'>
                    <div className="meter">
                        <span onClick={handleToggleMeter}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                xmlnsXlink="http://www.w3.org/1999/xlink"
                                enableBackground="new 0 0 50 50"
                                height="55px"
                                viewBox="0 0 50 50"
                                width="55px"
                            >
                                <rect fill="none" height="50" width="50" />
                                <polygon
                                points="26.6,24.249 40.725,18.691 40.95,19.049 29.07,28.725"
                                fill="#FFA500"
                                />
                                <path
                                d="M25,24c-2.211,0-4,1.792-4,4c0,2.208,1.789,4,4,4s4-1.792,4-4C29,25.791,27.211,24,25,24z"
                                fill="none"
                                stroke="#FFA500"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeMiterlimit="10"
                                strokeWidth="2"
                                />
                                <path
                                d="M44.959,41.338C47.511,37.523,49,32.938,49,28C49,14.736,38.264,4,25,4S1,14.736,1,28c0,4.936,1.488,9.521,4.037,13.332"
                                fill="none"
                                stroke="#FFA500"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeMiterlimit="10"
                                strokeWidth="2"
                                />
                                <line
                                fill="none"
                                stroke="#FFA500"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeMiterlimit="10"
                                strokeWidth="2"
                                x1="49"
                                x2="46"
                                y1="28"
                                y2="28"
                                />
                                <line
                                fill="none"
                                stroke="#FFA500"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeMiterlimit="10"
                                strokeWidth="2"
                                x1="1"
                                x2="4"
                                y1="28"
                                y2="28"
                                />
                                <line
                                fill="none"
                                stroke="#FFA500"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeMiterlimit="10"
                                strokeWidth="2"
                                x1="25"
                                x2="25"
                                y1="4"
                                y2="7"
                                />
                                <line
                                fill="none"
                                stroke="#FFA500"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeMiterlimit="10"
                                strokeWidth="2"
                                x1="13"
                                x2="14.5"
                                y1="7.215"
                                y2="9.813"
                                />
                                <line
                                fill="none"
                                stroke="#FFA500"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeMiterlimit="10"
                                strokeWidth="2"
                                x1="45.785"
                                x2="43.187"
                                y1="40"
                                y2="38.5"
                                />
                                <line
                                fill="none"
                                stroke="#FFA500"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeMiterlimit="10"
                                strokeWidth="2"
                                x1="4.215"
                                x2="6.813"
                                y1="16"
                                y2="17.5"
                                />
                                <line
                                fill="none"
                                stroke="#FFA500"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeMiterlimit="10"
                                strokeWidth="2"
                                x1="4.216"
                                x2="6.814"
                                y1="40"
                                y2="38.5"
                                />
                                <line
                                fill="none"
                                stroke="#FFA500"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeMiterlimit="10"
                                strokeWidth="2"
                                x1="45.785"
                                x2="43.188"
                                y1="16"
                                y2="17.5"
                                />
                                <line
                                fill="none"
                                stroke="#FFA500"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeMiterlimit="10"
                                strokeWidth="2"
                                x1="37"
                                x2="35.5"
                                y1="7.214"
                                y2="9.813"
                                />
                                <rect
                                fill="none"
                                height="3.998"
                                stroke="#FFA500"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeMiterlimit="10"
                                strokeWidth="2"
                                width="20.002"
                                x="14.999"
                                y="41"
                                />
                            </svg>
                        </span>
                        <div className={`meter_details ${toggleMeter ? 'meter_details_active' : ''}`}>
                            <div className="score">
                                <h3> हजुरको Desired स्कोर कति हो ?</h3>
                                <div className="scores_btn">
                                    <button onClick={() => handleSelectScore('50-65')} className={selectedScore === '50-65' ? 'selected' : ''}>(50-65)</button>
                                    <button onClick={() => handleSelectScore('65-75')} className={selectedScore === '65-75' ? 'selected' : ''}>(65-75)</button>
                                    <button onClick={() => handleSelectScore('75-90')} className={selectedScore === '75-90' ? 'selected' : ''}>(75-90)</button>
                                </div>
                            </div>
                            <div className="questions">
                                <h3 style={{marginTop:'10px'}}>हजुरलाई कुन section गाह्रो लाग्छ?</h3>
                            </div>
                            <div className="tabs">
                                {tabs.map((item,index)=>(
                                    <button
                                        key={index}
                                        className={`tab ${activeTab === item.tab ? "active_tab" : ""}`}
                                        onClick={() => handleTabClick(item.tab)}
                                    >
                                        {item.tab}
                                    </button>
                                ))} 
                            </div>
                            <div className="tab-content">
                                {renderContent()}
                            </div>
                            <div className='meter_content'>
                                <p className='text-center cursor-pointer' onClick={handleReadyClick}>म तयार छु</p>                                
                            </div>
                        </div>
                    </div>
                    {!login && (
                        <div className="signup_box">
                        <Link to='/login'>
                            <p className='login signup_button'>LOGIN</p>
                        </Link>
                    </div>
                    )}
                    {login && (
                        <div className="profile_img">
                            <img src={profile} alt="" />
                        </div>
                    )}                    
                </div>
            </div>
        </div>
    </div>
  )
}

export default chatPageNavbar