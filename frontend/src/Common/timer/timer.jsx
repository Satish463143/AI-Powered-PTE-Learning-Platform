import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { tick } from '../../reducer/chatReducer';

const Timer = () => {
    const dispatch = useDispatch();
    const timer = useSelector(state => state.chat.timer);
    const isRunning = useSelector(state => state.chat.isRunning);

    useEffect(() => {
        if (isRunning && timer > 0) {
            const interval = setInterval(() => {
                dispatch(tick());
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer, isRunning, dispatch]);
    
    return (
        <div className='timer' style={{display:'flex', alignItems:'center'}}>
            <h1>Time Remaining:  
                <span>
                    {String(Math.floor(timer / 60)).padStart(2, '0')}:{String(timer % 60).padStart(2, '0')}
                </span>
            </h1>
        </div>
    )
}

export default Timer
