import React, { useState } from 'react'
import './aiRecommendation.css'

const aiRecommendation = ({handleMenuBar}) => {
    const [activeTab, setActiveTab] = useState("Reading");
    const tabs = [
        { tab: 'Reading' },
        { tab: 'Writing' },
        { tab: 'Speaking' },
        { tab: 'Listening' },
    ]

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };
  return (
    <div className='container'>
        <div className={`ai_recommendation ${handleMenuBar ? 'progress_bar_active' : ''}`}>
            <div className="ai_recommendation_content">
                <h2>AI Recommendation</h2>
            </div>
            <div className="ai_recommendation_tabs">
                {/* Tabs */}
                <div className="ai_recommendation_tab">
                    {tabs.map((item,index)=>(
                        <>
                            <button key={index} onClick={()=>handleTabClick(item.tab)} className={activeTab === item.tab ? 'active_tab' : ''}>{item.tab}</button>
                        </>
                    ))}
                </div>
                <h2 className='text-center' style={{marginTop: '20px'}}>🧠 Top Recommendations:</h2>
                {/* Tabs Content */}
                <div className="ai_recommendation_tabs_content">

                </div>

            </div>
        </div>
    </div>
  )
}

export default aiRecommendation