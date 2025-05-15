import React from 'react'
import './sideNavbar.css'
import { Link } from 'react-router-dom'
import notes from '../../assets/image/notes.svg'
import progress from '../../assets/image/laptop.svg'
import quiz from '../../assets/image/quiz.svg'
import mockTest from '../../assets/image/clock.svg'

const sideNavbar = ({ handleMenuBar, onNewChat }) => {
  const handleNewChatClick = () => {
    if (onNewChat) {
      onNewChat();
    }
  };

  const handleClick = () => {
    handleNewChatClick();
    if (handleMenuBar) {
      handleMenuBar();
    }
  };

  return (
    <div className='sideNavbar'>
      <div className="add_new_chat">
        <Link to='/chatPage'>
          <p onClick={handleClick}>नयाँ chat +</p>
        </Link>
      </div>
      <h3>Load from the menu</h3>
      <div className="menu_items">
        <ul>
          <Link to='/progressPage'>
            <li onClick={handleMenuBar}>
              <img src={progress} alt="" />
              <p>हजुरको Progress</p>
            </li>
          </Link>
          <Link to='/'>
            <li onClick={handleMenuBar}>
              <img src={notes} alt="" />
              <p>AI-NOTES</p>
            </li>
          </Link>
          <Link to='/'>
            <li onClick={handleMenuBar}>
              <img src={quiz} alt="" />
              <p>AI Quiz</p>
            </li>
          </Link>
          <Link to='/mockTest'>
            <li onClick={handleMenuBar}>
              <img src={mockTest} alt="" />
              <p>Mock test परीक्षा जस्तै</p>
            </li>
          </Link>
        </ul>
      </div>
    </div>
  )
}

export default sideNavbar