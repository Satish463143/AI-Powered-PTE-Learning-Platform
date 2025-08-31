import React from 'react'
import './allSections.css'
import video from '../../../../src/assets/image/icon 1.png'
import speaker from '../../../../src/assets/image/icon 4.png'
import listening from '../../../../src/assets/image/icon 5.png'
import reading from '../../../../src/assets/image/icon 2.png'
import writing from '../../../../src/assets/image/icon_3.png'
import { useNavigate } from 'react-router-dom'
import Blob from '../../../../src/assets/image/Regular_blob.png'

const AllSections = () => {
    const navigate = useNavigate()

    const handleSectionClick = (content) => {
        navigate('/chatPage', { state: { selectedContent: content } });
      };

   
  return (
    <div style={{backgroundColor: 'var(--white)', padding: '0px 0 60px 0', margin:'50px 0' }}>
        <div className='container'>
            <div className='all_sections'>
                <div className="all_section_content" onClick={() => handleSectionClick('Video Learning')}>
                    <img src={video} alt="" className='all_section_img' />
                    <p>भिडियो शिक्षण <br /><span>Call pte sathi Teacher</span> </p>
                    <img className='blob_img' src={Blob} alt="" />
                </div>
                <div className="all_section_content" onClick={() => handleSectionClick('Reading')}>
                    <img src={reading} alt=""  className='all_section_img' />
                    <p>
                        रीडिङ सेक्शन <br />
                       <span>AI-Powered Reading</span> 
                    </p>
                    <img className='blob_img' src={Blob} alt="" />
                </div>
                <div className="all_section_content" onClick={() => handleSectionClick('Writing')}>
                    <img src={writing} alt="" className='all_section_img'  />
                    <p>राइटिङ सेक्शन <br />
                        <span>AI-Powered  Writing</span>
                    </p>
                    <img className='blob_img' src={Blob} alt="" />
                </div>
                <div className="all_section_content" onClick={() => handleSectionClick('Speaking')}>
                    <img src={speaker} alt="" className='all_section_img'  />
                    <p>स्पीकिङ सेक्शन <br />
                        <span>AI-Powered Speaking</span>
                    </p>
                    <img className='blob_img' src={Blob} alt="" />
                </div>
                <div className="all_section_content" onClick={() => handleSectionClick('Listening')}>
                    <img src={listening} alt=""  className='all_section_img' />
                    <p> लिसनिङ सेक्शन <br />
                        <span>AI-Powered Listening</span>
                    </p>
                    <img className='blob_img' width='' src={Blob} alt="" />
                </div>
            </div>
        </div>
    </div>
  )
}

export default AllSections