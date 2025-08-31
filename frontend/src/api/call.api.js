import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const callApi = createApi({
  reducerPath: "callApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('_at');
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
    credentials: 'include',
  }),
  tagTypes: ['Call'],
  endpoints: (builder) => ({
    // Start call - Gets Gemini token and starts session
    startCall: builder.mutation({
      query: () => ({
        url: "/call/start_call",
        method: "POST",
      }),
      invalidatesTags: ['Call'],
    }),

    // End call - Sends scores, transcript
    endCall: builder.mutation({
      query: (data) => ({
        url: "/call/end_call",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['Call'],
    }),

    // Get user's past call history
    getCallHistory: builder.query({
      query: () => ({
        url: "/call/get_call_history",
        method: "GET",
      }),
      providesTags: ['Call'],
    }),
  }),
});

export const {
  useStartCallMutation,
  useEndCallMutation,
  useGetCallHistoryQuery,
} = callApi;
