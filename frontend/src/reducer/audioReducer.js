import { createSlice } from '@reduxjs/toolkit';

const audioSlice = createSlice({
  name: 'audio',
  initialState: {
    currentAudio: null,
    hasPlayed: false,
    redoUsed: false,
  },
  reducers: {
    setAudio: (state, action) => {      
      // Store the audio source
      state.currentAudio = action.payload;
      
      // Reset play state
      state.hasPlayed = false;
      state.redoUsed = false;
    },
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
