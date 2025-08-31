import React from 'react'
import html2pdf from 'html2pdf.js';


const HistroryCallXp = ({callHistory}) => {
    

    // Get the latest call data (first item in the array)
    const latestCallData = callHistory?.result?.[0];
    
    // Ensure all scores are valid numbers with fallback to 0
    const safeScore = (value) => Number(value) || 0;
    
    // Get scores from historyScores
    const pScore = safeScore(latestCallData?.historyScores?.pronunciationScore);
    const oScore = safeScore(latestCallData?.historyScores?.oralFluencyScore);
    const vScore = safeScore(latestCallData?.historyScores?.vocabularyScore);
    const cScore = safeScore(latestCallData?.historyScores?.contentScore);
    const currentXP = safeScore(latestCallData?.xp);
   
    // Calculate percentages using safe values
    const pronounciationPercentage = (pScore / 5) * 100;
    const oralFrequencyPercentage = (oScore / 5) * 100;
    const vocabularyPercentage = (vScore / 5) * 100;
    const contentPercentage = (cScore / 5) * 100;
   
    // Calculate overall score using safe values
    const overallScore = ((pScore + oScore + vScore + cScore) / 4).toFixed(2);

    // Ensure XP is a valid number between 0 and 10
    const safeXP = Math.min(Math.max(currentXP, 0), 10);

    // Create a Blob from the PDF content and generate URL
    const pdfContent = latestCallData?.pdfContent;
    const downloadPDF = () => {
        if (!pdfContent) return;
    
        const element = document.createElement('div');
        element.innerHTML = pdfContent;
    
        const opt = {
          margin:       0.5,
          filename:     'Individual_Preparation_Plan.pdf',
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2 },
          jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
    
        html2pdf().set(opt).from(element).save();
      };


    if (!latestCallData) {
        return <div>No call history available</div>;
    }
    
    return (
        <div className='ai_call_xp_container'>
            <div className='ai_call_xp_bar'>
                <h3>Your Speaking experience point </h3>
                <div className="xp_bar_container">
                    <span>
                        <svg width='30px' height='30px'  viewBox="0 0 320 512" xmlns="http://www.w3.org/2000/svg"><path fill='var(--orange)' d="M296 160H180.6l42.6-129.8C227.2 15 215.7 0 200 0H56C44 0 33.8 8.9 32.2 20.8l-32 240C-1.7 275.2 9.5 288 24 288h118.7L96.6 482.5c-3.6 15.2 8 29.5 23.3 29.5 8.4 0 16.4-4.4 20.8-12l176-304c9.3-15.9-2.2-36-20.7-36z"/></svg>
                    </span>
                    <div style={{width: '100%'}}>
                        <p style={{fontSize: '13px'}}>
                            {`Your overall XP is ${safeXP} out of 10`}
                        </p>
                        <div className="xp_bar">
                            <div className="xp_bar_fill" style={{width: `${safeXP * 10}%`}}></div>
                            <div className="xp_bar_score">{safeXP}/10</div>
                        </div>
                    </div>                                
                </div>
            </div>
            <div className="ai_call_score_bar">
                <h3>Your 'Ai' prediction score</h3>
                <div className="score_bar_container">
                    <p>Pronunciation ({pScore}/5)</p>
                    <div className="score_bar">
                        <div className="score_bar_fill" style={{width: `${pronounciationPercentage}%`}}></div>
                    </div>
                </div>
                <div className="score_bar_container">
                    <p>Oral Frequency ({oScore}/5)</p>
                    <div className="score_bar">
                        <div className="score_bar_fill" style={{width: `${oralFrequencyPercentage}%`}}></div>
                    </div>
                </div>
                <div className="score_bar_container">
                    <p>Vocabulary ({vScore}/5)</p>
                    <div className="score_bar">
                        <div className="score_bar_fill" style={{width: `${vocabularyPercentage}%`}}></div>
                    </div>
                </div>
                <div className="score_bar_container">
                    <p>Content ({cScore}/5)</p>
                    <div className="score_bar">
                        <div className="score_bar_fill" style={{width: `${contentPercentage}%`}}></div>
                    </div>
                </div>
                <div className="overall_score">
                    <p>{overallScore}/5</p>
                </div>
            </div>
            <div className="ai_call_pdf">
                <p>Download your class notes</p>              
                <button 
                    onClick={downloadPDF} 
                    style={{
                        display: 'flex', 
                        alignItems: 'center',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0
                    }}
                >
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
                </button>
            </div>
        </div>
    )
}

export default HistroryCallXp