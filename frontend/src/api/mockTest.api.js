import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const mockTestApi = createApi({
  reducerPath: 'mockTestApi',
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
  tagTypes: ['MockTest'],
  endpoints: (builder) => ({
    // POST /mock-test/start
    startMockTest: builder.mutation({
      query: (testData) => {
        // If testData is FormData, don't set Content-Type (browser will set it with boundary)
        const headers = testData instanceof FormData ? {} : { 'Content-Type': 'application/json' };
        
        return {
          url: '/fullMockTest/mock-test/start',
          method: 'POST',
          body: testData,
          headers
        };
      },
      invalidatesTags: ['MockTest'],
    }),
    saveAboutMe:builder.mutation({
      query:(audio)=>({
        url:'/fullMockTest/mock-test/about-me',
        method:"POST",
        body:audio || {}
      })
    }),

    // GET /mock-test/reports
    getMockTestReports: builder.query({
      query: () => '/fullMockTest/mock-test/reports',
      providesTags: ['MockTest'],
    }),

    // GET /mock-test/report/:mockTestId
    getMockTestReportById: builder.query({
      query: (mockTestId) => `/fullMockTest/mock-test/report/${mockTestId}`,
      providesTags: ['MockTest'],
    }),

    // GET /mock-test/stats
    getMockTestStats: builder.query({
      query: () => '/fullMockTest/mock-test/stats',
      providesTags: ['MockTest'],
    }),
  }),
});

export const { useStartMockTestMutation,useSaveAboutMeMutation, useGetMockTestReportsQuery, useGetMockTestReportByIdQuery, useGetMockTestStatsQuery } = mockTestApi;   
