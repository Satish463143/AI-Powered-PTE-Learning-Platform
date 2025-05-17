import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const UserApi = createApi({
    reducerPath:"UserApi",
    baseQuery: fetchBaseQuery({
        baseUrl:import.meta.env.VITE_API_URL,
        prepareHeaders:(headers)=>{
            const token = localStorage.getItem('_at') || null
            if(token){
                headers.set("Authorization", "Bearer "+token)
            }
        }
    }),
    tagTypes:['Users'],
    endpoints:(builder)=>({
        listAll:builder.query({
            query:({ page = 1, limit = 10, search = '' }) => `/user?page=${page}&limit=${limit}&search=${search}`,
            providesTags:['Users'],
        }),
        create:builder.mutation({
            query:(formData)=> ({
                url: "/",
                body:formData,
                method:"POST",
                headers:()=>([
                    {"Content-Type":"multipart/form-data"}
                ])
            }),
            invalidatesTags:['Users'],
        }),
        update:builder.mutation({
            query:({id,payload})=>({
                url: `/${id}`,
                body:payload,
                method:'PUT',
                headers:()=>([
                    {"Content-Type" :"multipart/form-data"}
                ])
            }),
            invalidatesTags:['Users'],
        }),
        showById:builder.query({
            query:(id)=>`/${id}`
        }),
        delete:builder.mutation({
            query:(id)=>({
                url:`/${id}`,
                method:"DELETE"
            }),
             invalidatesTags:['Users'],
        }),
    })
})
export const {useShowByIdQuery, useDeleteMutation, useUpdateMutation, useCreateMutation, useListAllQuery} = UserApi