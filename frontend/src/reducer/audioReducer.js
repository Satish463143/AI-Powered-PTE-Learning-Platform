import { createSlice } from '@reduxjs/toolkit';

const audioSlice = createSlice({
  name: 'audio',
  initialState: {
    currentAudio: null,
    hasPlayed: false,
    redoUsed: false
  },
  reducers: {
    setAudio: (state, action) => {      
      // Only update currentAudio if it's different
      if (state.currentAudio !== action.payload) {
        state.currentAudio = action.payload;
        // Only reset play states if audio actually changed
        state.hasPlayed = false;
        state.redoUsed = false;
      }
    },
    //set played
    markPlayed: (state) => {
      state.hasPlayed = true;
    },
    markRedoUsed: (state) => {
      state.redoUsed = true;
    },
    resetAudioState: (state) => {
      state.currentAudio = null;
      state.hasPlayed = false;
      state.redoUsed = false;
    }
  }
});

export const { setAudio, markPlayed, markRedoUsed, resetAudioState } = audioSlice.actions;
export default audioSlice.reducer;
