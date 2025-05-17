import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { useMeQuery } from "../api/auth.api";

export const getLoggedInUser = createAsyncThunk(
    "User/getLoggedInUser",
    async()=>{
        try{
            const loggedInUser = await useMeQuery().unwrap()
            return loggedInUser
        }catch(error){
            console.log(error)
        }
    }
)

const UserSlicer = createSlice({
    name:"User",
    initialState:{
        loggedInUser:null,
    },
    reducers:{
        setLoggedInUser:(state,action)=>{
            state.loggedInUser = action.payload
        },
        logoutUser:(state)=>{
            state.loggedInUser = null
        }
    },
    extraReducers:(builder)=>{
        builder.addCase(getLoggedInUser.fulfilled,(state,action)=>{
            state.loggedInUser = action.payload
        })
        builder.addCase(getLoggedInUser.rejected,(state,action)=>{
            state.loggedInUser = null
        })
    }
})

export const {setLoggedInUser, logoutUser} = UserSlicer.actions
export default UserSlicer.reducer