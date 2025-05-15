import React from 'react'
import './allSections.css'
import video from '../../../../src/assets/image/video.png'
import speaker from '../../../../src/assets/image/speaking.png'
import listening from '../../../../src/assets/image/ear.png'
import reading from '../../../../src/assets/image/book.png'
import writing from '../../../../src/assets/image/pen.png'
import { useNavigate } from 'react-router-dom'

const AllSections = () => {
    const navigate = useNavigate()

    const handleSectionClick = (content) => {
        navigate('/chatPage', { state: { selectedContent: content } });
      };

   
  return (
    <div className='container'>
        <div className='all_sections'>
            <div className="all_section_content" onClick={() => handleSectionClick('Video Learning')}>
                <img src={video} alt="" />
                <p>भिडियो शिक्षण <br /> AI-Powered video learning</p>
            </div>
            <div className="all_section_content" onClick={() => handleSectionClick('Reading')}>
                <img src={reading} alt="" />
                <p>
                    रीडिङ सेक्शन <br />
                    AI-Powered
                    Reading
                </p>
            </div>
            <div className="all_section_content" onClick={() => handleSectionClick('Writing')}>
                <img src={writing} alt="" />
                <p>राइटिङ सेक्शन <br />
                    AI-Powered
                    Writing
                </p>
            </div>
            <div className="all_section_content" onClick={() => handleSectionClick('Speaking')}>
                <img src={speaker} alt="" />
                <p>स्पीकिङ सेक्शन <br />
                    AI-Powered
                    Speaking
                </p>
            </div>
            <div className="all_section_content" onClick={() => handleSectionClick('Listening')}>
                <img src={listening} alt="" />
                <p> लिसनिङ सेक्शन <br />
                    AI-Powered
                    Listening
                </p>
            </div>
        </div>
    </div>
  )
}

export default AllSections