import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isCallActive: false,
  isMinimized: false,
};

const callSlice = createSlice({
  name: 'call',
  initialState,
  reducers: {
    startCall: (state) => {
      state.isCallActive = true;
      state.isMinimized = false;
    },
    minimizeCall: (state) => {
      state.isMinimized = true;
    },
    maximizeCall: (state) => {
      state.isMinimized = false;
    },
    endCall: (state) => {
      state.isCallActive = false;
      state.isMinimized = false;
    },
  },
});

export const { startCall, minimizeCall, maximizeCall, endCall } = callSlice.actions;
export default callSlice.reducer;
