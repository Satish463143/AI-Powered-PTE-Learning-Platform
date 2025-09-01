
// import React, { useState, useEffect } from 'react'
// import HomePage from './Pages/homePage/homePage.jsx'
// import {BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
// import Layout from './Pages/layout/layout.jsx'
// import LoginPage from './Pages/loginPage/loginPage.jsx'
// import SignUpPage from './Pages/signUpPage/signUpPage.jsx'
// import ChatPage from './Pages/chatPage/chatPage.jsx'
// import ProgressPage from './Pages/progressPage/progressPage.jsx'
// import MockTest from './Pages/mockTest/mockTest.jsx'
// import FullMockTest from './Pages/fullMockTest/fullMockTest.jsx'
// import SectionMocktest from './Pages/sectionMocktest/sectionMocktest.jsx'
// import QuestionMockTest from './Pages/questionMockTest/questionMockTest.jsx'
// import { ErrorBoundary } from './Pages/questionMockTest/questionMockTest.jsx'
// import AiCallComponent from './Components/aiCallComponent/aiCallComponent.jsx'
// import AiNotes from './Pages/aiNotes/aiNotes.jsx'
// import AdminRoute from './Components/ProtectedRoutes/AdminRoute.jsx'
// import { ToastContainer } from 'react-toastify'
// import 'react-toastify/dist/ReactToastify.css'
// import { useDispatch } from 'react-redux'
// import { useMeQuery } from './api/auth.api'
// import { setLoggedInUser } from './reducer/userReducer'

// // Admin components
// import CmsRoutes from './Pages/admin/CmsRoutes'

// const App = () => {
//   const [scrollToChatFunction, setScrollToChatFunction] = useState(null)
//   const dispatch = useDispatch()
//   const { data: userData, isSuccess } = useMeQuery(undefined, {
//     skip: !localStorage.getItem('_at') // Only run query if token exists
//   })

//   useEffect(() => {
//     if (isSuccess && userData) {
//       dispatch(setLoggedInUser(userData.result))
//     } 
//   }, [isSuccess, userData, dispatch])

//   const handleScrollToChatReady = (scrollFunction) => {
//     setScrollToChatFunction(() => scrollFunction)
//   }

//   return (
//     <>
//       <Router>
//         <Routes>
//           <Route path='/' element={<Layout/>}>
//             <Route index element={<HomePage/>}/>
//             <Route path='/login' element={<LoginPage/>}/>
//             <Route path='/signup' element={<SignUpPage/>}/>
//           </Route>
//           <Route path='/chatPage' element={<ChatPage/>}/>
//           <Route path='/progressPage' element={<ProgressPage/>}/>
//           <Route path='/mockTest' element={<MockTest onScrollToChatReady={handleScrollToChatReady}/>}/>
//           <Route path='/mockTest/fullTest' element={<FullMockTest/>}/>
//           <Route path='/mockTest/sectionTest/:section' element={<SectionMocktest/>}/>
//           <Route path='/mockTest/questionSet/:section' element={
//             <ErrorBoundary>
//               <QuestionMockTest/>
//             </ErrorBoundary>
//           }/>
//           <Route path='/aiNotes' element={<AiNotes/>}/>
          
//           {/* Admin Routes */}
//           <Route path='/admin/*' element={
//             <AdminRoute>
//               <CmsRoutes />
//             </AdminRoute>
//           }/>
//         </Routes>
//       </Router>
//       <AiCallComponent />
//       <ToastContainer
//         position="top-right"
//         autoClose={3000}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//         theme="light"
//       />
//     </>
//   )
// }

// export default App

import React from 'react';
import LiveSmokeTest from './debug/LiveSmokeTest';
export default function App() { return <LiveSmokeTest />; }

