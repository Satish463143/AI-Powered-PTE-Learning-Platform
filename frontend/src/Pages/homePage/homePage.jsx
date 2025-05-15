import React from 'react'
import Banner from '../../Components/HomeComponents/banner/banner'
import AllSections from '../../Components/HomeComponents/allSections/allSections'
import Tutorials from '../../Components/HomeComponents/tutorials/tutorials'
import Carousel from '../../Components/HomeComponents/carousel/carousel'
import VideoFeatures from '../../Components/HomeComponents/videoFeatures/videoFeatures'
import Faqs from '../../Components/HomeComponents/faqs/faqs'
const HomePage = () => {
  return (
    <div>
      <Banner/>
      <AllSections/>
      <Tutorials/>
      <Carousel/>
      <VideoFeatures/>
      <Faqs/>
    </div>
  )
}

export default HomePage