import React from 'react'
import './banner.css'
import { Link } from 'react-router-dom'

const Banner = () => {
  return (
    <div className='container'>
        <div className='banner'>
            <p className='banner_text'>
                हजुर को आफ्नै <br /> <span>“PTE AI”</span>  Tutor<span className='span_banner'>.</span>
                <p className='banner_text_2'>.....</p>
            </p>
            <div className='banner_text_3'>
            <Link to='chatPage'><p> सुरु गरौँ </p></Link>
            </div>
            
        </div>
    </div>
  )
}

export default Banner