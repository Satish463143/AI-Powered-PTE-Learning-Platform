import React from 'react'
import notes from '../../../assets/image/speaking-2.svg'
import listening from '../../../assets/image/listening-2.svg'
import reading from '../../../assets/image/reading-2.svg'
import './videoFeatures.css'

const videoFeatures = () => {
  return (
    <div className='container'>
        <div className="video_title">
            <h1>Video Features</h1>
        </div>  
        <div className="video_content">
            <div className="video_content_item">
                <div className="video_content_item_image">
                    <img src={listening} alt="" />
                </div>
                <div className="video_content_item_title">
                    <h1>AI-NOTES
                    पीटीई section नोट्स</h1>
                </div>
            </div>
            <div className="video_content_item">
                <div className="video_content_item_image">
                    <img src={notes} alt="" />
                </div>
                <div className="video_content_item_title">
                    <h1>अंग्रेजी PTE
                        भिडियोमा नेपाली
                        आवाज</h1>
                </div>
            </div>
            <div className="video_content_item">
                <div className="video_content_item_image">
                    <img src={reading} alt="" />
                </div>
                <div className="video_content_item_title">
                    <h1>Practice in real-time
                    परीक्षा जस्तै अभ्यास</h1>
                </div>
            </div>
        </div>      
    </div>
  )
}

export default videoFeatures