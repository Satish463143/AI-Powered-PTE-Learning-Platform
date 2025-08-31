import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "../reducer/chatReducer";
import audioReducer from "../reducer/audioReducer";
import timerSlice from "../reducer/speakingTimerReducer";
import callReducer from "../reducer/callReducer";
import userReducer from "../reducer/userReducer";
import { chatApi } from "../api/chat.api";
import { AuthApi } from "../api/auth.api";
import { UserApi } from "../api/user.api";
import { practiceApi } from "../api/practiceQuestion.api";
import describeImageReducer from '../reducer/describeImageReducer';
import questionAudioReducer from '../reducer/questionAudioReducer';
import questionContentReducer from '../reducer/questionContentReducer';
import {mockTestApi} from '../api/mockTest.api'
import {practiceFeedbackApi} from '../api/practiceFeedback.api'
import {progressXPApi} from '../api/practiceXp.api'
import {callApi} from '../api/call.api'

const store = configureStore({
  reducer: {
    user:userReducer,
    chat: chatReducer,
    audio: audioReducer,
    speakingTimer: timerSlice,
    call: callReducer,
    describeImage: describeImageReducer,
    questionAudio: questionAudioReducer,
    questionContent: questionContentReducer,
    [chatApi.reducerPath]: chatApi.reducer,
    [AuthApi.reducerPath]: AuthApi.reducer,
    [UserApi.reducerPath]: UserApi.reducer,
    [practiceApi.reducerPath]:practiceApi.reducer,
    [mockTestApi.reducerPath]:mockTestApi.reducer,
    [practiceFeedbackApi.reducerPath]:practiceFeedbackApi.reducer,
    [progressXPApi.reducerPath]:progressXPApi.reducer,
    [callApi.reducerPath]:callApi.reducer	
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware()
    .concat(chatApi.middleware)
    .concat(AuthApi.middleware)
    .concat(UserApi.middleware)
    .concat(practiceApi.middleware)
    .concat(mockTestApi.middleware)
    .concat(practiceFeedbackApi.middleware)
    .concat(progressXPApi.middleware)
    .concat(callApi.middleware)
    
});

export default store;
