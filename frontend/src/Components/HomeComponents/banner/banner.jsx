import React from 'react'
import './banner.css'
import { Link } from 'react-router-dom'
import bannerBg from '../../../assets/image/bg_image.gif'
import aiIcon from '../../../assets/image/line.png'

const Banner = () => {
  return (
    <div className='container'>
      <div className="banner_container">
        <div className='banner'>
          <div className='banner_text'>
            हजुरको आफ्नै <span className="ai-tutor">"<span>Pte ai<img src={aiIcon} alt="PTE_ai_icon" /></span>" Tutor.</span>
          </div>
        </div>
        <div className="banner_bg_image">
          <img src={bannerBg} alt="banner_bg" />
        </div>
      </div>
      <div className='banner_text_3'>
        <Link to='/chatPage'><p>सुरु गरौँ</p></Link>
      </div> 
    </div>
  )
}

export default Banner