import React, { useState } from 'react'
import Banner from '../../Components/HomeComponents/banner/banner'
import AllSections from '../../Components/HomeComponents/allSections/allSections'
import Faqs from '../../Components/HomeComponents/faqs/faqs'
import AiModel from '../../Components/HomeComponents/aiModel/aiModel'
import Ready from '../../Components/HomeComponents/ready/ready'
import Review from '../../Components/HomeComponents/review/review'
import './homePage.css'
const HomePage = () => {
 

  return (
    <>
      <div className='shadow_bg'></div>
      <div className='dots_bg'></div>  
      <Banner/>
      <AllSections/>
      <AiModel/>
      <Ready/>
      <Review/>
      <Faqs/>      
    </>
  )
}

export default HomePage