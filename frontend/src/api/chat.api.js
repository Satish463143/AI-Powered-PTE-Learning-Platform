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
    endpoints: (builder) => ({
        getChat: builder.mutation({
            query: (message) => ({
                url: '/chat',
                method: 'POST',
                body: message,
                headers:()=>([
                    {"Content-Type":"multipart/form-data"}
                ])
            }),
        }),
    }),
});

export const { useGetChatMutation } = chatApi;
