import React, { useState } from 'react'
import SideNavbar from '../../Common/sideNavbar/sideNavbar'
import ChatPageNavbar from '../../Components/chatPageComponent/chatPageNavbar/chatPageNavbar'
import ChatWithAi from '../../Components/chatPageComponent/chatWIthAi/chatWIthAi'
import ChatBox from '../../Components/chatPageComponent/chatBox/chatBox'
import './chatPage.css'

const chatPage = () => {  
  const [menuBar, setMenuBar] = useState(false)
  const [isSoundOn, setIsSoundOn] = useState(false)
  const [selectedScore, setSelectedScore] = useState(null)
  const [selectedContent, setSelectedContent] = useState(null)
  const [resetChat, setResetChat] = useState(false)
  const [showChatWithAi, setShowChatWithAi] = useState(true);
  const [messages, setMessages] = useState([]);

  //hamberg menu 
  const handleMenuBar = () => {
    setMenuBar(!menuBar)
  }

  // Function to reset chat
  const handleNewChat = () => {
    setSelectedScore(null)
    setSelectedContent(null)
    setResetChat(true)
    setShowChatWithAi(true)
    setMessages([])
    // Reset the reset flag after a short delay
    setTimeout(() => {
      setResetChat(false)
    }, 100)
  }

  //pass sound state (on/off) from ChatPageNavbar to ChatWithAi
  const handleSoundToggle = (checked) => {
    setIsSoundOn(checked)
  }

  // pass score and also content if selected from ChatPageNavbar to ChatWithAi
  const handleScoreSelect = (score, content) => {
    setSelectedScore(score)
    if (content) {
      setSelectedContent(content)
    }
  }
 
  // pass content and  also score if selected from ChatPageNavbar to ChatWithAi
  const handleContentSelect = (score, content) => {
    setSelectedContent(content)
    if (score) {
      setSelectedScore(score)
    }
  }

  // Function to update messages from either component
  const handleUpdateMessages = (newMessages) => {
    setMessages(newMessages);
  }

  return (
    <div>
      <div className="hambergmenu" onClick={handleMenuBar}>
        <div className={`bar_1 ${menuBar ? 'bar_1_active' : ''}`}></div>
        <div className={`bar_2 ${menuBar ? 'bar_2_active' : ''}`}></div>
        <div className={`bar_3 ${menuBar ? 'bar_3_active' : ''}`}></div>
      </div>
      <div className={`chatPage_container ${menuBar ? 'menuBar_active' : ''}`}>
        <div className="toggle_navbar">
          <SideNavbar onNewChat={handleNewChat} handleMenuBar={handleMenuBar} />
        </div>
        <div style={{height:'100vh', overflowY:'scroll'}}>
          <ChatPageNavbar 
            handleMenuBar={menuBar}
            onSoundToggle={handleSoundToggle}
            onScoreSelect={handleScoreSelect}
            onContentSelect={handleContentSelect}
          />
          <ChatWithAi 
            isSoundOn={isSoundOn}
            selectedScore={selectedScore}
            selectedContent={selectedContent}
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
