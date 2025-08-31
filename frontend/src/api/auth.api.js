import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const AuthApi = createApi({
    reducerPath: "AuthApi",
    baseQuery: fetchBaseQuery({
        baseUrl:import.meta.env.VITE_API_URL,
        prepareHeaders:(headers)=>{
            const token = localStorage.getItem('_at')
            if (token) {
                headers.set("Authorization", `Bearer ${token}`)
            }
            return headers
        },
        credentials: 'include'
    }),
    tagTypes: ['Auth'],
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (formData) => ({
                url: "/auth/login",
                body: formData,
                method: "POST"
            }),
            invalidatesTags: ['Auth'],
            // Handle the response to ensure token is stored
            async onQueryStarted(args, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data?.result?.token?.token) {
                        localStorage.setItem('_at', data.result.token.token);
                        localStorage.setItem('_rt', data.result.token.refreshToken);
                    }
                } catch (error) {
                    console.error('Login failed:', error);
                }
            }
        }),
        logout: builder.mutation({
            query: () => ({
                url: "/auth/logout",
                method: "POST"
            }),
            invalidatesTags: ['Auth'],
            // Clear tokens on logout
            async onQueryStarted(args, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    localStorage.removeItem('_at');
                    localStorage.removeItem('_rt');
                } catch (error) {
                    console.error('Logout failed:', error);
                }
            }
        }),
        me: builder.query({
            query: () => ({
                url: "/auth/me",
                method: "GET"
            }),
            providesTags: ['Auth']
        })
    })
});

export const { useLoginMutation, useLogoutMutation, useMeQuery } = AuthApi;