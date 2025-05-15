import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { tickPrepareTime, tickStartTime } from '../../../reducer/speakingTimerReducer';

const SpeakingTime = ({ isSubmitted, showTimer = true }) => {
  const dispatch = useDispatch();
  const { prepareTime, startTime, isPreparing, isStarted } = useSelector((state) => state.speakingTimer);

  // Format seconds as MM:SS
  const formatTime = (seconds) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  };

  useEffect(() => {
    // Don't run timers if the question is submitted or shouldn't show timer
    if (isSubmitted || !showTimer) return;

    // Timer for the 'prepare' state or 'speak' state
    let interval;
    if (isPreparing || isStarted) {
      interval = setInterval(() => {
        if (isPreparing) {
          dispatch(tickPrepareTime());
        } else if (isStarted) {
          dispatch(tickStartTime());
        }
      }, 1000);
    }

    // Clear the interval when the component is unmounted or when state changes
    return () => clearInterval(interval);

  }, [isPreparing, isStarted, dispatch, isSubmitted, showTimer]);

  // Don't render anything if we shouldn't show the timer
  if (!showTimer) return null;

  return (
    <div >
      {isPreparing && !isSubmitted && <h3>Prepare Time: {formatTime(prepareTime)}</h3>}
      {!isPreparing && isStarted && !isSubmitted && <h3>Speak Time: {formatTime(startTime)}</h3>}
      {(!isPreparing && !isStarted) || isSubmitted ? <h3>Time Over</h3> : null}
    </div>
  );
};

export default SpeakingTime;
