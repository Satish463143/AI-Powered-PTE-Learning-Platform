import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "../reducer/chatReducer";
import audioReducer from "../reducer/audioReducer";
import timerSlice from "../reducer/speakingTimerReducer";
const store = configureStore({
  reducer: {
    chat: chatReducer,
    audio: audioReducer,
    speakingTimer: timerSlice,
  },
});

export default store;
