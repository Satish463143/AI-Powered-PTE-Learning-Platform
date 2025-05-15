import React, { useState } from 'react'
import SideNavbar from '../../Common/sideNavbar/sideNavbar'
import ProgressNavbar from '../../Components/progressComponent/progressNavbar/progressNavbar'
import AiRecommendation from '../../Components/progressComponent/aiRecommendation/aiRecommendation'
import ProgressChat from '../../Components/progressComponent/progressChat/progressChat'
const progressPage = () => {
    const [menuBar, setMenuBar] = useState(false)
    const handleMenuBar = () => {
        setMenuBar(!menuBar)
    }
    return (
        <div>
            <div className="hambergmenu" onClick={handleMenuBar}>
                <div className={`bar_1 ${menuBar ? 'bar_1_active' : ''}`}></div>
                <div className={`bar_2 ${menuBar ? 'bar_2_active' : ''}`}></div>
                <div className={`bar_3 ${menuBar ? 'bar_3_active' : ''}`}></div>
            </div>
            <div className={`chatPage_container ${menuBar ? 'menuBar_active' : ''}`}>
                <div className="toggle_navbar">
                    <SideNavbar handleMenuBar={handleMenuBar}/>
                </div>
                <div style={{height:'100vh', overflowY:'scroll'}}>
                    <ProgressNavbar handleMenuBar={menuBar}/>
                    <AiRecommendation handleMenuBar={menuBar}/>
                    <ProgressChat handleMenuBar={menuBar}/>
                </div>
            </div>
        </div>
    )
}

export default progressPage