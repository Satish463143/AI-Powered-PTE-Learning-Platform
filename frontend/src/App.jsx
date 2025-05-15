import React from 'react'
import HomePage from './Pages/homePage/homePage.jsx'
import {BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Layout from './Pages/layout/layout.jsx'
import LoginPage from './Pages/loginPage/loginPage.jsx'
import SignUpPage from './Pages/signUpPage/signUpPage.jsx'
import ChatPage from './Pages/chatPage/chatPage.jsx'
import ProgressPage from './Pages/progressPage/progressPage.jsx'
import MockTest from './Pages/mockTest/mockTest.jsx'
const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<Layout/>}>
            <Route index element={<HomePage/>}/>
            <Route path='/login' element={<LoginPage/>}/>
            <Route path='/signup' element={<SignUpPage/>}/>
          </Route>
          <Route path='/chatPage' element={<ChatPage/>}/>
          <Route path='/progressPage' element={<ProgressPage/>}/>
          <Route path='/mockTest' element={<MockTest/>}/>
        </Routes>
      </Router>
    </>
  )
}

export default App