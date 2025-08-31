import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import MockTestNavbar from '../../Components/mockTestComponent/mockTestNavbar'
import MockTestSection from '../../Components/mockTestComponent/mockTestSection'
import MockTestChat from '../../Components/mockTestComponent/mockTestChat'
import MockTestQuestionsSet from '../../Components/mockTestComponent/mockTestQuestionsSet'
import SideNavbar from '../../Common/sideNavbar/sideNavbar'
import MockResult from '../../Common/mockResult/mockResult'
import MobileNavbar from '../../Common/mobileNavbar/mobileNavbar'
import { useMeQuery } from '../../api/auth.api'
import Swal from 'sweetalert2'

const MockTest = ({onScrollToChatReady}) => {
  const {data: loggedInUser, isLoading} = useMeQuery()
  const navigate = useNavigate()
  const [menuBar, setMenuBar] = useState(true)
  const [mockResult, setMockResult] = useState(false)
  const chatRef = useRef(null)
  const chatComponentRef = useRef(null)
  
  useEffect(() => {
    // Check authentication
    if (!isLoading && !loggedInUser) {
      Swal.fire({
        title: 'Please Login to continue',
        text: 'You need to be logged in to access this page',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Login',
        cancelButtonText: 'Go to Home',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login')
        } else {
          navigate('/')
        }
      })
    }
  }, [loggedInUser, isLoading, navigate])

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
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize) 
  }, [])

  const toggleMockResult = () => {
    setMockResult(!mockResult)
  }

  const scrollToChatAndGreet = useCallback(() => {
    if (chatRef.current) {
      chatRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
      // Trigger AI greeting after scrolling
      setTimeout(() => {
        if (chatComponentRef.current) {
          chatComponentRef.current.addAIGreeting()
        }
      }, 500) // Wait for scroll to complete
    }
  }, []) // Empty dependency array since it doesn't depend on any state

  useEffect(() => {
    if (onScrollToChatReady) {
      onScrollToChatReady(scrollToChatAndGreet)
    }
  }, [onScrollToChatReady, scrollToChatAndGreet])

  // Show loading state while checking authentication
  if (isLoading) {
    return <div>Loading...</div>
  }

  // Don't render the page content if user is not logged in
  if (!loggedInUser) {
    return null
  }

  return (
    <>
      <div>
            <div className="hambergmenu mock_hamberg " onClick={handleMenuBar}>
                <div className={`bar_1 ${menuBar ? 'bar_1_active' : ''}`}></div>
                <div className={`bar_2 ${menuBar ? 'bar_2_active' : ''}`}></div>
                <div className={`bar_3 ${menuBar ? 'bar_3_active' : ''}`}></div>
            </div>
            <MobileNavbar/>
            <div className={`chatPage_container ${menuBar ? 'menuBar_active' : ''}`}>
                <div className="toggle_navbar">
                    <SideNavbar handleMenuBar={handleMenuBar}/>
                </div>
               
                <div style={{height:'100vh', overflowY:'scroll'}}>
                  <MockTestNavbar loggedInUser={loggedInUser} handleMenuBar={menuBar} toggleMockResult={toggleMockResult} scrollToChat={scrollToChatAndGreet}/>
                  <MockTestSection loggedInUser={loggedInUser} handleMenuBar={menuBar} toggleMockResult={toggleMockResult} scrollToChat={scrollToChatAndGreet}/>
                  <MockTestQuestionsSet loggedInUser={loggedInUser} handleMenuBar={menuBar} toggleMockResult={toggleMockResult} scrollToChat={scrollToChatAndGreet}/>
                  <div ref={chatRef}>
                    <MockTestChat ref={chatComponentRef} toggleMockResult={toggleMockResult}/>
                  </div>
                </div>
                
                <div className="signup_box">
                <p className='login signup_button'>{loggedInUser?.result?.name}</p>
              </div>
                
                
                

            </div>
        </div>
        <MockResult section="Full Mock Test" mockResult={mockResult} toggleMockResult={toggleMockResult} scrollToChat={scrollToChatAndGreet}/>
    </>
  )
}

export default MockTest