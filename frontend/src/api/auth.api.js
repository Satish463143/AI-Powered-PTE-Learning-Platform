import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const AuthApi = createApi({
    reducerPath:"AuthApi",
    baseQuery: fetchBaseQuery({
        baseUrl:import.meta.env.VITE_API_URL,
        prepareHeaders:(headers)=>{
            const token = localStorage.getItem('_at') || null
            if(token){
                headers.set("Authorization", "Bearer "+token)
            }
        }
    }),
    tagTypes:['Auth'],
    endpoints:(builder)=>({        
        login:builder.mutation({
            query:(formData)=> ({
                url: "/auth/login",
                body:formData,
                method:"POST",
                headers:()=>([
                    {"Content-Type":"application/json"}
                ])
            }),
            invalidatesTags:['Auth'],
        }),
        logout:builder.mutation({
            query:(formData)=> ({
                url: "/auth/logout",
                body:formData,
                method:"POST",
                headers:()=>([
                    {"Content-Type":"application/json"}
                ])
            }),
            invalidatesTags:['Auth'],
        }),
        me:builder.query({
            query:()=>({
                url: "/auth/me",
                method:"GET",
            }),
            providesTags: ['Auth'],
        }),
       
    })
})
export const {useLoginMutation, useLogoutMutation, useMeQuery} = AuthApi