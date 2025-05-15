import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  prepareTime: 0,
  startTime: 0,
  isPreparing: false,
  isStarted: false,
  isPaused: false,
};

const timerSlice = createSlice({
  name: 'speakingTimer',
  initialState,
  reducers: {
    setPrepareTime: (state, action) => {
      state.prepareTime = action.payload;
      state.isPreparing = true;
      state.isStarted = false;
      state.isPaused = false;
    },

    setStartTime: (state, action) => {
      state.startTime = action.payload;
      state.isPaused = false;
    },

    tickPrepareTime: (state) => {
      if (state.isPaused) return;
      
      if (state.prepareTime > 1) {
        state.prepareTime -= 1;
      } else {
        state.prepareTime = 0;
        state.isPreparing = false;
        state.isStarted = true;
      }
    },

    tickStartTime: (state) => {
      if (state.isPaused) return;
      
      if (state.startTime > 1) {
        state.startTime -= 1;
      } else {
        state.startTime = 0;
        state.isStarted = false;
      }
    },

    resetTimer: (state) => {
      state.prepareTime = 0;
      state.startTime = 0;
      state.isPreparing = false;
      state.isStarted = true;
      state.isPaused = false;
    },
    
    pauseTimer: (state) => {
      state.isPaused = true;
    },
    
    resumeTimer: (state) => {
      state.isPaused = false;
    },
  },
});

export const {
  setPrepareTime,
  setStartTime,
  tickPrepareTime,
  tickStartTime,
  resetTimer,
  pauseTimer,
  resumeTimer,
} = timerSlice.actions;

export default timerSlice.reducer;
