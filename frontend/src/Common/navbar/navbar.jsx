import React from 'react'
import logo from '../../../src/assets/image/logo.png'
import { Link } from 'react-router-dom'
import './navbar.css'
const Navbar = () => {
  return (
    <div className='container'>
      <div className="navbar">
        <div className="logo">
          <Link to='/'><img src={logo} alt="logo" /></Link>
          
        </div>
        <div className="menu">
          <nav>
            <ul>
              <Link to='/progressPage'><li>Progress</li></Link>
              <Link><li>Ai Notes</li></Link>
              <Link to='/mockTest'><li>PTE mock test</li></Link>              
            </ul>
          </nav>
        </div>
        <div className="signup_box">
          <Link to='/login'>
            <p className='login signup_button'>LOGIN</p>
          </Link>
          <Link to='/signup'>
            <p className='signup_button signup'>SIGN UP</p>
          </Link>
        </div>
      </div>

    </div>
  )
}

export default Navbar