import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const practiceFeedbackApi = createApi({
    reducerPath:"practiceFeedbackApi",
    baseQuery: fetchBaseQuery({
        baseUrl:import.meta.env.VITE_API_URL,
        prepareHeaders:(headers)=>{
            const token = localStorage.getItem('_at') || null
            if(token){
                headers.set("Authorization", "Bearer "+token)
            }
        }
    }),
    tagTypes:['PracticeFeedback'],
    endpoints:(builder)=>({
        generateFeedback:builder.mutation({
            query:(section)=>({
                method:"POST",
                url:"/practiceFeedback",
                body:section,
                headers:()=>({
                    "Content-Type":"application/json"
                })
            }),
            invalidatesTags:['PracticeFeedback']
        }),

    })
})

export const {useGenerateFeedbackMutation} = practiceFeedbackApi;