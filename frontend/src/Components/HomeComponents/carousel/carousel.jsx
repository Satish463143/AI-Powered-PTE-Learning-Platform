import React from 'react'
import Slider from 'react-slick'
import CarouselItem from './carouselItem'
import './carousel.css'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import speaking from '../../../assets/image/speaking.png'
import reading from '../../../assets/image/book.png'
import listening from '../../../assets/image/ear.png'
import writing from '../../../assets/image/pen.png'
// Custom arrow components
const NextArrow = ({ onClick }) => (
    <div className="slick-arrow slick-next" onClick={onClick}>
        →
    </div>
);
  
const PrevArrow = ({ onClick }) => (
    <div className="slick-arrow slick-prev" onClick={onClick}>
        ←
    </div>
);

const Carousel = () => {
    const carouselItems = [
        {
            title: 'Reading',
            description: 'From Confused to Confident –PTE Reading with an AI-Powered Coach',
            image: reading,
            link: '/carousel-item-1'
        },
        {
            title: 'Speaking',
            description: 'AI That Listens, Corrects, and Coaches You to a Better Speaking Score',
            image: speaking,
            link: '/carousel-item-1'
        },
        {
            title: 'Writing',
            description: 'Step-by-Step PTE Reading Solving Strategies,Powered by AI',
            image: writing,
            link: '/carousel-item-1'
        },
        {
            title: 'Listening',
            description: 'AI That Listens, Corrects, and Coaches You to a Better Speaking Score',
            image: listening,
            link: '/carousel-item-1'
        },
    ]
    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
    }
        
  return (
    <div className='container'>
        <div className="carousels">
            <Slider {...settings}>
                {carouselItems.map((item, index) => (
                    <CarouselItem key={index} title={item.title} description={item.description} image={item.image} link={item.link} />
                ))}
            </Slider>
        </div>
    </div>
  )
}

export default Carousel