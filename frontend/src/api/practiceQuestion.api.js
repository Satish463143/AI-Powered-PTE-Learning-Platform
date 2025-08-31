import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const practiceApi = createApi({
  reducerPath: 'practiceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    credentials: 'include',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('_at');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['practiceQuestion'],
  endpoints: (builder) => ({
    startPractice: builder.mutation({
      query: ({ type, payload }) => {
        // If this is a speaking section submission with audio
        if (payload.actionType === 'submit' && payload.section === 'speaking' && payload.userAnswer?.answer?.audioBlob) {
          const formData = new FormData();
          
          // Add the audio file with the correct filename and type
          formData.append('audio', payload.userAnswer.answer.audioBlob, 'recording.webm');
          
          // Add other data
          formData.append('actionType', payload.actionType);
          formData.append('section', payload.section);
          
          // Add userAnswer as a JSON string, but only include necessary data
          const userAnswerData = {
            originalQuestion: payload.userAnswer.originalQuestion,
            questionId: payload.userAnswer.answer.questionId
          };
          formData.append('userAnswer', JSON.stringify(userAnswerData));
          
          if (payload.attemptDuration) {
            formData.append('attemptDuration', payload.attemptDuration.toString());
          }

          return {
            url: `/question/practice/${type}`,
            method: 'POST',
            body: formData,
          };
        }

        // For non-file uploads, use regular JSON
        return {
          url: `/question/practice/${type}`,
          method: 'POST',
          body: payload
        };
      }
    })
  })
});

export const { useStartPracticeMutation } = practiceApi;
