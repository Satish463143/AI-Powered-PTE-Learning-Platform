import { createSlice } from "@reduxjs/toolkit";

// Add a debug function to log state changes
const logStateChange = (actionType, prevState, nextState) => {
 
};

const initialState = {
  timer: 0,
  isRunning: false,
  inputDisabled: false,
  hintUsed: false,   // Track if hint was just used (for triggering response)
  questionHints: {},  // Track hints used per question ID
  submittedQuestions: {}, // Track which questions have been submitted
  initializedTimers: {}, // Track which question timers have been initialized
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setTimer(state, action) {
      const prevState = { ...state };
      const { duration, questionId } = action.payload;
      
      // Only set the timer if it hasn't been initialized for this question
      // or if no questionId is provided (backward compatibility)
      if (!questionId || !state.initializedTimers[questionId]) {
        state.timer = duration;
        state.isRunning = true;
        state.inputDisabled = false;
        
        // Mark timer as initialized for this question
        if (questionId) {
          state.initializedTimers[questionId] = true;
        }
      }
      
      state.hintUsed = false;  // Reset hintUsed when timer is set
      logStateChange('setTimer', prevState, state);
    },
    //manage the timer to reduce by 1 second
    tick(state) {
      const prevState = { ...state };
      if (state.timer > 0) {
        state.timer -= 1;
      } else {
        state.isRunning = false;
        state.inputDisabled = true;
      }
      // Only log non-tick events to avoid console spam
      if (state.timer === 0 || prevState.isRunning !== state.isRunning) {
        logStateChange('tick', prevState, state);
      }
    },
    submit(state, action) {
      const prevState = { ...state };
      const questionId = action.payload;
      
      // Set general state
      state.timer = 0;
      state.isRunning = false;
      state.inputDisabled = false;
      
      // Mark this question as submitted
      if (questionId) {
        state.submittedQuestions[questionId] = true;
      }
      
      logStateChange('submit', prevState, state);
    },
    useHint(state, action) {
      const prevState = { ...state };
      const questionId = action.payload;
      console.log("useHint action dispatched - Setting hintUsed to true for question:", questionId); 
      
      // Set the general hint flag to trigger the AI response
      state.hintUsed = true;
      
      // Track that this specific question has used a hint
      if (questionId) {
        state.questionHints[questionId] = true;
      }
      
      logStateChange('useHint', prevState, state);
    },
    nextQuestion(state) {
      const prevState = { ...state };
      state.timer = 0;
      state.isRunning = false;
      state.inputDisabled = false;
      state.hintUsed = false;  // Reset hintUsed for next question
      logStateChange('nextQuestion', prevState, state);
    },
    resetTimer(state, action) {
      // Used to manually reset a timer for specific question
      const questionId = action.payload;
      if (questionId) {
        state.initializedTimers[questionId] = false;
      }
    }
  },
});

export const { setTimer, tick, submit, useHint, nextQuestion, resetTimer } = chatSlice.actions;

export default chatSlice.reducer;
