import React from 'react'

const AiCallXp = ({score, currentLevel, currentXP, pronounciationScore, oralFluencyScore, vocabularyScore, contentScore}) => {
    // Ensure all scores are valid numbers with fallback to 0
    const safeScore = (value) => Number(value) || 0;
    
    const pScore = safeScore(pronounciationScore);
    const oScore = safeScore(oralFluencyScore);
    const vScore = safeScore(vocabularyScore);
    const cScore = safeScore(contentScore);
    
    // Calculate percentages using safe values
    const xpPercentage = (currentXP / 10) * 100;
    const pronounciationPercentage = (pScore / 90) * 100;
    const oralFluencyPercentage = (oScore / 90) * 100; // Changed from oralFrequencyPercentage
    const vocabularyPercentage = (vScore / 90) * 100;
    const contentPercentage = (cScore / 90) * 100;
    
    // Calculate overall score using safe values
    const overallScore = ((pScore + oScore + vScore + cScore) / 4).toFixed(2);

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
                            {currentLevel < 10 ? `Earn ${10 - currentXP} XP to reach Level ${currentLevel + 1}` : 'Max Level Reached!'}
                        </p>
                        <div className="xp_bar">
                            <div className="xp_bar_fill" style={{width: `${xpPercentage}%`}}></div>
                            <div className="xp_bar_score">{currentXP}/10</div>
                        </div>
                    </div>                                
                </div>
            </div>
            <div className="ai_call_score_bar">
                <h3>Your 'Ai' prediction score</h3>
                <div className="score_bar_container">
                    <p>Pronunciation</p>
                    <div className="score_bar">
                        <div className="score_bar_fill" style={{width: `${pronounciationPercentage}%`}}></div>
                    </div>
                </div>
                <div className="score_bar_container">
                    <p>Oral Fluency</p>
                    <div className="score_bar">
                        <div className="score_bar_fill" style={{width: `${oralFluencyPercentage}%`}}></div>
                    </div>
                </div>
                <div className="score_bar_container">
                    <p>Vocabulary</p>
                    <div className="score_bar">
                        <div className="score_bar_fill" style={{width: `${vocabularyPercentage}%`}}></div>
                    </div>
                </div>
                <div className="score_bar_container">
                    <p>Content</p>
                    <div className="score_bar">
                        <div className="score_bar_fill" style={{width: `${contentPercentage}%`}}></div>
                    </div>
                </div>
                <div className="overall_score">
                    <p>{overallScore}/90</p>
                </div>
            </div>
        </div>
    )
}

export default AiCallXp