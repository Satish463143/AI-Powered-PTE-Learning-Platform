import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "../reducer/chatReducer";
import audioReducer from "../reducer/audioReducer";
import timerSlice from "../reducer/speakingTimerReducer";
import userReducer from "../reducer/userReducer";
import { chatApi } from "../api/chat.api";
import { AuthApi } from "../api/auth.api";
import { UserApi } from "../api/user.api";
const store = configureStore({
  reducer: {
    user:userReducer,
    chat: chatReducer,
    audio: audioReducer,
    speakingTimer: timerSlice,
    [chatApi.reducerPath]: chatApi.reducer,
    [AuthApi.reducerPath]: AuthApi.reducer,
    [UserApi.reducerPath]: UserApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
    .concat(chatApi.middleware)
    .concat(AuthApi.middleware)
    .concat(UserApi.middleware),
});

export default store;
