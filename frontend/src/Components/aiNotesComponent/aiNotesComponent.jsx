import React, { useState } from 'react'
import Select from 'react-select'
import './aiNotesComponent.css'
import Writing_1 from '../../assets/pdf/Writing section/writing essay template.pdf' 
import Writing_2 from '../../assets/pdf/Writing section/Summerize written text.pdf' 
import Listening_1 from '../../assets/pdf/Listening section/Important Reminders (Dhyan Dinu Parne Kura)_.pdf' 
import Listening_2 from '../../assets/pdf/Listening section/Key Connecting Words & Phrases (Jodne Shabda-haru)_.pdf'
import Listening_3 from '../../assets/pdf/Listening section/Listening summerize spoken text(Note- taking tips).pdf'
import Listening_4 from '../../assets/pdf/Listening section/Template 1;General Overview+Keydetails.pdf'
import Listening_5 from '../../assets/pdf/Listening section/Template 2_ Focus on Problem_Solution or Cause_Effect.pdf'
import Listening_6 from '../../assets/pdf/Listening section/Template 3_ More Direct Approach.pdf'
import Speaking_1 from '../../assets/pdf/Speaking section/Describe image  (Line Graph) Template..pdf'
import Speaking_2 from '../../assets/pdf/Speaking section/Describe image  (maps).pdf'
import Speaking_3 from '../../assets/pdf/Speaking section/Describe image  (process diagram).pdf'
import Speaking_4 from '../../assets/pdf/Speaking section/Describe image  (Table ).pdf'
import Speaking_5 from '../../assets/pdf/Speaking section/Describe image (Bar chart) Template..pdf'
import Speaking_6 from '../../assets/pdf/Speaking section/Describe image (pie chart) Template..pdf'
import Reading_1 from '../../assets/pdf/Reading section/_(FIB-R - Drag and Drop).pdf'
import Reading_2 from '../../assets/pdf/Reading section/Re-order paragraphs (ROP).pdf'
import Reading_3 from '../../assets/pdf/Reading section/Multiple-choice, choose multiple answers (MCQ-M).pdf'
import Reading_4 from '../../assets/pdf/Reading section/_Multiple-choice, choose single answer (MCQ-S).pdf'
import Reading_5 from '../../assets/pdf/Reading section/FIB-RW - Drop-down menu.pdf'




const AiNotesComponent = ({handleMenuBar}) => {
    const section = ['Reading', 'Listening', 'Speaking', 'Writing']
    const [selectedSection, setSelectedSection] = useState("Reading")
    
    // Create options array for Select component
    const sectionOptions = section.map(item => ({
        value: item,
        label: item
    }))
    
    const handleSectionClick = (section) => {
        setSelectedSection(section)
    }

    //content with individual PDFs for each item
    const sectionData = {
        'Reading': {
            items: [
                {
                    content: "Multiple Choice (Multiple)",
                    pdf: Reading_3 // Add specific PDF for this content
                },
                {
                    content: "Re-order Paragraphs",
                    pdf: Reading_2 // Add PDF when available
                },
                {
                    content: "Reading：Fill in the Blanks", 
                    pdf: Reading_1 // Add PDF when available
                },
                {
                    content: "Multiple Choice (Single)",
                    pdf: Reading_4 // Add PDF when available
                },
                {
                    content: "Reading & Writing：Fill in the blanks",
                    pdf: Reading_5 // Add PDF when available
                }
            ]
        },
        'Writing': {
            items: [
                {
                    content: "Summarize Written Text",
                    pdf: Writing_2 
                },
                {
                    content: "Write Essay",
                    pdf: Writing_1 
                }
            ]
        },
        'Speaking': {
            items: [
                {
                    content: "Describe image  (Line Graph) Template",
                    pdf: Speaking_1 
                },
                {
                    content: "Describe image  (maps).pdf",
                    pdf: Speaking_2 
                },
                {
                    content: "Describe image  (process diagram)",
                    pdf: Speaking_3 
                },
                {
                    content: "Describe image  (Table )",
                    pdf: Speaking_4 
                },
                {
                    content: "Describe image (Bar chart) Template",
                    pdf: Speaking_5 
                },
                {
                    content: "Describe image (pie chart) Template..pdf",
                    pdf: Speaking_6 
                }
            ]
        },
        'Listening': {
            items: [
                {
                    content: "Important Reminders (Dhyan Dinu Parne Kura)",
                    pdf: Listening_1 
                },
                {
                    content: "Key Connecting Words & Phrases (Jodne Shabda-haru)",
                    pdf: Listening_2 
                },
                {
                    content: "Listening summerize spoken text(Note- taking tips)",
                    pdf: Listening_3 
                },
                {
                    content: "Template 1: General Overview+Keydetails",
                    pdf: Listening_4 
                },
                {
                    content: "Template 2: Focus on Problem_Solution or Cause_Effect",
                    pdf: Listening_5 
                },
                {
                    content: "Template 3: More Direct Approach",
                    pdf: Listening_6 
                }
            ]
        }
    }

    const renderContent = () => {
        const currentSection = sectionData[selectedSection]
        if (!currentSection) return null
        
        return (
            <div>
                <div className="content-list">
                    {currentSection.items.map((item, index) => (
                        <div key={index} className="notes_content_item">
                            <p>{item.content}</p>
                            {item.pdf && (
                                <div className="pdf-link">
                                    <a href={item.pdf} download={`${item.content}.pdf`} style={{display: 'flex', alignItems: 'center',}}>
                                        <span>
                                            <svg data-name="Layer 1" id="Layer_1" height='40' width='40' viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><defs><style>{`.cls-1{fill:#f44336;}.cls-2{fill:#ff8a80;}.cls-3{fill:#ffebee;}`}</style></defs><title/><path class="cls-1" d="M16.5,22h-9a3,3,0,0,1-3-3V5a3,3,0,0,1,3-3h6.59a1,1,0,0,1,.7.29l4.42,4.42a1,1,0,0,1,.29.7V19A3,3,0,0,1,16.5,22Z"/><path class="cls-2" d="M18.8,7.74H15.2a1.5,1.5,0,0,1-1.5-1.5V2.64a.55.55,0,0,1,.94-.39L19.19,6.8A.55.55,0,0,1,18.8,7.74Z"/><path class="cls-3" d="M7.89,19.13a.45.45,0,0,1-.51-.51V15.69a.45.45,0,0,1,.5-.51.45.45,0,0,1,.5.43.78.78,0,0,1,.35-.32,1.07,1.07,0,0,1,.51-.12,1.17,1.17,0,0,1,.64.18,1.2,1.2,0,0,1,.43.51,2,2,0,0,1,0,1.57A1.2,1.2,0,0,1,8.75,18a.86.86,0,0,1-.35-.3v.91a.5.5,0,0,1-.13.38A.52.52,0,0,1,7.89,19.13Zm1-1.76a.48.48,0,0,0,.38-.18.81.81,0,0,0,.14-.55.82.82,0,0,0-.14-.55.5.5,0,0,0-.38-.17.51.51,0,0,0-.39.17.89.89,0,0,0-.14.55.87.87,0,0,0,.14.55A.48.48,0,0,0,8.92,17.37Z"/><path class="cls-3" d="M12.17,18.11a1.1,1.1,0,0,1-.63-.17,1.22,1.22,0,0,1-.44-.51,2,2,0,0,1,0-1.57,1.22,1.22,0,0,1,.44-.51,1.11,1.11,0,0,1,.63-.18,1.06,1.06,0,0,1,.5.12.91.91,0,0,1,.35.28V14.48a.45.45,0,0,1,.51-.51.49.49,0,0,1,.37.13.5.5,0,0,1,.13.38v3.11a.5.5,0,0,1-1,.08.76.76,0,0,1-.34.32A1.14,1.14,0,0,1,12.17,18.11Zm.33-.74a.48.48,0,0,0,.38-.18.8.8,0,0,0,.15-.55.82.82,0,0,0-.15-.55.5.5,0,0,0-.38-.17.49.49,0,0,0-.38.17.82.82,0,0,0-.15.55.8.8,0,0,0,.15.55A.46.46,0,0,0,12.5,17.37Z"/><path class="cls-3" d="M15.52,18.1a.46.46,0,0,1-.51-.51V16h-.15a.34.34,0,0,1-.39-.38c0-.25.13-.37.39-.37H15a1.2,1.2,0,0,1,.34-.87,1.52,1.52,0,0,1,.92-.36h.17a.39.39,0,0,1,.29,0,.35.35,0,0,1,.15.17.55.55,0,0,1,0,.22.38.38,0,0,1-.09.19.27.27,0,0,1-.18.1h-.08a.66.66,0,0,0-.41.12.41.41,0,0,0-.11.31v.09h.32c.26,0,.39.12.39.37a.34.34,0,0,1-.39.38H16v1.6A.45.45,0,0,1,15.52,18.1Z"/></svg>
                                        </span>
                                        <span>
                                            <svg 
                                                xmlns="http://www.w3.org/2000/svg" 
                                                width="25" 
                                                height="25" 
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
                                        </span> 
                                    </a>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )
    } 
  return (
    <div className='container'>
      <div className={`progress_bar ${handleMenuBar ? 'progress_bar_active' : ''}`}>
        <h2 style={{marginTop:'50px',marginBottom:'20px',fontSize:'22px',fontWeight:'bold'}}>Which sections template you want to view?</h2>        
        
        {/* Button Tabs - for screens > 750px */}
        <div className="ai_recommendation_tab">
            {section.map((item,index)=>(
                <button key={index} onClick={()=>handleSectionClick(item)} className={selectedSection === item ? 'active_tab' : ''}>{item}</button>
            ))}
        </div>

        {/* Dropdown - only for screens ≤ 750px */}
        <div className="ai_recommendation_dropdown">
            <Select
                options={sectionOptions}
                value={sectionOptions.find(option => option.value === selectedSection)}
                onChange={(selected) => handleSectionClick(selected.value)}
                placeholder="Select a section..."
            />
        </div>

        <div className="ai_notes_content">
            {renderContent()}
        </div>
      </div>
    </div>
  )
}

export default AiNotesComponent