import React from 'react'
import Navbar from '../../Common/navbar/navbar.jsx'
import { Outlet } from 'react-router-dom'
import Footer from '../../Common/footer/footer.jsx'
import MobileNavbar from '../../Common/mobileNavbar/mobileNavbar.jsx'

const Layout = () => {
  return (
    <div>
        <Navbar/>
        <MobileNavbar/>
        <Outlet/>
        <Footer/>
    </div>
  )
}

export default Layout