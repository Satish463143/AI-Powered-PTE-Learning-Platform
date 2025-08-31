import React from 'react'
import logo from '../../../src/assets/image/logo.png'
import { Link, useNavigate } from 'react-router-dom'
import './navbar.css'
import { useMeQuery } from '../../api/auth.api'
import Swal from 'sweetalert2'
import 'sweetalert2/src/sweetalert2.scss'

const Navbar = () => {
  const {data: loggedInUser, isLoading} = useMeQuery()
  const navigate = useNavigate()

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
      return
    }
    navigate(path)
  }

  return (
    <div className='container '>
      <div className="navbar">
        <div className="logo">
          <Link to='/'><img src={logo} alt="logo" /></Link>          
        </div>
        <div className="menu">
          <nav>
            <ul>
              <li onClick={() => handleProtectedNavigation('/progressPage')} style={{cursor: 'pointer'}}>Progress</li>
              <li onClick={() => handleProtectedNavigation('/aiNotes')} style={{cursor: 'pointer'}}>Ai Notes</li>
              <li onClick={() => handleProtectedNavigation('/mockTest')} style={{cursor: 'pointer'}}>PTE mock test</li>              
            </ul>
          </nav>
        </div>
        {!loggedInUser && !isLoading ? (
          <div className="signup_box">
            <Link to='/login'>
              <p className='login signup_button'>LOGIN</p>
            </Link>
            <Link to='/signup'>
              <p className='signup_button signup'>SIGN UP</p>
            </Link>
          </div>
        ) : (
          <div className="signup_box">
            <p className='login signup_button'>{loggedInUser?.result?.name}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Navbar