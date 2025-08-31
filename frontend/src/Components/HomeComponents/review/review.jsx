import React from 'react'
import mokey from '../../../assets/image/monkey.png'
import review from '../../../assets/image/png customer review.png'
import aiIcon from '../../../assets/image/line.png'
import { Link } from 'react-router-dom'
import './review.css'

const Review = () => {
  return (
    <div className='container'>
        <div className="review_container">
            <div className="review_monkey_img">
                <img src={mokey} alt="" />
            </div>
            <div className="review_title">
                <h2 >के भन्छन् हाम्रो <span>Platform <img src={aiIcon} alt="PTE_ai_icon" /></span> <br />  प्रयोग गर्ने विद्यार्थीहरु?</h2>
            </div>
            <div className="review_img">
                <img src={review} alt="" />
            </div>
            
        </div>
        <div className="aiModel_button">
          <Link to='/'>
            <p>हामीलाई सहयोग गर्नुहोस्</p>
          </Link>
        </div>
    </div>
  )
}

export default Review