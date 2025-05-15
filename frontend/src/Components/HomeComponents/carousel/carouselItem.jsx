import React from 'react'
import { Link } from 'react-router-dom'

const CarouselItem = ({title, description, image, link}) => {
  return (
    <div className='carousel_item'>
        <div className="carousel_item_content">
            <div>
                <img src={image} alt="" />
            </div>
            <div>
                <h1 className='text-center'>{title}</h1>
                <p className='text-center'>{description}</p>
            </div>
            
        </div>
        <div className="video_icon">
                <Link to={link}>
                    <span>
                        <svg
                            height="40px"
                            width="40px"
                            viewBox="0 0 32 32"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{
                            fillRule: 'evenodd',
                            clipRule: 'evenodd',
                            strokeLinejoin: 'round',
                            strokeMiterlimit: 2,
                            }}
                        >
                            <g id="Icon">
                            <path d="M15.999,2c-7.726,0 -14,6.273 -14,14c0,7.727 6.274,14 14,14c7.727,0 14,-6.273 14,-14c0,-7.727 -6.273,-14 -14,-14Zm0,2c6.623,0 12,5.377 12,12c0,6.623 -5.377,12 -12,12c-6.623,0 -12,-5.377 -12,-12c0,-6.623 5.377,-12 12,-12Z" />
                            <path d="M22.447,16.882c0.339,-0.169 0.553,-0.515 0.553,-0.894c0,-0.379 -0.214,-0.725 -0.553,-0.895l-10,-5c-0.31,-0.155 -0.678,-0.138 -0.973,0.044c-0.295,0.182 -0.474,0.504 -0.474,0.851l0,10c0,0.346 0.179,0.668 0.474,0.85c0.295,0.183 0.663,0.199 0.973,0.044l10,-5Zm-2.683,-0.894l-6.764,3.382c0,-0 -0,-6.764 -0,-6.764l6.764,3.382Z" />
                            </g>
                        </svg> 
                        </span>
                </Link>                
            </div>        
    </div>
  )
}

export default CarouselItem