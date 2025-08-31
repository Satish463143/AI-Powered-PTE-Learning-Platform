import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AiNotesComponent from '../../Components/aiNotesComponent/aiNotesComponent.jsx'
import SideNavbar from '../../Common/sideNavbar/sideNavbar.jsx'
import AiNotesChat from '../../Components/aiNotesComponent/aiNotesChat.jsx'
import '../chatPage/chatPage.css'
import MobileNavbar from '../../Common/mobileNavbar/mobileNavbar'
import { useMeQuery } from '../../api/auth.api'
import Swal from 'sweetalert2'

const AiNotes = () => {
  const [menuBar, setMenuBar] = useState(true)
  const navigate = useNavigate()
  const { data: loggedInUser, isLoading } = useMeQuery()

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

    handleResize() // Set initial state on load

    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Show loading state while checking authentication
  if (isLoading) {
    return <div>Loading...</div>
  }

  // Don't render the page content if user is not logged in
  if (!loggedInUser) {
    return null
  }

  return (
    <div>
      <div className="hambergmenu ai_notes_hamberg" onClick={handleMenuBar}>
        <div className={`bar_1 ${menuBar ? 'bar_1_active' : ''}`}></div>
        <div className={`bar_2 ${menuBar ? 'bar_2_active' : ''}`}></div>
        <div className={`bar_3 ${menuBar ? 'bar_3_active' : ''}`}></div>
      </div>
      <MobileNavbar />
      <div className={`chatPage_container ${menuBar ? 'menuBar_active' : ''}`}>
        <div className="toggle_navbar">
          <SideNavbar handleMenuBar={handleMenuBar} />
        </div>
        <div style={{ height: '100vh', overflowY: 'scroll' }}>
          <AiNotesComponent handleMenuBar={menuBar} />
          <AiNotesChat handleMenuBar={menuBar} />
        </div>
      </div>
    </div>
  )
}

export default AiNotes
