// progress.api.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const progressApi = createApi({
  reducerPath: 'progressApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('_at');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['XP'],
  endpoints: (builder) => ({
    // POST /practiceXp/
    calculatePracticeXp: builder.mutation({
      query: (xpData) => ({
        url: '/practiceXp/',
        method: 'POST',
        body: xpData,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['XP'],
    }),
  }),
});

export const { useCalculatePracticeXpMutation } = progressApi;



