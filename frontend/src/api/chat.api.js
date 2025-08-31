import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const chatApi = createApi({
    reducerPath: 'chatApi',
    baseQuery:fetchBaseQuery({
        baseUrl:import.meta.env.VITE_API_URL,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token') || null
            if(token){
                headers.set('Authorization', `Bearer ${token}`)
            }
            
        }
    }),

    tagTypes: ['Chat'],
    endpoints: (builder) => ({
        getChat: builder.mutation({
            query: (message) => ({
                url: '/aiChat/chat',
                method: 'POST',
                body: message,
                headers:()=>([
                    {"Content-Type":"application/json"}
                ])
            }),
            invalidatesTags: ['Chat']
        }),
    }),
});

export const { useGetChatMutation } = chatApi;
