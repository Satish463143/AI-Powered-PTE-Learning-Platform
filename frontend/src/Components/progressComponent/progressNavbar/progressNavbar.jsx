import React, { useState, useEffect } from 'react'
import './progressNavbar.css'

const progressNavbar = ({handleMenuBar}) => {
    const [score, setScore] = useState(56) 
    const [selectedScore, setSelectScore] = useState(null)
    const [toggleScore, setToggleScore] = useState(false)
    const [targetScore, setTargetScore] = useState(90) // Default target score
    const [progressPercentage, setProgressPercentage] = useState(0)

    useEffect(() => {
        // Calculate progress percentage whenever score or target score changes
        const percentage = (score / targetScore) * 100
        setProgressPercentage(Math.min(percentage, 100)) // Cap at 100%
    }, [score, targetScore])

    const handleToggleScore = () => {
        setToggleScore(!toggleScore)
    }

    const handleSelectScore = (scoreRange) => {
        setSelectScore(scoreRange)
        // Set target score based on selected range
        const [min, max] = scoreRange.split('-').map(Number)
        setTargetScore(max) // Using max as target score
        setTimeout(() => {
            setToggleScore(false)
        }, 500)        
    }

    return (
        <div className='container'>
            <div className="progress_navbar">
                <div className={`progress_bar ${handleMenuBar ? 'progress_bar_active' : ''}`}>
                    <h3>Progress 
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            xmlnsXlink="http://www.w3.org/1999/xlink"
                            height="35px"
                            width="35px"
                            viewBox="0 0 512 512"
                            style={{ enableBackground: 'new 0 0 512 512' }}
                        >
                            <g id="C_-_55_x2C__growth_x2C__Chart_x2C__flowchart_x2C__graph_x2C__increase_x2C__progress">
                            <g>
                                <polygon points="161.898,298.28 161.898,380.918 251.314,380.918 251.314,284.795 161.898,284.795" />
                                <rect height="77.952" width="80.436" x="72.092" y="302.966" />
                                <polygon points="260.686,280.109 260.686,380.918 350.095,380.918 350.095,257.32 260.686,257.32" />
                                <polygon points="359.466,252.635 359.466,380.918 439.908,380.918 439.908,211.523 359.466,211.523" />
                                <path d="M471.531,380.919H40.469c-2.587,0-4.686,2.098-4.686,4.686s2.099,4.686,4.686,4.686h431.063
                                c2.588,0,4.686-2.098,4.686-4.686S474.119,380.919,471.531,380.919z"/>
                                <path d="M58.429,278.565c1.022,0,2.053-0.333,2.916-1.021l43.308-34.484l87.789,13.105c1.465,0.22,2.947-0.268,3.997-1.313
                                l51.67-51.429l50.999,21.156c1.787,0.744,3.844,0.31,5.181-1.088l89.806-93.856c1.789-1.87,1.725-4.835-0.146-6.625
                                c-1.87-1.792-4.837-1.724-6.625,0.146l-87.588,91.539l-50.922-21.124c-1.748-0.725-3.759-0.329-5.101,1.007l-52.215,51.971
                                l-87.477-13.059c-1.287-0.193-2.594,0.159-3.61,0.969l-44.903,35.754c-2.024,1.611-2.359,4.559-0.747,6.583
                                C55.686,277.961,57.051,278.565,58.429,278.565z"/>
                            </g>
                            </g>
                            <g id="Layer_1" />
                        </svg>
                    </h3>                        
                    <div className="progress_line">
                        <div className="progress_line_bar" style={{width: `${progressPercentage}%`}}></div>
                    </div>
                    {/* <h2>You are ready for your exam once the progress bar reaches green <span></span></h2> */}
                </div>
                
                <div className="progress_score">
                    <div className="select_score">
                        <div className="score_menu">
                            <h3>लक्ष्य स्कोर कति राख्नन चाहनुहुन्छ?</h3>
                            <h2 onClick={handleToggleScore}>Set Score</h2>
                        </div>
                        <div className={`score_disable ${toggleScore ? 'score_active' : ''}`}>
                            <h3> हजुरको Desired स्कोर कति हो ?</h3>
                            <div className="scores_btn">
                                <button onClick={() => handleSelectScore('50-65')} className={selectedScore === '50-65' ? 'selected' : ''}>(50-65)</button>
                                <button onClick={() => handleSelectScore('65-75')} className={selectedScore === '65-75' ? 'selected' : ''}>(65-75)</button>
                                <button onClick={() => handleSelectScore('75-90')} className={selectedScore === '75-90' ? 'selected' : ''}>(75-90)</button>
                            </div>
                        </div>
                    </div>              
                </div>
            </div>
        </div>
    )
}

export default progressNavbar