import { createSlice } from '@reduxjs/toolkit';

const questionAudioSlice = createSlice({
  name: 'questionAudio',
  initialState: {
    audioMap: {}, // Map of questionId to audio URL
    currentQuestionId: null,
    previousQuestionId: null // Track the previous question to prevent audio changes
  },
  reducers: {
    setQuestionAudio: (state, action) => {
      const { questionId, audioUrl } = action.payload;
      // Only set if not already set and it's the current question
      if (questionId && audioUrl && !state.audioMap[questionId] && state.currentQuestionId === questionId) {
        state.audioMap[questionId] = audioUrl;
      }
    },
    setCurrentQuestion: (state, action) => {
      // Store the current question as previous before updating
      state.previousQuestionId = state.currentQuestionId;
      state.currentQuestionId = action.payload;
    },
    clearCurrentQuestion: (state) => {
      state.previousQuestionId = state.currentQuestionId;
      state.currentQuestionId = null;
    }
  }
});

export const { setQuestionAudio, setCurrentQuestion, clearCurrentQuestion } = questionAudioSlice.actions;
export default questionAudioSlice.reducer; 