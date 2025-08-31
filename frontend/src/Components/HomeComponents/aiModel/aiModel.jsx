import React from 'react'
import './aiModel.css'
import aiModel_img from '../../../assets/image/design png.png'
import aiIcon from '../../../assets/image/line.png'
import { Link } from 'react-router-dom'


const AiModel = () => {
  return (
    <div className='container'>
        <div className="aiModel_title">
            <p className='font_style'>We have created <br /> Nepal's  <span >first <img src={aiIcon} alt="PTE_ai_icon" /> </span>Ai model ! </p>
        </div> 
        <div className="aiModel_img">
          <img src={aiModel_img} alt="PTE Sathi Ai Model" className="ai-model-gif" />
        </div>   
        <div className="aiModel_button">
          <Link to='/'>
            <p>Platform पयोग गर्ने तरिका</p>
          </Link>
        </div>    
        
    </div>
  )
}

export default AiModel