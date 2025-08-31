import React, { useState ,useEffect} from 'react'
import SideNavbar from '../../Common/sideNavbar/sideNavbar'
import ChatPageNavbar from '../../Components/chatPageComponent/chatPageNavbar/chatPageNavbar'
import ChatWithAi from '../../Components/chatPageComponent/chatWIthAi/chatWIthAi'
import ChatBox from '../../Components/chatPageComponent/chatBox/chatBox'
import './chatPage.css'
import MobileNavbar from '../../Common/mobileNavbar/mobileNavbar'

const chatPage = () => {  
  const [menuBar, setMenuBar] = useState(true)
  const [isSoundOn, setIsSoundOn] = useState(false)
  const [selectedScore, setSelectedScore] = useState(null)
  const [selectedContent, setSelectedContent] = useState(null)
  const [selectedSection, setSelectedSection] = useState(null) 
  const [resetChat, setResetChat] = useState(false)
  const [showChatWithAi, setShowChatWithAi] = useState(true)
  const [messages, setMessages] = useState([])

  const handleMenuBar = () => {
    setMenuBar(!menuBar)
  }
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 750) {
        setMenuBar(false)
      } else {
        setMenuBar(true)
      }
    }
  
    // Run on mount
    handleResize()
  
    // Attach listener
    window.addEventListener('resize', handleResize)
  
    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])
  

  const handleNewChat = () => {
    setSelectedScore(null)
    setSelectedContent(null)
    setSelectedSection(null) // ✅ Reset
    setResetChat(true)
    setShowChatWithAi(true)
    setMessages([])
    setTimeout(() => {
      setResetChat(false)
    }, 100)
  }

  const handleSoundToggle = (checked) => {
    setIsSoundOn(checked)
  }

  const handleScoreSelect = (score, content, section) => {
    setSelectedScore(score)
    if (content) setSelectedContent(content)
    if (section) setSelectedSection(section) // ✅ Save section
  }

  return (
    <div>
      <div className="hambergmenu chat_hamberg" onClick={handleMenuBar}>
        <div className={`bar_1 ${menuBar ? 'bar_1_active' : ''}`}></div>
        <div className={`bar_2 ${menuBar ? 'bar_2_active' : ''}`}></div>
        <div className={`bar_3 ${menuBar ? 'bar_3_active' : ''}`}></div>
      </div>
      <MobileNavbar/>
      <div className={`chatPage_container ${menuBar ? 'menuBar_active' : ''}`}>
        <div className="toggle_navbar">
          <SideNavbar onNewChat={handleNewChat} handleMenuBar={handleMenuBar} />
        </div>
        <div style={{ height: '100vh', overflowY: 'hidden' }} className='chatPage_bg'>
          <ChatPageNavbar 
            handleMenuBar={menuBar}
            onSoundToggle={handleSoundToggle}
            onScoreSelect={handleScoreSelect}
          />
          <ChatWithAi 
            isSoundOn={isSoundOn}
            selectedScore={selectedScore}
            selectedContent={selectedContent}
            selectedSection={selectedSection} 
            resetChat={resetChat}
            showChatWithAi={showChatWithAi}
            setShowChatWithAi={setShowChatWithAi}
            messages={messages}
            setMessages={setMessages}
          />
          <ChatBox 
            showChatWithAi={showChatWithAi}
            messages={messages}
            setMessages={setMessages}
            isSoundOn={isSoundOn}
          />
        </div>
      </div>
    </div>
  )
}

export default chatPage
