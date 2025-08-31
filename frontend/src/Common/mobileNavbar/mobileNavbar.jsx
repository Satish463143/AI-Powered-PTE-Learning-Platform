import React, { useState } from 'react'
import logo from '../../assets/image/logo_half.png'
import { Link, useNavigate } from 'react-router-dom'
import './mobileNavbar.css'
import notes from '../../assets/image/notes.svg'
import progress from '../../assets/image/laptop.svg'
import mockTest from '../../assets/image/clock.svg'
import { useDispatch } from 'react-redux'
import { startCall } from '../../reducer/callReducer'
import Swal from 'sweetalert2'
import { useMeQuery } from '../../api/auth.api'

const mobileNavbar = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [menuBar, setMenuBar] = useState(false)
    const { data: loggedInUser, isLoading } = useMeQuery()

    const handleMenuBar = () => {
      setMenuBar(!menuBar)
      if (!menuBar) {
        document.body.classList.add("no-scroll")
      } else {
        document.body.classList.remove("no-scroll")
      }
    }

    const handleProtectedNavigation = (path) => {
      if (!loggedInUser && !isLoading) {
        Swal.fire({
          title: 'Please Login to continue',
          text: 'You need to be logged in to access this feature',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Login',
          cancelButtonText: 'Cancel',
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/login')
          }
        })
        return false
      }
      navigate(path)
      handleMenuBar()
      return true
    }

    const handleCall = () => {
      if (!loggedInUser && !isLoading) {
        Swal.fire({
          title: 'Please Login to continue',
          text: 'You need to be logged in to access this feature',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Login',
          cancelButtonText: 'Cancel',
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/login')
          }
        })
        return
      }

      Swal.fire({
        title: "Start Call?",
        text: `Please put on your headphones & stay in a peaceful area.`,
        icon: 'warning',
        confirmButtonText: 'Sure',
        showCancelButton: true,
        cancelButtonText: 'No',
      }).then((result) => {
        if (result.isConfirmed) {
          dispatch(startCall())
          handleMenuBar()
        }
      })
    }

    return (
        <div className='mobile_navbar '>
            <div className="container">
                <div className="mobile_menus">
                    <div className="mobile_hambergmenu cursor-pointer" onClick={handleMenuBar}>
                        <div className={`bar_1 ${menuBar ? 'bar_1_active' : ''}`}></div>
                        <div className={`bar_2 ${menuBar ? 'bar_2_active' : ''}`}></div>
                        <div className={`bar_3 ${menuBar ? 'bar_3_active' : ''}`}></div>
                    </div>
                    <div className="menu_icon">
                        <Link to="/">
                            <img src={logo} alt="menu" />
                        </Link>
                    </div>
                    <div className="login_btn">
                        {!loggedInUser && !isLoading ? (
                            <Link to="/login">
                                <span>
                                    <svg viewBox="0 0 81.99 98.27" width='30px' height='30px' xmlns="http://www.w3.org/2000/svg"><title/><g data-name="Layer 2" id="Layer_2"><g data-name="Layer 1" id="Layer_1-2"><path d="M40.37,47.34A22.9,22.9,0,0,0,57.11,40.4,22.9,22.9,0,0,0,64,23.67,22.91,22.91,0,0,0,57.11,6.93,22.91,22.91,0,0,0,40.37,0,22.9,22.9,0,0,0,23.64,6.93,22.9,22.9,0,0,0,16.7,23.67,22.9,22.9,0,0,0,23.64,40.4,22.91,22.91,0,0,0,40.37,47.34Z"/><path d="M81.79,75.57a58.46,58.46,0,0,0-.8-6.21,48.92,48.92,0,0,0-1.53-6.24,30.84,30.84,0,0,0-2.57-5.82,22,22,0,0,0-3.87-5,17.06,17.06,0,0,0-5.56-3.49,19.21,19.21,0,0,0-7.1-1.28c-1,0-2,.41-3.85,1.63l-4,2.58A23,23,0,0,1,47.33,54a20.14,20.14,0,0,1-12.68,0,22.91,22.91,0,0,1-5.18-2.28l-4-2.59c-1.87-1.22-2.84-1.63-3.85-1.63a19.19,19.19,0,0,0-7.1,1.29A17,17,0,0,0,9,52.25a22,22,0,0,0-3.87,5,30.9,30.9,0,0,0-2.57,5.82A49,49,0,0,0,1,69.36a58.26,58.26,0,0,0-.8,6.21C.07,77.45,0,79.4,0,81.37c0,5.13,1.63,9.28,4.85,12.35s7.38,4.56,12.49,4.56H64.65c5.11,0,9.31-1.53,12.49-4.56S82,86.5,82,81.37C82,79.39,81.92,77.44,81.79,75.57Z"/></g></g></svg>
                                </span>
                            </Link>
                        ) : (
                            <span className="user-name">{loggedInUser?.result?.name}</span>
                        )}
                    </div>
                </div> 
            </div> 
            <div className={`mobile_nav_bar ${menuBar ? 'active_mobile_nav_bar' : ''}`}>
                <div className="mobile_menus_overlay" onClick={handleMenuBar}></div>
                <div className="mobile_menus_content">
                    <div className="mobile_add_new_chat add_new_chat">
                        <Link to='/chatPage'>
                            <p>नयाँ chat with AI</p>
                        </Link>
                    </div>
                    <div className="menu_items">
                        <ul>
                            <li onClick={() => handleProtectedNavigation('/progressPage')} style={{cursor: 'pointer'}}>
                                <img src={progress} alt="" />
                                <p>हजुरको Progress</p>
                            </li>
                            <li onClick={() => handleProtectedNavigation('/aiNotes')} style={{cursor: 'pointer'}}>
                                <img src={notes} alt="" />
                                <p>AI-NOTES</p>
                            </li>
                            <li onClick={handleCall} style={{cursor: 'pointer'}}>
                                <span>
                                    <svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" height='50px' width='50px'><title/><g data-name="Layer 2" id="Layer_2"><g data-name="Layer 2" id="Layer_2-2"><path fill="#009800" d="M48,0A48,48,0,1,0,96,48,48,48,0,0,0,48,0Zm2.71,25.64c10.69.33,19.93,10,19.8,20.37a4.15,4.15,0,0,0,.05.79c0,.85-.05,1.73-1.23,1.7-1.34,0-1.15-1.32-1.23-2.33V45.9c-1.43-11-6.55-16.21-17.71-17.9-.93-.11-2.33.05-2.3-1.13C48.22,25.09,49.86,25.78,50.71,25.64ZM65,45.49a.86.86,0,0,1-.85.88c-1.21.22-1.4-.49-1.48-1.29a5.23,5.23,0,0,0-.08-.93C61.41,37.46,59,35,52.14,33.48c-1-.22-2.58-.11-2.3-1.62s1.65-1,2.74-.85c6.85.85,12.48,6.69,12.45,13.13C65,44.53,65.05,45.08,65,45.49Zm-5.7-.88a1.31,1.31,0,0,1-.6.16,1.07,1.07,0,0,1-.93-.36,1.9,1.9,0,0,1-.33-.93,4.94,4.94,0,0,0-4.61-4.8c-.85-.14-1.7-.44-1.29-1.53.27-.77,1-.85,1.7-.85,3-.08,6.61,3.51,6.55,6.61A1.86,1.86,0,0,1,59.27,44.61Zm11.38,19.3c-1.18,3.24-5.24,6.55-8.72,6.5a12.59,12.59,0,0,1-2.33-.63C47.15,64.55,37.5,56.54,30.94,45.57a59,59,0,0,1-4-8c-2.11-5.07.08-9.35,5.43-11.13a4.53,4.53,0,0,1,2.82,0c2.3.85,8.06,8.61,8.17,10.94.08,1.78-1.12,2.74-2.36,3.54A3.77,3.77,0,0,0,39,44.39a6.35,6.35,0,0,0,.58,2.19,20.55,20.55,0,0,0,11,10.5c1.78.8,3.51.71,4.74-1.1,2.17-3.21,4.85-3,7.79-1.07,1.43,1,3,2,4.36,3.1C69.39,59.56,71.8,60.76,70.65,63.91Z"/></g></g></svg>
                                </span>
                                <p>CALL AI SPEAKING COACH</p>
                            </li>
                            <li onClick={() => handleProtectedNavigation('/mockTest')} style={{cursor: 'pointer'}}>
                                <img src={mockTest} alt="" />
                                <p>Mock test परीक्षा जस्तै</p>
                            </li>
                        </ul>
                    </div>
                    <div className="chat_history">
                        <div className="chat_history_title">
                            <h3 className='text-center'>Chat History</h3>
                            <p className='text-center'>( अगाडि study गरेको को कुरा ह)</p>
                        </div>
                    </div>
                </div>
            </div>               
        </div>
    )
}

export default mobileNavbar