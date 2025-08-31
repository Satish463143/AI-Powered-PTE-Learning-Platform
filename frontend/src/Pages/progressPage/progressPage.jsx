import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SideNavbar from '../../Common/sideNavbar/sideNavbar'
import ProgressNavbar from '../../Components/progressComponent/progressNavbar/progressNavbar'
import AiRecommendation from '../../Components/progressComponent/aiRecommendation/aiRecommendation'
import ProgressChat from '../../Components/progressComponent/progressChat/progressChat'
import '../chatPage/chatPage.css'
import MobileNavbar from '../../Common/mobileNavbar/mobileNavbar'
import { useMeQuery } from '../../api/auth.api'
import Swal from 'sweetalert2'
import { useCalculatePracticeXpMutation } from '../../api/practiceXp.api'

const ProgressPage = () => {
    const [menuBar, setMenuBar] = useState(true)
    const [xpData, setXpData] = useState(null)
    const navigate = useNavigate()
    const { data: loggedInUser, isLoading } = useMeQuery()
    const [calculatePracticeXp] = useCalculatePracticeXpMutation()

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

    const handleCalculatePracticeXp = async (section = 'overall') => {
        try {
            const response = await calculatePracticeXp({ section })
            if (response.data) {
                setXpData(response.data)
            }
        } catch (exception) {
            console.error('Error calculating practice XP:', exception)
            Swal.fire({
                title: 'Error',
                text: 'Failed to calculate practice XP',
                icon: 'error',
            })
        }
    }

    // Handle section update from AiRecommendation
    const handleSectionUpdate = (section) => {
        handleCalculatePracticeXp(section)
    }

    useEffect(() => {
        // Initial XP calculation with default section
        if (loggedInUser) {
            handleCalculatePracticeXp()
        }
    }, [loggedInUser])

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 750) {
                setMenuBar(false)
            } else {
                setMenuBar(true)
            }
        }

        // Initial check
        handleResize()

        // Add event listener
        window.addEventListener('resize', handleResize)

        // Cleanup
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
            <div className="hambergmenu progress_hamberg" onClick={handleMenuBar}>
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
                    <ProgressNavbar handleMenuBar={menuBar} xpData={xpData} />
                    <AiRecommendation 
                        handleMenuBar={menuBar} 
                        xpData={xpData} 
                        onSectionUpdate={handleSectionUpdate} 
                    />
                    <ProgressChat handleMenuBar={menuBar} />
                </div>
            </div>
        </div>
    )
}

export default ProgressPage