import React from 'react'
import ready_img from '../../../assets/image/design element 4.gif'
import './ready.css'

const Ready = () => {
  return (
    <div className='container'>
        <div className="ready_container">
            <div className="ready_content">
                <h2 className='font_style'>Real Exam जस्तै  <span style={{color:'var(--red)'}}>Mock test</span> practice घरमै बसेर</h2>
                <div className="ready_button">
                    <p>म तयार छु</p>
                </div>
            </div>
            <div className="ready_img">
                <img src={ready_img} alt="Ready" />
            </div>
        </div>  
        <div className="ready_star_content">
            <div className="ready_star_content_flex">
                <span>
                    <svg data-name="Layer 1" id="Layer_1" height='44px' width='44px' viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill='var(--dots)'><path d="M28.1068,15.3999C22.40759,15.3999,16.6,9.59277,16.6,3.89307a.59961.59961,0,1,0-1.19922,0c0,5.6997-5.80762,11.50683-11.50781,11.50683a.6001.6001,0,0,0,0,1.2002c5.70019,0,11.50781,5.80713,11.50781,11.50635a.59961.59961,0,0,0,1.19922,0c0-5.69922,5.80762-11.50635,11.50683-11.50635a.6001.6001,0,0,0,0-1.2002Z"/></svg>
                </span>
                <p>
                    तुरुन्तै Score र Feedback पाउनुहोस् Smart PTE Practice
                </p>
            </div>
            
        </div>      
        <div className="ready_star_content_2">
            <div className="ready_star_content_flex">
                <span>
                    <svg data-name="Layer 1" id="Layer_1" height='44px' width='44px' viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill='var(--dots)'><path d="M28.1068,15.3999C22.40759,15.3999,16.6,9.59277,16.6,3.89307a.59961.59961,0,1,0-1.19922,0c0,5.6997-5.80762,11.50683-11.50781,11.50683a.6001.6001,0,0,0,0,1.2002c5.70019,0,11.50781,5.80713,11.50781,11.50635a.59961.59961,0,0,0,1.19922,0c0-5.69922,5.80762-11.50635,11.50683-11.50635a.6001.6001,0,0,0,0-1.2002Z"/></svg>
                </span>
                <p>
                आफ्नो Weak पक्ष पत्ता लगाउनुहोस्
                </p>
            </div>
            
        </div>       
        <div className="ready_star_content_3">
            <div className="ready_star_content_flex">
                <span>
                    <svg data-name="Layer 1" id="Layer_1" height='44px' width='44px' viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill='var(--dots)'><path d="M28.1068,15.3999C22.40759,15.3999,16.6,9.59277,16.6,3.89307a.59961.59961,0,1,0-1.19922,0c0,5.6997-5.80762,11.50683-11.50781,11.50683a.6001.6001,0,0,0,0,1.2002c5.70019,0,11.50781,5.80713,11.50781,11.50635a.59961.59961,0,0,0,1.19922,0c0-5.69922,5.80762-11.50635,11.50683-11.50635a.6001.6001,0,0,0,0-1.2002Z"/></svg>
                </span>
                <p>
                Exam अघि नै आफ्नो स्कोर थाहा पाउनुहोस्
                </p>
            </div>            
        </div>      
    </div>
  )
}

export default Ready